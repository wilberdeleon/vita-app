/**
 * Peptides Home, as slice 5.4 redesigned it.
 *
 * `PeptideRoutines.test.tsx` already pins the domain behaviour — what a
 * *taken* is allowed to assert, what an undo may destroy, how routines sort
 * into groups. This file is about the screen: the hierarchy, the states Today
 * can be in, and the safety properties that are the reason this feature is
 * designed the way it is rather than the obvious way.
 *
 * The safety block at the bottom is the important part. A peptide screen can
 * hurt someone in exactly three ways — by implying VITA chose the dose, by
 * making a confirmation look pre-answered, or by quietly turning *we don't
 * know* into *you skipped it*. Every test there exists to stop one of those.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: mockFontScale }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Peptides from '../../../app/(vita)/peptides/index';
import Dashboard from '../../../app/(vita)/(tabs)/dashboard';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { NutritionProvider } from '../../../lib/nutrition';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water/state/WaterProvider';
import type { WaterRepository } from '../../../lib/water/data/WaterRepository';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const TODAY = todayLogDate();
const CREATED = '2026-08-25T10:00:00.000Z';

function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    routineAmount: { amountMcg: toMcg(1, 'mg'), authored: { amount: 1, unit: 'mg' } },
    schedule: { kind: 'daily' },
    routineState: 'active',
    active: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  };
}

function repositoryWith(
  seedSetups: PeptideSetup[],
  seedStatuses: RoutineDayStatus[] = [],
): { repository: PeptideRepository; setups: () => PeptideSetup[] } {
  let setups = [...seedSetups];
  const days = new Map<string, PeptideLogEntry[]>();
  const statusDays = new Map<string, RoutineDayStatus[]>();
  for (const s of seedStatuses) statusDays.set(s.logDate, [...(statusDays.get(s.logDate) ?? []), s]);

  const repository: PeptideRepository = {
    async getSetups() {
      return [...setups];
    },
    async saveSetups(next) {
      setups = [...next];
    },
    async getCustomDefinitions() {
      return [];
    },
    async saveCustomDefinitions() {},
    async getLogs(logDate) {
      return [...(days.get(logDate) ?? [])];
    },
    async saveLogs(logDate, entries) {
      if (entries.length === 0) days.delete(logDate);
      else days.set(logDate, [...entries]);
    },
    async getRecentLogs() {
      return [...days.values()].flat();
    },
    async getRoutineStatuses(logDate) {
      return [...(statusDays.get(logDate) ?? [])];
    },
    async saveRoutineStatuses(logDate, next) {
      if (next.length === 0) statusDays.delete(logDate);
      else statusDays.set(logDate, [...next]);
    },
    async getRecentRoutineStatuses() {
      return [...statusDays.values()].flat();
    },
  };

  return { repository, setups: () => setups };
}

/** Water has to exist for the Dashboard to mount; it is never asserted on. */
function emptyWater(): WaterRepository {
  return {
    async getEntries() {
      return [];
    },
    async saveEntries() {},
    async getGoal() {
      return null;
    },
    async saveGoal() {},
    async getPreferences() {
      return { unit: 'floz' };
    },
    async savePreferences() {},
    async getRecentDays() {
      return [];
    },
  };
}

let mounted: ReactTestRenderer | null = null;

async function mount(repository: PeptideRepository, element: React.ReactElement = <Peptides />) {
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
              <WaterProvider repository={emptyWater()}>
                <PeptideProvider repository={repository}>{element}</PeptideProvider>
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
  mockFontScale = 1;
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
    (node) =>
      typeof node.props?.onPress === 'function' &&
      matches(String(node.props.accessibilityLabel ?? '')),
  )[0];
}

async function press(tree: ReactTestRenderer, label: string | RegExp) {
  const target = control(tree, label);
  if (!target) throw new Error(`no control labelled ${String(label)}`);
  await act(async () => target.props.onPress());
}

