/**
 * Routine, Edit Routine and Injection Sites, as slice 5.5 redesigned them.
 *
 * `PeptideRoutines.test.tsx` and `PeptideLogging.test.tsx` already pin the
 * domain: what a *taken* may assert, what an undo may destroy, what history is
 * allowed to say. This file is about the three screens — the hierarchy, the
 * states each can be in, and the boundaries that must survive a redesign.
 *
 * The boundary block at the end is the important part. A screen showing where
 * someone injected is one design decision away from telling them where to
 * inject next, and every test there exists to keep that decision made.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: mockFontScale }),
}));

let mockRouteId = 'setup-1';
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Peptides from '../../../app/(vita)/peptides/index';
import RoutineDetail from '../../../app/(vita)/peptides/routine/[id]';
import MonthlyActivity from '../../../app/(vita)/peptides/routine/[id]/month';
import EditPeptideSetup from '../../../app/(vita)/peptides/setup/[id]';
import InjectionSites from '../../../app/(vita)/tools/injection-sites';
import { ToastProvider } from '../../../components/ui';
import {
  formatLogDateLong,
  fromLogDate,
  shiftLogDate,
  todayLogDate,
  weekdayInitial,
  type LogDate,
} from '../../../lib/daily';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  createSiteSnapshot,
  toMcg,
  type InjectionSiteSnapshot,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../../lib/peptides';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { weekOf } from '../week';

const TODAY = todayLogDate();
const CREATED = '2026-08-25T10:00:00.000Z';
/** A day that is always inside the current Monday-to-Sunday week. */
const THIS_WEEK = weekOf(TODAY)[0];

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

function logFixture(
  overrides: Partial<PeptideLogEntry> & { id: string; logDate: LogDate },
): PeptideLogEntry {
  return {
    setupId: 'setup-1',
    definitionId: 'catalog:retatrutide',
    loggedAt: `${overrides.logDate}T09:00:00.000Z`,
    amount: { amountMcg: toMcg(1, 'mg'), authoredUnit: 'mg' },
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  } as PeptideLogEntry;
}

const siteLog = (id: string, day: LogDate, site: InjectionSiteSnapshot, setupId = 'setup-1') =>
  logFixture({ id, logDate: day, setupId, site });

const statusFixture = (state: 'taken' | 'skipped', logDate: LogDate = TODAY): RoutineDayStatus => ({
  id: `rds-${state}`,
  setupId: 'setup-1',
  logDate,
  state,
  createdAt: CREATED,
  updatedAt: CREATED,
});

function repositoryWith(
  seedSetups: PeptideSetup[],
  seedLogs: PeptideLogEntry[] = [],
  seedStatuses: RoutineDayStatus[] = [],
): { repository: PeptideRepository; setups: () => PeptideSetup[]; logs: () => PeptideLogEntry[] } {
  let setups = [...seedSetups];
  const days = new Map<string, PeptideLogEntry[]>();
  const statusDays = new Map<string, RoutineDayStatus[]>();
  for (const entry of seedLogs) days.set(entry.logDate, [...(days.get(entry.logDate) ?? []), entry]);
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

    /* Slice 5.5B's historical reads. Range-bounded and read-only, exactly
       like the real repository — these fakes hold every day they were given,
       which is what makes an "older than the warm window" test meaningful. */
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

  return { repository, setups: () => setups, logs: () => [...days.values()].flat() };
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
  const tree = mounted;
  mounted = null;
  mockPush.mockClear();
  mockRouteId = 'setup-1';
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

/** Opens a collapsed section, the way a user does. */
const expand = (tree: ReactTestRenderer, title: RegExp) => press(tree, title);

/* ── Routine: the hierarchy ─────────────────────────────────────────────── */

describe('the routine screen', () => {
  it('leads with today, and folds everything else away', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);
    const lines = texts(tree);

    // Today above the week, the week above activity, management last.
    expect(lines.indexOf('Today')).toBeLessThan(lines.indexOf('Recent activity'));
    expect(lines.indexOf('Recent activity')).toBeLessThan(lines.indexOf('Routine details'));
    expect(lines.indexOf('Routine details')).toBeLessThan(lines.indexOf('Manage routine'));

    // The four uppercase headers this replaced are gone.
    const shouting = lines.filter(
      (line) => line.length > 2 && line === line.toUpperCase() && /^[A-Z' ]+$/.test(line),
    );
    expect(shouting).toEqual([]);
  });

  it('summarises the collapsed sections so most visits never open them', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);
    const rendered = screen(tree);

    expect(rendered).toContain('1 mg · Daily');
    expect(rendered).toContain('20 mg vial · 2 mL');
  });

  it('keeps every capability, one tap away', async () => {
    // The hierarchy changed; nothing was deleted.
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith([setupFixture()], [logFixture({ id: 'a', logDate: TODAY })]).repository,
    );

    expect(control(tree, 'Add log')).toBeDefined();
    expect(control(tree, 'View all history')).toBeDefined();
    expect(control(tree, 'Previous week')).toBeDefined();
    expect(control(tree, 'Next week')).toBeDefined();

    await expand(tree, /^Routine details/);
    expect(screen(tree)).toContain('Schedule');

    await expand(tree, /^Preparation/);
    expect(screen(tree)).toContain('Reconstitution');

    await expand(tree, /^Manage routine/);
    for (const label of ['Edit Routine', 'Pause Routine', 'Remove from Routine']) {
      expect(control(tree, label)).toBeDefined();
    }
  });

  it('marks a paused routine as paused', async () => {
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith([setupFixture({ routineState: 'inactive', active: false })]).repository,
    );
    expect(screen(tree)).toContain('Paused');
    // Nothing to answer for a routine that is not running.
    expect(control(tree, /as taken$/)).toBeUndefined();

    await expand(tree, /^Manage routine/);
    expect(control(tree, 'Resume Routine')).toBeDefined();
  });

  it('carries a long name without truncating what is spoken', async () => {
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith([setupFixture({ definitionId: 'catalog:blend-cjc-ipamorelin' })]).repository,
    );
    expect(screen(tree)).toContain('CJC-1295 without DAC + Ipamorelin');
  });
});

