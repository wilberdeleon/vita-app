/**
 * Fuel's food-discovery screens — Add Food, Search, Recent, Favorites.
 *
 * **Characterization first.** These were written against the screens as they
 * stood at `d5ba0eb`, before 5.6C touched a pixel, so the behaviour the
 * redesign had to preserve is pinned by something other than memory:
 * navigation, the meal query, and what selecting a food does. The visual
 * assertions that follow them are the new contract.
 *
 * The search provider layer is stubbed at the registry seam — **no network
 * call is made in any test in this file**, which is also what makes the
 * failure states testable at all.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockParams: Record<string, string> = {};
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: (...args: unknown[]) => mockBack(...args),
    replace: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => mockParams,
}));

/** The one seam every provider call goes through. Nothing reaches the network. */
const mockSearchAllProviders = jest.fn();
jest.mock('../../../lib/nutrition/providers/registry', () => ({
  ...jest.requireActual('../../../lib/nutrition/providers/registry'),
  searchAllProviders: (...args: unknown[]) => mockSearchAllProviders(...args),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import AddFood from '../../../app/(vita)/fuel/add';
import SearchFood from '../../../app/(vita)/fuel/search';
import RecentFoods from '../../../app/(vita)/fuel/recent';
import FavoriteFoods from '../../../app/(vita)/fuel/favorites';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { NutritionProvider, createEntry, type VitaFood } from '../../../lib/nutrition';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { mealAccent } from '../mealAccent';

const TODAY = todayLogDate();

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Greek yogurt',
  brand: 'Fage',
  servings: [
    {
      label: '1 serving',
      quantity: 1,
      unit: 'serving',
      nutrition: { calories: 140, protein: 18, carbs: 6, fat: 4 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

/** What `searchAllProviders` resolves to, in the shape the hook expects. */
const outcome = (over: Partial<{ foods: VitaFood[]; allFailed: boolean; noProviders: boolean }> = {}) => ({
  foods: [],
  outcomes: [],
  allFailed: false,
  noProviders: false,
  ...over,
});

async function seed(options: { entries?: VitaFood[]; favorites?: VitaFood[] } = {}) {
  await AsyncStorage.clear();
  if (options.entries?.length) {
    const entries = options.entries.map((item) =>
      createEntry({ food: item, quantity: 1, meal: 'Lunch', logDate: TODAY }),
    );
    await AsyncStorage.setItem(`vita:v1:foodlog:${TODAY}`, JSON.stringify(entries));
    await AsyncStorage.setItem('vita:v1:myfoods', JSON.stringify(options.entries));
  }
  if (options.favorites?.length) {
    // The stored shape, with the definition embedded — which is what a USDA
    // favourite really looks like on disk (CC0, so retention is permitted).
    await AsyncStorage.setItem(
      'vita:v1:favorites',
      JSON.stringify(
        options.favorites.map((item) => ({
          vitaId: item.vitaId,
          source: 'usda',
          favoritedAt: '2026-09-01T00:00:00.000Z',
          food: item,
        })),
      ),
    );
  }
}

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement) {
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <ToastProvider>
            <NutritionProvider>{element}</NutritionProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

/**
 * A query nothing else in the file uses.
 *
 * The provider layer keeps a short in-memory cache keyed by the query string
 * — deliberately, so backing out of Food Detail does not re-hit the network.
 * Rather than add a reset hatch to production for the sake of tests, each
 * case searches for something only it searches for.
 */
let queryCounter = 0;
const uniqueQuery = () => `probe${(queryCounter += 1)}`;

beforeEach(() => {
  mockParams = {};
  mockSearchAllProviders.mockReset();
  mockSearchAllProviders.mockResolvedValue(outcome());
});

afterEach(async () => {
  if (mounted) await act(async () => mounted!.unmount());
  mounted = null;
  mockPush.mockClear();
  mockBack.mockClear();
  await AsyncStorage.clear();
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
      return children
        .filter((child: unknown) => typeof child === 'string' || typeof child === 'number')
        .join('');
    })
    .filter(Boolean);
}

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');

function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: string) => (typeof label === 'string' ? value === label : label.test(value));
  return tree.root.findAll(
    (node) =>
      typeof node.props?.onPress === 'function' && matches(String(node.props.accessibilityLabel ?? '')),
  )[0];
}

/** Types into the screen's search field and lets the debounce elapse. */
async function search(tree: ReactTestRenderer, query: string) {
  const field = tree.root.findAllByType(TextInput)[0];
  await act(async () => field.props.onChangeText(query));
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
  await act(async () => undefined);
}

/* ── characterization: what these screens did, and still must ──────────── */

describe('what discovery has always done', () => {
  it('opens a food from search, carrying the meal it was launched with', async () => {
    mockParams = { meal: 'Dinner' };
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [food()] }));
    jest.useFakeTimers();
    await seed();
    const tree = await mount(<AddFood />);
    await search(tree, uniqueQuery());

    await act(async () => control(tree, /^Greek yogurt\./)!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/food/usda%3A1?meal=Dinner');
    jest.useRealTimers();
  });

  it('opens a recent food the same way', async () => {
    mockParams = { meal: 'Breakfast' };
    await seed({ entries: [food()] });
    const tree = await mount(<RecentFoods />);

    await act(async () => control(tree, /^Greek yogurt\./)!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/food/usda%3A1?meal=Breakfast');
  });

  it('opens a favorite the same way', async () => {
    mockParams = { meal: 'Snacks' };
    await seed({ entries: [food()], favorites: [food()] });
    const tree = await mount(<FavoriteFoods />);

    await act(async () => control(tree, /^Greek yogurt\./)!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/food/usda%3A1?meal=Snacks');
  });

  it('reaches the scanner and manual entry with the meal intact', async () => {
    mockParams = { meal: 'Lunch' };
    await seed();
    const tree = await mount(<AddFood />);

    await act(async () => control(tree, 'Scan a barcode')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/scan?meal=Lunch');

    await act(async () => control(tree, 'Enter a food manually')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/manual?meal=Lunch');
  });

  it('adds no meal to the query when it was opened without one', async () => {
    await seed();
    const tree = await mount(<AddFood />);

    await act(async () => control(tree, 'Scan a barcode')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/scan');
  });

  it('carries every meal, not just the convenient one', async () => {
    for (const meal of ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const) {
      mockParams = { meal };
      await seed({ entries: [food()] });
      const tree = await mount(<RecentFoods />);
      await act(async () => control(tree, /^Greek yogurt\./)!.props.onPress());
      expect(mockPush).toHaveBeenLastCalledWith(`/fuel/food/usda%3A1?meal=${meal}`);
      await act(async () => tree.unmount());
      mounted = null;
    }
  });
});

/* ── the shared row ────────────────────────────────────────────────────── */

describe('one food row, everywhere', () => {
  const expected = 'Greek yogurt. Fage. 1 serving. 140 calories.';

  it('says the same thing in search, recents and favorites', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [food()] }));
    jest.useFakeTimers();
    await seed({ entries: [food()], favorites: [food()] });

    const searchScreen = await mount(<AddFood />);
    await search(searchScreen, uniqueQuery());
    expect(String(control(searchScreen, /^Greek yogurt\./)!.props.accessibilityLabel)).toBe(expected);
    await act(async () => searchScreen.unmount());
    mounted = null;
    jest.useRealTimers();

    const recents = await mount(<RecentFoods />);
    expect(String(control(recents, /^Greek yogurt\./)!.props.accessibilityLabel)).toBe(expected);
    await act(async () => recents.unmount());
    mounted = null;

    const favorites = await mount(<FavoriteFoods />);
    expect(String(control(favorites, /^Greek yogurt\./)!.props.accessibilityLabel)).toBe(expected);
  });

  it('renders the same food visual each time', async () => {
    // The three-tier resolver, not a per-screen placeholder: the same food
    // must look like the same food wherever it appears.
    await seed({ entries: [food()], favorites: [food()] });

    const recents = await mount(<RecentFoods />);
    const recentArt = recents.root.findAll((node) => typeof node.props?.art === 'string');
    expect(recentArt.length).toBeGreaterThan(0);
    const art = recentArt[0].props.art;
    await act(async () => recents.unmount());
    mounted = null;

    const favorites = await mount(<FavoriteFoods />);
    expect(favorites.root.findAll((node) => typeof node.props?.art === 'string')[0].props.art).toBe(art);
  });

  it('states what is there and invents nothing that is not', async () => {
    const bare = food({ vitaId: 'usda:2', name: 'Mystery food', brand: undefined });
    await seed({ entries: [bare] });
    const rendered = screen(await mount(<RecentFoods />));

    expect(rendered).toContain('Mystery food');
    expect(rendered).not.toMatch(/undefined|NaN|null/);
    // No brand means no separator left dangling.
    expect(rendered).not.toMatch(/^\s*·|·\s*·/);
  });
});

/* ── Add Food ──────────────────────────────────────────────────────────── */

describe('Add Food', () => {
  it('opens on search rather than on a menu', async () => {
    /*
     * The 5.6C correction. It used to be five destinations — Scan, Search,
     * Manual, Recent, Favorites — so reaching a food took two taps before
     * any typing. Search is on the screen now.
     */
    await seed();
    const tree = await mount(<AddFood />);

    expect(tree.root.findAllByType(TextInput).length).toBeGreaterThan(0);
    expect(screen(tree)).toContain('Add food');
    expect(screen(tree)).not.toContain('Search our database');
  });

  it('shows recents and favorites while the query is empty', async () => {
    await seed({ entries: [food()], favorites: [food()] });
    const rendered = screen(await mount(<AddFood />));

    expect(rendered).toContain('RECENT');
    expect(rendered).toContain('FAVORITES');
    expect(rendered).toContain('Greek yogurt');
  });

  it('offers nothing it does not have', async () => {
    // No favourites means no Favorites heading — an empty section is worse
    // than an absent one.
    await seed({ entries: [food()] });
    const rendered = screen(await mount(<AddFood />));

    expect(rendered).toContain('RECENT');
    expect(rendered).not.toContain('FAVORITES');
  });

  it('replaces the idle content with results once a query is typed', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [food({ name: 'Skyr' })] }));
    jest.useFakeTimers();
    await seed({ entries: [food()], favorites: [food()] });
    const tree = await mount(<AddFood />);
    expect(screen(tree)).toContain('RECENT');

    await search(tree, uniqueQuery());
    const rendered = screen(tree);
    expect(rendered).toContain('Skyr');
    // Nobody should scroll past yesterday's food to reach what they searched.
    expect(rendered).not.toContain('RECENT');
    expect(rendered).not.toContain('FAVORITES');
    jest.useRealTimers();
  });

  it('says so plainly when there is nothing to show yet', async () => {
    await seed();
    const rendered = screen(await mount(<AddFood />));
    expect(rendered).toContain('Search for a food, or scan a barcode.');
  });
});

