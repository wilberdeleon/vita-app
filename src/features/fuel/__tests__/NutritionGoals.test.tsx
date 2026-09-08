/**
 * Nutrition goals, end to end — the product change slice 5.6A exists for.
 *
 * VITA shipped hardcoded goals of 2,000 kcal, 160 g protein, 214 g carbs
 * and 64 g fat and presented them across Fuel as the user's own, while the
 * API for setting goals had no caller anywhere in the app. The founder
 * ruling: **a goal exists when the user creates one, and not before.**
 *
 * These cover the whole path — the editor writes it, storage keeps it, Fuel
 * reflects it, and clearing it returns to nothing rather than to the old
 * figures.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: jest.fn(),
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
import NutritionGoals from '../../../app/(vita)/settings/nutrition-goals';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { NutritionProvider, createEntry, type VitaFood } from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const TODAY = todayLogDate();
const GOALS_KEY = 'vita:v1:targets';

const food = (): VitaFood => ({
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
});

/** Seeds the real AsyncStorage the default repository reads. */
async function seed({ goals, calories }: { goals?: unknown; calories?: number } = {}) {
  await AsyncStorage.clear();
  if (goals !== undefined) await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  if (calories !== undefined) {
    const entry = createEntry({
      food: food(),
      quantity: calories / 300,
      meal: 'Breakfast',
      logDate: TODAY,
    });
    await AsyncStorage.setItem(`vita:v1:foodlog:${TODAY}`, JSON.stringify([entry]));
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

const storedGoals = async () => {
  const raw = await AsyncStorage.getItem(GOALS_KEY);
  return raw === null ? null : (JSON.parse(raw) as Record<string, number>);
};

/* ── the editor ────────────────────────────────────────────────────────── */

describe('setting a goal', () => {
  it('opens with every field blank for someone who has none', async () => {
    /*
     * Nothing is prefilled, and nothing is *suggested* either: a number in
     * a placeholder is a figure VITA put in front of someone at the moment
     * they were deciding, which is what the hardcoded defaults did in a
     * quieter voice.
     */
    await seed();
    const tree = await mount(<NutritionGoals />);

    for (const field of [/Calories goal/, /Protein goal/, /Carbs goal/, /Fat goal/]) {
      const input = tree.root
        .findAllByType(TextInput)
        .find((node) => field.test(String(node.props.accessibilityLabel ?? '')))!;
      expect(input.props.value).toBe('');
      expect(String(input.props.placeholder)).not.toMatch(/\d/);
    }
  });

  it('saves a calories-only goal, inventing no macros around it', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    await type(tree, /Calories goal/, '2200');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(await storedGoals()).toEqual({ calories: 2200 });
  });

  it('saves a protein-only goal, inventing no calorie goal around it', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    await type(tree, /Protein goal/, '150');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(await storedGoals()).toEqual({ protein: 150 });
  });

  it('saves all four when all four are given', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    await type(tree, /Calories goal/, '2200');
    await type(tree, /Protein goal/, '150');
    await type(tree, /Carbs goal/, '200');
    await type(tree, /Fat goal/, '60');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(await storedGoals()).toEqual({ calories: 2200, protein: 150, carbs: 200, fat: 60 });
  });

  it('opens with the goals already set, and edits them', async () => {
    await seed({ goals: { calories: 2000 } });
    const tree = await mount(<NutritionGoals />);

    const input = tree.root
      .findAllByType(TextInput)
      .find((node) => /Calories goal/.test(String(node.props.accessibilityLabel ?? '')))!;
    expect(input.props.value).toBe('2000');

    await type(tree, /Calories goal/, '2500');
    await act(async () => control(tree, 'Save goals')!.props.onPress());
    expect(await storedGoals()).toEqual({ calories: 2500 });
  });

  it('clears back to no goal, never to the old defaults', async () => {
    await seed({ goals: { calories: 2000, protein: 160, carbs: 214, fat: 64 } });
    const tree = await mount(<NutritionGoals />);

    await act(async () => control(tree, 'Clear goals')!.props.onPress());

    expect(await storedGoals()).toBeNull();
  });

  it('offers no clear action when there is nothing to clear', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);
    expect(control(tree, 'Clear goals')).toBeUndefined();
  });

  it('refuses a value that is not a positive number', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    for (const bad of ['0', '-5', 'abc']) {
      await type(tree, /Calories goal/, bad);
      expect(screen(tree)).toContain('Enter a number greater than zero.');
      expect(control(tree, 'Save goals')!.props.disabled).toBe(true);
    }
  });

  it('treats every field blank as clearing, not as an empty goal', async () => {
    await seed({ goals: { calories: 2000 } });
    const tree = await mount(<NutritionGoals />);

    await type(tree, /Calories goal/, '');
    await act(async () => control(tree, 'Save goals')!.props.onPress());
    expect(await storedGoals()).toBeNull();
  });

  it('rules on nothing but the arithmetic', async () => {
    /*
     * No healthy range, no warning, no advice. Deciding whether someone's
     * goal is a good one is a nutrition recommendation, and VITA makes none.
     */
    await seed();
    const tree = await mount(<NutritionGoals />);

    await type(tree, /Calories goal/, '5000');
    expect(screen(tree)).not.toContain('Enter a number greater than zero.');
    await act(async () => control(tree, 'Save goals')!.props.onPress());
    expect(await storedGoals()).toEqual({ calories: 5000 });

    const rendered = screen(tree).toLowerCase();
    for (const phrase of ['recommend', 'suggested', 'typical', 'healthy', 'too high', 'too low']) {
      expect(rendered).not.toContain(phrase);
    }
  });

  it('uses the shared numeric keyboard, with no screen-specific accessory', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    const numeric = tree.root
      .findAllByType(TextInput)
      .filter((node) => node.props.keyboardType === 'decimal-pad');
    expect(numeric).toHaveLength(4);
    for (const field of numeric) {
      expect(field.props.inputAccessoryViewID).toBeDefined();
    }
  });
});

