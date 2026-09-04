/**
 * Home, driven through the real screen against real providers.
 *
 * The Dashboard is the screen most likely to quietly start lying, because it
 * summarises four domains it does not own. Before slice 5.3 it showed steps,
 * sleep, workouts, a streak and a Journey stage that no feature produced —
 * every one of them a plausible number rendered to every user forever. So the
 * assertions below are as much about what must *not* appear as about what
 * must.
 *
 * These mount the route with real `WaterProvider`, `NutritionProvider` and
 * `PeptideProvider` instances over injected repositories, so what is rendered
 * is what the engines actually produced.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: (...args: unknown[]) => mockPush(...args),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Dashboard from '../../../app/(vita)/(tabs)/dashboard';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { NutritionProvider } from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import type { WaterRepository } from '../../../lib/water/data/WaterRepository';
import { createWaterEntry } from '../../../lib/water/model/entries';
import { createWaterGoal } from '../../../lib/water/model/goals';
import type { WaterEntry, WaterGoal, WaterPreferences } from '../../../lib/water/model/types';
import { WaterProvider } from '../../../lib/water/state/WaterProvider';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { greetingForHour } from '../greeting';
import { QUOTE_FONT, SQUARE_HEIGHT, daypartAccent } from '../widget';

const TODAY = todayLogDate();

function fakeWater(
  seed: { entries?: WaterEntry[]; goal?: WaterGoal | null; preferences?: WaterPreferences } = {},
) {
  const days: Record<string, WaterEntry[]> = seed.entries ? { [TODAY]: seed.entries } : {};
  let goal: WaterGoal | null = seed.goal ?? null;
  let preferences: WaterPreferences | null = seed.preferences ?? { unit: 'floz' };

  const repository: WaterRepository = {
    async getEntries(logDate) {
      return days[logDate] ? [...days[logDate]] : [];
    },
    async saveEntries(logDate, entries) {
      days[logDate] = [...entries];
    },
    async getGoal() {
      return goal;
    },
    async saveGoal(next) {
      goal = next;
    },
    async getPreferences() {
      return preferences;
    },
    async savePreferences(next) {
      preferences = next;
    },
    async getRecentDays() {
      return [];
    },
  };
  return repository;
}

let mounted: ReactTestRenderer | null = null;

async function mount(water: WaterRepository) {
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
              <WaterProvider repository={water}>
                <PeptideProvider>
                  <Dashboard />
                </PeptideProvider>
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
  const tree = mounted;
  mounted = null;
  mockPush.mockClear();
  if (tree) await act(async () => tree.unmount());
  /*
   * Home's layout and Quick Tools preferences persist, which is the point of
   * them — but it means one test's customisation would otherwise be the next
   * test's starting state. Every case here begins from the shipped default.
   */
  await AsyncStorage.clear();
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).map((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children
      .filter((c): c is string | number => typeof c === 'string' || typeof c === 'number')
      .join('');
  });
}

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');

/** A pressable by the name a screen reader announces. */
function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: string) => (typeof label === 'string' ? value === label : label.test(value));
  return tree.root.findAll(
    (node) => typeof node.props?.onPress === 'function' && matches(String(node.props.accessibilityLabel ?? '')),
  )[0];
}

/** A pressable that can be held, by the name a screen reader announces. */
function holdable(tree: ReactTestRenderer, label: RegExp) {
  return tree.root.findAll(
    (node) =>
      typeof node.props?.onLongPress === 'function' &&
      label.test(String(node.props.accessibilityLabel ?? '')),
  )[0];
}

/** The resolved style of a node, with registered styles flattened out. */
function styleOf(node: { props: Record<string, unknown> }): ViewStyle & TextStyle {
  return (StyleSheet.flatten(node.props.style as ViewStyle) ?? {}) as ViewStyle & TextStyle;
}

/** The `Text` whose rendered content is exactly `value`. */
function textNode(tree: ReactTestRenderer, value: string) {
  return tree.root.findAllByType(Text).find((node) => {
    const children = Array.isArray(node.props.children)
      ? node.props.children
      : [node.props.children];
    return children.join('') === value;
  });
}

/* ── the greeting ───────────────────────────────────────────────────────── */