describe("today, on the routine screen", () => {
  it('offers both actions, outlined, neither pre-selected', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    for (const label of ['Mark Retatrutide as taken', 'Mark Retatrutide as skipped']) {
      const node = control(tree, label)!;
      expect(node).toBeDefined();
      expect(node.props.accessibilityState?.selected).toBe(false);

      const style = Object.assign({}, ...[node.props.style].flat(2).filter(Boolean));
      expect(style.borderWidth).toBeGreaterThan(0);
      expect(style.backgroundColor).toBeUndefined();
    }
  });

  it('shows a recorded Taken and stops asking', async () => {
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith([setupFixture()], [], [statusFixture('taken')]).repository,
    );

    expect(screen(tree)).toContain('Taken');
    expect(control(tree, /as taken$/)).toBeUndefined();
    expect(control(tree, "Change today's status for Retatrutide")).toBeDefined();
  });

  it('shows a recorded Skipped without judgement', async () => {
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith([setupFixture()], [], [statusFixture('skipped')]).repository,
    );
    const rendered = screen(tree).toLowerCase();

    expect(screen(tree)).toContain('Skipped');
    for (const word of ['missed', 'failed', 'behind', 'overdue', 'due']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('leaves an unanswered day unanswered', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);
    expect(screen(tree)).toContain('Scheduled today');
    expect(screen(tree)).not.toContain('Skipped ·');
  });
});

describe('recent activity', () => {
  it('shows at most two entries, then defers', async () => {
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith(
        [setupFixture()],
        [1, 2, 3, 4, 5].map((n) =>
          logFixture({ id: `l${n}`, logDate: shiftLogDate(TODAY, -n) }),
        ),
      ).repository,
    );

    const rows = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /^1 mg, /.test(String(node.props.accessibilityLabel ?? '')),
    );
    // A composite and its host both carry the label, so count distinct
    // *rows* by what they announce rather than by node.
    expect(new Set(rows.map((node) => String(node.props.accessibilityLabel))).size).toBe(2);
    expect(control(tree, 'View all history')).toBeDefined();
  });

  it('opens one entry, and the full history', async () => {
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith([setupFixture()], [logFixture({ id: 'l1', logDate: TODAY })]).repository,
    );

    await press(tree, /^1 mg, /);
    expect(mockPush).toHaveBeenCalledWith('/peptides/log/l1');

    await press(tree, 'View all history');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1/history');
  });

  it('says nothing happened, compactly, and still offers Add log', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    expect(screen(tree)).toContain('No activity yet');
    // No giant empty-state container, and no view-all link over nothing.
    expect(control(tree, 'View all history')).toBeUndefined();

    await press(tree, 'Add log');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1/log');
  });
});

describe('injection sites on the routine screen', () => {
  it('appears only when this routine has site-tagged logs', async () => {
    const without = await mount(
      <RoutineDetail />,
      repositoryWith([setupFixture()], [logFixture({ id: 'a', logDate: THIS_WEEK })]).repository,
    );
    expect(screen(without)).not.toContain('Injection sites this week');
    await act(async () => without.unmount());
    mounted = null;

    const tree = await mount(
      <RoutineDetail />,
      repositoryWith(
        [setupFixture()],
        [siteLog('a', THIS_WEEK, createSiteSnapshot('thigh-left'))],
      ).repository,
    );
    expect(screen(tree)).toContain('Injection sites this week');
    expect(screen(tree)).toContain('Left Thigh');
  });

  it('hands the full picture to the tool rather than drawing a second one', async () => {
    const tree = await mount(
      <RoutineDetail />,
      repositoryWith(
        [setupFixture()],
        [siteLog('a', THIS_WEEK, createSiteSnapshot('thigh-left'))],
      ).repository,
    );

    await press(tree, /^Injection sites this week/);
    expect(mockPush).toHaveBeenCalledWith('/tools/injection-sites');
  });
});

/* ── Edit Routine ───────────────────────────────────────────────────────── */

describe('editing a routine', () => {
  it('opens on the fields people actually change', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    const rendered = screen(tree);

    expect(rendered).toContain('Amount (MG)');
    expect(rendered).toContain('Schedule');
    expect(rendered).toContain('Reminder');
    /*
     * The conversion table does not stand between you and the schedule. Since
     * 5.5D the calculator's *collapsed* row does sit under Amount, carrying
     * one line — `1 mg = 10 units` — because the founder asked for one
     * consistent calculator rather than two behaviours (§18). What must stay
     * folded away is the table, the concentration and the custom field.
     */
    expect(rendered).not.toContain('Concentration ·');
    expect(rendered).not.toContain('REFERENCE CONVERSIONS');
    expect(rendered).not.toContain('CUSTOM CONVERSION');
    expect(rendered).not.toContain('Vial Amount (MG)');
  });

  it('summarises preparation instead of hiding it', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    expect(screen(tree)).toContain('20 mg vial · 2 mL');
  });

  it('keeps every field, one tap away', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);

    await expand(tree, /^More options/);
    expect(screen(tree)).toContain('Start date');
    expect(screen(tree)).toContain('Date (YYYY-MM-DD)');

    await expand(tree, /^Preparation/);
    for (const label of ['Vial Amount (MG)', 'Reconstitution Volume (ML)', 'Unit conversion']) {
      expect(screen(tree)).toContain(label);
    }
  });

  it('opens preparation for a routine that has never been configured', async () => {
    // For that one, the section is the reason the screen exists.
    const tree = await mount(
      <EditPeptideSetup />,
      repositoryWith([setupFixture({ routineState: 'needs-setup', active: false })]).repository,
    );
    expect(screen(tree)).toContain('Vial Amount (MG)');
    expect(screen(tree)).toContain('Unit conversion');
  });

  it('keeps one clear Save', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    const saves = texts(tree).filter((line) => line.startsWith('Save'));
    expect(saves).toEqual(['Save Changes']);
  });
});

