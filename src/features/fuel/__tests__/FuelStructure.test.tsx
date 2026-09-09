/**
 * Fuel Home's restored structure — the 5.6B.1 correction, on the screen.
 *
 * 5.6B replaced the old card architecture and, in the founder's device
 * review, took too much with it: the screen was sparse, nutrition had lost
 * its weight, the meal structure people navigate by had gone, and Water and
 * Peptides were wanted here after all. These cover what came back, the four
 * goal/food states, arranging, and the one architectural rule that matters
 * most — **there is only ever one water goal.**
 *
 * 5.6B.2 adds the hierarchy correction and the customisation surface on top:
 * Nutrition first, the Day Strip second, Water and Peptides as a pair of
 * squares, and a Customize Fuel sheet that can hide the three optional
 * sections, resize the two that have two designs, reorder everything and reset
 * — persisting all of it.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

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
  useLocalSearchParams: () => ({}),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Fuel from '../../../app/(vita)/(tabs)/fuel';
import FuelSetup from '../../../app/(vita)/fuel/setup';
import WaterGoalScreen from '../../../app/(vita)/water/goal';
import { ToastProvider, WaterVessel } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { NutritionProvider, createEntry, type MealSlot, type VitaFood } from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { FUEL_LAYOUT_KEY } from '../useFuelLayout';
import { DEFAULT_FUEL_LAYOUT, type FuelLayout } from '../sections';

const TODAY = todayLogDate();
const GOALS_KEY = 'vita:v1:targets';
const WATER_GOAL_KEY = 'vita:v1:water:goal';

const food = (name = 'Oats'): VitaFood => ({
  vitaId: `usda:${name}`,
  source: 'usda',
  sourceId: name,
  name,
  servings: [
    { label: '1 cup', quantity: 1, unit: 'cup', nutrition: { calories: 300, protein: 10, carbs: 54, fat: 5 } },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
});

async function seed(
  options: {
    goals?: unknown;
    waterGoal?: unknown;
    meals?: MealSlot[];
    layout?: unknown;
    setupDismissed?: boolean;
  } = {},
) {
  await AsyncStorage.clear();
  if (options.goals !== undefined) await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(options.goals));
  if (options.waterGoal !== undefined)
    await AsyncStorage.setItem(WATER_GOAL_KEY, JSON.stringify(options.waterGoal));
  if (options.layout !== undefined)
    await AsyncStorage.setItem(FUEL_LAYOUT_KEY, JSON.stringify(options.layout));
  if (options.setupDismissed)
    await AsyncStorage.setItem('vita:v1:fuel:setup', JSON.stringify({ dismissed: true }));
  if (options.meals?.length) {
    const entries = options.meals.map((meal) =>
      createEntry({ food: food(), quantity: 1, meal, logDate: TODAY }),
    );
    await AsyncStorage.setItem(`vita:v1:foodlog:${TODAY}`, JSON.stringify(entries));
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
            <NutritionProvider>
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

async function type(tree: ReactTestRenderer, label: RegExp, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => label.test(String(node.props.accessibilityLabel ?? '')));
  if (!field) throw new Error(`no field matching ${String(label)}`);
  await act(async () => field.props.onChangeText(value));
}

/* ── the four states ───────────────────────────────────────────────────── */