/* ── meal context ──────────────────────────────────────────────────────── */

describe('meal context', () => {
  it('uses Fuel Home’s own meal identity, not a second one', async () => {
    for (const meal of ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const) {
      mockParams = { meal };
      await seed();
      const tree = await mount(<AddFood />);

      expect(screen(tree)).toContain(meal);
      // The exact glyph the meal row on Fuel Home draws — one mapping.
      const icons = tree.root.findAll((node) => node.props?.name === mealAccent(meal).icon);
      expect(icons.length).toBeGreaterThan(0);

      await act(async () => tree.unmount());
      mounted = null;
    }
  });

  it('says nothing about a meal when none was chosen', async () => {
    await seed();
    const rendered = screen(await mount(<AddFood />));
    for (const meal of ['Breakfast', 'Lunch', 'Dinner', 'Snacks']) {
      expect(rendered).not.toContain(meal);
    }
  });

  it('announces the meal for a screen reader', async () => {
    mockParams = { meal: 'Breakfast' };
    await seed();
    const tree = await mount(<AddFood />);
    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));
    expect(spoken).toContain('Adding to Breakfast');
  });
});

/* ── search states ─────────────────────────────────────────────────────── */

describe('searching', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows results without naming a provider', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [food()] }));
    await seed();
    const tree = await mount(<AddFood />);
    await search(tree, uniqueQuery());

    const rendered = screen(tree);
    expect(rendered).toContain('Greek yogurt');
    // OFF and USDA are implementation details, not row badges.
    expect(rendered).not.toMatch(/USDA|Open Food Facts|OFF/);
  });

  it('keeps going when one provider fails and another does not', async () => {
    mockSearchAllProviders.mockResolvedValue({
      foods: [food()],
      outcomes: [{ provider: 'usda', ok: false, error: { kind: 'network', stage: 'fetch' } }],
      allFailed: false,
      noProviders: false,
    });
    await seed();
    const tree = await mount(<AddFood />);
    await search(tree, uniqueQuery());

    const rendered = screen(tree);
    expect(rendered).toContain('Greek yogurt');
    expect(rendered).not.toMatch(/failed|error|usda/i);
  });

  it('states a total failure plainly, with no API jargon', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ allFailed: true }));
    await seed();
    const tree = await mount(<AddFood />);
    await search(tree, uniqueQuery());

    const rendered = screen(tree);
    expect(rendered).toContain("Couldn't search right now");
    expect(rendered).not.toMatch(/HTTP|429|status|provider|endpoint/i);
    expect(control(tree, 'Try again')).toBeDefined();
  });

  it('offers a way forward when nothing matched', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [] }));
    await seed();
    const tree = await mount(<AddFood />);
    await search(tree, uniqueQuery());

    expect(screen(tree)).toContain('No foods found');
    expect(control(tree, 'Enter a food manually')).toBeDefined();
  });
});