/* ── Injection Sites ────────────────────────────────────────────────────── */

describe('the injection sites tool', () => {
  it('says so plainly when the week holds nothing', async () => {
    const tree = await mount(<InjectionSites />, repositoryWith([setupFixture()]).repository);
    expect(screen(tree)).toContain('No injection sites logged this week');
    expect(screen(tree)).toContain('This week');
  });

  it('marks one site with the day it was used', async () => {
    const day = weekOf(TODAY)[2];
    const tree = await mount(
      <InjectionSites />,
      repositoryWith([setupFixture()], [siteLog('a', day, createSiteSnapshot('thigh-left'))])
        .repository,
    );

    // The marker's glyph is the weekday initial when a site holds one log.
    expect(screen(tree)).toContain(weekdayInitial(day));
    // And the same record is written out, because a drawing is not an
    // accessible interface on its own.
    expect(screen(tree)).toContain('Left Thigh');
    expect(screen(tree)).toContain('Retatrutide');
  });

  it('collapses several logs at one site into a count, never a stack', async () => {
    const week = weekOf(TODAY);
    const tree = await mount(
      <InjectionSites />,
      repositoryWith(
        [setupFixture()],
        [
          siteLog('a', week[0], createSiteSnapshot('abdomen-left')),
          siteLog('b', week[2], createSiteSnapshot('abdomen-left')),
          siteLog('c', week[4], createSiteSnapshot('abdomen-left')),
        ],
      ).repository,
    );

    // One marker reading 3, and three rows in the list beneath.
    const zone = control(tree, /^Left Abdomen\./)!;
    expect(zone).toBeDefined();
    expect(String(zone.props.accessibilityLabel).match(/Retatrutide/g)).toHaveLength(3);
  });

  it('spells a marker out in full for a screen reader', async () => {
    const day = weekOf(TODAY)[4];
    const tree = await mount(
      <InjectionSites />,
      repositoryWith([setupFixture()], [siteLog('a', day, createSiteSnapshot('abdomen-right'))])
        .repository,
    );

    const spoken = String(control(tree, /^Right Abdomen\./)!.props.accessibilityLabel);
    expect(spoken).toContain('Right Abdomen');
    expect(spoken).toContain('Retatrutide');
    expect(spoken).toContain('1 mg');
  });

  it('steps between weeks', async () => {
    const lastWeek = weekOf(TODAY, -1)[1];
    const tree = await mount(
      <InjectionSites />,
      repositoryWith([setupFixture()], [siteLog('a', lastWeek, createSiteSnapshot('glute-left'))])
        .repository,
    );

    expect(screen(tree)).toContain('This week');
    await press(tree, 'Previous week');
    expect(screen(tree)).toContain('Last week');
    // Back-view sites appear once the view is switched; the list always has it.
    expect(screen(tree)).toContain('Left Glute');

    await press(tree, 'Next week');
    expect(screen(tree)).toContain('This week');
  });

  it('separates front and back without inverting left and right', async () => {
    const day = weekOf(TODAY)[0];
    const tree = await mount(
      <InjectionSites />,
      repositoryWith([setupFixture()], [siteLog('a', day, createSiteSnapshot('glute-right'))])
        .repository,
    );

    // Glutes exist only on the back silhouette — and are named from the
    // wearer's point of view, not a clinician's, in both views.
    expect(control(tree, /^Right Glute/)).toBeUndefined();
    await press(tree, 'Body view, Back');
    expect(control(tree, /^Right Glute\./)).toBeDefined();
    // The list beneath carries it either way, so nothing depends on the view.
    expect(screen(tree)).toContain('Right Glute');
  });

  it('keeps the all-time record reachable', async () => {
    // Narrowing the default view is not the same as removing history.
    const old = shiftLogDate(TODAY, -60);
    const tree = await mount(
      <InjectionSites />,
      repositoryWith([setupFixture()], [siteLog('a', old, createSiteSnapshot('thigh-right'))])
        .repository,
    );

    expect(screen(tree)).toContain('No sites logged this week');
    await expand(tree, /^All recorded sites/);
    expect(screen(tree)).toContain('Right Thigh');
  });

  it('groups several peptides at one site without a rainbow of colours', async () => {
    const week = weekOf(TODAY);
    const tree = await mount(
      <InjectionSites />,
      repositoryWith(
        [setupFixture(), setupFixture({ id: 'setup-2', definitionId: 'catalog:mots-c' })],
        [
          siteLog('a', week[0], createSiteSnapshot('thigh-left')),
          { ...siteLog('b', week[3], createSiteSnapshot('thigh-left'), 'setup-2'),
            definitionId: 'catalog:mots-c' },
        ],
      ).repository,
    );

    const spoken = String(control(tree, /^Left Thigh\./)!.props.accessibilityLabel);
    expect(spoken).toContain('Retatrutide');
    expect(spoken).toContain('MOTS-c');
  });
});

/* ── the boundary ───────────────────────────────────────────────────────── */