describe('the four core states', () => {
  it('no goals and no food still reads as a complete screen', async () => {
    // The founder's objection to 5.6B: one lonely line in a black void.
    await seed();
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('Set up Fuel');
    expect(rendered).toContain('No food logged today');
    for (const slot of ['Breakfast', 'Lunch', 'Dinner', 'Snacks']) {
      expect(rendered).toContain(slot);
    }
    expect(rendered).toContain('Water');
    expect(rendered).toContain('Peptides');
    expect(rendered).toContain('Add food');
  });

  it('goals and no food states them without a zero dashboard', async () => {
    await seed({ goals: { calories: 2000, protein: 150 } });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('2,000 calorie goal');
    expect(rendered).toContain('150 g protein goal');
    expect(rendered).not.toContain('0%');
    expect(rendered).not.toContain('Calories today');
    // Setup is done, so the invitation is gone.
    expect(rendered).not.toContain('Set your daily intake goals');
  });

  it('food and no goals leads with the food', async () => {
    await seed({ meals: ['Breakfast'] });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('300');
    expect(rendered).toContain('Calories today');
    expect(rendered).toContain('Protein');
    expect(rendered).not.toMatch(/\/\s*150/);
  });

  it('food and goals measures both', async () => {
    await seed({ goals: { calories: 2000, protein: 150 }, meals: ['Breakfast'] });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('2,000 goal');
    expect(rendered).toMatch(/Protein\s+10 \/ 150 g/);
    // Carbs and fat never gain a denominator, in any state.
    expect(rendered).not.toMatch(/Carbs[^·]*\//);
    expect(rendered).not.toMatch(/Fat[^·]*\//);
  });
});

/* ── setup ─────────────────────────────────────────────────────────────── */

describe('setting Fuel up', () => {
  it('offers only calories, protein and water — never carbs or fat', async () => {
    await seed();
    const tree = await mount(<FuelSetup />);

    const fields = tree.root
      .findAllByType(TextInput)
      .map((node) => String(node.props.accessibilityLabel ?? ''));
    expect(fields).toHaveLength(3);
    expect(fields[0]).toMatch(/^Daily calorie goal/);
    expect(fields[1]).toMatch(/^Daily protein goal/);
    expect(fields[2]).toMatch(/^Daily water goal/);
    expect(screen(tree)).not.toContain('Daily carb goal');
    expect(screen(tree)).not.toContain('Daily fat goal');
  });

  it('suggests nothing and prefills nothing', async () => {
    await seed();
    const tree = await mount(<FuelSetup />);

    for (const field of tree.root.findAllByType(TextInput)) {
      expect(field.props.value).toBe('');
      expect(String(field.props.placeholder)).not.toMatch(/\d/);
    }
    const rendered = screen(tree).toLowerCase();
    /*
     * "…or suggest what they should be" is the copy that *disclaims* a
     * recommendation, so it is removed before the scan rather than allowed
     * to mask a real one.
     */
    const claims = rendered.replace(
      "vita doesn't set them for you or suggest what they should be.",
      '',
    );
    for (const phrase of ['recommend', 'suggested', 'typical', 'ideal']) {
      expect(claims).not.toContain(phrase);
    }
  });

  it('saves calories alone', async () => {
    await seed();
    const tree = await mount(<FuelSetup />);
    await type(tree, /^Daily calorie goal/, '2200');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(JSON.parse((await AsyncStorage.getItem(GOALS_KEY))!)).toEqual({ calories: 2200 });
  });

  it('saves protein alone', async () => {
    await seed();
    const tree = await mount(<FuelSetup />);
    await type(tree, /^Daily protein goal/, '150');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(JSON.parse((await AsyncStorage.getItem(GOALS_KEY))!)).toEqual({ protein: 150 });
  });

  it('refuses a value that is not a positive number', async () => {
    await seed();
    const tree = await mount(<FuelSetup />);
    await type(tree, /^Daily calorie goal/, '-5');

    expect(screen(tree)).toContain('Enter a number greater than zero.');
    expect(control(tree, 'Save goals')!.props.disabled).toBe(true);
  });

  it('uses the shared numeric keyboard, with no screen-specific accessory', async () => {
    await seed();
    const tree = await mount(<FuelSetup />);

    const numeric = tree.root
      .findAllByType(TextInput)
      .filter((node) => node.props.keyboardType === 'decimal-pad');
    expect(numeric).toHaveLength(3);
    for (const field of numeric) expect(field.props.inputAccessoryViewID).toBeDefined();
  });

  it('lets the user leave without setting anything', async () => {
    await seed();
    const tree = await mount(<FuelSetup />);

    await act(async () => control(tree, 'Skip for now')!.props.onPress());
    expect(mockBack).toHaveBeenCalled();
    expect(await AsyncStorage.getItem(GOALS_KEY)).toBeNull();
  });

  it('stops inviting someone who skipped', async () => {
    // Declining once is an answer, not a state to be asked about again.
    await seed({ setupDismissed: true });
    const tree = await mount(<Fuel />);

    expect(screen(tree)).not.toContain('Set your daily intake goals');
    // …but the way back stays reachable.
    expect(control(tree, 'Set up Fuel')).toBeDefined();
  });
});

/* ── the water goal is Water's ─────────────────────────────────────────── */

describe('the shared water goal', () => {
  it('writes through Water’s own domain, not a Fuel copy', async () => {
    /*
     * The hard architectural rule. Fuel must not own a second water goal:
     * two numbers that disagree by Tuesday is the whole failure mode.
     */
    await seed();
    const tree = await mount(<FuelSetup />);

    await type(tree, /^Daily water goal/, '8');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    const stored = JSON.parse((await AsyncStorage.getItem(WATER_GOAL_KEY))!) as {
      amount: number;
    };
    expect(stored.amount).toBe(8);
    // And nothing Fuel-shaped was written alongside it.
    expect(await AsyncStorage.getItem('vita:v1:fuel:water')).toBeNull();
  });

  it('is the same goal the Water screen edits', async () => {
    await seed({ waterGoal: { amount: 8, unit: 'cup' } });

    const water = await mount(<WaterGoalScreen />);
    const field = water.root
      .findAllByType(TextInput)
      .find((node) => /goal in/i.test(String(node.props.accessibilityLabel ?? '')));
    expect(field?.props.value).toBe('8');
    await act(async () => water.unmount());
    mounted = null;

    // The same figure reaches Fuel's own setup surface.
    const setup = await mount(<FuelSetup />);
    const fuelField = setup.root
      .findAllByType(TextInput)
      .find((node) => /^Daily water goal/.test(String(node.props.accessibilityLabel ?? '')));
    expect(fuelField?.props.value).toBe('8');
  });

  it('shows Water’s progress on Fuel once a goal exists', async () => {
    /*
     * Shown in the user's own display unit, which is Water's preference and
     * not Fuel's business: a goal stored as 8 cups reads as 64 fl oz for
     * someone whose Water screen is set to fluid ounces. Fuel reuses that
     * conversion rather than owning one.
     */
    await seed({ waterGoal: { amount: 8, unit: 'cup' } });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('Water');
    // Home's wording, now Fuel's too: the percentage leads and the remainder
    // supports it. 8 cups reads as 64 fl oz — the display preference is
    // Water's, and Fuel does not get its own.
    expect(rendered).toMatch(/64 fl oz to go|0%/);
  });

  it('states the total with no goal, and no fake percentage', async () => {
    await seed();
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('Water');
    // The day's real total leads, and no percentage is invented for a goal
    // that does not exist — the same reading Home gives.
    expect(rendered).toContain('No goal set');
    expect(rendered).not.toContain('0%');
  });
});

/* ── arranging ─────────────────────────────────────────────────────────── */

describe('arranging the sections', () => {
  const arrange = async (tree: ReactTestRenderer) => {
    const holdable = tree.root.findAll((node) => typeof node.props?.onLongPress === 'function')[0];
    await act(async () => holdable.props.onLongPress());
  };

  it('starts in the founder-approved order', async () => {
    await seed({ meals: ['Breakfast'] });
    const lines = texts(await mount(<Fuel />));

    /*
     * Asserted on strings that appear in exactly one section: "Breakfast"
     * is also the Day Strip's meal marker, so it cannot locate the meals
     * section. "No foods logged" only ever appears there.
     */
    expect(lines.indexOf('Calories today')).toBeLessThan(lines.indexOf('No foods logged'));
    expect(lines.indexOf('No foods logged')).toBeLessThan(lines.indexOf('Water'));
    expect(lines.indexOf('Water')).toBeLessThan(lines.indexOf('Peptides'));
  });

  it('opens on a long press, and offers Done', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    expect(control(tree, 'Done arranging Fuel')).toBeUndefined();

    await arrange(tree);
    expect(control(tree, 'Done arranging Fuel')).toBeDefined();
    expect(control(tree, 'Move Meals up')).toBeDefined();
  });

  it('offers move controls, so a drag is never the only way', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await arrange(tree);

    await act(async () => control(tree, 'Move Water up')!.props.onPress());
    const lines = texts(tree);
    expect(lines.indexOf('WATER')).toBeLessThan(lines.indexOf('No foods logged'));
  });

  it('cannot move the first section up or the last one down', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await arrange(tree);

    expect(control(tree, 'Move Nutrition up')!.props.disabled).toBe(true);
    expect(control(tree, 'Move Peptides down')!.props.disabled).toBe(true);
  });

  it('persists the order', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await arrange(tree);
    await act(async () => control(tree, 'Move Peptides up')!.props.onPress());

    const stored = JSON.parse((await AsyncStorage.getItem(FUEL_LAYOUT_KEY))!) as {
      order: string[];
    };
    expect(stored.order.indexOf('peptides')).toBeLessThan(stored.order.indexOf('water'));
  });

  it('restores a stored order on the next launch', async () => {
    await seed({ layout: ['water', 'peptides', 'dayStrip', 'nutrition', 'meals'] });
    const lines = texts(await mount(<Fuel />));

    expect(lines.indexOf('Water')).toBeLessThan(lines.indexOf('Peptides'));
    expect(lines.indexOf('Peptides')).toBeLessThan(lines.indexOf('No food logged today'));
  });

  it('repairs a stored order written by another build', async () => {
    // Unknown section, a repeat, and one missing — all normal, all survivable.
    await seed({ layout: ['movement', 'water', 'water'] });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('Water');
    expect(rendered).toContain('Peptides');
    expect(rendered).toContain('Breakfast');
  });

  it('leaves the header and Add Food out of the arrangement', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await arrange(tree);

    // Fixed furniture: no move controls for any of them.
    expect(control(tree, /Move (Fuel|Add food|Scan) /)).toBeUndefined();
  });
});