/* ── persistence ───────────────────────────────────────────────────────── */

describe('across a restart', () => {
  it('a user who set nothing still has nothing', async () => {
    await seed();
    const first = await mount(<Fuel />);
    expect(screen(first)).not.toContain('2,000');
    await act(async () => first.unmount());
    mounted = null;

    const second = await mount(<Fuel />);
    expect(await storedGoals()).toBeNull();
    expect(screen(second)).not.toContain('2,000');
  });

  it('a goal the user set comes back', async () => {
    await seed();
    const editor = await mount(<NutritionGoals />);
    await type(editor, /Calories goal/, '2200');
    await act(async () => control(editor, 'Save goals')!.props.onPress());
    await act(async () => editor.unmount());
    mounted = null;

    const fuel = await mount(<Fuel />);
    expect(screen(fuel)).toContain('2,200');
  });
});

/* ── what Fuel says ────────────────────────────────────────────────────── */

describe('Fuel with no goal', () => {
  it('never shows the figures VITA used to invent', async () => {
    await seed({ calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    // 2000 / 160 / 214 / 64 — the old hardcoded set.
    expect(rendered).not.toContain('2,000');
    expect(rendered).not.toContain('160');
    expect(rendered).not.toContain('214');
    expect(rendered).not.toContain('Calories remaining');
    expect(rendered).not.toContain('Protein Goal');
    expect(rendered).not.toMatch(/\d+% of/);
  });

  it('states what was eaten instead', async () => {
    await seed({ calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('600');
    expect(rendered).toContain('Calories today');
  });

  it('shows macro totals with no denominator appended', async () => {
    await seed({ calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('Protein');
    expect(rendered).not.toMatch(/\/\s*160/);
  });

  it('says nothing about goals on a completely empty day', async () => {
    await seed();
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).not.toContain('remaining');
    expect(rendered).not.toContain('2,000');
  });
});

describe('Fuel with a goal the user set', () => {
  it('measures the day against it', async () => {
    await seed({ goals: { calories: 2000 }, calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('Calories remaining');
    expect(rendered).toContain('1,400');
    expect(rendered).toContain('30%');
  });

  it('reports going over factually, never as a failure', async () => {
    await seed({ goals: { calories: 500 }, calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('Calories over');
    for (const shame of ['failed', 'exceeded', 'over budget', 'off track', 'bad']) {
      expect(rendered.toLowerCase()).not.toContain(shame);
    }
  });

  it('measures only the macros that have goals', async () => {
    await seed({ goals: { calories: 2000, protein: 150 }, calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('Protein Goal');
    expect(rendered).toContain('150');
    // Carbs and Fat were left unset, so they carry no denominator.
    expect(rendered).not.toMatch(/\/\s*214/);
    expect(rendered).not.toMatch(/\/\s*64/);
  });
});