describe('no recommendation, anywhere', () => {
  const surfaces: Array<[string, () => React.ReactElement]> = [
    ['the routine screen', () => <RoutineDetail />],
    ['edit routine', () => <EditPeptideSetup />],
    ['injection sites', () => <InjectionSites />],
  ];

  it.each(surfaces)('%s suggests no dose, protocol or site', async (_name, element) => {
    const week = weekOf(TODAY);
    const tree = await mount(
      element(),
      repositoryWith(
        [setupFixture()],
        [
          siteLog('a', week[0], createSiteSnapshot('thigh-left')),
          siteLog('b', week[2], createSiteSnapshot('abdomen-left')),
        ],
      ).repository,
    );

    const rendered = screen(tree).toLowerCase();
    for (const claim of [
      'recommend',
      'suggested',
      'optimal',
      'next site',
      'rotate',
      'avoid',
      'rest this',
      'overused',
      'should take',
      'titrate',
      'due today',
      'overdue',
      'adherence',
      'compliance',
    ]) {
      expect(rendered).not.toContain(claim);
    }
    // And nothing is scored.
    expect(rendered).not.toMatch(/\d+%/);
  });

  it('reads the authored amount back without changing it', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    await expand(tree, /^Routine details/);
    expect(screen(tree)).toContain('1 mg');
    expect(fake.setups()[0].routineAmount).toEqual({
      amountMcg: toMcg(1, 'mg'),
      authored: { amount: 1, unit: 'mg' },
    });
  });

  it('never writes a site while showing one', async () => {
    // The map is a lens onto history, not a logging surface.
    const fake = repositoryWith(
      [setupFixture()],
      [siteLog('a', weekOf(TODAY)[0], createSiteSnapshot('thigh-left'))],
    );
    const tree = await mount(<InjectionSites />, fake.repository);

    await press(tree, /^Left Thigh\./);
    await press(tree, /^Right Thigh$/);
    expect(fake.logs()).toHaveLength(1);
    expect(fake.logs()[0].site?.key).toBe('thigh-left');
  });
});

/* ── Dynamic Type ───────────────────────────────────────────────────────── */

describe('the system text size', () => {
  const surfaces: Array<[string, () => React.ReactElement]> = [
    ['the routine screen', () => <RoutineDetail />],
    ['edit routine', () => <EditPeptideSetup />],
    ['injection sites', () => <InjectionSites />],
  ];

  it.each(surfaces)('%s never switches font scaling off', async (_name, element) => {
    /*
     * The policy, in one assertion: **VITA has no large-text versions of
     * screens.** There is one layout, and the platform scales it. Nothing
     * here passes `allowFontScaling={false}` to protect a layout.
     */
    const tree = await mount(element(), repositoryWith([setupFixture()]).repository);
    const copy = tree.root.findAllByType(Text).filter((node) => {
      const style = Object.assign({}, ...[node.props.style].flat(2).filter(Boolean));
      return style.fontFamily !== 'ionicons';
    });

    expect(copy.length).toBeGreaterThan(3);
    for (const node of copy) {
      expect(node.props.allowFontScaling).not.toBe(false);
    }
  });

  it.each(surfaces)('%s renders the same content at an accessibility size', async (_name, element) => {
    mockFontScale = 1.9;
    const tree = await mount(
      element(),
      repositoryWith([setupFixture()], [siteLog('a', THIS_WEEK, createSiteSnapshot('thigh-left'))])
        .repository,
    );
    // Same screen, same controls — no alternate component for large text.
    expect(texts(tree).length).toBeGreaterThan(5);
  });
});

/* ── the rest of the app follows ────────────────────────────────────────── */

describe('cross-feature reactivity', () => {
  it('updates Peptides Home the moment a routine is answered here', async () => {
    /*
     * Both screens read one provider, so this is really a test that neither
     * of them cached anything. Peptides Home is locked in direction as of
     * 5.4; a regression here would show up as Home disagreeing with Routine
     * about the same day.
     */
    const tree = await mount(
      <>
        <RoutineDetail />
        <Peptides />
      </>,
      repositoryWith([setupFixture()]).repository,
    );

    expect(screen(tree)).toContain('1 scheduled today');

    await press(tree, 'Mark Retatrutide as skipped');

    // No remount, no refresh.
    expect(screen(tree)).toContain('All answered');
    expect(control(tree, 'Mark Retatrutide as skipped')).toBeUndefined();
  });
});

/* ── the weekly timeline (5.5A) ─────────────────────────────────────────── */

describe('the week timeline', () => {
  it('offers one quiet way into the month, from the week header', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    const month = control(tree, 'Monthly activity')!;
    expect(month).toBeDefined();
    await act(async () => month.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/peptides/routine/setup-1/month');
  });

  it('keeps every day a real button, Monday to Sunday', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    const cells = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /, (scheduled|not scheduled), /.test(String(node.props?.accessibilityLabel ?? '')),
    );
    const labels = [...new Set(cells.map((node) => String(node.props.accessibilityLabel)))];
    expect(labels).toHaveLength(7);
    expect(labels[0]).toMatch(/^Monday, /);
    expect(labels[6]).toMatch(/^Sunday, /);
  });

  it('marks today without claiming anything was recorded', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);
    const todayCell = tree.root
      .findAll(
        (node) =>
          typeof node.props?.onPress === 'function' &&
          String(node.props?.accessibilityLabel ?? '').includes(', today,'),
      )
      .map((node) => String(node.props.accessibilityLabel))[0];

    expect(todayCell).toBeDefined();
    // Today and state are separate facts; the halo says one, the node says
    // the other.
    expect(todayCell).toContain('no response');
  });
});

/* ── monthly activity (5.5A) ────────────────────────────────────────────── */

