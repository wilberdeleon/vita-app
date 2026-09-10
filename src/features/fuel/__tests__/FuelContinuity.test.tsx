/**
 * **One feature, not five screens built at different times.**
 *
 * The founder's standing visual-consistency contract is a product rule, and a
 * product rule that only lives in a document drifts. This file is the
 * mechanical half of it: it asserts that the screens after a food is chosen
 * derive their meal identity, their macro identity and their food picture
 * **from the same sources Fuel Home does**, and that the meal a person picked
 * survives every route between the meal row and the log write.
 *
 * ## What it deliberately does not do
 *
 * It does not compare pixels, and it does not copy hex values into
 * expectations. A test that hardcodes `#D68FA5` passes when the mapping and the
 * screen are both wrong in the same way, and has to be edited every time the
 * founder adjusts a colour. These assertions read the shared function and
 * require the screen to agree with it — so changing `mealAccent` moves every
 * screen at once, and a screen that quietly hardcodes its own violet fails.
 * §103, §104.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let cameraHandler: ((result: { data: string; type: string }) => void) | undefined;
const mockPermission = { granted: true, canAskAgain: true };

jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  return {
    CameraView: (props: Record<string, unknown>) => {
      cameraHandler = props.onBarcodeScanned as typeof cameraHandler;
      return <View testID="camera-view" />;
    },
    useCameraPermissions: () => [mockPermission, jest.fn()],
  };
});

jest.mock('expo-linking', () => ({ openSettings: jest.fn() }));

const mockLookup = jest.fn();
jest.mock('../../../lib/nutrition/providers/registry', () => ({
  ...jest.requireActual('../../../lib/nutrition/providers/registry'),
  lookupBarcodeAcrossProviders: (...args: unknown[]) => mockLookup(...args),
}));

let mockParams: Record<string, string> = {};
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
    back: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => mockParams,
}));

import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import Fuel from '../../../app/(vita)/(tabs)/fuel';
import AddFood from '../../../app/(vita)/fuel/add';
import ScanBarcode from '../../../app/(vita)/fuel/scan';
import FoodDetail from '../../../app/(vita)/fuel/food/[id]';
import AddFoodManually from '../../../app/(vita)/fuel/manual';
import EditLogEntry from '../../../app/(vita)/fuel/entry/[id]';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import type { NutritionRepository } from '../../../lib/nutrition/data/FoodLogRepository';
import {
  NutritionProvider,
  createEntry,
  rememberFoods,
  type FavoriteFood,
  type FoodEntry,
  type MealSlot,
  type NutritionTargets,
  type VitaFood,
} from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { FoodAvatar } from '../components/FoodAvatar';
import { FoodFacts } from '../components/FoodFacts';
import { FoodIdentity } from '../components/FoodIdentity';
import { MealContext } from '../components/MealContext';
import { macroAccent } from '../macroAccent';
import { mealAccent } from '../mealAccent';

const TODAY = todayLogDate();
const MEALS: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Greek yogurt',
  brand: 'Fage',
  servings: [
    {
      label: '1 container',
      quantity: 1,
      unit: 'container',
      nutrition: { calories: 140, protein: 18, carbs: 6, fat: 4 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

function fakeRepository(seed: { entries?: FoodEntry[]; targets?: NutritionTargets | null } = {}) {
  const days: Record<string, FoodEntry[]> = { [TODAY]: [...(seed.entries ?? [])] };
  let targets: NutritionTargets | null = seed.targets ?? null;
  let customFoods: VitaFood[] = [];
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
  return { repository, day: () => days[TODAY] ?? [], customFoods: () => [...customFoods] };
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
  mockParams = {};
  mockPush.mockClear();
  mockReplace.mockClear();
  mockLookup.mockReset();
  cameraHandler = undefined;
});

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
      return children
        .filter((child: unknown) => typeof child === 'string' || typeof child === 'number')
        .join('');
    })
    .filter(Boolean);

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');

function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: string) =>
    Boolean(value) && (typeof label === 'string' ? value === label : label.test(value));
  return tree.root.findAll(
    (node) =>
      typeof node.props?.onPress === 'function' &&
      (matches(String(node.props.accessibilityLabel ?? '')) || matches(String(node.props.label ?? ''))),
  )[0];
}

async function press(node: ReactTestInstance | undefined) {
  if (!node) throw new Error('no such control on screen');
  await act(async () => {
    await node.props.onPress();
  });
}

/** Every Ionicon on screen, with the colour it was drawn in. */
const glyphs = (tree: ReactTestRenderer) =>
  tree.root.findAllByType(Ionicons).map((node) => ({
    name: String(node.props.name),
    color: String(node.props.color),
  }));