describe('the greeting', () => {
  it('greets by name, with the time of day and the date', async () => {
    const tree = await mount(fakeWater());
    const rendered = screen(tree);

    // An eyebrow, not a headline (5.3A): small, uppercase, and above a
    // factual line rather than being the line.
    expect(rendered).toMatch(/GOOD (MORNING|AFTERNOON|EVENING|NIGHT), WILBER/);
    // The date is a compact chip — context, not the subject.
    expect(rendered).toMatch(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), [A-Z][a-z]{2} \d{1,2}/);
  });

  it('carries no slogan, and no replacement for one', async () => {
    /*
     * `Build with intention.` was the largest type in the app and said
     * nothing about the user's day. The founder ruling was to remove it and
     * *not* substitute another line of the same kind.
     */
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    for (const slogan of [
      'build with intention',
      'your day, your direction',
      'stay on track',
      'crush',
      'you got this',
      'optimize your day',
      'amazing',
    ]) {
      expect(rendered).not.toContain(slogan);
    }
  });
});

/* ── the fixtures that used to live here ────────────────────────────────── */

describe('invented data', () => {
  it('shows no steps, sleep, workouts or streak', async () => {
    // Every one of these was a fixture rendered to every user forever.
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    for (const word of ['steps', 'sleep', 'workout', 'streak', '6,842', '6.4 h']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('claims no Journey stage or progress', async () => {
    // Journey is Sprint 6. Until then Home says nothing about it rather than
    // showing a stage nobody reached.
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    for (const word of ['journey', 'week 2', 'stage']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('counts no goal pillars it cannot actually check', async () => {
    // "N of 4 goals complete" was two real pillars and two invented ones.
    expect(screen(await mount(fakeWater()))).not.toMatch(/of 4 goals/i);
  });
});

/* ── Water ──────────────────────────────────────────────────────────────── */

describe('the Water module', () => {
  it('reports real progress against a real goal', async () => {
    const tree = await mount(
      fakeWater({
        goal: createWaterGoal(64, 'floz'),
        entries: [createWaterEntry({ amount: 16, unit: 'floz' })],
      }),
    );

    const rendered = screen(tree);
    expect(rendered).toContain('25%');
    expect(rendered).toContain('48 fl oz to go');
  });

  it('says the goal is reached rather than congratulating', async () => {
    const tree = await mount(
      fakeWater({
        goal: createWaterGoal(64, 'floz'),
        entries: [createWaterEntry({ amount: 64, unit: 'floz' })],
      }),
    );
    expect(screen(tree)).toContain('Goal reached');
  });

  it('shows the day total, not a percentage, when no goal exists', async () => {
    const tree = await mount(
      fakeWater({ entries: [createWaterEntry({ amount: 16, unit: 'floz' })] }),
    );

    const rendered = screen(tree);
    expect(rendered).toContain('16 fl oz');
    // A ring at 0% would say the user is failing a target they never set.
    expect(rendered).not.toContain('0%');
    expect(control(tree, 'Add water')).toBeDefined();
  });

  it('opens Water, and opens Water ready to log, from two separate targets', async () => {
    const tree = await mount(fakeWater({ goal: createWaterGoal(64, 'floz') }));

    // Spoken as "Add water" even where the visible label shortens to "Add" —
    // "Add" alone would be meaningless out of context to a screen reader.
    await act(async () => control(tree, 'Add water')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/water?add=1');

    mockPush.mockClear();
    await act(async () => control(tree, /^Water,/)!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/water');
  });
});

/* ── Fuel ───────────────────────────────────────────────────────────────── */

describe('the Fuel strip', () => {
  it('states an empty day honestly', async () => {
    const tree = await mount(fakeWater());

    // Terse on screen so it does not truncate beside the action; the spoken
    // label carries the full phrase.
    expect(screen(tree)).toContain('No meals');
    expect(control(tree, /^Fuel,.*no meals logged yet/)).toBeDefined();
    expect(control(tree, 'Log food')).toBeDefined();
  });

  it('navigates to Fuel and to its own logging flow', async () => {
    const tree = await mount(fakeWater());

    await act(async () => control(tree, 'Log food')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/add');

    mockPush.mockClear();
    await act(async () => control(tree, /^Fuel,/)!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel');
  });

  it('shows no score, grade or rating of any kind', async () => {
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    for (const word of ['score', 'grade', 'rating', 'nutri']) {
      expect(rendered).not.toContain(word);
    }
  });
});

/* ── Peptides ───────────────────────────────────────────────────────────── */

describe('the Peptides module', () => {
  it('says nothing is scheduled without implying anything is wrong', async () => {
    const tree = await mount(fakeWater());
    const rendered = screen(tree);

    expect(rendered).toMatch(/No routines yet|Nothing scheduled/);
    expect(control(tree, /^Peptides,/)).toBeDefined();
  });

  it('never uses obligation, judgement or scoring language', async () => {
    /*
     * Sprint 3 set these rules for the feature and a summary does not get to
     * soften them: a schedule is what the user planned, an unanswered day is
     * unanswered, and nothing is scored.
     */
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    for (const word of ['due', 'overdue', 'missed', 'late', 'adherence', 'compliance', 'behind']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('opens Peptides', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, /^Peptides,/)!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/peptides');
  });
});

/* ── Tools ──────────────────────────────────────────────────────────────── */

describe('Tools discoverability', () => {
  it('offers the tools that exist, each to a real route', async () => {
    const tree = await mount(fakeWater());

    for (const [label, route] of [
      ['Peptide Calculator', '/tools/peptide-calculator'],
      ['Injection Sites', '/tools/injection-sites'],
    ] as const) {
      const tile = control(tree, label);
      expect(tile).toBeDefined();
      mockPush.mockClear();
      await act(async () => tile!.props.onPress());
      expect(mockPush).toHaveBeenCalledWith(route);
    }
  });

  it('offers the Food Scanner, pointed at the barcode scanner that exists', async () => {
    /*
     * **Reversed by founder ruling in 5.3C.** 5.3B omitted this tile on the
     * grounds that *Food Scanner* would come to mean the future evaluating
     * scanner, and that `/fuel/scan` — the barcode lookup used to log a food
     * — was a different feature sharing a camera. The founders decided the
     * shortcut is worth having now, so the tile ships and routes there.
     */
    const tree = await mount(fakeWater());

    const tile = control(tree, 'Food Scanner');
    expect(tile).toBeDefined();
    await act(async () => tile!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/fuel/scan');
  });

  it('claims nothing the scanner does not do', async () => {
    /*
     * The part of the old rule that survives the reversal: a shortcut may be
     * a navigation convenience, but it may not overstate where it goes. The
     * scanner looks a product up so it can be logged. No VITA Score is
     * authorised, so nothing here may promise a score, a grade or a rating.
     */
    const tree = await mount(fakeWater());
    const rendered = screen(tree).toLowerCase();

    for (const claim of ['score', 'grade', 'rating', 'rank', 'analy']) {
      expect(rendered).not.toContain(claim);
    }

    const spoken = String(control(tree, 'Food Scanner')!.props.accessibilityHint ?? '');
    expect(spoken).toBe('Opens the food barcode scanner');
  });

  it('keeps the full Tools destination reachable without a second module', async () => {
    // A Quick Tools section *and* a Tools row would be the duplication the
    // authorization warned against; one quiet link is the whole answer.
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'All tools')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/tools');
  });

  it('offers no fourth tile invented for symmetry', async () => {
    const rendered = screen(await mount(fakeWater()));
    expect(rendered).toContain('QUICK TOOLS');
    for (const absent of ['BMI', 'Reference', 'Coming Soon']) {
      expect(rendered).not.toContain(absent);
    }
  });

  it('advertises nothing that does not exist yet', async () => {
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    // `scanner` left out deliberately — the barcode scanner does exist, and
    // 5.3C put a shortcut to it here.
    for (const word of ['bmi', 'coming soon', 'research library']) {
      expect(rendered).not.toContain(word);
    }
  });
});

/* ── reactivity ─────────────────────────────────────────────────────────── */

describe('staying current', () => {
  it('reflects a drink logged elsewhere, with no refresh', async () => {
    /*
     * Home reads the same provider Water writes to, so this is really a test
     * that Home did not quietly snapshot anything. If it ever grows its own
     * cached total, this is what catches it.
     */
    const repository = fakeWater({ goal: createWaterGoal(64, 'floz') });
    const tree = await mount(repository);
    expect(screen(tree)).toContain('0%');

    await act(async () => {
      await repository.saveEntries(TODAY, [createWaterEntry({ amount: 32, unit: 'floz' })]);
    });

    // Remount is the stand-in for navigating back to Home.
    await act(async () => tree.unmount());
    mounted = null;
    const returned = await mount(repository);
    expect(screen(returned)).toContain('50%');
  });
});

/* ── Today's Schedule ───────────────────────────────────────────────────── */

describe("Today's Schedule", () => {
  it('says nothing is scheduled, compactly, when there is nothing', async () => {
    const tree = await mount(fakeWater());
    const rendered = screen(tree);

    expect(rendered).toContain("TODAY'S SCHEDULE");
    expect(rendered).toContain('Nothing scheduled today');
  });

  it('invents no clock times, because routines have none', async () => {
    /*
     * Routines schedule by *day*. A setup may carry an optional reminder
     * time, but that is a notification the user asked for, not when a dose
     * is due — putting it in a schedule column would quietly promote it into
     * one. So no row carries a time until the domain has a real one.
     */
    const rendered = screen(await mount(fakeWater()));
    expect(rendered).not.toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
  });

  it('invents no activity rows', async () => {
    // The reference image showed walks and workouts; VITA has no movement
    // domain, so a schedule cannot honestly contain one.
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    for (const word of ['walk', 'workout', 'chest', 'run ', 'steps']) {
      expect(rendered).not.toContain(word);
    }
  });
});

/* ── the daily summary line ─────────────────────────────────────────────── */

describe('the summary line', () => {
  it('states real remaining hydration', async () => {
    const tree = await mount(
      fakeWater({
        goal: createWaterGoal(64, 'floz'),
        entries: [createWaterEntry({ amount: 16, unit: 'floz' })],
      }),
    );
    expect(screen(tree)).toContain('48 fl oz to go');
  });

  it('says the goal is reached in the module, without praising anyone', async () => {
    const tree = await mount(
      fakeWater({
        goal: createWaterGoal(64, 'floz'),
        entries: [createWaterEntry({ amount: 64, unit: 'floz' })],
      }),
    );
    expect(screen(tree)).toContain('Goal reached');
  });

  it('never assembles a score out of the numbers it holds', async () => {
    const rendered = screen(await mount(fakeWater({ goal: createWaterGoal(64, 'floz') }))).toLowerCase();
    for (const word of ['score', 'readiness', 'of 4', '% complete']) {
      expect(rendered).not.toContain(word);
    }
  });
});

/* ── the quote ──────────────────────────────────────────────────────────── */

describe('the quote', () => {
  it('shows the approved quote and its attribution', async () => {
    const rendered = screen(await mount(fakeWater()));
    expect(rendered).toContain('I came, I saw, I conquered.');
    expect(rendered).toContain('Julius Caesar');
  });

  it('is the only personality on the screen', async () => {
    // A quote someone is on record as saying is content; the app commenting
    // on your behaviour is the thing that has been removed twice.
    const rendered = screen(await mount(fakeWater())).toLowerCase();
    for (const slogan of ['stay on track', 'keep going', "you've got this", 'locked in', 'crush']) {
      expect(rendered).not.toContain(slogan);
    }
  });
});

/* ── customizing Home ───────────────────────────────────────────────────── */

describe('Customize Home', () => {
  it('opens from the header, separately from Settings', async () => {
    const tree = await mount(fakeWater());

    // Both controls exist and are different things.
    expect(control(tree, 'Settings')).toBeDefined();
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    // The sheet lists every module by name.
    const rendered = screen(tree);
    for (const label of ['Water', 'Peptides', 'Fuel', 'Quick Tools', "Today's Schedule"]) {
      expect(rendered).toContain(label);
    }
  });

  it('hides a module from Home, and brings it back', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    await act(async () => control(tree, 'Hide Quick Tools')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());
    expect(screen(tree)).not.toContain('QUICK TOOLS');

    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Show Quick Tools')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());
    expect(screen(tree)).toContain('QUICK TOOLS');
  });

  it('reorders with buttons that say what they do', async () => {
    // Reordering is reachable by every input method, not just a pointer.
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    expect(control(tree, 'Move Water up')).toBeDefined();
    expect(control(tree, 'Move Water down')).toBeDefined();
    expect(control(tree, 'Move Fuel down')).toBeDefined();

    // Fuel ships first; moving Water up twice puts it there instead.
    await act(async () => control(tree, 'Move Water up')!.props.onPress());
    expect(control(tree, 'Move Water up')!.props.disabled).toBe(true);
  });

  it('offers a size choice only where a real design exists', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    for (const label of ['Water, Square', 'Water, Wide', 'Fuel, Square', 'Fuel, Wide']) {
      expect(control(tree, label)).toBeDefined();
    }
    // Lists need width; a square form would be the wide layout squeezed.
    expect(control(tree, "Today's Schedule, Square")).toBeUndefined();
    expect(control(tree, 'Quick Tools, Square')).toBeUndefined();
  });

  it('switches a module between square and wide, and Home follows', async () => {
    const tree = await mount(
      fakeWater({ goal: createWaterGoal(64, 'floz'), entries: [createWaterEntry({ amount: 32, unit: 'floz' })] }),
    );

    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Water, Wide')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());

    // Same real state, different shape — the wide layout puts the remaining
    // amount on the value line.
    expect(screen(tree)).toContain('50%');
    expect(screen(tree)).toContain('32 fl oz to go');
  });

  it('restores the shipped layout from Reset', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    await act(async () => control(tree, 'Hide Quick Tools')!.props.onPress());
    await act(async () => control(tree, 'Reset Home layout to default')!.props.onPress());

    expect(control(tree, 'Hide Quick Tools')).toBeDefined();
    await act(async () => control(tree, 'Close')!.props.onPress());
    expect(screen(tree)).toContain('QUICK TOOLS');
  });

  it('leaves the header alone — it is not a customisable module', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    for (const absent of ['Hide Settings', 'Hide VITA', 'Hide Greeting']) {
      expect(control(tree, absent)).toBeUndefined();
    }
    expect(screen(tree)).toContain('always stay');
  });
});

/* ── accessibility ──────────────────────────────────────────────────────── */

describe('accessibility', () => {
  it('gives every action its own spoken name', async () => {
    const tree = await mount(fakeWater({ goal: createWaterGoal(64, 'floz') }));

    for (const label of [
      /^Water,/,
      'Add water',
      /^Fuel,/,
      'Log food',
      /^Peptides,/,
      'Peptide Calculator',
      'Injection Sites',
      'All tools',
      'Customize Home',
      'Settings',
    ]) {
      expect(control(tree, label)).toBeDefined();
    }
  });

  it('does not swallow the modules into one giant element', async () => {
    // Four separate destinations plus two inline actions; a single
    // accessible container over the lot would make Home unusable by voice.
    const tree = await mount(fakeWater({ goal: createWaterGoal(64, 'floz') }));
    const targets = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        typeof node.props?.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.length > 0,
    );
    // Composite + host pairs mean the raw count is higher; what matters is
    // that the distinct spoken names are all present.
    const names = new Set(targets.map((node) => node.props.accessibilityLabel));
    expect(names.size).toBeGreaterThanOrEqual(6);
  });
});

/* ── square widget geometry (5.3C) ──────────────────────────────────────── */

describe('square widgets', () => {
  it('gives Water, Peptides and Fuel the same footprint', async () => {
    /*
     * Founder ruling, 5.3C. In 5.3B each module set its own `minHeight`, so
     * Peptides — which has the least to say — sat visibly shorter than Water
     * beside it. A grid of widgets has to hold still.
     */
    const tree = await mount(fakeWater());

    // Fuel ships wide; make it a square so all three can be compared.
    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Fuel, Square')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());

    for (const label of [/^Water,/, /^Peptides,/, /^Fuel,/]) {
      const style = styleOf(control(tree, label)!);
      expect(style.minHeight).toBe(SQUARE_HEIGHT);
      expect(style.maxHeight).toBe(SQUARE_HEIGHT);
    }
  });

  it('keeps that footprint whether or not there is data', async () => {
    // The empty and populated states are the same object; only the contents
    // differ. A widget must not shrink because a day happens to be quiet.
    const empty = await mount(fakeWater());
    const emptyHeight = styleOf(control(empty, /^Water,/)!).minHeight;
    await act(async () => empty.unmount());
    mounted = null;

    const full = await mount(
      fakeWater({
        goal: createWaterGoal(64, 'floz'),
        entries: [createWaterEntry({ amount: 32, unit: 'floz' })],
      }),
    );
    expect(styleOf(control(full, /^Water,/)!).minHeight).toBe(emptyHeight);
    expect(emptyHeight).toBe(SQUARE_HEIGHT);
  });

  it('pins the footprint at both ends, so content cannot push it either way', async () => {
    // A minimum alone is what 5.3B had, and it let a busy widget grow.
    const tree = await mount(fakeWater());
    for (const label of [/^Water,/, /^Peptides,/]) {
      const style = styleOf(control(tree, label)!);
      expect(style.minHeight).toBe(style.maxHeight);
    }
  });
});

/* ── the quote, as a quotation (5.3C) ───────────────────────────────────── */

describe('quote typography', () => {
  it('sets the line in a serif, italic, and not as body text', async () => {
    const tree = await mount(fakeWater());
    const quote = textNode(tree, 'I came, I saw, I conquered.');
    expect(quote).toBeDefined();

    const style = styleOf(quote!);
    expect(style.fontFamily).toBe(QUOTE_FONT);
    expect(style.fontStyle).toBe('italic');
    // Restrained, not shouted: the serif carries it without extra weight.
    expect(style.fontWeight).toBe('400');
  });

  it('attributes with an em dash, quietly', async () => {
    const tree = await mount(fakeWater());
    const attribution = textNode(tree, '— Julius Caesar');
    expect(attribution).toBeDefined();
    expect(styleOf(attribution!).fontSize).toBeLessThan(Number(styleOf(textNode(tree, 'I came, I saw, I conquered.')!).fontSize));
  });

  it('reads as one quotation to a screen reader, not two fragments', async () => {
    const tree = await mount(fakeWater());
    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));
    expect(spoken).toContain('I came, I saw, I conquered. — Julius Caesar');
  });
});

/* ── the greeting's colour (5.3C) ───────────────────────────────────────── */

describe('the daypart accent', () => {
  it('tints the greeting with the colour for the current period', async () => {
    const tree = await mount(fakeWater());
    const period = greetingForHour(new Date().getHours()).period;

    const greeting = tree.root
      .findAllByType(Text)
      .find((node) =>
        (Array.isArray(node.props.children) ? node.props.children : [node.props.children])
          .join('')
          .startsWith('GOOD '),
      );
    expect(greeting).toBeDefined();
    // The suite renders light; the accents have a legible value per scheme.
    expect(styleOf(greeting!).color).toBe(daypartAccent(period, 'light'));
  });

  it('says the time of day in words as well as colour', async () => {
    // Colour is decoration on text that already carries the meaning; nothing
    // here is only available to someone who can see the hue.
    expect(screen(await mount(fakeWater()))).toMatch(
      /GOOD (MORNING|AFTERNOON|EVENING|NIGHT), WILBER/,
    );
  });
});

/* ── customizing Quick Tools (5.3C) ─────────────────────────────────────── */

describe('Quick Tools customization', () => {
  it('lists every tool in Customize Home, with how many are on', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    const rendered = screen(tree);
    for (const name of ['Peptide Calculator', 'Injection Sites', 'Food Scanner']) {
      expect(rendered).toContain(name);
    }
    expect(rendered).toContain('3 shown');
  });

  it('hides one tool from Home and brings it back', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Hide Food Scanner')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());

    expect(control(tree, 'Food Scanner')).toBeUndefined();
    expect(control(tree, 'Peptide Calculator')).toBeDefined();

    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Show Food Scanner')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());
    expect(control(tree, 'Food Scanner')).toBeDefined();
  });

  it('drops the whole section rather than showing a heading over nothing', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    for (const name of ['Peptide Calculator', 'Injection Sites', 'Food Scanner']) {
      await act(async () => control(tree, `Hide ${name}`)!.props.onPress());
    }
    await act(async () => control(tree, 'Close')!.props.onPress());

    expect(screen(tree)).not.toContain('QUICK TOOLS');
    expect(control(tree, 'All tools')).toBeUndefined();
  });

  it('reorders tools by tap, because three items do not need a drag', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    expect(control(tree, 'Move Peptide Calculator up')!.props.disabled).toBe(true);
    await act(async () => control(tree, 'Move Food Scanner up')!.props.onPress());
    expect(control(tree, 'Move Food Scanner up')!.props.disabled).toBe(false);
    await act(async () => control(tree, 'Move Food Scanner up')!.props.onPress());
    expect(control(tree, 'Move Food Scanner up')!.props.disabled).toBe(true);
  });

  it('remembers the choice across a return to Home', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Hide Injection Sites')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());

    await act(async () => tree.unmount());
    mounted = null;

    // A preference that reset on navigation is not a preference.
    const returned = await mount(fakeWater());
    expect(control(returned, 'Injection Sites')).toBeUndefined();
    expect(control(returned, 'Peptide Calculator')).toBeDefined();
  });

  it('restores the tools along with the layout on Reset', async () => {
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Hide Food Scanner')!.props.onPress());
    await act(async () => control(tree, 'Reset Home layout to default')!.props.onPress());

    expect(control(tree, 'Hide Food Scanner')).toBeDefined();
  });
});