/* ── the full-screen lists ─────────────────────────────────────────────── */

describe('the Recent and Favorites screens', () => {
  it('use the same rows Add Food does', async () => {
    await seed({ entries: [food()], favorites: [food()] });

    const recents = await mount(<RecentFoods />);
    expect(screen(recents)).toContain('Recent foods');
    expect(control(recents, /^Greek yogurt\./)).toBeDefined();
    await act(async () => recents.unmount());
    mounted = null;

    const favorites = await mount(<FavoriteFoods />);
    expect(screen(favorites)).toContain('Favorites');
    expect(control(favorites, /^Greek yogurt\./)).toBeDefined();
  });

  it('state an empty list factually, with no decoration', async () => {
    await seed();

    const recents = await mount(<RecentFoods />);
    expect(screen(recents)).toContain('No recent foods yet');
    await act(async () => recents.unmount());
    mounted = null;

    const favorites = await mount(<FavoriteFoods />);
    expect(screen(favorites)).toContain('No favorites yet');
  });
});

/* ── one search experience, not two ────────────────────────────────────── */

describe('the search route', () => {
  it('renders the same screen Add Food does', async () => {
    /*
     * `/fuel/search` predates `/fuel/add` gaining a search field. Two routes
     * rendering two search UIs is exactly the divergence this slice exists
     * to remove, so the older one now renders the newer screen.
     */
    await seed({ entries: [food()] });
    const tree = await mount(<SearchFood />);

    expect(tree.root.findAllByType(TextInput).length).toBeGreaterThan(0);
    expect(screen(tree)).toContain('Add food');
    expect(screen(tree)).toContain('RECENT');
  });
});
