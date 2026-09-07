/**
 * The month across every routine — slice 5.5C.
 *
 * Peptides Home answers *what is scheduled today*. A routine's own calendar
 * answers *how has this one gone*. Neither answered *what did I actually do
 * in July*, which with more than one routine meant visiting several
 * calendars. This is that screen, and these tests are mostly about the two
 * ways it could go wrong: flattening a day that holds several different
 * answers into one, and quietly acquiring a score.
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
import PeptideActivity from '../../../app/(vita)/peptides/activity';
import Peptides from '../../../app/(vita)/peptides/index';
import { ToastProvider } from '../../../components/ui';
import { fromLogDate, shiftLogDate, todayLogDate, type LogDate } from '../../../lib/daily';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  createSiteSnapshot,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../../lib/peptides';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { monthActivityByDay } from '../allRoutines';
import { daysInMonth, monthOf } from '../month';

const TODAY = todayLogDate();
const CREATED = '2026-08-25T10:00:00.000Z';

function setupFixture(id: string, overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id,
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
  } as PeptideSetup;
}

const status = (
  setupId: string,
  state: 'taken' | 'skipped',
  logDate: LogDate,
): RoutineDayStatus => ({
  id: `rds-${setupId}-${logDate}-${state}`,
  setupId,
  logDate,
  state,
  createdAt: CREATED,
  updatedAt: CREATED,
});

const logFixture = (id: string, setupId: string, logDate: LogDate): PeptideLogEntry =>
  ({
    id,
    setupId,
    definitionId: 'catalog:retatrutide',
    logDate,
    loggedAt: `${logDate}T09:00:00.000Z`,
    amount: { amountMcg: toMcg(1, 'mg'), authoredUnit: 'mg' },
    site: createSiteSnapshot('abdomen-left'),
    createdAt: CREATED,
    updatedAt: CREATED,
  }) as PeptideLogEntry;

function repositoryWith(
  seedSetups: PeptideSetup[],
  seedLogs: PeptideLogEntry[] = [],
  seedStatuses: RoutineDayStatus[] = [],
): PeptideRepository {
  const days = new Map<string, PeptideLogEntry[]>();
  const statusDays = new Map<string, RoutineDayStatus[]>();
  for (const entry of seedLogs) days.set(entry.logDate, [...(days.get(entry.logDate) ?? []), entry]);
  for (const s of seedStatuses)
    statusDays.set(s.logDate, [...(statusDays.get(s.logDate) ?? []), s]);

  let setups = [...seedSetups];
  return {
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
    async getLogsInRange(startDate, endDate) {
      return [...days.entries()]
        .filter(([day]) => day >= startDate && day <= endDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([, records]) => records);
    },
    async getRoutineStatusesInRange(startDate, endDate) {
      return [...statusDays.entries()]
        .filter(([day]) => day >= startDate && day <= endDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([, records]) => records);
    },
    async getEarliestHistoryDate() {
      const all = [...days.keys(), ...statusDays.keys()];
      if (all.length === 0) return null;
      return all.reduce((oldest, day) => (day < oldest ? day : oldest)) as never;
    },
  };
}

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement, repository: PeptideRepository) {
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
            <PeptideProvider repository={repository}>{element}</PeptideProvider>
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
  mockFontScale = 1;
  mockPush.mockClear();
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = Array.isArray(node.props.children)
        ? node.props.children
        : [node.props.children];
      // Numbers are content too — a count rendered as `{3}` is a child of
      // type number, and dropping those makes a screen look emptier than it is.
      return children
        .filter((child: unknown) => typeof child === 'string' || typeof child === 'number')
        .join('');
    })
    .filter(Boolean);
}

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');

function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: string) =>
    typeof label === 'string' ? value === label : label.test(value);
  return tree.root.findAll(
    (node) =>
      typeof node.props?.onPress === 'function' &&
      matches(String(node.props.accessibilityLabel ?? '')),
  )[0];
}

/** The cell for a date, found by the day it announces. */
function dayCell(tree: ReactTestRenderer, logDate: LogDate) {
  const day = fromLogDate(logDate).getDate();
  return tree.root
    .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
    .find((node) => new RegExp(`\\b${day}\\b`).test(String(node.props.accessibilityLabel)));
}

/* ── the day, when several routines have something to say ──────────────── */

