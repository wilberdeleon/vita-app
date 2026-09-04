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

import { Text } from 'react-native';
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
  it('offers exactly the three approved tools, each to a real route', async () => {
    const tree = await mount(fakeWater());

    for (const [label, route] of [
      ['Peptide Calculator', '/tools/peptide-calculator'],
      ['Injection Sites', '/tools/injection-sites'],
      ['Food Scanner', '/fuel/scan'],
    ] as const) {
      const tile = control(tree, label);
      expect(tile).toBeDefined();
      mockPush.mockClear();
      await act(async () => tile!.props.onPress());
      expect(mockPush).toHaveBeenCalledWith(route);
    }
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
    for (const word of ['bmi', 'coming soon', 'research library', 'scanner']) {
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

  it('says hydration is complete without praising anyone', async () => {
    const tree = await mount(
      fakeWater({
        goal: createWaterGoal(64, 'floz'),
        entries: [createWaterEntry({ amount: 64, unit: 'floz' })],
      }),
    );
    expect(screen(tree)).toContain('hydration complete');
  });

  it('is simply absent when there is nothing factual to say', async () => {
    // No goal, no routines, nothing logged — a filler line would be worse
    // than the space it takes.
    const rendered = screen(await mount(fakeWater()));
    expect(rendered).not.toMatch(/to go|complete|scheduled ·/);
  });

  it('never assembles a score out of the numbers it holds', async () => {
    const rendered = screen(await mount(fakeWater({ goal: createWaterGoal(64, 'floz') }))).toLowerCase();
    for (const word of ['score', 'readiness', 'of 4', '% complete']) {
      expect(rendered).not.toContain(word);
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
    expect(control(tree, 'Move Peptides up')).toBeDefined();

    await act(async () => control(tree, 'Move Peptides up')!.props.onPress());
    // Water was first; Peptides has taken its place.
    expect(control(tree, 'Move Peptides up')!.props.disabled).toBe(true);
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
      'Food Scanner',
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
