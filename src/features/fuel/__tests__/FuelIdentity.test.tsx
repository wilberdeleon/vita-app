/**
 * Fuel's final visual identity — the 5.6B.4 polish, asserted as meaning.
 *
 * Three founder findings, three sections below: the calorie summary now says
 * the same thing on Fuel and on Home; the macros carry a category identity
 * that is not a health verdict; and the meal rows have their time of day back.
 *
 * **No pixels are compared.** What is pinned is the mapping — which accent and
 * which glyph a thing gets, and that the two screens agree about the day.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Dashboard from '../../../app/(vita)/(tabs)/dashboard';
import Fuel from '../../../app/(vita)/(tabs)/fuel';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { NutritionProvider, createEntry, type MealSlot, type VitaFood } from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { lightSurfaces, palette } from '../../../theme/tokens';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { macroAccent } from '../macroAccent';
import { mealAccent } from '../mealAccent';

const TODAY = todayLogDate();

/**
 * The scheme these tests run in.
 *
 * `ThemeProvider` resolves to light when the host reports no system
 * preference, which is what the jest environment does. Stated once here so the
 * colour assertions below read as "the accent for the active scheme" rather
 * than as magic hexes.
 */
const SCHEME = 'light' as const;

const food = (calories: number): VitaFood => ({
  vitaId: 'usda:test',
  source: 'usda',
  sourceId: 'test',
  name: 'Oats',
  servings: [
    {
      label: '1 cup',
      quantity: 1,
      unit: 'cup',
      nutrition: { calories, protein: 20, carbs: 40, fat: 10 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
});

async function seed(options: { calories?: number; goals?: unknown; meals?: MealSlot[] } = {}) {
  await AsyncStorage.clear();
  if (options.goals !== undefined) {
    await AsyncStorage.setItem('vita:v1:targets', JSON.stringify(options.goals));
  }
  const meals = options.meals ?? ['Lunch'];
  const entries = meals.map((meal) =>
    createEntry({ food: food(options.calories ?? 616), quantity: 1, meal, logDate: TODAY }),
  );
  await AsyncStorage.setItem(`vita:v1:foodlog:${TODAY}`, JSON.stringify(entries));
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
  await AsyncStorage.clear();
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = Array.isArray(node.props.children)
        ? node.props.children
        : [node.props.children];
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

/** The spoken label of the Fuel widget on Home, whichever shape it is in. */
function homeFuelLabel(tree: ReactTestRenderer): string {
  return String(control(tree, /^Fuel\./)!.props.accessibilityLabel);
}

/* ── the calorie summary, on both screens ──────────────────────────────── */

describe('Fuel calories', () => {
  it('leads with consumed and supports it with the remainder and the goal', async () => {
    await seed({ calories: 616, goals: { calories: 1500 } });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('616');
    expect(rendered).toContain('Calories consumed');
    expect(rendered).toContain('884 left · 1,500 goal');
  });

  it('states the total alone when no goal exists', async () => {
    await seed({ calories: 616 });
    const rendered = screen(await mount(<Fuel />));

    expect(rendered).toContain('616');
    expect(rendered).toContain('Calories consumed');
    expect(rendered).not.toMatch(/left|goal reached|over ·/i);
  });

  it('says the goal was reached rather than reporting nothing left', async () => {
    await seed({ calories: 1500, goals: { calories: 1500 } });
    expect(screen(await mount(<Fuel />))).toContain('Goal reached · 1,500 goal');
  });

  it('states an over day factually, and never in red', async () => {
    await seed({ calories: 1620, goals: { calories: 1500 } });
    const tree = await mount(<Fuel />);

    expect(screen(tree)).toContain('120 over · 1,500 goal');
    // Amber, the same colour a skipped routine takes. `palette.fat` is the
    // error red and must not appear on a day that simply went further.
    const figure = tree.root
      .findAllByType(Text)
      .find((node) => String(node.props.children) === '1,620');
    const style = [figure!.props.style].flat(3).find((entry) => entry && 'color' in entry);
    expect((style as { color: string }).color).toBe(palette.carbs);
  });
});

describe('Home and Fuel', () => {
  /**
   * The point of the shared summary: the two screens may word things
   * differently, but for one day's data they must not disagree about it.
   */
  const cases: { name: string; calories: number; goals?: unknown; expect: RegExp }[] = [
    { name: 'no goal', calories: 616, expect: /616 calories consumed\. No calorie goal set\./ },
    {
      name: 'under goal',
      calories: 616,
      goals: { calories: 1500 },
      expect: /616 calories consumed\. 1,500 calorie goal\. 884 calories remaining\./,
    },
    {
      name: 'exactly at goal',
      calories: 1500,
      goals: { calories: 1500 },
      expect: /1,500 calories consumed\. 1,500 calorie goal\. Goal reached\./,
    },
    {
      name: 'over goal',
      calories: 1620,
      goals: { calories: 1500 },
      expect: /1,620 calories consumed\. 1,500 calorie goal\. 120 calories over\./,
    },
  ];

  for (const item of cases) {
    it(`announce the same facts — ${item.name}`, async () => {
      await seed({ calories: item.calories, goals: item.goals });

      const fuel = await mount(<Fuel />);
      const fuelSpoken = String(
        fuel.root.findAll((node) => item.expect.test(String(node.props?.accessibilityLabel ?? '')))
          .length,
      );
      expect(Number(fuelSpoken)).toBeGreaterThan(0);
      await act(async () => fuel.unmount());
      mounted = null;

      const home = await mount(<Dashboard />);
      expect(homeFuelLabel(home)).toMatch(item.expect);
    });
  }

  it('show the compact form on Home and the full form on Fuel', async () => {
    await seed({ calories: 616, goals: { calories: 1500 } });

    const home = await mount(<Dashboard />);
    const homeText = screen(home);
    expect(homeText).toContain('616 cal consumed');
    expect(homeText).toContain('884 left');
    // The goal is carried by the remainder and the rail; a fourth figure is
    // what stops a compact widget being compact.
    expect(homeText).not.toContain('1,500 goal');
    await act(async () => home.unmount());
    mounted = null;

    const fuel = await mount(<Fuel />);
    expect(screen(fuel)).toContain('884 left · 1,500 goal');
  });

  it('make no claim about a target on Home when none is set', async () => {
    await seed({ calories: 616 });
    const home = await mount(<Dashboard />);

    expect(screen(home)).toContain('616 cal consumed');
    expect(screen(home)).not.toContain('cal left');
    expect(homeFuelLabel(home)).toContain('No calorie goal set');
  });
});

/* ── macro identity ────────────────────────────────────────────────────── */

describe('the macro row', () => {
  function macro(tree: ReactTestRenderer, key: 'protein' | 'carbs' | 'fat') {
    return tree.root.find(
      (node) => typeof node.type === 'string' && node.props?.testID === `fuel-macro-${key}`,
    );
  }

  it('gives each macro its own category accent', async () => {
    await seed({ calories: 616 });
    const tree = await mount(<Fuel />);

    for (const key of ['protein', 'carbs', 'fat'] as const) {
      const label = macro(tree, key).findAllByType(Text)[0];
      const style = [label.props.style].flat(3).find((entry) => entry && 'color' in entry);
      expect((style as { color: string }).color).toBe(macroAccent(key, SCHEME));
    }
  });

  it('never uses the green that would read as a verdict', async () => {
    /*
     * The macro palette tokens are green, amber and red — a traffic light,
     * which is what got the composition bar deleted and protein's green rail
     * removed. Green in particular says *good*, and VITA does not grade food.
     */
    for (const key of ['protein', 'carbs', 'fat'] as const) {
      for (const scheme of ['light', 'dark'] as const) {
        expect(macroAccent(key, scheme)).not.toBe(palette.protein);
        expect(macroAccent(key, scheme)).not.toBe(palette.journey);
        expect(macroAccent(key, scheme)).not.toBe(palette.success);
      }
    }
  });

  it('gives each macro a distinct accent in both schemes', async () => {
    for (const scheme of ['light', 'dark'] as const) {
      const accents = (['protein', 'carbs', 'fat'] as const).map((key) => macroAccent(key, scheme));
      expect(new Set(accents).size).toBe(3);
      // And none of them borrows a neighbouring feature's colour outright.
      for (const accent of accents) {
        expect(accent).not.toBe(palette.water);
        expect(accent).not.toBe(palette.peptide);
        expect(accent).not.toBe(palette.primary);
      }
    }
  });

  it('keeps the figures neutral, whatever the accent', async () => {
    // The colour identifies the column; it never colours the number, which
    // is where a category accent would start reading as a status.
    await seed({ calories: 616 });
    const tree = await mount(<Fuel />);

    for (const key of ['protein', 'carbs', 'fat'] as const) {
      const value = macro(tree, key).findAllByType(Text)[1];
      const style = [value.props.style].flat(3).find((entry) => entry && 'color' in entry);
      expect((style as { color: string }).color).toBe(lightSurfaces.text);
    }
  });

  it('rails only where a goal exists', async () => {
    await seed({ calories: 616, goals: { protein: 200 } });
    const withGoal = await mount(<Fuel />);
    expect(screen(withGoal)).toMatch(/20 \/ 200 g/);
    await act(async () => withGoal.unmount());
    mounted = null;

    await seed({ calories: 616 });
    const without = await mount(<Fuel />);
    const rendered = screen(without);
    expect(rendered).toMatch(/20 g/);
    // Carbs and fat never gain a denominator, a target or a limit.
    expect(rendered).not.toMatch(/Carbs[^·]*\//);
    expect(rendered).not.toMatch(/Fat[^·]*\//);
    expect(rendered.toLowerCase()).not.toContain('limit');
  });

  it('speaks each macro without needing its colour', async () => {
    await seed({ calories: 616, goals: { protein: 200 } });
    const tree = await mount(<Fuel />);
    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));

    expect(spoken).toContain('20 grams of 200 gram protein goal.');
    expect(spoken).toContain('40 grams carbohydrates.');
    expect(spoken).toContain('10 grams fat.');
  });
});

/* ── meal identity ─────────────────────────────────────────────────────── */

describe('the meal rows', () => {
  it('map each meal to its own time of day', () => {
    expect(mealAccent('Breakfast').icon).toBe('partly-sunny-outline');
    expect(mealAccent('Lunch').icon).toBe('sunny-outline');
    // The founder asked for a moon, and for the red to go.
    expect(mealAccent('Dinner').icon).toBe('moon-outline');
    expect(mealAccent('Dinner', 'dark').color).not.toBe(palette.fat);
    expect(mealAccent('Snacks').icon).toBe('restaurant-outline');
  });

  it('gives all four a distinct accent in both schemes', () => {
    const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
    for (const scheme of ['light', 'dark'] as const) {
      const colors = slots.map((slot) => mealAccent(slot, scheme).color);
      expect(new Set(colors).size).toBe(4);
    }
  });

  it('keeps meal colours out of the macro language', () => {
    /*
     * A meal accent means *what time of day*; a macro accent means *which
     * nutrient*. Sharing a hex between the two would tie the languages
     * together and imply the row was saying something about the food.
     */
    const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
    for (const scheme of ['light', 'dark'] as const) {
      const meals = slots.map((slot) => mealAccent(slot, scheme).color);
      for (const key of ['protein', 'carbs', 'fat'] as const) {
        expect(meals).not.toContain(macroAccent(key, scheme));
      }
    }
  });

  it('draws the icon for every slot, logged or not', async () => {
    // An empty row keeps its identity; that is what stops the screen going
    // visually dead on a day nobody has eaten yet.
    await seed({ calories: 616, meals: ['Lunch'] });
    const tree = await mount(<Fuel />);

    for (const slot of ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const) {
      const row = control(tree, new RegExp(`^${slot}\\.`));
      expect(row).toBeDefined();
      const icons = row.findAll((node) => node.props?.name === mealAccent(slot).icon);
      expect(icons.length).toBeGreaterThan(0);
    }
  });

  it('hides the icon from assistive technology — the name already says it', async () => {
    await seed({ calories: 616, meals: ['Lunch'] });
    const tree = await mount(<Fuel />);
    const icon = control(tree, /^Lunch\./).findAll(
      (node) => node.props?.name === 'sunny-outline',
    )[0];
    expect(icon.props.accessibilityElementsHidden).toBe(true);
  });

  it('announces a logged meal, its calories, its count and its state', async () => {
    await seed({ calories: 616, meals: ['Lunch'] });
    const tree = await mount(<Fuel />);

    expect(String(control(tree, /^Lunch\./).props.accessibilityLabel)).toBe(
      'Lunch. 616 calories. 1 food. Collapsed.',
    );
    await act(async () => control(tree, /^Lunch\./).props.onPress());
    expect(String(control(tree, /^Lunch\./).props.accessibilityLabel)).toBe(
      'Lunch. 616 calories. 1 food. Expanded.',
    );
  });

  it('announces an empty meal as empty, and as the way to fill it', async () => {
    await seed({ calories: 616, meals: ['Lunch'] });
    const tree = await mount(<Fuel />);
    expect(String(control(tree, /^Dinner\./).props.accessibilityLabel)).toBe(
      'Dinner. No foods logged. Add food to Dinner',
    );
  });

  it('leaves the foods inside a meal neutral', async () => {
    // The tint belongs to the meal, not to what was eaten — colouring the
    // foods would look like the row grading them.
    await seed({ calories: 616, meals: ['Dinner'] });
    const tree = await mount(<Fuel />);
    await act(async () => control(tree, /^Dinner\./).props.onPress());

    const name = tree.root.findAllByType(Text).find((node) => node.props.children === 'Oats');
    const style = [name!.props.style].flat(3).find((entry) => entry && 'color' in entry);
    expect((style as { color: string }).color).toBe(lightSurfaces.text);
  });
});
