/**
 * Fuel, driven through the screens a person actually uses.
 *
 * Until slice 5.6A **no test had ever rendered a Fuel screen** — the same
 * gap `WaterRoutes.test.tsx` records for Water, and the same one that let
 * PT-141 ship broken: a correct domain with 92 passing tests behind a screen
 * that showed the user nothing they recognised. Fuel is the second-largest
 * domain in VITA and had no coverage at all.
 *
 * The repository is the injectable seam the provider was built with, so
 * these are real renders against real state rather than mocked components.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockRouteId = '';
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: (...args: unknown[]) => mockBack(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Fuel from '../../../app/(vita)/(tabs)/fuel';
import FoodLog from '../../../app/(vita)/fuel/log';
import FoodDetail from '../../../app/(vita)/fuel/food/[id]';
import EditEntry from '../../../app/(vita)/fuel/entry/[id]';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import type { NutritionRepository } from '../../../lib/nutrition/data/FoodLogRepository';
import {
  NutritionProvider,
  createEntry,
  type FavoriteFood,
  type FoodEntry,
  type NutritionTargets,
  type VitaFood,
} from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const TODAY = todayLogDate();

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Oats',
  servings: [
    { label: '1 cup', quantity: 1, unit: 'cup', nutrition: { calories: 300, protein: 10, carbs: 54, fat: 5 } },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

function fakeRepository(
  seed: { entries?: FoodEntry[]; targets?: NutritionTargets | null; customFoods?: VitaFood[] } = {},
) {
  const days: Record<string, FoodEntry[]> = { [TODAY]: [...(seed.entries ?? [])] };
  let targets: NutritionTargets | null = seed.targets ?? null;
  let customFoods: VitaFood[] = [...(seed.customFoods ?? [])];
  let favorites: FavoriteFood[] = [];

  const repository: NutritionRepository = {
    async getEntries(logDate) {
      return days[logDate] ? [...days[logDate]] : [];
    },
    async saveEntries(logDate, entries) {
      days[logDate] = [...entries];
    },
    async getTargets() {
      return targets;
    },
    async saveTargets(next) {
      targets = next;
    },
    async getCustomFoods() {
      return [...customFoods];
    },
    async saveCustomFoods(next) {
      customFoods = [...next];
    },
    async getRecentEntries() {
      return Object.values(days).flat();
    },
    async getFavorites() {
      return [...favorites];
    },
    async saveFavorites(next) {
      favorites = [...next];
    },
  };

  return { repository, day: () => days[TODAY] ?? [] };
}

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement, repository: NutritionRepository) {
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
            <NutritionProvider repository={repository}>
              <WaterProvider>
                <PeptideProvider>{element}</PeptideProvider>
              </WaterProvider>
            </NutritionProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  if (mounted) await act(async () => mounted!.unmount());
  mounted = null;
  mockPush.mockClear();
  mockBack.mockClear();
  mockReplace.mockClear();
  mockRouteId = '';
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

/* ── the Fuel tab ──────────────────────────────────────────────────────── */