const takenStatus = (): RoutineDayStatus => ({
  id: 'status-1',
  setupId: 'setup-1',
  logDate: TODAY,
  state: 'taken',
  createdAt: CREATED,
  updatedAt: CREATED,
});

const skippedStatus = (): RoutineDayStatus => ({ ...takenStatus(), state: 'skipped' });

/* ── the states Today can be in ─────────────────────────────────────────── */

describe('Today', () => {
  it('says nothing is scheduled, plainly, when nothing is', async () => {
    const notToday = (new Date().getDay() + 3) % 7;
    const fake = repositoryWith([
      setupFixture({ schedule: { kind: 'daysOfWeek', days: [notToday] } }),
    ]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('Nothing scheduled today');
    // Calm and direct — not a giant empty card, and no motivational filler.
    for (const filler of ['Great job', 'Keep going', 'Enjoy your', 'rest day']) {
      expect(screen(tree)).not.toContain(filler);
    }
  });

  it('leads with the routine, its amount and both actions', async () => {
    const tree = await mount(repositoryWith([setupFixture()]).repository);
    const rendered = screen(tree);

    expect(rendered).toContain('1 scheduled today');
    expect(rendered).toContain('Retatrutide');
    // The user's own configured amount, read back.
    expect(rendered).toContain('1 mg · Scheduled today');
    expect(control(tree, 'Mark Retatrutide as taken')).toBeDefined();
    expect(control(tree, 'Mark Retatrutide as skipped')).toBeDefined();
  });

  it('keeps every routine actionable when several are scheduled', async () => {
    /*
     * The founders were explicit: three routines must not collapse into
     * "3 scheduled today" with nothing to press. A summary may sit above,
     * but the actions stay.
     */
    const fake = repositoryWith([
      setupFixture({ id: 'a' }),
      setupFixture({ id: 'b', definitionId: 'catalog:bpc-157' }),
      setupFixture({ id: 'c', definitionId: 'catalog:ipamorelin' }),
    ]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('3 scheduled today');
    for (const name of ['Retatrutide', 'BPC-157', 'Ipamorelin']) {
      expect(control(tree, `Mark ${name} as taken`)).toBeDefined();
      expect(control(tree, `Mark ${name} as skipped`)).toBeDefined();
    }
  });

  it('counts what is answered alongside what is still open', async () => {
    const fake = repositoryWith(
      [setupFixture({ id: 'setup-1' }), setupFixture({ id: 'b', definitionId: 'catalog:bpc-157' })],
      [takenStatus()],
    );
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('1 scheduled today · 1 answered');
  });

  it('says so when every scheduled routine has an answer', async () => {
    const fake = repositoryWith([setupFixture()], [takenStatus()]);
    expect(screen(await mount(fake.repository))).toContain('All answered');
  });

  it('shows a recorded Taken and stops asking', async () => {
    const fake = repositoryWith([setupFixture()], [takenStatus()]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('1 mg · Taken');
    expect(control(tree, 'Mark Retatrutide as taken')).toBeUndefined();
    expect(control(tree, 'Mark Retatrutide as skipped')).toBeUndefined();
    // A mistake stays correctable.
    expect(control(tree, "Change today's status for Retatrutide")).toBeDefined();
  });

  it('shows a recorded Skipped without a word of judgement', async () => {
    const fake = repositoryWith([setupFixture()], [skippedStatus()]);
    const tree = await mount(fake.repository);
    const rendered = screen(tree).toLowerCase();

    expect(screen(tree)).toContain('1 mg · Skipped');
    for (const word of ['missed', 'failed', 'behind', 'should have', 'try again']) {
      expect(rendered).not.toContain(word);
    }
    expect(control(tree, "Change today's status for Retatrutide")).toBeDefined();
  });

  it('opens the routine from a Today item', async () => {
    const tree = await mount(repositoryWith([setupFixture()]).repository);
    await press(tree, /^Retatrutide, 1 milligram, scheduled today$/);
    expect(mockPush).toHaveBeenCalledWith('/peptides/routine/setup-1');
  });
});

/* ── the rest of the screen ─────────────────────────────────────────────── */

describe('the management region', () => {
  it('collapses unfinished setup to one notice', async () => {
    const fake = repositoryWith([
      setupFixture({ routineState: 'needs-setup', active: false }),
      setupFixture({ id: 'b', definitionId: 'catalog:bpc-157', routineState: 'needs-setup', active: false }),
    ]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('2 routines need setup');
    await press(tree, '2 routines need setup');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/b');
  });

  it('names the routine when only one needs setup', async () => {
    const fake = repositoryWith([setupFixture({ routineState: 'needs-setup', active: false })]);
    const tree = await mount(fake.repository);
    expect(screen(tree)).toContain('Finish setting up Retatrutide');
  });

  it('lists running routines quietly, with their schedule and amount', async () => {
    const notToday = (new Date().getDay() + 3) % 7;
    const fake = repositoryWith([
      setupFixture({ schedule: { kind: 'daysOfWeek', days: [notToday] } }),
    ]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('Your routines');
    expect(screen(tree)).toContain('· 1 mg');
    await press(tree, /^Retatrutide,/);
    expect(mockPush).toHaveBeenCalledWith('/peptides/routine/setup-1');
  });

  it('keeps an as-needed routine here rather than inventing a schedule for it', async () => {
    // `isScheduledOn` returns false for as-needed by design: it is available,
    // not scheduled. Promoting it into Today would assert a plan nobody made.
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'asNeeded' } })]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('Nothing scheduled today');
    expect(screen(tree)).toContain('As needed');
    expect(control(tree, 'Mark Retatrutide as taken')).toBeUndefined();
  });

  it('folds paused routines behind a count, and opens them on request', async () => {
    const fake = repositoryWith([
      setupFixture({ routineState: 'inactive', active: false }),
      setupFixture({ id: 'b', definitionId: 'catalog:bpc-157', routineState: 'inactive', active: false }),
    ]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('Inactive · 2');
    expect(screen(tree)).not.toContain('Retatrutide');

    const disclosure = control(tree, 'Inactive, 2')!;
    expect(disclosure.props.accessibilityState).toEqual({ expanded: false });
    await act(async () => disclosure.props.onPress());

    expect(screen(tree)).toContain('Retatrutide');
    expect(screen(tree)).toContain('Paused');
    expect(control(tree, 'Inactive, 2')!.props.accessibilityState).toEqual({ expanded: true });
  });

  it('does not bring Pause, Resume or Remove onto Home', async () => {
    // Those belong to the routine itself, where there is room to say what
    // they do. 5.5 owns that screen.
    const fake = repositoryWith([setupFixture()]);
    const rendered = screen(await mount(fake.repository));
    for (const label of ['Pause', 'Resume', 'Remove', 'Delete']) {
      expect(rendered).not.toContain(label);
    }
  });
});

describe('with no routines at all', () => {
  it('offers one purposeful way in, and does not teach the catalog', async () => {
    const tree = await mount(repositoryWith([]).repository);
    const rendered = screen(tree);

    expect(rendered).toContain('No routines yet');
    expect(rendered).toContain('Add to Routine');
    // Not a catalog education page.
    for (const word of ['research', 'Learn', 'Browse compounds', 'popular']) {
      expect(rendered).not.toContain(word);
    }

    await press(tree, 'Add to Routine');
    expect(mockPush).toHaveBeenCalledWith('/peptides/catalog');
  });

  it('offers exactly one way to add, wherever it is', async () => {
    /*
     * Empty, it is a labelled CTA in the body. Populated, it is the header
     * `+` and nothing else — the same action under the same name twice would
     * be redundant to read and ambiguous to hear.
     */
    const empty = await mount(repositoryWith([]).repository);
    expect(screen(empty)).toContain('Add to Routine');
    expect(control(empty, 'Add to Routine')).toBeDefined();
    await act(async () => empty.unmount());
    mounted = null;

    const withRoutines = await mount(repositoryWith([setupFixture()]).repository);
    expect(control(withRoutines, 'Add to Routine')).toBeDefined();
    // The header control is an icon; it does not repeat the words below.
    expect(screen(withRoutines)).not.toContain('Add to Routine');
  });
});

/* ── safety ─────────────────────────────────────────────────────────────── */

describe('safety', () => {
  it('offers Taken and Skipped as two outlined choices, neither pre-selected', async () => {
    /*
     * A filled *Taken* read as *already taken* before anyone touched it —
     * the most consequential misreading available on this screen. Both stay
     * outlined; the feature colour marks the likelier choice without
     * asserting it is the current state.
     */
    const tree = await mount(repositoryWith([setupFixture()]).repository);

    for (const label of ['Mark Retatrutide as taken', 'Mark Retatrutide as skipped']) {
      const node = control(tree, label)!;
      expect(node).toBeDefined();
      expect(node.props.accessibilityState?.selected).toBe(false);

      const style = Object.assign({}, ...[node.props.style].flat(2).filter(Boolean));
      expect(style.borderWidth).toBeGreaterThan(0);
      // Outlined means outlined: no fill on either.
      expect(style.backgroundColor).toBeUndefined();
    }
  });

  it('says scheduled, never due', async () => {
    const fake = repositoryWith([setupFixture()]);
    const rendered = screen(await mount(fake.repository)).toLowerCase();

    expect(rendered).toContain('scheduled today');
    for (const word of [
      'due',
      'overdue',
      'missed',
      'behind',
      'must take',
      'next dose',
      'compliance',
      'adherence',
    ]) {
      expect(rendered).not.toContain(word);
    }
  });

  it('keeps No response distinct from Skipped', async () => {
    /*
     * An unanswered day means *we do not know*. Turning it into *skipped*
     * would put a claim in the record the user never made.
     */
    const unanswered = await mount(repositoryWith([setupFixture()]).repository);
    expect(screen(unanswered)).toContain('Scheduled today');
    expect(screen(unanswered)).not.toContain('Skipped ·');
    expect(control(unanswered, 'Mark Retatrutide as skipped')).toBeDefined();
    await act(async () => unanswered.unmount());
    mounted = null;

    const skipped = await mount(repositoryWith([setupFixture()], [skippedStatus()]).repository);
    expect(screen(skipped)).toContain('Skipped');
    // And an answered day no longer offers the choice at all.
    expect(control(skipped, 'Mark Retatrutide as skipped')).toBeUndefined();
  });

  it('recommends no dose, no protocol and no site', async () => {
    const fake = repositoryWith([setupFixture()]);
    const rendered = screen(await mount(fake.repository)).toLowerCase();

    for (const claim of [
      'recommend',
      'suggested',
      'optimal',
      'should take',
      'increase your',
      'titrate',
      'protocol',
      'rotate to',
    ]) {
      expect(rendered).not.toContain(claim);
    }
  });

  it('reads back the authored amount without touching it', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(fake.repository);

    expect(screen(tree)).toContain('1 mg');
    // The stored setup is untouched by rendering it.
    expect(fake.setups()[0].routineAmount).toEqual({
      amountMcg: toMcg(1, 'mg'),
      authored: { amount: 1, unit: 'mg' },
    });
  });

  it('scores nothing', async () => {
    const fake = repositoryWith(
      [setupFixture({ id: 'a' }), setupFixture({ id: 'b', definitionId: 'catalog:bpc-157' })],
      [takenStatus()],
    );
    const rendered = screen(await mount(fake.repository));

    expect(rendered).not.toMatch(/\d+%/);
    for (const word of ['streak', 'score', 'grade', 'rating', 'on track']) {
      expect(rendered.toLowerCase()).not.toContain(word);
    }
  });
});

/* ── accessibility and Dynamic Type ─────────────────────────────────────── */

describe('accessibility', () => {
  it('spells the amount out, and names the state, in every spoken label', async () => {
    const tree = await mount(repositoryWith([setupFixture()]).repository);
    // `mg` is read as "em gee" by VoiceOver, which is not what it means.
    expect(control(tree, 'Retatrutide, 1 milligram, scheduled today')).toBeDefined();
  });

  it('pluralises the spoken amount', async () => {
    const fake = repositoryWith([
      setupFixture({
        routineAmount: { amountMcg: toMcg(2.5, 'mg'), authored: { amount: 2.5, unit: 'mg' } },
      }),
    ]);
    const tree = await mount(fake.repository);
    expect(control(tree, 'Retatrutide, 2.5 milligrams, scheduled today')).toBeDefined();
  });

  it('gives every action its own spoken name', async () => {
    const fake = repositoryWith([
      setupFixture(),
      setupFixture({ id: 'b', definitionId: 'catalog:bpc-157', routineState: 'inactive', active: false }),
    ]);
    const tree = await mount(fake.repository);

    for (const label of [
      'Mark Retatrutide as taken',
      'Mark Retatrutide as skipped',
      'Inactive, 1',
      'Add to Routine',
    ]) {
      expect(control(tree, label)).toBeDefined();
    }
  });

  it('carries a long name in full to a screen reader, however it wraps', async () => {
    const fake = repositoryWith([setupFixture({ definitionId: 'catalog:blend-cjc-ipamorelin' })]);
    const tree = await mount(fake.repository);

    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));

    const named = spoken.find((label) => label.includes('CJC-1295'));
    expect(named).toBeDefined();
    // Truncation is a visual affordance; the label is never abbreviated.
    expect(named).not.toContain('…');
  });

  it('never switches font scaling off', async () => {
    const tree = await mount(repositoryWith([setupFixture()]).repository);
    const copy = tree.root
      .findAllByType(Text)
      .filter((node) => {
        const style = Object.assign({}, ...[node.props.style].flat(2).filter(Boolean));
        return style.fontFamily !== 'ionicons';
      });

    expect(copy.length).toBeGreaterThan(3);
    for (const node of copy) {
      expect(node.props.allowFontScaling).not.toBe(false);
    }
  });

  it('renders the whole screen at an accessibility text size', async () => {
    mockFontScale = 1.9;
    const fake = repositoryWith([
      setupFixture(),
      setupFixture({ id: 'b', definitionId: 'catalog:bpc-157', routineState: 'inactive', active: false }),
    ]);
    const tree = await mount(fake.repository);

    // Nothing is dropped and nothing is fixed-height: the same content, the
    // same actions, at nearly double the type.
    expect(screen(tree)).toContain('Retatrutide');
    expect(control(tree, 'Mark Retatrutide as taken')).toBeDefined();
    expect(control(tree, 'Inactive, 1')).toBeDefined();
  });
});

/* ── the Dashboard reads the same state ─────────────────────────────────── */

describe('cross-feature reactivity', () => {
  it('updates the Dashboard the moment a routine is answered here', async () => {
    /*
     * Home is locked and consumes peptide state. Both screens read one
     * provider, so this is really a test that neither of them cached
     * anything — if either ever grows its own copy, this is what catches it.
     */
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(
      fake.repository,
      <>
        <Peptides />
        <Dashboard />
      </>,
    );

    expect(screen(tree)).toContain('1 scheduled');

    await press(tree, 'Mark Retatrutide as skipped');

    // No remount, no refresh: the widget and the schedule both moved on.
    expect(screen(tree)).toContain('All answered');
    expect(screen(tree)).toContain('Skipped');
    expect(screen(tree)).not.toContain('1 scheduled today ');
  });

  it("keeps Today's Schedule on the Dashboard correct", async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(
      fake.repository,
      <>
        <Peptides />
        <Dashboard />
      </>,
    );

    expect(screen(tree)).toContain("TODAY'S SCHEDULE");
    expect(screen(tree)).toContain('Retatrutide');
    expect(screen(tree)).not.toContain('Nothing scheduled today');
  });
});