/* ── edit mode (5.3C) ───────────────────────────────────────────────────── */

describe('rearranging on Home', () => {
  it('enters edit mode from a hold on a widget', async () => {
    const tree = await mount(fakeWater());

    // Nothing announces itself as removable until the hold.
    expect(control(tree, 'Remove Water from Home')).toBeUndefined();

    await act(async () => holdable(tree, /^Water,/)!.props.onLongPress());

    for (const label of ['Remove Water from Home', 'Remove Peptides from Home', 'Remove Fuel from Home']) {
      expect(control(tree, label)).toBeDefined();
    }
  });

  it('offers a visible, labelled way out', async () => {
    /*
     * A mode entered by gesture needs an exit that is not also a gesture —
     * tapping empty space is neither discoverable nor reachable by voice.
     */
    const tree = await mount(fakeWater());
    await act(async () => holdable(tree, /^Water,/)!.props.onLongPress());

    const done = control(tree, 'Done rearranging Home');
    expect(done).toBeDefined();
    // The header's two icons stand down while it is there, so the top of the
    // screen never carries three competing controls.
    expect(control(tree, 'Customize Home')).toBeUndefined();

    await act(async () => done!.props.onPress());
    expect(control(tree, 'Customize Home')).toBeDefined();
    expect(control(tree, 'Remove Water from Home')).toBeUndefined();
  });

  it('removes a widget from Home without destroying anything', async () => {
    const tree = await mount(fakeWater());
    await act(async () => holdable(tree, /^Water,/)!.props.onLongPress());
    await act(async () => control(tree, 'Remove Water from Home')!.props.onPress());
    await act(async () => control(tree, 'Done rearranging Home')!.props.onPress());

    expect(control(tree, /^Water,/)).toBeUndefined();

    // It is hidden, not deleted — Customize Home offers it straight back.
    await act(async () => control(tree, 'Customize Home')!.props.onPress());
    await act(async () => control(tree, 'Show Water')!.props.onPress());
    await act(async () => control(tree, 'Close')!.props.onPress());
    expect(control(tree, /^Water,/)).toBeDefined();
  });

  it('says "remove", never "delete", because no data is touched', async () => {
    const tree = await mount(fakeWater());
    await act(async () => holdable(tree, /^Water,/)!.props.onLongPress());

    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel).toLowerCase());
    expect(spoken.some((label) => label.includes('delete'))).toBe(false);
  });

  it('keeps Customize Home as the complete, accessible surface', async () => {
    /*
     * The gesture is a shortcut, not a replacement. Hiding, resizing and
     * reordering all remain reachable without a pointer — a hold is
     * unavailable to someone using VoiceOver or a switch, and Home is the
     * screen they can least afford to be locked out of arranging.
     */
    const tree = await mount(fakeWater());
    await act(async () => control(tree, 'Customize Home')!.props.onPress());

    for (const label of ['Hide Water', 'Move Water up', 'Water, Wide', 'Hide Food Scanner']) {
      expect(control(tree, label)).toBeDefined();
    }
  });
});