describe('Fuel', () => {
  it('renders an empty day without inventing anything eaten', async () => {
    const tree = await mount(<Fuel />, fakeRepository().repository);
    expect(screen(tree)).toContain('Fuel');
    expect(screen(tree)).toContain('No food logged today');
    // All four slots stay as structure — 5.6B.1 restored them compactly.
    for (const slot of ['Breakfast', 'Lunch', 'Dinner', 'Snacks']) {
      expect(screen(tree)).toContain(slot);
    }
    // …and no zero is claimed for any macro.
    expect(screen(tree)).not.toMatch(/Protein\s+0 g/);
  });

  it('shows what was logged, by meal', async () => {
    const entry = createEntry({ food: food(), quantity: 2, meal: 'Lunch', logDate: TODAY });
    const tree = await mount(<Fuel />, fakeRepository({ entries: [entry] }).repository);

    // Meals are collapsed by default (5.6B.1) — the subtotal is the summary.
    expect(screen(tree)).toContain('600 cal · 1 food');
    // 2 × 300 kcal, summed by the shared engine rather than by the screen.
    expect(screen(tree)).toContain('600');

    // Opening the meal reveals the food itself.
    await act(async () => control(tree, /^Lunch, 1 food/)!.props.onPress());
    expect(screen(tree)).toContain('Oats');
  });

  it('offers the meal-specific way in', async () => {
    const tree = await mount(<Fuel />, fakeRepository().repository);
    expect(control(tree, 'Add food to Breakfast')).toBeDefined();
  });

  it('has one primary action, not four competing ones', async () => {
    /*
     * The old screen had a filled orange Log Food card, a Scan Barcode card
     * beside it, and four `+ Add food` rows — four things starting the same
     * task at the same weight.
     */
    const tree = await mount(<Fuel />, fakeRepository().repository);

    expect(control(tree, 'Add food')).toBeDefined();
    expect(control(tree, 'Log food — search, scan, or add')).toBeUndefined();
    expect(control(tree, 'Scan barcode — quick scan a product')).toBeUndefined();
    // The scanner survives as one header icon.
    expect(control(tree, 'Scan a barcode')).toBeDefined();
  });

  it('carries water and peptides as the same compact modules Home draws', async () => {
    /*
     * 5.6B removed them; the founder's review put them back; 5.6B.2 made them
     * a pair of squares; 5.6B.3 made them *the same component Home uses*,
     * after the founder compared the two screens and found one feature drawn
     * two ways.
     */
    const tree = await mount(<Fuel />, fakeRepository().repository);
    const rendered = screen(tree);

    expect(rendered).toContain('Water');
    expect(rendered).toContain('Peptides');
    expect(control(tree, 'Add water')).toBeDefined();
    expect(control(tree, /^Peptides\./)).toBeDefined();
  });

  it('opens logging with the meal already chosen', async () => {
    const tree = await mount(<Fuel />, fakeRepository().repository);
    await act(async () => control(tree, 'Add food to Dinner')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/add?meal=Dinner');
  });

  it('shows only the meals that actually have something in them', async () => {
    /*
     * 5.6B: an empty slot is the absence of information, not information.
     * The old screen listed all four with *No foods logged* whether or not
     * anything had happened, which made an untouched day read as a list of
     * things not done.
     */
    const entry = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const tree = await mount(<Fuel />, fakeRepository({ entries: [entry] }).repository);
    const rendered = screen(tree);

    // All four remain — the founder's 5.6B.1 correction — but a meal with
    // food reports its subtotal while an empty one stays one quiet line.
    expect(rendered).toContain('Breakfast');
    expect(rendered).toContain('300 cal · 1 food');
    expect(rendered).toContain('Dinner');
    expect(rendered).toContain('No foods logged');
  });
});

/* ── the day's log ─────────────────────────────────────────────────────── */

describe('the food log', () => {
  it('lists the day', async () => {
    const entry = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const tree = await mount(<FoodLog />, fakeRepository({ entries: [entry] }).repository);
    expect(screen(tree)).toContain('Oats');
  });

  it('says so plainly when nothing is logged', async () => {
    const tree = await mount(<FoodLog />, fakeRepository().repository);
    expect(screen(tree).toLowerCase()).toContain('no');
  });
});

/* ── logging a food ────────────────────────────────────────────────────── */

describe('adding a food to the log', () => {
  it('writes an entry carrying the food’s own snapshot', async () => {
    mockRouteId = 'vita-custom:x';
    const custom = food({
      vitaId: 'vita-custom:x',
      source: 'vita-custom',
      sourceId: 'x',
      isCustom: true,
      brand: 'Quaker',
    });
    const fake = fakeRepository({ customFoods: [custom] });
    const tree = await mount(<FoodDetail />, fake.repository);

    expect(screen(tree)).toContain('Oats');
    await act(async () => control(tree, /Add to Log/i)!.props.onPress());

    const [stored] = fake.day();
    expect(stored.name).toBe('Oats');
    expect(stored.brand).toBe('Quaker');
    expect(stored.nutrition.calories).toBe(300);
    expect(stored.foodRef.vitaFoodId).toBe('vita-custom:x');
  });

  it('says so when the food cannot be resolved at all', async () => {
    mockRouteId = 'usda:missing';
    const tree = await mount(<FoodDetail />, fakeRepository().repository);
    expect(screen(tree).toLowerCase()).toContain('no longer');
  });
});

/* ── editing and deleting ──────────────────────────────────────────────── */

describe('a logged entry', () => {
  it('can be edited', async () => {
    const entry = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    mockRouteId = entry.id;
    const fake = fakeRepository({ entries: [entry] });
    const tree = await mount(<EditEntry />, fake.repository);

    expect(screen(tree)).toContain('Oats');
    await act(async () => control(tree, /Save Changes/i)!.props.onPress());
    expect(fake.day()).toHaveLength(1);
  });

  it('stays editable after its food definition is gone', async () => {
    /*
     * The snapshot design paying off: the entry carries its own name,
     * serving and nutrition, so history is self-sufficient. Nothing here
     * resolves `vita-custom:deleted`, and the screen still works.
     */
    const entry = createEntry({
      food: food({ vitaId: 'vita-custom:deleted', source: 'vita-custom', sourceId: 'deleted', isCustom: true }),
      quantity: 1,
      meal: 'Lunch',
      logDate: TODAY,
    });
    mockRouteId = entry.id;
    const tree = await mount(<EditEntry />, fakeRepository({ entries: [entry] }).repository);
    expect(screen(tree)).toContain('Oats');
  });
});