/* ── meals ─────────────────────────────────────────────────────────────── */

describe('the meals section', () => {
  it('keeps all four slots, compactly', async () => {
    await seed({ meals: ['Breakfast'] });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('300 cal · 1 food');
    expect(rendered).toContain('No foods logged');
  });

  it('starts collapsed and opens on tap', async () => {
    await seed({ meals: ['Breakfast'] });
    const tree = await mount(<Fuel />);
    expect(screen(tree)).not.toContain('Oats');

    await act(async () => control(tree, /^Breakfast, 1 food/)!.props.onPress());
    expect(screen(tree)).toContain('Oats');

    await act(async () => control(tree, /^Breakfast, 1 food/)!.props.onPress());
    expect(screen(tree)).not.toContain('Oats');
  });

  it('announces whether a meal is open', async () => {
    await seed({ meals: ['Breakfast'] });
    const tree = await mount(<Fuel />);

    expect(control(tree, /^Breakfast, 1 food/)!.props.accessibilityState.expanded).toBe(false);
    await act(async () => control(tree, /^Breakfast, 1 food/)!.props.onPress());
    expect(control(tree, /^Breakfast, 1 food/)!.props.accessibilityState.expanded).toBe(true);
  });

  it('adds straight into an empty meal', async () => {
    await seed();
    const tree = await mount(<Fuel />);

    await act(async () => control(tree, 'Add food to Dinner')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/add?meal=Dinner');
  });
});

/* ── customizing Fuel ──────────────────────────────────────────────────── */

/** Reads back what the screen actually persisted. */
async function storedLayout(): Promise<FuelLayout> {
  return JSON.parse((await AsyncStorage.getItem(FUEL_LAYOUT_KEY))!) as FuelLayout;
}

/** Opens the sheet the way a user does — through the header's `•••`. */
async function customize(tree: ReactTestRenderer) {
  await act(async () => control(tree, 'Customize Fuel')!.props.onPress());
}

/**
 * Nodes carrying a `testID`, host elements only.
 *
 * `findAll` walks composites too, so a `<View testID>` matches twice — once as
 * the RN component and once as the host it renders. Counting rows would be
 * doubled without this.
 */
function byTestID(tree: ReactTestRenderer, match: (id: string) => boolean) {
  return tree.root.findAll(
    (node) => typeof node.type === 'string' && typeof node.props?.testID === 'string' && match(node.props.testID),
  );
}

/** A section is on the screen when its wrapper is. */
function hasSection(tree: ReactTestRenderer, id: string): boolean {
  return byTestID(tree, (value) => value === `fuel-section-${id}`).length > 0;
}

/** The side-by-side rows currently rendered. */
function pairs(tree: ReactTestRenderer) {
  return byTestID(tree, (value) => value === 'fuel-pair');
}

/** The sections on screen, in the order they are drawn. */
function sectionsOf(tree: ReactTestRenderer): string[] {
  return byTestID(tree, (value) => value.startsWith('fuel-section-')).map((node) =>
    String(node.props.testID).replace('fuel-section-', ''),
  );
}

describe('the default composition', () => {
  it('leads with Nutrition, then Meals, then the pair — and no Day Strip', async () => {
    /*
     * 5.6B.2 put Nutrition first. 5.6B.3 switched the Day Strip off by
     * default: seeing Nutrition, the strip and four meal rows together, the
     * founder ruled the strip added density without adding an answer.
     */
    await seed({ goals: { calories: 2000 }, meals: ['Breakfast'] });
    const tree = await mount(<Fuel />);

    expect(screen(tree)).toContain('2,000 goal');
    expect(sectionsOf(tree)).toEqual(['nutrition', 'meals', 'water', 'peptides']);
  });

  it('brings the Day Strip back when it is switched on', async () => {
    await seed({ meals: ['Breakfast'] });
    const tree = await mount(<Fuel />);
    await customize(tree);
    await act(async () => control(tree, 'Show Day Strip')!.props.onPress());

    expect(sectionsOf(tree)).toEqual(['nutrition', 'meals', 'water', 'peptides', 'dayStrip']);
  });

  it('pairs Water and Peptides side by side', async () => {
    await seed();
    const tree = await mount(<Fuel />);

    expect(pairs(tree)).toHaveLength(1);
    const inside = pairs(tree)[0]
      .findAll(
        (node) =>
          typeof node.type === 'string' &&
          String(node.props?.testID ?? '').startsWith('fuel-section-'),
      )
      .map((node) => String(node.props.testID));
    expect(inside).toEqual(['fuel-section-water', 'fuel-section-peptides']);
  });

  it('keeps a lone square at square width rather than stretching it', async () => {
    /*
     * The §16 case, and the defect the 5.6B.2 device pass caught: Water
     * square with Meals between it and Peptides square is two separate rows,
     * and the square in each must still be a square. A lone square rendered
     * into a full-width row *is* a wide module.
     */
    await seed({ layout: { order: ['nutrition', 'water', 'meals', 'peptides', 'dayStrip'] } });
    const tree = await mount(<Fuel />);

    expect(pairs(tree)).toHaveLength(0);
    expect(byTestID(tree, (value) => value === 'fuel-square-row')).toHaveLength(2);
    // Still squares, not the wide design.
    expect(byTestID(tree, (value) => value.endsWith('-wide'))).toHaveLength(0);
  });

  it('renders both modules in their square design', async () => {
    await seed({ waterGoal: { amount: 8, unit: 'cup' } });
    const tree = await mount(<Fuel />);

    expect(byTestID(tree, (value) => value === 'fuel-water-square')).toHaveLength(1);
    expect(byTestID(tree, (value) => value === 'fuel-peptides-square')).toHaveLength(1);
    expect(byTestID(tree, (value) => value.endsWith('-wide'))).toHaveLength(0);
  });

  it('drops the decorative vessel at accessibility text sizes, keeping the words', async () => {
    /*
     * The RN jest preset reports `fontScale: 2`, which is exactly the case
     * worth pinning: past `COMPACT_FONT_SCALE` the vessel stands aside so the
     * figures can have its space. It is decorative — it encodes only what the
     * two lines say — so nothing is lost. Home behaves identically, because
     * it is the same component.
     */
    await seed({ waterGoal: { amount: 8, unit: 'cup' } });
    const tree = await mount(<Fuel />);

    expect(tree.root.findAllByType(WaterVessel)).toHaveLength(0);
    /*
     * `64 fl oz`, not `8 cups`: the goal was authored in cups and the display
     * preference defaults to fluid ounces, so Water converts it — the same
     * behaviour the Water screen shows. The figure survives the vessel being
     * dropped, which is the point of the assertion.
     */
    expect(screen(tree)).toContain('64 fl oz to go');
  });
});

describe('the Customize Fuel sheet', () => {
  it('is reached from the header, and not before', async () => {
    await seed();
    const tree = await mount(<Fuel />);

    expect(control(tree, 'Show Day Strip')).toBeUndefined();
    expect(control(tree, 'Customize Fuel')).toBeDefined();

    await customize(tree);
    // It starts hidden, so the control offers to show it.
    expect(control(tree, 'Show Day Strip')).toBeDefined();
    expect(control(tree, 'Reset Fuel layout to default')).toBeDefined();
  });

  it('shows and hides the Day Strip, which starts off', async () => {
    await seed({ meals: ['Breakfast'] });
    const tree = await mount(<Fuel />);
    await customize(tree);

    // Meals works with the strip off — no feature depends on it.
    expect(hasSection(tree, 'dayStrip')).toBe(false);
    expect(screen(tree)).toContain('300 cal · 1 food');

    await act(async () => control(tree, 'Show Day Strip')!.props.onPress());
    expect(hasSection(tree, 'dayStrip')).toBe(true);

    await act(async () => control(tree, 'Hide Day Strip')!.props.onPress());
    expect(hasSection(tree, 'dayStrip')).toBe(false);
  });

  it('remembers the Day Strip being switched on, and Reset switches it off', async () => {
    /*
     * The distinction the founder drew: a *default* that changed must not
     * overwrite a *choice* somebody made. Turning the strip on is a choice
     * and survives a relaunch; Reset Layout is the deliberate way back.
     */
    await seed();
    const first = await mount(<Fuel />);
    await customize(first);
    await act(async () => control(first, 'Show Day Strip')!.props.onPress());
    await act(async () => first.unmount());

    const second = await mount(<Fuel />);
    expect(hasSection(second, 'dayStrip')).toBe(true);

    await customize(second);
    await act(async () => control(second, 'Reset Fuel layout to default')!.props.onPress());
    expect(hasSection(second, 'dayStrip')).toBe(false);
    expect((await storedLayout()).hidden).toEqual(['dayStrip']);
  });

  it('hides and shows Water', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    await act(async () => control(tree, 'Hide Water')!.props.onPress());
    expect(hasSection(tree, 'water')).toBe(false);

    await act(async () => control(tree, 'Show Water')!.props.onPress());
    expect(hasSection(tree, 'water')).toBe(true);
  });

  it('hides and shows Peptides', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    await act(async () => control(tree, 'Hide Peptides')!.props.onPress());
    expect(hasSection(tree, 'peptides')).toBe(false);

    await act(async () => control(tree, 'Show Peptides')!.props.onPress());
    expect(hasSection(tree, 'peptides')).toBe(true);
  });

  it('offers no way to hide Nutrition or Meals', async () => {
    // They define the feature. There is no control, rather than a control
    // that refuses — and no delete × anywhere in the sheet.
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    expect(control(tree, 'Hide Nutrition')).toBeUndefined();
    expect(control(tree, 'Hide Meals')).toBeUndefined();
    expect(control(tree, /^Remove /)).toBeUndefined();
    expect(screen(tree)).toContain('Wide · Always shown');
  });

  it('hiding Water leaves the Water feature untouched', async () => {
    await seed({ waterGoal: { amount: 8, unit: 'cup' } });
    const tree = await mount(<Fuel />);
    await customize(tree);
    await act(async () => control(tree, 'Hide Water')!.props.onPress());

    // The goal is still exactly where Water wrote it.
    expect(JSON.parse((await AsyncStorage.getItem(WATER_GOAL_KEY))!)).toEqual({
      amount: 8,
      unit: 'cup',
    });
  });

  it('sets Water wide and back to square', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    await act(async () => control(tree, 'Set Water to wide')!.props.onPress());
    expect((await storedLayout()).sizes.water).toBe('wide');
    // And with one square left, nothing is paired.
    expect(pairs(tree)).toHaveLength(0);
    expect(byTestID(tree, (value) => value === 'fuel-water-wide')).toHaveLength(1);

    await act(async () => control(tree, 'Set Water to square')!.props.onPress());
    expect((await storedLayout()).sizes.water).toBe('square');
  });

  it('sets Peptides wide and back to square', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    await act(async () => control(tree, 'Set Peptides to wide')!.props.onPress());
    expect((await storedLayout()).sizes.peptides).toBe('wide');
    expect(pairs(tree)).toHaveLength(0);
    expect(byTestID(tree, (value) => value === 'fuel-peptides-wide')).toHaveLength(1);

    await act(async () => control(tree, 'Set Peptides to square')!.props.onPress());
    expect((await storedLayout()).sizes.peptides).toBe('square');
  });

  it('offers no size control for the three wide sections', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    for (const label of ['Nutrition', 'Day Strip', 'Meals']) {
      expect(control(tree, `Set ${label} to square`)).toBeUndefined();
      expect(control(tree, `Set ${label} to wide`)).toBeUndefined();
    }
  });

  it('reorders with Move up, the same as the in-page arrows', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    await act(async () => control(tree, 'Move Peptides up')!.props.onPress());
    expect((await storedLayout()).order).toEqual([
      'nutrition',
      'meals',
      'peptides',
      'water',
      'dayStrip',
    ]);
  });

  it('describes each row for a screen reader', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    const row = tree.root.findAll(
      (node) => String(node.props?.accessibilityLabel ?? '').startsWith('Water,'),
    )[0];
    expect(row.props.accessibilityLabel).toBe('Water, visible, Square, position 3 of 5');
  });

  it('persists everything, and restores it on the next launch', async () => {
    await seed();
    const first = await mount(<Fuel />);
    await customize(first);
    await act(async () => control(first, 'Hide Water')!.props.onPress());
    await act(async () => control(first, 'Set Water to wide')!.props.onPress());
    await act(async () => control(first, 'Move Peptides up')!.props.onPress());
    await act(async () => first.unmount());

    const stored = await storedLayout();
    expect(stored.hidden).toEqual(['dayStrip', 'water']);
    expect(stored.sizes.water).toBe('wide');

    const second = await mount(<Fuel />);
    expect(hasSection(second, 'water')).toBe(false);
    expect(pairs(second)).toHaveLength(0);
  });

  it('resets to the founder-approved default', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);
    await act(async () => control(tree, 'Hide Water')!.props.onPress());
    await act(async () => control(tree, 'Set Peptides to wide')!.props.onPress());
    await act(async () => control(tree, 'Move Meals up')!.props.onPress());

    await act(async () => control(tree, 'Reset Fuel layout to default')!.props.onPress());

    expect(await storedLayout()).toEqual(DEFAULT_FUEL_LAYOUT);
    expect(hasSection(tree, 'water')).toBe(true);
    expect(pairs(tree)).toHaveLength(1);
  });

  it('works on a screen with no food, no goals and nothing scheduled', async () => {
    // A section is structural: it does not disappear because its data is empty.
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    for (const label of ['Nutrition', 'Day Strip', 'Meals', 'Water', 'Peptides']) {
      expect(control(tree, `Move ${label} down`)).toBeDefined();
    }
  });
});