describe('monthly activity', () => {
  const thisMonthLabel = () => {
    const now = fromLogDate(TODAY);
    return `${
      [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ][now.getMonth()]
    } ${now.getFullYear()}`;
  };

  it('opens on the current month, named the way people say it', async () => {
    const tree = await mount(<MonthlyActivity />, repositoryWith([setupFixture()]).repository);

    expect(screen(tree)).toContain('Monthly activity');
    expect(screen(tree)).toContain(thisMonthLabel());
    expect(screen(tree)).toContain('Retatrutide');
    // Monday-first, matching the week strip.
    expect(texts(tree).slice(0, 14).join('')).toContain('MTWTFSS');
  });

  it('offers no month that has not happened', async () => {
    const tree = await mount(<MonthlyActivity />, repositoryWith([setupFixture()]).repository);
    expect(control(tree, 'Next month')!.props.disabled).toBe(true);
  });

  it('steps back to a month the provider actually holds', async () => {
    const lastMonth = shiftLogDate(TODAY, -35);
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture()], [], [statusFixture('taken', lastMonth)]).repository,
    );

    expect(control(tree, 'Previous month')!.props.disabled).toBe(false);
    await press(tree, 'Previous month');
    expect(screen(tree)).not.toContain(thisMonthLabel());
    expect(control(tree, 'Next month')!.props.disabled).toBe(false);
  });

  it('offers no month for a routine with no history at all', async () => {
    /*
     * 5.5B reads months on demand, so the floor is now whatever history
     * actually exists rather than whatever happened to be in memory. With
     * nothing recorded, there is nothing earlier to show.
     */
    const tree = await mount(<MonthlyActivity />, repositoryWith([setupFixture()]).repository);
    expect(control(tree, 'Previous month')!.props.disabled).toBe(true);
  });

  /** The month label `days` ago, spelled the way the screen spells it. */
  const monthLabelAgo = (days: number) => {
    const date = fromLogDate(shiftLogDate(TODAY, -days));
    return `${
      [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ][date.getMonth()]
    } ${date.getFullYear()}`;
  };

  /** Steps back until the arrow disables, and says where it stopped. */
  async function stepBackToFloor(tree: ReactTestRenderer, limit = 24) {
    let steps = 0;
    for (; steps < limit; steps += 1) {
      const back = control(tree, 'Previous month');
      if (!back || back.props.disabled) break;
      await act(async () => back.props.onPress());
    }
    return steps;
  }

  /*
   * ── how far back it goes ──────────────────────────────────────────────
   *
   * §5 of the 5.5C authorization, written after the founder saw about two
   * months on device. The investigation found no bug in the navigation
   * floor — the scenarios they opened held two weeks of fixtures, so two
   * months was the whole truth about them. What it *did* find was that the
   * 5.5B regression asserted `toContain('Taken')` after stepping back, and
   * the Month summary renders the word "Taken" on every month ever drawn.
   * That test would have passed with navigation frozen on the current month.
   *
   * These assert the month actually reached, by name.
   */
  it.each([
    ['two months', 60],
    ['six months', 180],
    ['a year', 365],
  ])('reaches history %s old, and stops exactly there', async (_label, daysAgo) => {
    const longAgo = shiftLogDate(TODAY, -daysAgo);
    const fake = repositoryWith(
      [setupFixture()],
      [logFixture({ id: 'old', logDate: longAgo })],
      [statusFixture('taken', longAgo)],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);

    expect(control(tree, 'Previous month')!.props.disabled).toBe(false);
    await stepBackToFloor(tree);

    // The month that holds the record, read out of storage rather than memory.
    expect(screen(tree)).toContain(monthLabelAgo(daysAgo));
    // And it is the floor: there is nothing older, so there is nowhere further.
    expect(control(tree, 'Previous month')!.props.disabled).toBe(true);
  });

  it('bounds navigation by the data, not by a window of any size', async () => {
    /*
     * The claim 5.5B made and this checks: no 60-, 90-day or n-month limit
     * survives anywhere. Sixteen months back is reachable in sixteen steps.
     */
    const longAgo = shiftLogDate(TODAY, -480);
    const fake = repositoryWith(
      [setupFixture()],
      [],
      [statusFixture('taken', longAgo)],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);

    const steps = await stepBackToFloor(tree, 40);
    expect(steps).toBeGreaterThanOrEqual(15);
    expect(screen(tree)).toContain(monthLabelAgo(480));
  });

  it('comes forward again after loading an old month', async () => {
    const longAgo = shiftLogDate(TODAY, -200);
    const fake = repositoryWith(
      [setupFixture()],
      [],
      [statusFixture('taken', longAgo), statusFixture('skipped', shiftLogDate(TODAY, -1))],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);

    await stepBackToFloor(tree);
    expect(screen(tree)).toContain(monthLabelAgo(200));

    for (let step = 0; step < 24; step += 1) {
      const forward = control(tree, 'Next month');
      if (!forward || forward.props.disabled) break;
      await act(async () => forward.props.onPress());
    }
    // Back where it started, with the recent month intact rather than blank.
    expect(screen(tree)).toContain(thisMonthLabel());
    expect(screen(tree)).toContain('Skipped');
  });

  it('revisits a cached month without asking storage again', async () => {
    const longAgo = shiftLogDate(TODAY, -70);
    const fake = repositoryWith([setupFixture()], [], [statusFixture('taken', longAgo)]);
    const reads = jest.spyOn(fake.repository, 'getRoutineStatusesInRange');
    const tree = await mount(<MonthlyActivity />, fake.repository);

    await act(async () => control(tree, 'Previous month')!.props.onPress());
    await act(async () => control(tree, 'Previous month')!.props.onPress());
    const afterFirstVisit = reads.mock.calls.length;

    // Forward and back over ground already covered.
    await act(async () => control(tree, 'Next month')!.props.onPress());
    await act(async () => control(tree, 'Previous month')!.props.onPress());

    expect(reads.mock.calls.length).toBe(afterFirstVisit);
    reads.mockRestore();
  });

  it('counts three states, with no score of any kind', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith(
        [setupFixture()],
        [],
        [
          statusFixture('taken', TODAY),
          statusFixture('skipped', shiftLogDate(TODAY, -1)),
        ],
      ).repository,
    );

    const rendered = screen(tree);
    expect(rendered).toContain('Taken');
    expect(rendered).toContain('Skipped');
    expect(rendered).toContain('No response');

    expect(rendered).not.toMatch(/\d+%/);
    for (const word of ['adherence', 'compliance', 'streak', 'average', 'score', 'goal', 'great']) {
      expect(rendered.toLowerCase()).not.toContain(word);
    }
  });

  it('speaks the summary as a sentence', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture()], [], [statusFixture('taken', TODAY)]).repository,
    );

    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));
    expect(
      spoken.some((label) => /^Month summary\. \d+ taken\. \d+ skipped\. \d+ no response\.$/.test(label)),
    ).toBe(true);
  });

  it('names every day it shows, including the ones it is not asking about', async () => {
    const notToday = (fromLogDate(TODAY).getDay() + 3) % 7;
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture({ schedule: { kind: 'daysOfWeek', days: [notToday] } })])
        .repository,
    );

    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));

    expect(spoken.some((label) => /, not scheduled$/.test(label))).toBe(true);
    expect(spoken.some((label) => /, no response$/.test(label))).toBe(true);
    // Never colour or a glyph alone.
    expect(spoken.some((label) => /^\w+day, /.test(label))).toBe(true);
  });

  it('leaves an as-needed month blank rather than unanswered', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture({ schedule: { kind: 'asNeeded' } })]).repository,
    );

    const spoken = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => String(node.props.accessibilityLabel));

    expect(spoken.some((label) => /, no response$/.test(label))).toBe(false);
    expect(screen(tree)).toContain('No routine activity this month');
  });

  it('opens the one log recorded on a day', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith(
        [setupFixture()],
        [logFixture({ id: 'l1', logDate: TODAY })],
        [statusFixture('taken', TODAY)],
      ).repository,
    );

    // 5.5B selects the day rather than navigating; the log is a second step.
    await press(tree, new RegExp(`^${fromLogDate(TODAY).toLocaleString('en-US', { weekday: 'long' })}, .*today, taken$`));
    expect(screen(tree)).toContain('Taken');

    await press(tree, 'View log');
    expect(mockPush).toHaveBeenCalledWith('/peptides/log/l1');
  });

  it('sends a day with several logs to the full history', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith(
        [setupFixture()],
        [
          logFixture({ id: 'l1', logDate: TODAY }),
          logFixture({ id: 'l2', logDate: TODAY, loggedAt: `${TODAY}T18:00:00.000Z` }),
        ],
        [statusFixture('taken', TODAY)],
      ).repository,
    );

    await press(tree, new RegExp(`^${fromLogDate(TODAY).toLocaleString('en-US', { weekday: 'long' })}, .*today, taken$`));
    // Both entries are listed — a day with two administrations has two.
    expect(screen(tree)).toContain('2 entries');

    await press(tree, 'View history');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1/history');
  });

  it('keeps history for a paused routine', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith(
        [setupFixture({ routineState: 'inactive', active: false })],
        [],
        [statusFixture('taken', TODAY)],
      ).repository,
    );
    // Pausing changes what happens next, never what already happened.
    expect(screen(tree)).toContain(thisMonthLabel());
    expect(screen(tree)).toContain('Taken');
  });

  it('never switches font scaling off', async () => {
    mockFontScale = 1.9;
    const tree = await mount(<MonthlyActivity />, repositoryWith([setupFixture()]).repository);
    const copy = tree.root.findAllByType(Text).filter((node) => {
      const style = Object.assign({}, ...[node.props.style].flat(2).filter(Boolean));
      return style.fontFamily !== 'ionicons';
    });
    expect(copy.length).toBeGreaterThan(10);
    for (const node of copy) expect(node.props.allowFontScaling).not.toBe(false);
  });
});

