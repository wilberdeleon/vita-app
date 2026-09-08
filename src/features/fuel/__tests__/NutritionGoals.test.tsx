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

    for (const field of [/^Daily calorie goal/, /^Daily protein goal/]) {
      const input = tree.root
        .findAllByType(TextInput)
        .find((node) => field.test(String(node.props.accessibilityLabel ?? '')))!;
      expect(input.props.value).toBe('');
      expect(String(input.props.placeholder)).not.toMatch(/\d/);
    }
  });

  it('offers exactly two goals — calories and protein', async () => {
    /*
     * Founder ruling, 5.6A.1: carbohydrate and fat are secondary totals
     * rather than things people set out to hit, and asking for four numbers
     * turned setting a goal into a configuration exercise.
     */
    await seed();
    const tree = await mount(<NutritionGoals />);

    const fields = tree.root
      .findAllByType(TextInput)
      .map((node) => String(node.props.accessibilityLabel ?? ''));
    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatch(/^Daily calorie goal/);
    expect(fields[1]).toMatch(/^Daily protein goal/);

    // No carb or fat *field*. The intro does mention them, to say why they
    // are not here — that is an explanation, not an input.
    expect(screen(tree)).not.toContain('Daily carb goal');
    expect(screen(tree)).not.toContain('Daily fat goal');
  });

  it('saves a calories-only goal, inventing no protein goal around it', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    await type(tree, /^Daily calorie goal/, '2200');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(await storedGoals()).toEqual({ calories: 2200 });
  });

  it('saves a protein-only goal, inventing no calorie goal around it', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    await type(tree, /^Daily protein goal/, '150');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(await storedGoals()).toEqual({ protein: 150 });
  });

  it('saves both when both are given', async () => {
    await seed();
    const tree = await mount(<NutritionGoals />);

    await type(tree, /^Daily calorie goal/, '2200');
    await type(tree, /^Daily protein goal/, '150');
    await act(async () => control(tree, 'Save goals')!.props.onPress());

    expect(await storedGoals()).toEqual({ calories: 2200, protein: 150 });
  });

  it('edits a protein goal on its own', async () => {
    await seed({ goals: { protein: 150 } });
    const tree = await mount(<NutritionGoals />);

    await type(tree, /^Daily protein goal/, '180');
    await act(async () => control(tree, 'Save goals')!.props.onPress());
    expect(await storedGoals()).toEqual({ protein: 180 });
  });

  it('opens with the goals already set, and edits them', async () => {
    await seed({ goals: { calories: 2000 } });
    const tree = await mount(<NutritionGoals />);

    const input = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Daily calorie goal/.test(String(node.props.accessibilityLabel ?? '')))!;
    expect(input.props.value).toBe('2000');

    await type(tree, /^Daily calorie goal/, '2500');
    await act(async () => control(tree, 'Save goals')!.props.onPress());
    expect(await storedGoals()).toEqual({ calories: 2500 });
  });

  it('clears back to no goal, never to the old defaults', async () => {
    await seed({ goals: { calories: 2000, protein: 160 } });
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
      await type(tree, /^Daily calorie goal/, bad);
      expect(screen(tree)).toContain('Enter a number greater than zero.');
      expect(control(tree, 'Save goals')!.props.disabled).toBe(true);
    }
  });

  it('treats every field blank as clearing, not as an empty goal', async () => {
    await seed({ goals: { calories: 2000 } });
    const tree = await mount(<NutritionGoals />);

    await type(tree, /^Daily calorie goal/, '');
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

    await type(tree, /^Daily calorie goal/, '5000');
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
    expect(numeric).toHaveLength(2);
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
    await type(editor, /^Daily calorie goal/, '2200');
    await act(async () => control(editor, 'Save goals')!.props.onPress());
    await act(async () => editor.unmount());
    mounted = null;

    // An empty day states the goal quietly rather than reporting 0 / 2,200.
    const fuel = await mount(<Fuel />);
    expect(screen(fuel)).toContain('2,200 calorie goal');
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

  it('leads an untouched day with the strip, not a wall of zeroes', async () => {
    /*
     * The founder's specific note: `0 Calories · Protein 0 · Carbs 0 · Fat
     * 0` as the hero of a screen nobody has used yet is a scoreboard for a
     * game that has not started.
     */
    await seed();
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('Nothing logged yet');
    expect(rendered).not.toContain('Calories today');
    expect(rendered).not.toMatch(/Protein\s+0 g/);
  });

  it('shows macro totals with no denominator appended', async () => {
    await seed({ calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('Protein');
    expect(rendered).not.toMatch(/\/\s*160/);
  });

  it('offers a way to set goals, since Settings is not discoverable', async () => {
    await seed({ calories: 600 });
    const tree = await mount(<Fuel />);

    expect(control(tree, 'Set nutrition goals')).toBeDefined();
  });

  it('routes that action to the existing editor rather than duplicating it', async () => {
    await seed();
    const tree = await mount(<Fuel />);

    await act(async () => control(tree, 'Set nutrition goals')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/settings/nutrition-goals');
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

    // 5.6B states the goal beside the figure rather than as a ring and a
    // percentage: `600 · Calories · 2,000 goal · 1,400 left`.
    expect(rendered).toContain('600');
    expect(rendered).toContain('2,000 goal');
    expect(rendered).toContain('1,400 left');
  });

  it('reports going over factually, never as a failure', async () => {
    await seed({ goals: { calories: 500 }, calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('100 over');
    for (const shame of ['failed', 'exceeded', 'over budget', 'off track', 'bad']) {
      expect(rendered.toLowerCase()).not.toContain(shame);
    }
  });

  it('measures protein when a protein goal exists', async () => {
    await seed({ goals: { calories: 2000, protein: 150 }, calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    // `Protein  20 / 150 g` — a denominator only where a goal exists.
    expect(rendered).toMatch(/Protein\s+20 \/ 150 g/);
  });
});

/* ── carbs and fat are totals, always ──────────────────────────────────── */

describe('carbs and fat', () => {
  it.each([
    ['no goals', undefined],
    ['a calorie goal', { calories: 2000 }],
    ['a protein goal', { protein: 150 }],
    ['both goals', { calories: 2000, protein: 150 }],
  ])('carry no denominator with %s', async (_label, goals) => {
    /*
     * The 5.6A.1 ruling, checked in every goal state: carbohydrate and fat
     * are tracked and summed exactly as before, and can never be measured
     * against a target because none can exist.
     */
    await seed({ goals, calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    expect(rendered).toContain('Carbs');
    expect(rendered).toContain('Fat');
    expect(rendered).not.toMatch(/Carbs[^·]*\//);
    expect(rendered).not.toMatch(/Fat[^·]*\//);
    expect(rendered).not.toContain('Carbs Goal');
    expect(rendered).not.toContain('Fat Goal');
  });

  it('still totals what was eaten', async () => {
    await seed({ calories: 600 });
    const tree = await mount(<Fuel />);
    const rendered = screen(tree);

    // 2 cups of the fixture oats: 108 g carbs, 10 g fat.
    expect(rendered).toContain('108');
    expect(rendered).toContain('10');
  });
});

/* ── first-time setup ──────────────────────────────────────────────────── */

describe('the contextual setup prompt', () => {
  const prompt = (tree: ReactTestRenderer) => control(tree, 'Set nutrition goals');

  it('appears when neither goal is set', async () => {
    await seed();
    expect(prompt(await mount(<Fuel />))).toBeDefined();
  });

  it.each([
    ['calories only', { calories: 2000 }],
    ['protein only', { protein: 150 }],
    ['both', { calories: 2000, protein: 150 }],
  ])('disappears with %s — goals are optional and partial', async (_label, goals) => {
    // Nagging someone to configure the second goal would contradict the
    // whole point of goals being optional.
    await seed({ goals });
    expect(prompt(await mount(<Fuel />))).toBeUndefined();
  });

  it('comes back after the user clears their goals', async () => {
    await seed({ goals: { calories: 2000 } });
    const before = await mount(<Fuel />);
    expect(prompt(before)).toBeUndefined();
    await act(async () => before.unmount());
    mounted = null;

    const editor = await mount(<NutritionGoals />);
    await act(async () => control(editor, 'Clear goals')!.props.onPress());
    await act(async () => editor.unmount());
    mounted = null;

    expect(prompt(await mount(<Fuel />))).toBeDefined();
  });

  it('is a quiet line, not a second call to action', async () => {
    await seed();
    const tree = await mount(<Fuel />);

    // Fuel stays usable without goals: this is not a gate and not a warning.
    expect(screen(tree)).toContain('Add food');
    expect(screen(tree)).toContain('Optional');
    const rendered = screen(tree).toLowerCase();
    for (const alarm of ['required', 'set up your', 'get started', 'finish setup', 'missing']) {
      expect(rendered).not.toContain(alarm);
    }
  });
});