describe('a day with more than one routine', () => {
  const YESTERDAY = shiftLogDate(TODAY, -1);

  const threeRoutines = () =>
    repositoryWith(
      [setupFixture('a'), setupFixture('b'), setupFixture('c')],
      [logFixture('l1', 'a', YESTERDAY)],
      [
        status('a', 'taken', YESTERDAY),
        status('b', 'skipped', YESTERDAY),
        status('c', 'taken', YESTERDAY),
      ],
    );

  it('is never reduced to a single state', async () => {
    const tree = await mount(<PeptideActivity />, threeRoutines());
    const cell = dayCell(tree, YESTERDAY)!;

    // Two taken and one skipped is three facts. Picking one to colour the
    // square would be a summary the data does not support.
    expect(cell.props.accessibilityLabel).toContain('3 routine events');
    expect(cell.props.accessibilityLabel).toContain('2 taken');
    expect(cell.props.accessibilityLabel).toContain('1 skipped');
  });

  it('lists the actual routines when the day is selected', async () => {
    const tree = await mount(<PeptideActivity />, threeRoutines());
    await act(async () => dayCell(tree, YESTERDAY)!.props.onPress());

    const rendered = screen(tree);
    expect(rendered).toContain('Taken');
    expect(rendered).toContain('Skipped');
    // The amount comes from the stored log, not from the routine as it stands.
    expect(rendered).toContain('1 mg');
  });

  it('opens the month with nothing selected', async () => {
    const tree = await mount(<PeptideActivity />, threeRoutines());
    expect(screen(tree)).not.toContain('Open routine');
  });

  it('closes the day when it is tapped again', async () => {
    const tree = await mount(<PeptideActivity />, threeRoutines());
    await act(async () => dayCell(tree, YESTERDAY)!.props.onPress());
    expect(screen(tree)).toContain('Open routine');

    await act(async () => dayCell(tree, YESTERDAY)!.props.onPress());
    expect(screen(tree)).not.toContain('Open routine');
  });
});

/* ── counting ──────────────────────────────────────────────────────────── */

describe('the month summary', () => {
  it('counts routine events, so two routines on one day is two', async () => {
    const day = shiftLogDate(TODAY, -1);
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith(
        [setupFixture('a', { schedule: { kind: 'asNeeded' } }), setupFixture('b', { schedule: { kind: 'asNeeded' } })],
        [],
        [status('a', 'taken', day), status('b', 'taken', day)],
      ),
    );

    const summary = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .find((node) => /^Month summary/.test(String(node.props.accessibilityLabel)));
    expect(summary!.props.accessibilityLabel).toContain('2 taken');
  });

  it('carries no percentage, rate or score of any kind', async () => {
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith(
        [setupFixture('a')],
        [],
        [status('a', 'taken', shiftLogDate(TODAY, -1))],
      ),
    );

    const rendered = screen(tree);
    for (const forbidden of ['%', 'adherence', 'completion', 'streak', 'average', 'rate', 'score']) {
      expect(rendered.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('says so plainly when a month held nothing', async () => {
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith([setupFixture('a', { schedule: { kind: 'asNeeded' } })]),
    );
    expect(screen(tree)).toContain('No routine activity this month.');
  });
});

/* ── schedule semantics, unchanged ─────────────────────────────────────── */

describe('schedule semantics', () => {
  it('leaves an as-needed routine blank on a day it was not used', async () => {
    const quiet = shiftLogDate(TODAY, -2);
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith([setupFixture('a', { schedule: { kind: 'asNeeded' } })]),
    );

    const cell = dayCell(tree, quiet);
    // No event at all — never "No response". An as-needed routine has
    // nothing to fail to answer.
    expect(cell?.props.accessibilityLabel).toContain('no activity');
    expect(cell?.props.onPress).toBeUndefined();
  });

  it('claims nothing about days before a routine began', async () => {
    /*
     * Asserted on the selector rather than through the grid, because "a day
     * before the start date" has to be a specific date and the grid only ever
     * shows one month — a route test for it would pass or fail depending on
     * what day of the month the suite happened to run.
     */
    const month = monthOf(TODAY);
    const start = daysInMonth(month)[daysInMonth(month).length - 1];
    const byDay = monthActivityByDay(
      [
        {
          setup: setupFixture('a', { startDate: start }),
          definition: { id: 'catalog:retatrutide', name: 'Retatrutide' } as never,
          name: 'Retatrutide',
          scheduleLabel: 'Daily',
          routineState: 'active',
        },
      ],
      [],
      [],
      month,
      start,
    );

    // Every day before the routine existed contributes no event at all —
    // not a zero, and certainly not an unanswered day it could not have
    // answered.
    for (const day of daysInMonth(month).slice(0, -1)) {
      expect(byDay.get(day)).toBeUndefined();
    }
    expect(byDay.get(start)).toBeDefined();
  });

  it('keeps a paused routine’s real history', async () => {
    /*
     * Someone who paused a routine in June was taking it in June. Dropping
     * it here would quietly rewrite that month.
     */
    const day = shiftLogDate(TODAY, -1);
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith(
        [setupFixture('a', { routineState: 'inactive', active: false })],
        [logFixture('l1', 'a', day)],
        [status('a', 'taken', day)],
      ),
    );

    expect(dayCell(tree, day)!.props.accessibilityLabel).toContain('1 taken');
  });
});