/* ── the week and the month must agree (§42) ────────────────────────────── */

describe('week and month consistency', () => {
  it.each([
    ['taken' as const],
    ['skipped' as const],
  ])('reports a %s day the same way in both views', async (state) => {
    const fake = repositoryWith([setupFixture()], [], [statusFixture(state, TODAY)]);

    const week = await mount(<RoutineDetail />, fake.repository);
    const weekLabel = tree_label(week);
    await act(async () => week.unmount());
    mounted = null;

    const month = await mount(<MonthlyActivity />, fake.repository);
    const monthLabelText = tree_label(month);

    expect(weekLabel).toContain(state);
    expect(monthLabelText).toContain(state);
  });

  it('agrees that an unscheduled day is unscheduled in both', async () => {
    const notToday = (fromLogDate(TODAY).getDay() + 3) % 7;
    const fake = repositoryWith([
      setupFixture({ schedule: { kind: 'daysOfWeek', days: [notToday] } }),
    ]);

    const week = await mount(<RoutineDetail />, fake.repository);
    expect(tree_label(week)).toContain('not scheduled');
    await act(async () => week.unmount());
    mounted = null;

    const month = await mount(<MonthlyActivity />, fake.repository);
    expect(tree_label(month)).toContain('not scheduled');
  });

  it('agrees that a day before the routine started belongs to neither view', async () => {
    /*
     * The guard `markForDay` adds, checked on both surfaces at once.
     *
     * The start date is the **Sunday of the displayed week**, not `TODAY - 1`.
     * Yesterday is in last week whenever today is a Monday, so the week strip
     * had no day before the start date to show and this test failed on
     * Mondays only — which is exactly how it was found, at the 5.5D baseline.
     * Anchoring to the week under test makes Monday through Saturday precede
     * the start on every day of the week.
     */
    const started = weekOf(TODAY)[6];
    const fake = repositoryWith([setupFixture({ startDate: started })]);

    const week = await mount(<RoutineDetail />, fake.repository);
    const weekLabels = tree_label(week);
    expect(weekLabels).toContain('not scheduled');
    await act(async () => week.unmount());
    mounted = null;

    const month = await mount(<MonthlyActivity />, fake.repository);
    expect(tree_label(month)).toContain('not scheduled');
  });
});