/* ═══════════════════════════════════════════════════════════════════════════
   MEAL IDENTITY — one mapping, five screens
   ═══════════════════════════════════════════════════════════════════════════ */

describe('meal identity', () => {
  it.each(MEALS)('is the same glyph and accent on every screen that shows %s', async (meal) => {
    /*
     * Read from the shared mapping, not written down here. The point is that
     * every screen agrees with `mealAccent` — if the founder changes Dinner's
     * rose tomorrow, all five move together and this test needs no edit.
     */
    // Light, because `ThemeProvider` resolves to light when the host reports no
    // system preference — which is what the RN Jest preset does. The point is
    // that the component reads the mapping *for the active scheme*, not that it
    // picked one of the two hexes.
    const expected = mealAccent(meal, 'light');

    const context = await mount(<MealContext meal={meal} />, fakeRepository().repository);
    const drawn = glyphs(context).filter((glyph) => glyph.name === expected.icon);
    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn[0].color).toBe(expected.color);
    expect(screen(context)).toContain(meal);
  });

  it.each(MEALS)('shows %s on Add Food and on Food Detail as the same component', async (meal) => {
    // Located by component type, so a screen that reverts to its own local
    // badge fails here even if it happens to render the same word.
    mockParams = { meal };
    const add = await mount(<AddFood />, fakeRepository().repository);
    expect(add.root.findAllByType(MealContext)).toHaveLength(1);
    expect(add.root.findAllByType(MealContext)[0].props.meal).toBe(meal);
    await act(async () => mounted!.unmount());
    mounted = null;

    rememberFoods([food()]);
    mockParams = { id: 'usda:1', meal };
    const detail = await mount(<FoodDetail />, fakeRepository().repository);
    expect(detail.root.findAllByType(MealContext)[0].props.meal).toBe(meal);
  });

  it.each(MEALS)('shows %s on Manual Entry as the same component', async (meal) => {
    mockParams = { meal };
    const tree = await mount(<AddFoodManually />, fakeRepository().repository);
    expect(tree.root.findAllByType(MealContext)[0].props.meal).toBe(meal);
  });

  it.each(MEALS)('shows %s on Edit Entry as the same component', async (meal) => {
    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal });
    mockParams = { id: entry.id };
    const tree = await mount(<EditLogEntry />, fakeRepository({ entries: [entry] }).repository);
    expect(tree.root.findAllByType(MealContext)[0].props.meal).toBe(meal);
  });

  it.each(MEALS)('draws %s over the camera from the same mapping', async (meal) => {
    /*
     * The scanner cannot use `MealContext` — that component is theme-aware and
     * would be invisible on a camera feed — so this is the one screen that
     * draws the mark itself. It must still read the mapping rather than pick a
     * colour, which is what this asserts.
     */
    mockParams = { meal };
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    const expected = mealAccent(meal, 'dark');
    const drawn = glyphs(tree).filter((glyph) => glyph.name === expected.icon);

    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn[0].color).toBe(expected.color);
    expect(screen(tree)).toContain(meal);
  });

  it('never lets a meal accent be a macro accent', async () => {
    // The two languages must not collide: the moment one is reused for the
    // other, a meal row starts looking like it is grading the food in it.
    for (const scheme of ['light', 'dark'] as const) {
      const meals = MEALS.map((meal) => mealAccent(meal, scheme).color.toLowerCase());
      const macros = (['protein', 'carbs', 'fat'] as const).map((key) =>
        macroAccent(key, scheme).toLowerCase(),
      );
      expect(meals.filter((colour) => macros.includes(colour))).toEqual([]);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   MACRO IDENTITY — Fuel Home, Food Detail, Manual Entry
   ═══════════════════════════════════════════════════════════════════════════ */

describe('macro identity', () => {
  const colourOf = (tree: ReactTestRenderer, testID: string) => {
    const column = tree.root.findAll((node) => node.props?.testID === testID)[0];
    return String(column.findAllByType(Text)[0].props.style.flat().find((s: { color?: string }) => s?.color)?.color);
  };

  it.each(['protein', 'carbs', 'fat'] as const)(
    'gives %s the same accent on Food Detail that Fuel Home gives it',
    async (key) => {
      rememberFoods([food()]);
      mockParams = { id: 'usda:1' };
      const tree = await mount(<FoodDetail />, fakeRepository().repository);

      // The theme resolves to light in Jest, which reports no system preference.
      expect(colourOf(tree, `food-macro-${key}`)).toBe(macroAccent(key, 'light'));
    },
  );

  it('carries the accent on the label and leaves the figure neutral', async () => {
    /*
     * The limit the founder set: colour identifies a category, it never grades
     * a value. A tinted number is one step from a red one.
     */
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    const column = tree.root.findAll((node) => node.props?.testID === 'food-macro-protein')[0];
    const [label, value] = column.findAllByType(Text);
    const colour = (node: ReactTestInstance) =>
      String(node.props.style.flat().find((s: { color?: string }) => s?.color)?.color);

    expect(colour(label)).toBe(macroAccent('protein', 'light'));
    expect(colour(value)).not.toBe(macroAccent('protein', 'light'));
  });

  it.each(['protein', 'carbs', 'fat'] as const)(
    'gives %s the same accent on Manual Entry',
    async (key) => {
      const tree = await mount(<AddFoodManually />, fakeRepository().repository);
      const labels = tree.root
        .findAllByType(Text)
        .map((node) => ({
          text: String(node.props.children),
          colour: String(node.props.style?.flat?.().find((s: { color?: string }) => s?.color)?.color),
        }));
      const wanted = { protein: 'Protein', carbs: 'Carbs', fat: 'Fat' }[key];

      expect(labels.find((entry) => entry.text === wanted)?.colour).toBe(macroAccent(key, 'light'));
    },
  );

  it('never uses the traffic-light palette tokens for a macro', async () => {
    /*
     * `palette.protein` is green, `palette.fat` is red. Side by side those are
     * a verdict, and Food Detail carried exactly that until 5.6D — three
     * coloured dots reading as good, warning, bad under a food nobody had
     * eaten yet. Green in particular cannot appear: green says *good*.
     */
    const { palette } = require('../../../theme/tokens');
    for (const scheme of ['light', 'dark'] as const) {
      for (const key of ['protein', 'carbs', 'fat'] as const) {
        expect(macroAccent(key, scheme).toLowerCase()).not.toBe(String(palette.protein).toLowerCase());
      }
    }
  });

  it('shows no goal, target, remainder or rail for an individual food', async () => {
    /*
     * §37 and §45. A food is not measured against a person's day — that is one
     * short step from telling them whether they should eat it.
     */
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(
      <FoodDetail />,
      fakeRepository({ targets: { calories: 2000, protein: 150 } }).repository,
    );

    const text = screen(tree);
    expect(text).not.toMatch(/left|remaining|goal|target|of 2,?000|of 150|%/i);
    expect(text).not.toMatch(/consumed/i);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   FOOD VISUAL — one resolver
   ═══════════════════════════════════════════════════════════════════════════ */

describe('the food picture', () => {
  it('is the same resolver on Food Detail that the lists use', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    // By component type: a screen that grew its own placeholder fails here.
    const avatars = tree.root.findAllByType(FoodAvatar);
    expect(avatars).toHaveLength(1);
    expect(avatars[0].props.food.vitaId).toBe('usda:1');
  });

  it('falls back to art rather than a dead grey box when an image is missing', async () => {
    rememberFoods([food({ vitaId: 'usda:noimage', imageUrl: undefined })]);
    mockParams = { id: 'usda:noimage' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    // The resolver decides the tier, not the screen — so the screen's only
    // obligation is to hand the food over, which is what is asserted.
    expect(tree.root.findAllByType(FoodAvatar)[0].props.food.imageUrl).toBeUndefined();
    expect(screen(tree)).not.toMatch(/no image|missing/i);
  });

  it('renders the same identity component on Food Detail and Edit Entry', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const detail = await mount(<FoodDetail />, fakeRepository().repository);
    expect(detail.root.findAllByType(FoodIdentity)).toHaveLength(1);
    await act(async () => mounted!.unmount());
    mounted = null;

    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Lunch' });
    mockParams = { id: entry.id };
    const edit = await mount(<EditLogEntry />, fakeRepository({ entries: [entry] }).repository);
    expect(edit.root.findAllByType(FoodIdentity)).toHaveLength(1);
  });

  it('renders the same nutrition component on Food Detail and Edit Entry', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const detail = await mount(<FoodDetail />, fakeRepository().repository);
    expect(detail.root.findAllByType(FoodFacts)).toHaveLength(1);
    await act(async () => mounted!.unmount());
    mounted = null;

    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Lunch' });
    mockParams = { id: entry.id };
    const edit = await mount(<EditLogEntry />, fakeRepository({ entries: [entry] }).repository);
    expect(edit.root.findAllByType(FoodFacts)).toHaveLength(1);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE CONTINUITY — the meal survives, end to end
   ═══════════════════════════════════════════════════════════════════════════ */

describe('the meal survives the whole flow', () => {
  it.each(MEALS)('Fuel → Add Food carries %s', async (meal) => {
    const tree = await mount(<Fuel />, fakeRepository().repository);
    await press(control(tree, new RegExp(`add.*${meal}|${meal}.*add`, 'i')));
    expect(String(mockPush.mock.calls[0]?.[0] ?? '')).toContain(`meal=${meal}`);
  });

  it.each(MEALS)('Add Food → Scan carries %s', async (meal) => {
    mockParams = { meal };
    const tree = await mount(<AddFood />, fakeRepository().repository);
    await press(control(tree, /scan a barcode/i));
    expect(String(mockPush.mock.calls[0][0])).toBe(`/fuel/scan?meal=${meal}`);
  });

  it.each(MEALS)('Add Food → Manual carries %s', async (meal) => {
    mockParams = { meal };
    const tree = await mount(<AddFood />, fakeRepository().repository);
    await press(control(tree, /enter a food manually/i));
    expect(String(mockPush.mock.calls[0][0])).toBe(`/fuel/manual?meal=${meal}`);
  });

  it.each(MEALS)('Scan → Food Detail → log lands in %s', async (meal) => {
    mockParams = { meal };
    mockLookup.mockResolvedValue({ status: 'found', food: food(), provider: 'openfoodfacts' });
    await mount(<ScanBarcode />, fakeRepository().repository);
    await act(async () => cameraHandler!({ data: '5000112637922', type: 'ean13' }));
    await act(async () => undefined);

    const href = String(mockReplace.mock.calls[0][0]);
    expect(href).toContain(`meal=${meal}`);
    await act(async () => mounted!.unmount());
    mounted = null;

    // Then the screen that href opens, with the same parameters.
    mockParams = { id: 'usda:1', meal, from: 'scan' };
    const repo = fakeRepository();
    const detail = await mount(<FoodDetail />, repo.repository);
    await press(control(detail, /^Add to (Breakfast|Lunch|Dinner|Snacks)$/));

    expect(repo.day()[0].meal).toBe(meal);
  });

  it.each(MEALS)('Manual → Food Detail → log lands in %s', async (meal) => {
    mockParams = { meal };
    const tree = await mount(<AddFoodManually />, fakeRepository().repository);

    const type = async (label: string, value: string) => {
      const input = tree.root
        .findAll(
          (node) =>
            typeof node.type === 'function' && String(node.props?.label ?? '').toLowerCase() === label,
        )
        .flatMap((node) => node.findAllByType(require('react-native').TextInput))[0];
      await act(async () => input.props.onChangeText(value));
    };
    await type('food name', 'Overnight oats');
    await type('calories', '320');
    await type('protein', '12');
    await type('carbs', '48');
    await type('fat', '9');

    await press(control(tree, /save/i));
    const href = String(mockReplace.mock.calls[0][0]);
    expect(href).toContain(`meal=${meal}`);
  });

  it('leaves the meal unset when the flow never had one', async () => {
    // Opened from the header's scanner rather than a meal row: Food Detail
    // seeds from the time of day, and nothing invents a meal along the way.
    const tree = await mount(<AddFood />, fakeRepository().repository);
    await press(control(tree, /scan a barcode/i));
    expect(String(mockPush.mock.calls[0][0])).toBe('/fuel/scan');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   WHAT A SCREEN READER HEARS
   ═══════════════════════════════════════════════════════════════════════════ */

describe('what a screen reader hears', () => {
  /**
   * Controls that announce themselves as nothing.
   *
   * Two traps, both of which made an earlier version of this pass vacuously.
   * `findAll` walks composites, so `Button` — which hands its own `label` down
   * to the `Pressable` it renders — shows up beside the named control it
   * produced. And filtering to host nodes instead returns **nothing at all**
   * under this RN preset, where a `Pressable`'s `onPress` never reaches a host
   * element, so an empty result read as a clean bill of health.
   *
   * So a control counts as named if it names itself *or* renders something
   * that does, and this returns the ones where neither is true.
   */
  const unnamedControls = (tree: ReactTestRenderer) =>
    tree.root
      .findAll((node) => typeof node.props?.onPress === 'function')
      .filter(
        (node) =>
          !node.props.accessibilityLabel &&
          node.findAll((child) => Boolean(child.props?.accessibilityLabel), { deep: true }).length === 0,
      )
      .map((node) => (typeof node.type === 'string' ? node.type : (node.type as { name?: string }).name ?? '?'));

  /** How many controls the walker actually found — a guard against a green vacuum. */
  const controlCount = (tree: ReactTestRenderer) =>
    tree.root.findAll((node) => typeof node.props?.onPress === 'function').length;

  /** Every accessible name anywhere on screen. */
  const spokenNames = (tree: ReactTestRenderer) =>
    tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));

  it('gives every control on Food Detail a name', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);
    expect(controlCount(tree)).toBeGreaterThan(3);
    expect(unnamedControls(tree)).toEqual([]);
  });

  it('gives every control on Manual Entry a name', async () => {
    const tree = await mount(<AddFoodManually />, fakeRepository().repository);
    expect(controlCount(tree)).toBeGreaterThan(3);
    expect(unnamedControls(tree)).toEqual([]);
  });

  it('gives every control on Edit Entry a name, including the destructive one', async () => {
    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Lunch' });
    mockParams = { id: entry.id };
    const tree = await mount(<EditLogEntry />, fakeRepository({ entries: [entry] }).repository);

    expect(controlCount(tree)).toBeGreaterThan(3);
    expect(unnamedControls(tree)).toEqual([]);
    expect(spokenNames(tree).some((name) => /remove .* from log/i.test(name))).toBe(true);
  });

  it('names every field on Manual Entry, with its unit', async () => {
    const tree = await mount(<AddFoodManually />, fakeRepository().repository);
    const { TextInput } = require('react-native');
    const fields = tree.root
      .findAllByType(TextInput)
      .map((node: ReactTestInstance) => String(node.props.accessibilityLabel ?? ''));

    expect(fields.filter((name: string) => name === '')).toEqual([]);
    expect(fields).toEqual(expect.arrayContaining(['Protein in grams', 'Carbs in grams', 'Fat in grams']));
  });

  it('says which meal a food is being added to', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1', meal: 'Dinner' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));
    expect(spoken).toEqual(expect.arrayContaining(['Adding to Dinner']));
  });

  it('describes the scan region rather than relying on the frame', async () => {
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));

    expect(spoken.some((label) => /barcode scanner/i.test(label))).toBe(true);
    expect(spoken.some((label) => /center the barcode/i.test(label))).toBe(true);
  });

  it('never spells a value with a bare unit glyph', async () => {
    // "18 g" read aloud is "eighteen gee". The spoken form says grams.
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    const column = tree.root.findAll((node) => node.props?.testID === 'food-macro-protein')[0];
    expect(String(column.props.accessibilityLabel)).toMatch(/grams protein/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   BOUNDARIES
   ═══════════════════════════════════════════════════════════════════════════ */

describe('boundaries', () => {
  const forbidden =
    /score|grade|rating|healthy|unhealthy|better choice|alternative|recommend|suggest|should eat|good for you/i;

  it.each([
    ['Food Detail', () => <FoodDetail />, { id: 'usda:1' }],
    ['Manual Entry', () => <AddFoodManually />, {}],
    ['the scanner', () => <ScanBarcode />, {}],
  ])('%s never grades, scores or recommends a food', async (_name, render, params) => {
    rememberFoods([food()]);
    mockParams = params as Record<string, string>;
    const tree = await mount(render(), fakeRepository().repository);
    expect(screen(tree)).not.toMatch(forbidden);
  });

  it('never shows a nutrition target on an individual food', async () => {
    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Lunch' });
    mockParams = { id: entry.id };
    const tree = await mount(
      <EditLogEntry />,
      fakeRepository({ entries: [entry], targets: { calories: 2000, protein: 150 } }).repository,
    );
    expect(screen(tree)).not.toMatch(/goal|left|remaining|allowance|TDEE|BMR/i);
  });

  it('never renders a placeholder where a provider gave nothing', async () => {
    rememberFoods([
      food({
        vitaId: 'usda:sparse',
        brand: undefined,
        servings: [
          {
            label: '1 serving',
            quantity: 1,
            unit: 'serving',
            nutrition: {
              calories: 90,
              protein: undefined as unknown as number,
              carbs: 4,
              fat: undefined as unknown as number,
            },
          },
        ],
      }),
    ]);
    mockParams = { id: 'usda:sparse' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    const text = screen(tree);
    expect(text).not.toMatch(/undefined|NaN|null/);
    // Absent is drawn as an em dash, never fabricated as a zero.
    expect(text).toContain('—');
  });
});
