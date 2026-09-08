/**
 * Fuel Home's restored structure — the 5.6B.1 correction, on the screen.
 *
 * 5.6B replaced the old card architecture and, in the founder's device
 * review, took too much with it: the screen was sparse, nutrition had lost
 * its weight, the meal structure people navigate by had gone, and Water and
 * Peptides were wanted here after all. These cover what came back, the four
 * goal/food states, arranging, and the one architectural rule that matters
 * most — **there is only ever one water goal.**
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
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Fuel from '../../../app/(vita)/(tabs)/fuel';
import FuelSetup from '../../../app/(vita)/fuel/setup';
import WaterGoalScreen from '../../../app/(vita)/water/goal';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { NutritionProvider, createEntry, type MealSlot, type VitaFood } from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { FUEL_LAYOUT_KEY } from '../useFuelLayout';

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
    expect(rendered).toContain('No food logged yet');
    for (const slot of ['Breakfast', 'Lunch', 'Dinner', 'Snacks']) {
      expect(rendered).toContain(slot);
    }
    expect(rendered).toContain('WATER');
    expect(rendered).toContain('PEPTIDES');
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

    expect(rendered).toContain('WATER');
    expect(rendered).toMatch(/of 64 fl oz|of 8 cups/);
  });

  it('states the total with no goal, and no fake percentage', async () => {
    await seed();
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('WATER');
    expect(rendered).toContain('None logged');
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
    expect(lines.indexOf('No foods logged')).toBeLessThan(lines.indexOf('WATER'));
    expect(lines.indexOf('WATER')).toBeLessThan(lines.indexOf('PEPTIDES'));
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

    expect(control(tree, 'Move Today up')!.props.disabled).toBe(true);
    expect(control(tree, 'Move Peptides down')!.props.disabled).toBe(true);
  });

  it('persists the order', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    await arrange(tree);
    await act(async () => control(tree, 'Move Peptides up')!.props.onPress());

    const stored = JSON.parse((await AsyncStorage.getItem(FUEL_LAYOUT_KEY))!) as string[];
    expect(stored.indexOf('peptides')).toBeLessThan(stored.indexOf('water'));
  });

  it('restores a stored order on the next launch', async () => {
    await seed({ layout: ['water', 'peptides', 'dayStrip', 'nutrition', 'meals'] });
    const lines = texts(await mount(<Fuel />));

    expect(lines.indexOf('WATER')).toBeLessThan(lines.indexOf('PEPTIDES'));
    expect(lines.indexOf('PEPTIDES')).toBeLessThan(lines.indexOf('No food logged yet'));
  });

  it('repairs a stored order written by another build', async () => {
    // Unknown section, a repeat, and one missing — all normal, all survivable.
    await seed({ layout: ['movement', 'water', 'water'] });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('WATER');
    expect(rendered).toContain('PEPTIDES');
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