/* ── dragging the week (slice 5.5D) ─────────────────────────────────────── */

describe('the week strip as a timeline', () => {
  /** The responder wrapped around the strip, found the way RN wires it. */
  const swipeSurface = (tree: ReactTestRenderer) =>
    tree.root.findAll(
      (node) => typeof node.props?.onMoveShouldSetResponderCapture === 'function',
    )[0];

  it('is draggable, without taking the page’s vertical scroll', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);
    const surface = swipeSurface(tree);
    expect(surface).toBeDefined();

    // The negotiation itself is `weekSwipe.test.ts`; this is the wiring —
    // that the claim runs in the capture phase, which is the only phase a
    // parent can take a gesture back from the day buttons underneath.
    expect(typeof surface.props.onMoveShouldSetResponderCapture).toBe('function');

    // …and that the day buttons underneath still receive presses. A touch is
    // a tap until it travels, so the strip stays a control surface.
    const cells = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /^\w+day, /.test(String(node.props.accessibilityLabel ?? '')),
    );
    expect(cells.length).toBe(7);
  });

  it('keeps the arrows working, and they still bound at the present', async () => {
    // §5: the swipe adds a way to navigate; it replaces nothing.
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    expect(screen(tree)).toContain('This week');
    await press(tree, 'Previous week');
    expect(screen(tree)).toContain('Last week');

    await press(tree, 'Next week');
    expect(screen(tree)).toContain('This week');
    // Forward stops at the present — a routine has no future to report.
    expect(control(tree, 'Next week')!.props.disabled).toBe(true);
  });

  it('can be stepped without a swipe, for VoiceOver', async () => {
    /*
     * §48. A drag is not available to someone navigating by flick, so the
     * week is an adjustable value as well as a pair of arrows.
     */
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    const region = tree.root
      .findAll((node) => typeof node.props?.onAccessibilityAction === 'function')
      .find((node) => /week/i.test(String(node.props.accessibilityLabel ?? '')))!;
    expect(region.props.accessibilityRole).toBe('adjustable');
    expect(region.props.accessibilityActions.map((action: { name: string }) => action.name)).toEqual(
      ['increment', 'decrement'],
    );

    await act(async () =>
      region.props.onAccessibilityAction({ nativeEvent: { actionName: 'decrement' } }),
    );
    expect(screen(tree)).toContain('Last week');
  });

  it('will not step forward past the present, by any route', async () => {
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    const region = () =>
      tree.root
        .findAll((node) => typeof node.props?.onAccessibilityAction === 'function')
        .find((node) => /week/i.test(String(node.props.accessibilityLabel ?? '')))!;

    await act(async () =>
      region().props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } }),
    );
    expect(screen(tree)).toContain('This week');
  });

  it('leaves the month link alone', async () => {
    // §14: swiping moves a week. The month is a separate destination and a
    // separate press target.
    const tree = await mount(<RoutineDetail />, repositoryWith([setupFixture()]).repository);

    await press(tree, 'Monthly activity');
    expect(mockPush).toHaveBeenCalledWith('/peptides/routine/setup-1/month');
  });

  it('changes which week is shown, not what a day means', async () => {
    /*
     * §15: the gesture is navigation. Stepping back must not alter the
     * schedule semantics the strip reports.
     */
    const lastWeek = weekOf(TODAY, -1)[2];
    const fake = repositoryWith([setupFixture()], [], [statusFixture('taken', lastWeek)]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    await press(tree, 'Previous week');
    const labels = tree_label(tree);
    expect(labels).toContain('taken');
    expect(labels).toContain(formatLogDateLong(lastWeek));
  });
});

/** Every spoken label on a screen, joined — for comparing two surfaces. */
function tree_label(tree: ReactTestRenderer): string {
  return tree.root
    .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
    .map((node) => String(node.props.accessibilityLabel))
    .join(' | ');
}

/* ── historical month loading (5.5B) ────────────────────────────────────── */