/* ── history ───────────────────────────────────────────────────────────── */

describe('historical months', () => {
  it('reaches a month far outside the warm window', async () => {
    const longAgo = shiftLogDate(TODAY, -200);
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith([setupFixture('a')], [], [status('a', 'taken', longAgo)]),
    );

    for (let step = 0; step < 24; step += 1) {
      const back = control(tree, 'Previous month');
      if (!back || back.props.disabled) break;
      await act(async () => back.props.onPress());
    }

    const date = fromLogDate(longAgo);
    const name = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ][date.getMonth()];
    expect(screen(tree)).toContain(`${name} ${date.getFullYear()}`);
  });

  it('offers no month that has not happened', async () => {
    const tree = await mount(<PeptideActivity />, repositoryWith([setupFixture('a')]));
    expect(control(tree, 'Next month')!.props.disabled).toBe(true);
  });

  it('clears the selected day when the month changes', async () => {
    const day = shiftLogDate(TODAY, -1);
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith(
        [setupFixture('a')],
        [logFixture('l1', 'a', day)],
        [status('a', 'taken', day), status('a', 'taken', shiftLogDate(TODAY, -40))],
      ),
    );

    await act(async () => dayCell(tree, day)!.props.onPress());
    expect(screen(tree)).toContain('Open routine');

    await act(async () => control(tree, 'Previous month')!.props.onPress());
    // Leaving last month's detail under this month would describe a day the
    // screen is no longer about.
    expect(screen(tree)).not.toContain('Open routine');
  });
});

/* ── the way in ────────────────────────────────────────────────────────── */

describe('reaching it from Peptides', () => {
  it('offers one restrained row, after the routines', async () => {
    /*
     * The second routine is as-needed on purpose: a routine scheduled today
     * is deduplicated out of the roster, so with only one this screen renders
     * no "Your routines" heading at all and the ordering assertion below
     * would pass without ever being tested.
     */
    const tree = await mount(
      <Peptides />,
      repositoryWith([setupFixture('a'), setupFixture('b', { schedule: { kind: 'asNeeded' } })]),
    );

    expect(control(tree, 'Monthly activity')).toBeDefined();

    const lines = texts(tree);
    expect(lines).toContain('Your routines');
    // Today stays the hero: the link never precedes the routines.
    expect(lines.indexOf('Your routines')).toBeLessThan(lines.indexOf('Monthly activity'));
  });

  it('is one row, not another card', async () => {
    const tree = await mount(<Peptides />, repositoryWith([setupFixture('a')]));

    // No count, no statistic, no headline number — the depth is behind it.
    const link = control(tree, 'Monthly activity');
    expect(link.props.accessibilityHint).toBe('What you logged across all your routines');
    expect(screen(tree)).not.toMatch(/\d+ (?:events|logged|entries) this month/);
  });

  it('is absent when there is nothing to look back on', async () => {
    const tree = await mount(<Peptides />, repositoryWith([]));
    expect(control(tree, 'Monthly activity')).toBeUndefined();
  });

  it('navigates to the all-routines month', async () => {
    const tree = await mount(<Peptides />, repositoryWith([setupFixture('a')]));
    await act(async () => control(tree, 'Monthly activity')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/peptides/activity');
  });

  it('says so honestly when there are no routines at all', async () => {
    const tree = await mount(<PeptideActivity />, repositoryWith([]));
    expect(screen(tree)).toContain('No routines yet');
  });
});

/* ── Dynamic Type ──────────────────────────────────────────────────────── */

describe('at an accessibility text size', () => {
  it('scales the day marks with the type rather than cropping them', async () => {
    mockFontScale = 2;
    const day = shiftLogDate(TODAY, -1);
    const tree = await mount(
      <PeptideActivity />,
      repositoryWith([setupFixture('a')], [], [status('a', 'taken', day)]),
    );

    // Nothing opts out of scaling, which is the global rule: one responsive
    // screen, never a separate large-text version.
    const copy = tree.root.findAllByType(Text).filter((node) => {
      // Icon glyphs set it themselves inside `@expo/vector-icons`.
      const style = Object.assign({}, ...[node.props.style].flat(2).filter(Boolean));
      return style.fontFamily !== 'ionicons';
    });
    expect(copy.length).toBeGreaterThan(3);
    for (const node of copy) {
      expect(node.props.allowFontScaling).not.toBe(false);
    }
  });
});