/* ── arrange mode, and motion ──────────────────────────────────────────── */

describe('arrange mode', () => {
  const hold = async (tree: ReactTestRenderer) => {
    const holdable = tree.root.findAll((node) => typeof node.props?.onLongPress === 'function')[0];
    await act(async () => holdable.props.onLongPress());
  };

  it('breaks the pair into one section per row', async () => {
    /*
     * A vertical drag cannot tell two sections sharing a row apart, and the
     * list being reordered has to be the list on screen. The pair comes back
     * on Done.
     */
    await seed();
    const tree = await mount(<Fuel />);
    expect(pairs(tree)).toHaveLength(1);

    await hold(tree);
    expect(pairs(tree)).toHaveLength(0);
    expect(hasSection(tree, 'water')).toBe(true);
    expect(hasSection(tree, 'peptides')).toBe(true);

    await act(async () => control(tree, 'Done arranging Fuel')!.props.onPress());
    expect(pairs(tree)).toHaveLength(1);
  });

  it('steps over a hidden section rather than swapping with it', async () => {
    // Hiding the Day Strip and moving Meals up has to move Meals above
    // Nutrition — swapping with something invisible reads as a dead button.
    // The strip between Nutrition and Meals, switched off: moving Meals up
    // has to reach Nutrition rather than swap with something invisible.
    await seed({ layout: { order: ['nutrition', 'dayStrip', 'meals', 'water', 'peptides'] } });
    const tree = await mount(<Fuel />);

    await hold(tree);
    await act(async () => control(tree, 'Move Meals up')!.props.onPress());

    const stored = await storedLayout();
    expect(stored.hidden).toEqual(['dayStrip']);
    expect(stored.order.indexOf('meals')).toBeLessThan(stored.order.indexOf('nutrition'));
  });
});

describe('with Reduce Motion on', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  });
  afterEach(() => jest.restoreAllMocks());

  it('still reorders, still hides, still resets', async () => {
    // The rule: no information may depend on animation. Everything the
    // customisation does is reachable with every transition switched off.
    await seed();
    const tree = await mount(<Fuel />);
    await customize(tree);

    await act(async () => control(tree, 'Move Peptides up')!.props.onPress());
    await act(async () => control(tree, 'Hide Water')!.props.onPress());
    expect(hasSection(tree, 'water')).toBe(false);

    await act(async () => control(tree, 'Reset Fuel layout to default')!.props.onPress());
    expect(await storedLayout()).toEqual(DEFAULT_FUEL_LAYOUT);
  });
});