describe('loading an older month', () => {
  /** A repository that counts reads and can be made to fail. */
  function trackingRepository(
    setups: PeptideSetup[],
    logs: PeptideLogEntry[],
    statuses: RoutineDayStatus[],
  ) {
    const base = repositoryWith(setups, logs, statuses);
    let rangeReads = 0;
    let fail = false;

    const repository: PeptideRepository = {
      ...base.repository,
      async getLogsInRange(startDate, endDate) {
        rangeReads += 1;
        if (fail) throw new Error('storage unavailable');
        return base.repository.getLogsInRange(startDate, endDate);
      },
      async getRoutineStatusesInRange(startDate, endDate) {
        if (fail) throw new Error('storage unavailable');
        return base.repository.getRoutineStatusesInRange(startDate, endDate);
      },
    };

    return {
      repository,
      reads: () => rangeReads,
      setFail: (value: boolean) => {
        fail = value;
      },
    };
  }

  it('reads a month older than the warm window and shows what it finds', async () => {
    /*
     * The premise of 5.5B: the sixty-day window was a loading decision, and
     * every day the user recorded is still on disk.
     */
    const longAgo = shiftLogDate(TODAY, -200);
    const fake = repositoryWith(
      [setupFixture()],
      [logFixture({ id: 'old', logDate: longAgo })],
      [statusFixture('taken', longAgo)],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);

    for (let step = 0; step < 8; step += 1) {
      const back = control(tree, 'Previous month')!;
      if (back.props.disabled) break;
      await act(async () => back.props.onPress());
    }

    expect(screen(tree)).toContain('Month summary');
    expect(screen(tree)).toContain('Taken');
  });

  it('stops at the oldest day history exists for', async () => {
    const oldest = shiftLogDate(TODAY, -70);
    const fake = repositoryWith(
      [setupFixture()],
      [],
      [statusFixture('taken', oldest)],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);

    // Steps back to that month, then refuses to go further.
    for (let step = 0; step < 10; step += 1) {
      const back = control(tree, 'Previous month')!;
      if (back.props.disabled) break;
      await act(async () => back.props.onPress());
    }
    expect(control(tree, 'Previous month')!.props.disabled).toBe(true);
  });

  it('does not re-read a month it has already loaded', async () => {
    const fake = trackingRepository(
      [setupFixture()],
      [],
      [statusFixture('taken', shiftLogDate(TODAY, -40))],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);
    const initial = fake.reads();

    await press(tree, 'Previous month');
    const afterBack = fake.reads();
    expect(afterBack).toBeGreaterThan(initial);

    await press(tree, 'Next month');
    // Returning to a cached month costs nothing.
    expect(fake.reads()).toBe(afterBack);
  });

  it('reports a failed read as a failure, never as an empty month', async () => {
    /*
     * Rendering nothing would tell the user this month held nothing — a claim
     * about their history that one failed storage call has not earned.
     */
    const fake = trackingRepository([setupFixture()], [], []);
    fake.setFail(true);
    const tree = await mount(<MonthlyActivity />, fake.repository);

    expect(screen(tree)).toContain("Couldn't load this month");
    expect(screen(tree)).not.toContain('Month summary');

    fake.setFail(false);
    await press(tree, 'Try again');
    expect(screen(tree)).not.toContain("Couldn't load this month");
    expect(screen(tree)).toContain('Month summary');
  });

  it('never duplicates an entry after loading and revisiting', async () => {
    const day = shiftLogDate(TODAY, -3);
    const fake = repositoryWith(
      [setupFixture()],
      [logFixture({ id: 'l1', logDate: day })],
      [statusFixture('taken', day)],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);

    await press(tree, 'Previous month');
    await press(tree, 'Next month');

    await press(tree, new RegExp(`^${fromLogDate(day).toLocaleString('en-US', { weekday: 'long' })},.*taken$`));
    // One entry, not two — the cache returns the same read, never a merge.
    expect(screen(tree)).not.toContain('2 entries');
  });

  it('never offers a future month', async () => {
    const fake = repositoryWith([setupFixture()], [], [statusFixture('taken', TODAY)]);
    const tree = await mount(<MonthlyActivity />, fake.repository);
    expect(control(tree, 'Next month')!.props.disabled).toBe(true);
  });
});

/* ── selecting a day (5.5B) ─────────────────────────────────────────────── */

describe('selecting a day in the month', () => {
  const weekdayOf = (day: LogDate) =>
    fromLogDate(day).toLocaleString('en-US', { weekday: 'long' });

  it('opens with nothing selected', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture()], [], [statusFixture('taken', TODAY)]).repository,
    );
    // The month should answer "what happened" before any interaction.
    expect(screen(tree)).toContain('Month summary');
    expect(screen(tree)).not.toContain('View log');
  });

  it('shows an unanswered day without a word of blame', async () => {
    const past = shiftLogDate(TODAY, -2);
    const tree = await mount(<MonthlyActivity />, repositoryWith([setupFixture()]).repository);

    await press(tree, new RegExp(`^${weekdayOf(past)},.*no response$`));
    const rendered = screen(tree).toLowerCase();
    expect(screen(tree)).toContain('No response');
    for (const word of ['missed', 'overdue', 'failed', 'behind']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('shows a skipped day plainly', async () => {
    const past = shiftLogDate(TODAY, -1);
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture()], [], [statusFixture('skipped', past)]).repository,
    );

    await press(tree, new RegExp(`^${weekdayOf(past)},.*skipped$`));
    expect(screen(tree)).toContain('Skipped');
  });

  it('announces the selection, and clears it on the second tap', async () => {
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture()], [], [statusFixture('taken', TODAY)]).repository,
    );

    await press(tree, new RegExp(`^${weekdayOf(TODAY)},.*taken$`));
    expect(control(tree, new RegExp(`^${weekdayOf(TODAY)},.*selected$`))).toBeDefined();

    await press(tree, new RegExp(`^${weekdayOf(TODAY)},.*selected$`));
    expect(screen(tree)).not.toContain('View log');
  });

  it('clears the selection when the month changes', async () => {
    // September the 3rd's details under August would describe a day the
    // screen is no longer about.
    const fake = repositoryWith(
      [setupFixture()],
      [logFixture({ id: 'l1', logDate: TODAY })],
      [statusFixture('taken', TODAY), statusFixture('taken', shiftLogDate(TODAY, -40))],
    );
    const tree = await mount(<MonthlyActivity />, fake.repository);

    await press(tree, new RegExp(`^${weekdayOf(TODAY)},.*taken$`));
    expect(screen(tree)).toContain('View log');

    await press(tree, 'Previous month');
    expect(screen(tree)).not.toContain('View log');
  });

  it('does not make a blank day feel like a button', async () => {
    const notToday = (fromLogDate(TODAY).getDay() + 3) % 7;
    const tree = await mount(
      <MonthlyActivity />,
      repositoryWith([setupFixture({ schedule: { kind: 'daysOfWeek', days: [notToday] } })])
        .repository,
    );

    const blank = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /, not scheduled$/.test(String(node.props?.accessibilityLabel ?? '')),
    );
    expect(blank).toHaveLength(0);
  });
});
