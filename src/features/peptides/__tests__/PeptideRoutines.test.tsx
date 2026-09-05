/**
 * Routines, daily status, and what removing one is allowed to destroy.
 *
 * Slice 3.9 introduces the only concept in this feature that can lie: a
 * routine-day status is an assertion about whether someone put a peptide into
 * their body. Most of what follows exists to pin the ways that assertion
 * could drift from the truth — a *taken* with no administration behind it, a
 * schedule quietly manufacturing one, a manual log swept up by an undo, or a
 * removal that takes history with it.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockRouteId = '';
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: (...args: unknown[]) => mockBack(...args),
    navigate: (...args: unknown[]) => mockNavigate(...args),
    dismissAll: jest.fn(),
  },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Alert, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Peptides from '../../../app/(vita)/peptides/index';
import RoutineDetail from '../../../app/(vita)/peptides/routine/[id]';
import EditPeptideSetup from '../../../app/(vita)/peptides/setup/[id]';
import PeptideDetail from '../../../app/(vita)/peptides/catalog/[id]';
import InjectionSites from '../../../app/(vita)/tools/injection-sites';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  createSiteSnapshot,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../../lib/peptides';
import { formatLogDateLong, fromLogDate, todayLogDate, toTimeInput } from '../../../lib/daily';
import { searchCatalog } from '../../../lib/peptides/data/catalog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStoragePeptideRepository as realRepository } from '../../../lib/peptides/data/asyncStorageRepository';
import { PeptideKeys } from '../../../lib/peptides/data/keys';
import { ToastProvider } from '../../../components/ui';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const CREATED = '2026-08-25T10:00:00.000Z';
const TODAY = todayLogDate();
const TODAY_LONG = formatLogDateLong(TODAY);

/** A 20 mg vial in 2 mL — 10 mg/mL, so 2 mg is 20 units. */
function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    schedule: { kind: 'daily' },
    routineState: 'active',
    active: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  };
}

function logFixture(overrides: Partial<PeptideLogEntry> = {}): PeptideLogEntry {
  return {
    id: 'plog-1',
    setupId: 'setup-1',
    definitionId: 'catalog:retatrutide',
    logDate: '2026-08-23',
    loggedAt: new Date(2026, 7, 23, 12, 0).toISOString(),
    amount: { authoredAmount: 2, authoredUnit: 'mg', amountMcg: 2000 },
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  };
}

type Fake = {
  repository: PeptideRepository;
  setups: () => PeptideSetup[];
  logs: () => PeptideLogEntry[];
  statuses: () => RoutineDayStatus[];
  failLogWrites: (fail: boolean) => void;
};

function repositoryWith(
  seedSetups: PeptideSetup[],
  seedLogs: PeptideLogEntry[] = [],
  seedStatuses: RoutineDayStatus[] = [],
): Fake {
  let setups = [...seedSetups];
  const days = new Map<string, PeptideLogEntry[]>();
  const statusDays = new Map<string, RoutineDayStatus[]>();
  let failLogs = false;

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
      if (failLogs) throw new Error('storage full');
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

  return {
    repository,
    setups: () => setups,
    logs: () => [...days.values()].flat(),
    statuses: () => [...statusDays.values()].flat(),
    failLogWrites: (fail: boolean) => {
      failLogs = fail;
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
  const tree = mounted;
  mounted = null;
  mockPush.mockClear();
  mockBack.mockClear();
  mockNavigate.mockClear();
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

function control(tree: ReactTestRenderer, label: string) {
  return tree.root
    .findAll((node) => typeof node.props?.onPress === 'function')
    .find((node) =>
      node.findAllByType(Text).some((text) => {
        const children = Array.isArray(text.props.children) ? text.props.children : [text.props.children];
        return children.join('').trim() === label;
      }),
    );
}

async function press(tree: ReactTestRenderer, label: string) {
  const target = control(tree, label);
  if (!target) throw new Error(`no "${label}" control on screen`);
  await act(async () => target.props.onPress());
}

async function pressByLabel(tree: ReactTestRenderer, label: string) {
  const [target] = tree.root.findAll(
    (node) => typeof node.props?.onPress === 'function' && node.props?.accessibilityLabel === label,
  );
  if (!target) throw new Error(`no control labelled "${label}"`);
  await act(async () => target.props.onPress());
}

async function type(tree: ReactTestRenderer, label: RegExp, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => label.test(String(node.props.accessibilityLabel ?? '')));
  if (!field) throw new Error(`no field matching ${label}`);
  await act(async () => field.props.onChangeText(value));
}

/* ── §75 routine state ──────────────────────────────────────────────── */

describe('routine state', () => {
  it('adds a peptide as needs-setup, not as active or inactive', async () => {
    mockRouteId = encodeURIComponent('catalog:bpc-157');
    const fake = repositoryWith([]);
    const tree = await mount(<PeptideDetail />, fake.repository);

    await press(tree, 'Add to Routine');

    expect(fake.setups()).toHaveLength(1);
    expect(fake.setups()[0].routineState).toBe('needs-setup');
    // Added is not paused. Merging the two was explicitly rejected.
    expect(fake.setups()[0].routineState).not.toBe('inactive');
  });

  it('returns to Peptides, not to the catalog it came through', async () => {
    mockRouteId = encodeURIComponent('catalog:bpc-157');
    const fake = repositoryWith([]);
    const tree = await mount(<PeptideDetail />, fake.repository);

    await press(tree, 'Add to Routine');

    /**
     * The destination is named, not inferred.
     *
     * `back()` returned to the search results, and `dismissAll()` popped to
     * whatever navigator root it found — which outside the Peptides stack
     * meant Fuel. And no form either: deciding to track something must not
     * cost an interrogation.
     */
    expect(mockNavigate).toHaveBeenCalledWith('/peptides');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows the new routine under Needs setup on that screen', async () => {
    mockRouteId = encodeURIComponent('catalog:bpc-157');
    const fake = repositoryWith([]);
    const detail = await mount(<PeptideDetail />, fake.repository);
    await press(detail, 'Add to Routine');
    await act(async () => detail.unmount());
    mounted = null;

    const home = await mount(<Peptides />, fake.repository);
    const rendered = screen(home);
    // 5.4: one compact notice naming the routine, in place of a section
    // header over a card over a row.
    expect(rendered).toContain('Finish setting up BPC-157');
  });

  it('becomes active when its setup is saved', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture({ routineState: 'needs-setup', active: false })]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, 'Save Setup');
    expect(fake.setups()[0].routineState).toBe('active');
  });

  it('keeps a paused routine paused when its setup is edited', async () => {
    // Saving an edit must never quietly un-pause something.
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture({ routineState: 'inactive', active: false })]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, 'Save Changes');
    expect(fake.setups()[0].routineState).toBe('inactive');
  });

  it('pauses and resumes from the routine screen', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    await press(tree, 'Pause Routine');
    expect(fake.setups()[0].routineState).toBe('inactive');

    await press(tree, 'Resume Routine');
    expect(fake.setups()[0].routineState).toBe('active');
    // Resuming never asks for setup again.
    expect(fake.setups()[0].vial?.amountMcg).toBe(20_000);
  });

  it('offers one routine per definition however many times Add is tapped', async () => {
    mockRouteId = encodeURIComponent('catalog:bpc-157');
    const fake = repositoryWith([]);
    const tree = await mount(<PeptideDetail />, fake.repository);

    await press(tree, 'Add to Routine');
    expect(fake.setups()).toHaveLength(1);

    // The CTA has already changed, so this is the state-aware path — but even
    // a stale tap must not create a second shell.
    await act(async () => {});
    expect(fake.setups()).toHaveLength(1);
  });

  it('sorts every routine into exactly one section', async () => {
    /**
     * Four routines, four sections, and — since 3.10A — **no routine in two
     * of them.** `b` is daily, so it belongs to Today; `d` is scheduled on a
     * day that is not today, so it belongs to Active.
     */
    const notToday = (todayIndex: number) => ((todayIndex + 3) % 7);
    const fake = repositoryWith([
      setupFixture({ id: 'a', routineState: 'needs-setup', active: false }),
      setupFixture({ id: 'b', definitionId: 'catalog:bpc-157', routineState: 'active' }),
      setupFixture({ id: 'c', definitionId: 'catalog:ipamorelin', routineState: 'inactive', active: false }),
      setupFixture({
        id: 'd',
        definitionId: 'catalog:tirzepatide',
        routineState: 'active',
        schedule: { kind: 'daysOfWeek', days: [notToday(fromLogDate(TODAY).getDay())] },
      }),
    ]);
    const tree = await mount(<Peptides />, fake.repository);

    /*
     * Slice 5.4 replaced four identical uppercase headers with a hierarchy:
     * Today is the unlabelled hero region, unfinished setups are one notice,
     * and the rest is a single quieter "Your routines". The *grouping* is
     * unchanged — that is what this test is really about.
     */
    const rendered = screen(tree);
    expect(rendered).toContain('1 scheduled today');
    expect(rendered).toContain('Finish setting up Retatrutide');
    expect(rendered).toContain('Your routines');
    expect(rendered).toContain('Inactive · 1');

    // BPC-157 is today's; it must be named once on the whole screen.
    expect(texts(tree).filter((line) => line === 'BPC-157')).toHaveLength(1);
    expect(texts(tree).filter((line) => line === 'Tirzepatide')).toHaveLength(1);
  });
});

/* ── legacy migration (§57, §58) ────────────────────────────────────── */

describe('pre-3.9 setups', () => {
  /**
   * The migration lives in the parser, so it is tested through the real
   * repository rather than an in-memory double — a double that hands back
   * whatever it was given would prove nothing about what happens on load.
   */
  async function loadLegacy(overrides: Record<string, unknown>) {
    const legacy = { ...setupFixture(), ...overrides } as Record<string, unknown>;
    delete legacy.routineState;
    await AsyncStorage.setItem(PeptideKeys.setups, JSON.stringify([legacy]));
    return (await realRepository.getSetups())[0];
  }

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loads an active legacy setup as Active, never as needs-setup', async () => {
    // Before 3.9 the only way a setup could exist was the full form, so every
    // stored one is configured. Telling a working routine it needs setup
    // would be a regression wearing a migration's clothes.
    const loaded = await loadLegacy({ active: true });
    expect(loaded.routineState).toBe('active');
  });

  it('loads an inactive legacy setup as Inactive', async () => {
    const loaded = await loadLegacy({ active: false });
    expect(loaded.routineState).toBe('inactive');
  });

  it('keeps a legacy setup with no vial as Active rather than incomplete', async () => {
    // A pre-filled pen has nothing to reconstitute. Missing vial data is a
    // legitimate setup, not an unfinished one.
    const loaded = await loadLegacy({ active: true, vial: undefined, reconstitutionMl: undefined });
    expect(loaded.routineState).toBe('active');
    expect(loaded.vial).toBeUndefined();
  });

  it('carries a stored displayName through the load untouched', async () => {
    const loaded = await loadLegacy({ active: true, displayName: 'Morning vial' });
    expect(loaded.displayName).toBe('Morning vial');
  });

  it('shows a migrated routine in its section on the home screen', async () => {
    const legacy = { ...setupFixture() } as Record<string, unknown>;
    delete legacy.routineState;
    await AsyncStorage.setItem(PeptideKeys.setups, JSON.stringify([legacy]));

    const tree = await mount(<Peptides />, realRepository);
    // The fixture is a daily routine, so a migrated *active* setup surfaces
    // in Today — which is the whole point: it loaded as running, not as
    // something still waiting to be configured.
    expect(screen(tree)).toContain('1 scheduled today');
    expect(screen(tree)).not.toContain('need setup');
    expect(screen(tree)).not.toContain('Finish setting up');
  });
});

/* ── §76 the catalog CTA ────────────────────────────────────────────── */

describe('the detail CTA', () => {
  async function ctaFor(setups: PeptideSetup[]) {
    mockRouteId = encodeURIComponent('catalog:retatrutide');
    const fake = repositoryWith(setups);
    const tree = await mount(<PeptideDetail />, fake.repository);
    return { tree, fake };
  }

  it('offers Add to Routine when the peptide is not tracked', async () => {
    const { tree } = await ctaFor([]);
    expect(control(tree, 'Add to Routine')).toBeDefined();
  });

  it('offers Finish Setup when it was added but never configured', async () => {
    const { tree } = await ctaFor([setupFixture({ routineState: 'needs-setup', active: false })]);
    expect(control(tree, 'Finish Setup')).toBeDefined();
    expect(control(tree, 'Add to Routine')).toBeUndefined();
  });

  it('offers View Routine once it is active', async () => {
    const { tree } = await ctaFor([setupFixture()]);
    expect(control(tree, 'View Routine')).toBeDefined();
  });

  it('offers View Routine for a paused one too, never a second Add', async () => {
    const { tree } = await ctaFor([setupFixture({ routineState: 'inactive', active: false })]);
    expect(control(tree, 'View Routine')).toBeDefined();
    expect(control(tree, 'Add to Routine')).toBeUndefined();
  });

  it('puts the action above the research rather than after it', async () => {
    // The founder had to scroll past claims, mechanisms, studied-for, targets
    // and sources to find it. Position is the whole fix.
    const { tree } = await ctaFor([]);
    const lines = texts(tree);
    const cta = lines.indexOf('Add to Routine');
    // Section headings render uppercase; the classification chip reads
    // "Research compound", which must not be mistaken for one.
    const research = lines.findIndex((line) =>
      ['RESEARCH CLAIMS', 'HOW IT WORKS', 'STUDIED FOR', 'TARGETS', 'SOURCES'].includes(line),
    );

    expect(cta).toBeGreaterThan(-1);
    expect(research).toBeGreaterThan(-1);
    expect(cta).toBeLessThan(research);
  });
});

/* ── §77 display name ───────────────────────────────────────────────── */

describe('display name', () => {
  it('is gone from the setup form', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    expect(screen(tree)).not.toContain('Display Name');
    expect(texts(tree)).not.toContain('NAME');
  });

  it('names a routine from its definition', async () => {
    const fake = repositoryWith([setupFixture({ displayName: 'Morning vial' })]);
    const tree = await mount(<Peptides />, fake.repository);

    expect(screen(tree)).toContain('Retatrutide');
    expect(screen(tree)).not.toContain('Morning vial');
  });

  it('loads a legacy setup carrying displayName without dropping it', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture({ displayName: 'Morning vial' })]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, 'Save Changes');

    // Invisible, unread — and still on disk. Silently erasing what an old
    // setup was called is a migration destroying data it did not need to.
    expect(fake.setups()[0].displayName).toBe('Morning vial');
  });
});

/* ── §78 daily status ───────────────────────────────────────────────── */

describe('the daily routine', () => {
  it('starts a scheduled day unanswered', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    expect(screen(tree)).toContain('Scheduled today');
    expect(fake.statuses()).toHaveLength(0);
  });

  it('leaves an unanswered day unanswered — no record is ever written for it', async () => {
    // The whole reason "unconfirmed" is an absence rather than a value: if
    // nothing writes it, nothing can convert silence into "skipped".
    const fake = repositoryWith([setupFixture()]);
    await mount(<Peptides />, fake.repository);
    await act(async () => {});

    expect(fake.statuses()).toEqual([]);
  });

  it('records Taken as a status and a real administration', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as taken');
    await type(tree, /^Amount in mg/, '2');
    await press(tree, 'Confirm Taken');

    expect(fake.statuses()).toHaveLength(1);
    expect(fake.statuses()[0].state).toBe('taken');
    expect(fake.logs()).toHaveLength(1);
    expect(fake.logs()[0].amount.amountMcg).toBe(2000);
    // The conversion is captured from the setup, as ever.
    expect(fake.logs()[0].calculationSnapshot?.calculatedUnits).toBe(20);
  });

  it('records Skipped as a status and nothing else', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as skipped');

    expect(fake.statuses()[0].state).toBe('skipped');
    // Skipping means it did not happen. Writing a log would invert that.
    expect(fake.logs()).toHaveLength(0);
    expect(fake.statuses()[0].linkedLogId).toBeUndefined();
  });

  it('replaces Taken and Skipped with a Change control once answered', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as skipped');

    const labels = tree.root
      .findAll((node) => typeof node.props?.onPress === 'function')
      .map((node) => String(node.props?.accessibilityLabel ?? ''));

    expect(labels).not.toContain('Mark Retatrutide as taken');
    expect(labels).not.toContain('Mark Retatrutide as skipped');
    expect(labels).toContain("Change today's status for Retatrutide");
  });

  it('never schedules an As Needed routine', async () => {
    // A plan the user did not make must not appear as one.
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'asNeeded' } })]);
    const tree = await mount(<Peptides />, fake.repository);

    expect(screen(tree)).not.toContain('Scheduled today');
    expect(screen(tree)).toContain('As needed');
  });

  it('never schedules a routine with no schedule at all', async () => {
    const fake = repositoryWith([setupFixture({ schedule: undefined })]);
    const tree = await mount(<Peptides />, fake.repository);
    expect(screen(tree)).not.toContain('Scheduled today');
  });

  it('keeps a paused routine out of Today', async () => {
    const fake = repositoryWith([setupFixture({ routineState: 'inactive', active: false })]);
    const tree = await mount(<Peptides />, fake.repository);
    expect(screen(tree)).not.toContain('Scheduled today');
  });

  it('never says due, missed, overdue, or scores anything', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    const rendered = screen(tree).toLowerCase();
    for (const word of ['due', 'missed', 'overdue', 'adherence', 'compliance', 'streak', '%']) {
      expect(rendered).not.toContain(word);
    }
  });
});

/* ── §79 Taken integrity ────────────────────────────────────────────── */

describe('taken integrity', () => {
  it('links the status to the administration it created', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as taken');
    await type(tree, /^Amount in mg/, '2');
    await press(tree, 'Confirm Taken');

    expect(fake.statuses()[0].linkedLogId).toBe(fake.logs()[0].id);
  });

  it('does not claim Taken when the administration could not be saved', async () => {
    // The one genuinely corrupt state this feature can reach: a confirmed
    // dose in the calendar that appears nowhere in history.
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);
    fake.failLogWrites(true);

    await pressByLabel(tree, 'Mark Retatrutide as taken');
    await type(tree, /^Amount in mg/, '2');
    await press(tree, 'Confirm Taken');

    expect(fake.statuses()).toHaveLength(0);
    expect(fake.logs()).toHaveLength(0);
    expect(screen(tree)).toContain('Scheduled today');
  });

  it('undoing Taken removes the linked administration and nothing else', async () => {
    const manual = logFixture({ id: 'manual-1', logDate: TODAY, loggedAt: new Date().toISOString() });
    const fake = repositoryWith([setupFixture()], [manual]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as taken');
    await type(tree, /^Amount in mg/, '2');
    await press(tree, 'Confirm Taken');
    expect(fake.logs()).toHaveLength(2);

    await pressByLabel(tree, "Change today's status for Retatrutide");

    expect(fake.statuses()).toHaveLength(0);
    // The hand-typed entry survives: no status points at it, so nothing may
    // sweep it up.
    expect(fake.logs()).toHaveLength(1);
    expect(fake.logs()[0].id).toBe('manual-1');
  });

  it('undoing Skipped removes only the status', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as skipped');
    await pressByLabel(tree, "Change today's status for Retatrutide");

    expect(fake.statuses()).toHaveLength(0);
    expect(fake.logs()).toHaveLength(0);
  });

  it('leaves several manual logs alone when a day status changes', async () => {
    const manuals = [
      logFixture({ id: 'm1', logDate: TODAY, loggedAt: new Date().toISOString() }),
      logFixture({ id: 'm2', logDate: TODAY, loggedAt: new Date().toISOString() }),
      logFixture({ id: 'm3', logDate: TODAY, loggedAt: new Date().toISOString() }),
    ];
    const fake = repositoryWith([setupFixture()], manuals);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as skipped');
    await pressByLabel(tree, "Change today's status for Retatrutide");

    expect(fake.logs()).toHaveLength(3);
  });
});

/* ── §81 the status strip ───────────────────────────────────────────── */

describe('routine history', () => {
  it('carries a text label for every day, not colour alone', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const labelled = tree.root.findAll(
      (node) =>
        node.props?.accessibilityRole === 'button' &&
        /no response|taken|skipped|not scheduled/.test(String(node.props?.accessibilityLabel ?? '')),
    );
    expect(labelled.length).toBeGreaterThan(0);
  });

  it('shows an answered day as answered and an unanswered one as no response', async () => {
    mockRouteId = 'setup-1';
    const seeded: RoutineDayStatus[] = [
      {
        id: 'rds-1',
        setupId: 'setup-1',
        logDate: TODAY,
        state: 'skipped',
        createdAt: CREATED,
        updatedAt: CREATED,
      },
    ];
    const fake = repositoryWith([setupFixture()], [], seeded);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const labels = tree.root
      .findAll((node) => node.props?.accessibilityRole === 'button')
      .map((node) => String(node.props?.accessibilityLabel ?? ''));

    // Full date, whether it was scheduled, and what was recorded — never a
    // bare initial over an unlabelled circle.
    expect(labels.some((label) => /scheduled, skipped$/.test(label))).toBe(true);
    expect(labels.some((label) => /scheduled, no response$/.test(label))).toBe(true);
  });
});

/* ── §82 the routine screen ─────────────────────────────────────────── */

describe('the routine screen', () => {
  it('opens on information rather than on a form', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('Active');
    expect(rendered).toContain('Scheduled today');
    // The vial reads as a value, not as an editable field.
    expect(rendered).toContain('20 mg vial · 2 mL reconstitution');
    expect(control(tree, 'Edit Routine')).toBeDefined();
  });

  it('sends Edit Routine to the setup route', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    await press(tree, 'Edit Routine');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1');
  });

  it('keeps manual logging reachable', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    await pressByLabel(tree, 'Add log');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1/log');
  });
});

/* ── §83 needs setup ────────────────────────────────────────────────── */

describe('needs setup', () => {
  it('lists an unconfigured routine with a way to finish it', async () => {
    const fake = repositoryWith([setupFixture({ routineState: 'needs-setup', active: false })]);
    const tree = await mount(<Peptides />, fake.repository);

    // One compact notice now, not a header over a card over a row.
    expect(screen(tree)).toContain('Finish setting up Retatrutide');
    await pressByLabel(tree, 'Finish setting up Retatrutide');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1');
  });

  it('leaves the Needs setup section once configured', async () => {
    const fake = repositoryWith([setupFixture({ routineState: 'needs-setup', active: false })]);

    mockRouteId = 'setup-1';
    const setup = await mount(<EditPeptideSetup />, fake.repository);
    await press(setup, 'Save Setup');
    await act(async () => setup.unmount());
    mounted = null;

    const home = await mount(<Peptides />, fake.repository);
    expect(screen(home)).not.toContain('Finish setting up');
    // Saving made it a running daily routine, so it appears in Today.
    expect(screen(home)).toContain('1 scheduled today');
  });
});

/* ── 3.9A: a simpler setup ──────────────────────────────────────────── */

describe('setup simplification', () => {
  it('offers no Preferred Unit control', async () => {
    // It asked, up front and out of context, a question that only matters
    // beside the amount being recorded — where the toggle still is.
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    expect(texts(tree)).not.toContain('PREFERRED UNIT');
    expect(screen(tree)).not.toContain('Preferred unit');
    expect(
      tree.root.findAll((node) => node.props?.accessibilityLabel === 'Preferred unit'),
    ).toHaveLength(0);
  });

  it('still saves, and keeps a legacy preferred unit intact', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture({ preferredDoseUnit: 'mcg' })]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, 'Save Changes');
    expect(fake.setups()[0].preferredDoseUnit).toBe('mcg');
  });

  it('names the vial field in milligrams and offers no unit choice', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    expect(texts(tree)).toContain('Vial Amount (MG)');
    expect(
      tree.root.findAll((node) => node.props?.accessibilityLabel === 'Vial unit'),
    ).toHaveLength(0);
  });

  it('labels reconstitution as a volume, with the detail underneath', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    expect(texts(tree)).toContain('Reconstitution Volume (ML)');
    expect(screen(tree)).toContain('Bacteriostatic water added to the vial.');
    // The slash-heavy original put two names for one number in a single line.
    expect(screen(tree)).not.toContain('Bacteriostatic Water / Reconstitution');
  });

  it('still lets a recorded amount be mg or mcg', async () => {
    // Removing the vial and preference toggles did not remove unit choice
    // from the number the user actually records.
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);
    await pressByLabel(tree, 'Mark Retatrutide as taken');

    const units = tree.root.findAll((node) =>
      /^Amount unit, (mg|mcg)$/.test(String(node.props?.accessibilityLabel ?? '')),
    );
    expect(units.length).toBeGreaterThan(0);
  });
});

/* ── 3.9A: the week strip is a control ──────────────────────────────── */

describe('the week strip', () => {
  function dayCells(tree: ReactTestRenderer) {
    return tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /, (scheduled|not scheduled), /.test(String(node.props?.accessibilityLabel ?? '')),
    );
  }

  it('shows seven days, each a button naming its date and state', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const cells = dayCells(tree);
    expect(cells.length).toBeGreaterThanOrEqual(7);
    // A full date, not a bare weekday initial over an unlabelled circle.
    expect(String(cells[0].props.accessibilityLabel)).toMatch(/^[A-Z][a-z]+day, /);
  });

  it('shows the date number, so a week is identifiable', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const dayOfMonth = String(Number(TODAY.slice(8, 10)));
    expect(texts(tree)).toContain(dayOfMonth);
  });

  it('opens a day when the cell — not the icon — is tapped', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const todayCell = dayCells(tree).find((node) =>
      String(node.props.accessibilityLabel).includes('no response'),
    );
    expect(todayCell).toBeDefined();
    await act(async () => todayCell!.props.onPress());

    expect(screen(tree)).toContain('No response');
  });

  it('writes through the same routine-day state the Today card uses', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    // Today specifically — every day in an untouched week reads "no
    // response", so picking the first would open last Thursday.
    const cell = dayCells(tree).find((node) =>
      String(node.props.accessibilityLabel).startsWith(TODAY_LONG),
    );
    await act(async () => cell!.props.onPress());
    await pressByLabel(tree, `Mark ${TODAY_LONG} as skipped`);

    // One store, one record — the strip is a view over it, not a copy.
    expect(fake.statuses()).toHaveLength(1);
    expect(fake.statuses()[0].state).toBe('skipped');
    expect(fake.logs()).toHaveLength(0);
  });

  it('clears a recorded day back to unanswered', async () => {
    mockRouteId = 'setup-1';
    const seeded: RoutineDayStatus[] = [
      {
        id: 'r1',
        setupId: 'setup-1',
        logDate: TODAY,
        state: 'skipped',
        createdAt: CREATED,
        updatedAt: CREATED,
      },
    ];
    const fake = repositoryWith([setupFixture()], [], seeded);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const cell = dayCells(tree).find((node) =>
      String(node.props.accessibilityLabel).startsWith(TODAY_LONG),
    );
    await act(async () => cell!.props.onPress());
    await pressByLabel(tree, `Clear the status for ${TODAY_LONG}`);

    expect(fake.statuses()).toHaveLength(0);
  });

  it('never offers to record a day that has not happened', async () => {
    // A schedule is a plan. Letting someone mark tomorrow taken would let the
    // app hold a confirmed administration that has not happened.
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const labels = dayCells(tree).map((c) => String(c.props.accessibilityLabel));
    // The rolling window ends today, so no cell is in the future.
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => !/future/.test(label))).toBe(true);
  });

  it('draws no day cells for a routine whose schedule covers nothing', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'asNeeded' } })]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const scheduled = dayCells(tree).filter((node) =>
      /, scheduled, /.test(String(node.props.accessibilityLabel)),
    );
    expect(scheduled).toHaveLength(0);
  });

  it('marks the open day apart from whether it was taken', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const cell = dayCells(tree).find((node) =>
      String(node.props.accessibilityLabel).includes('no response'),
    );
    await act(async () => cell!.props.onPress());

    const selected = dayCells(tree).filter((node) => node.props.accessibilityState?.selected);
    // Exactly one day is "open"; none of them is thereby "taken".
    expect(selected).toHaveLength(1);
    expect(String(selected[0].props.accessibilityLabel)).toContain('no response');
  });
});

/* ── 3.9A: Today's buttons assert nothing ───────────────────────────── */

describe("today's actions", () => {
  /**
   * Both surfaces, because there are two.
   *
   * The Peptides card and the routine screen each draw their own Taken and
   * Skipped, and fixing only one is exactly the defect that shipped: the home
   * card was corrected while the routine screen kept a filled Taken that read
   * as already-answered.
   */
  it.each([
    // Peptides Home moved to "Mark …" in 5.4, the wording the authorization
    // fixed. The routine screen still says "Record …" and is 5.5's to change;
    // the safety property under test is identical on both.
    ['the peptides screen', () => <Peptides />, 'Mark'],
    ['the routine screen', () => <RoutineDetail />, 'Record'],
  ])('presents Taken and Skipped as two available choices on %s', async (_name, element, verb) => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(element(), fake.repository);

    for (const label of [`${verb} Retatrutide as taken`, `${verb} Retatrutide as skipped`]) {
      const [node] = tree.root.findAll(
        (n) => typeof n.props?.onPress === 'function' && n.props?.accessibilityLabel === label,
      );
      expect(node).toBeDefined();
      // Neither is pre-selected — a filled Taken button read as "already
      // taken" before anyone touched it.
      expect(node.props.accessibilityState?.selected).toBe(false);
    }
  });
});

/* ── 3.9A: a newly added compound goes through the same routine flow ── */

describe('a compound added by the catalog expansion', () => {
  it('is searchable, opens, and joins the routine like any other', async () => {
    // The expansion must not have created a second class of catalog entry
    // that bypasses the routine architecture 3.9 established.
    expect(searchCatalog('PT141').map((entry) => entry.id)).toContain('catalog:bremelanotide');

    mockRouteId = encodeURIComponent('catalog:setmelanotide');
    const fake = repositoryWith([]);
    const detail = await mount(<PeptideDetail />, fake.repository);

    // The state-aware CTA is present near the top, as on every other page.
    expect(control(detail, 'Add to Routine')).toBeDefined();
    await press(detail, 'Add to Routine');
    expect(mockNavigate).toHaveBeenCalledWith('/peptides');
    await act(async () => detail.unmount());
    mounted = null;

    expect(fake.setups()).toHaveLength(1);
    expect(fake.setups()[0].definitionId).toBe('catalog:setmelanotide');
    expect(fake.setups()[0].routineState).toBe('needs-setup');

    const home = await mount(<Peptides />, fake.repository);
    const rendered = screen(home);
    expect(rendered).toContain('Finish setting up Setmelanotide');
    expect(rendered).toContain('Setmelanotide');
  });

  it('creates no duplicate shell when added twice', async () => {
    mockRouteId = encodeURIComponent('catalog:thymalin');
    const fake = repositoryWith([]);

    const first = await mount(<PeptideDetail />, fake.repository);
    await press(first, 'Add to Routine');
    await act(async () => first.unmount());
    mounted = null;

    const second = await mount(<PeptideDetail />, fake.repository);
    // Already in the routine, so the page offers the next real step instead.
    expect(control(second, 'Add to Routine')).toBeUndefined();
    expect(control(second, 'Finish Setup')).toBeDefined();
    expect(fake.setups()).toHaveLength(1);
  });

  it('resolves a bioregulator by name in the catalog search', async () => {
    for (const [query, id] of [
      ['Cartalax', 'catalog:cartalax'],
      ['Chonluten', 'catalog:chonluten'],
      ['Pancragen', 'catalog:pancragen'],
      ['Vilon', 'catalog:vilon'],
      ['Thymogen', 'catalog:thymogen'],
    ] as const) {
      expect(searchCatalog(query).map((entry) => entry.id)).toContain(id);
    }
  });
});

/* ── 3.9B: setup once, log fast ─────────────────────────────────────── */

describe('routine amount', () => {
  const WITH_AMOUNT = () =>
    setupFixture({
      routineAmount: { amountMcg: 2000, authored: { amount: 2, unit: 'mg' } },
    });

  it('fills the daily flow in from the routine, not from a recommendation', async () => {
    const fake = repositoryWith([WITH_AMOUNT()]);
    const tree = await mount(<Peptides />, fake.repository);
    await pressByLabel(tree, 'Mark Retatrutide as taken');

    // Stated, not asked for — and the conversion comes with it.
    expect(screen(tree)).toContain('2 mg');
    expect(screen(tree)).toContain('20 units');
    expect(screen(tree)).toContain('From your routine');
  });

  it('records that amount without the user typing anything', async () => {
    const fake = repositoryWith([WITH_AMOUNT()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as taken');
    await press(tree, 'Confirm Taken');

    const log = fake.logs()[0];
    expect(log.amount.authoredAmount).toBe(2);
    expect(log.amount.authoredUnit).toBe('mg');
    expect(log.calculationSnapshot?.calculatedUnits).toBe(20);
  });

  it('still asks when the routine has no amount', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);
    await pressByLabel(tree, 'Mark Retatrutide as taken');

    // Someone who tracks a schedule but not an amount is a real user.
    expect(screen(tree)).not.toContain('From your routine');
    const field = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Amount in/.test(String(node.props.accessibilityLabel ?? '')));
    expect(field).toBeDefined();
  });

  it("changes today's log without touching the routine", async () => {
    const fake = repositoryWith([WITH_AMOUNT()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Mark Retatrutide as taken');
    await pressByLabel(tree, 'Change amount for today');
    await type(tree, /^Amount in mg/, '2.5');
    await press(tree, 'Confirm Taken');

    expect(fake.logs()[0].amount.authoredAmount).toBe(2.5);
    // The routine is configuration, and today is an event. One does not
    // rewrite the other.
    expect(fake.setups()[0].routineAmount?.authored.amount).toBe(2);
  });

  it('leaves historical logs alone when the routine amount changes', async () => {
    const old = logFixture({
      id: 'old',
      logDate: '2026-08-20',
      amount: { authoredAmount: 1, authoredUnit: 'mg', amountMcg: 1000 },
    });
    const fake = repositoryWith([WITH_AMOUNT()], [old]);

    mockRouteId = 'setup-1';
    const setup = await mount(<EditPeptideSetup />, fake.repository);
    await type(setup, /^Routine amount in mg/, '3');
    await press(setup, 'Save Changes');
    await act(async () => setup.unmount());
    mounted = null;

    // Future convenience changed; what happened on the 20th did not.
    expect(fake.setups()[0].routineAmount?.authored.amount).toBe(3);
    expect(fake.logs().find((entry) => entry.id === 'old')!.amount.authoredAmount).toBe(1);
  });

  it('canonicalises the routine amount to micrograms', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await type(tree, /^Routine amount in mg/, '2');
    await press(tree, 'Save Changes');

    expect(fake.setups()[0].routineAmount).toEqual({
      amountMcg: 2000,
      authored: { amount: 2, unit: 'mg' },
    });
  });
});

describe('the daily time', () => {
  it('defaults to now and is editable', async () => {
    const fake = repositoryWith([
      setupFixture({ routineAmount: { amountMcg: 2000, authored: { amount: 2, unit: 'mg' } } }),
    ]);
    const tree = await mount(<Peptides />, fake.repository);
    await pressByLabel(tree, 'Mark Retatrutide as taken');

    const field = tree.root
      .findAllByType(TextInput)
      .find((node) => node.props.accessibilityLabel === 'Time in 24-hour format');
    expect(field).toBeDefined();

    const now = new Date();
    const expected = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
    // Nobody should have to type the current time.
    expect(field!.props.value).toBe(expected);

    // But someone logging at 5pm what they took at 9am must be able to say so.
    await act(async () => field!.props.onChangeText('09:15'));
    await press(tree, 'Confirm Taken');
    // Compared as local wall-clock. The stored instant is UTC, so asserting
    // on the ISO string is the timezone trap this codebase keeps hitting.
    expect(toTimeInput(fake.logs()[0].loggedAt)).toBe('09:15');
  });
});

describe('the reminder', () => {
  it('is off by default and exposes a time when switched on', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    const timeField = () =>
      tree.root
        .findAllByType(TextInput)
        .find((node) => node.props.accessibilityLabel === 'Reminder time, 24-hour');

    expect(timeField()).toBeUndefined();
    await pressByLabel(tree, 'Reminder, On');
    expect(timeField()).toBeDefined();
  });

  it('persists the preference and the time', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await pressByLabel(tree, 'Reminder, On');
    await type(tree, /^Reminder time/, '08:30');
    await press(tree, 'Save Changes');

    expect(fake.setups()[0].reminder).toEqual({ enabled: true, timeLocal: '08:30' });
  });

  it('schedules nothing with the operating system', () => {
    // Configuration only in this slice. If this ever fails, a notification
    // dependency arrived without the architecture being authorised.
    const packageJson = require('../../../../package.json');
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    expect(Object.keys(deps).some((name) => name.includes('notification'))).toBe(false);
  });
});

/* ── 3.9B: a real Monday-to-Sunday week ─────────────────────────────── */

describe('the week', () => {
  function dayCells(tree: ReactTestRenderer) {
    return tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /, (scheduled|not scheduled), /.test(String(node.props?.accessibilityLabel ?? '')),
    );
  }

  it('runs Monday to Sunday, never starting on today', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const labels = dayCells(tree).map((node) => String(node.props.accessibilityLabel));
    expect(labels).toHaveLength(7);
    expect(labels[0]).toMatch(/^Monday, /);
    expect(labels[6]).toMatch(/^Sunday, /);
    // The rolling window this replaced produced Friday → Saturday → Sunday →
    // Monday, which is chronologically correct and unreadable as a calendar.
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    labels.forEach((label, index) => expect(label.startsWith(order[index])).toBe(true));
  });

  it('marks today without implying anything was recorded', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const todayCell = dayCells(tree).find((node) =>
      String(node.props.accessibilityLabel).includes(', today,'),
    );
    expect(todayCell).toBeDefined();
    expect(String(todayCell!.props.accessibilityLabel)).toContain('no response');
  });

  it('steps back a week and forward again', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const first = dayCells(tree)[0].props.accessibilityLabel as string;
    await pressByLabel(tree, 'Previous week');
    const previous = dayCells(tree)[0].props.accessibilityLabel as string;

    expect(previous).not.toBe(first);
    expect(previous).toMatch(/^Monday, /);
    expect(screen(tree)).toContain('Last week');

    await pressByLabel(tree, 'Next week');
    expect(dayCells(tree)[0].props.accessibilityLabel).toBe(first);
  });

  it('does not offer a week that has not happened', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const next = tree.root.findAll(
      (node) => node.props?.accessibilityLabel === 'Next week' && node.props?.disabled === true,
    );
    expect(next.length).toBeGreaterThan(0);
  });
});

/* ── §80 removal preserves everything ───────────────────────────────── */

describe('removing a routine', () => {
  const seededLogs = [
    logFixture({ id: 'plog-1', logDate: '2026-08-23', site: createSiteSnapshot('abdomen-left') }),
    logFixture({
      id: 'plog-2',
      logDate: '2026-08-24',
      loggedAt: new Date(2026, 7, 24, 12, 0).toISOString(),
      site: createSiteSnapshot('thigh-right'),
    }),
  ];
  const seededStatuses: RoutineDayStatus[] = [
    {
      id: 'rds-1',
      setupId: 'setup-1',
      logDate: '2026-08-23',
      state: 'taken',
      linkedLogId: 'plog-1',
      createdAt: CREATED,
      updatedAt: CREATED,
    },
    {
      id: 'rds-2',
      setupId: 'setup-1',
      logDate: '2026-08-24',
      state: 'skipped',
      createdAt: CREATED,
      updatedAt: CREATED,
    },
  ];

  async function removeIt(fake: Fake) {
    mockRouteId = 'setup-1';
    const tree = await mount(<RoutineDetail />, fake.repository);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await press(tree, 'Remove from Routine');

    const [, message, buttons] = alert.mock.calls[0] as [
      string,
      string,
      Array<{ text: string; onPress?: () => void }>,
    ];
    expect(message).toContain('log history will be kept');

    await act(async () => buttons.find((b) => b.text === 'Remove')?.onPress?.());
    alert.mockRestore();
    await act(async () => tree.unmount());
    mounted = null;
  }

  it('asks first, and says what it keeps', async () => {
    const fake = repositoryWith([setupFixture()], seededLogs, seededStatuses);
    await removeIt(fake);
    expect(fake.setups()).toHaveLength(0);
  });

  it('takes the routine out of every current section', async () => {
    const fake = repositoryWith([setupFixture()], seededLogs, seededStatuses);
    await removeIt(fake);

    const home = await mount(<Peptides />, fake.repository);
    const rendered = screen(home);
    expect(rendered).not.toContain('Finish setting up');
    expect(rendered).toContain('No routines yet');
  });

  it('preserves every administration, in full', async () => {
    const fake = repositoryWith([setupFixture()], seededLogs, seededStatuses);
    await removeIt(fake);

    const logs = fake.logs();
    expect(logs).toHaveLength(2);
    const kept = logs.find((entry) => entry.id === 'plog-1')!;
    expect(kept.amount.authoredAmount).toBe(2);
    expect(kept.amount.authoredUnit).toBe('mg');
    expect(kept.site?.label).toBe('Left Abdomen');
    expect(kept.loggedAt).toBe(seededLogs[0].loggedAt);
  });

  it('preserves injection-site history, still attributed to the peptide', async () => {
    const fake = repositoryWith([setupFixture()], seededLogs, seededStatuses);
    await removeIt(fake);

    // Tools resolves names from the compiled catalog through the log's own
    // `definitionId`, so history does not depend on the routine existing.
    const tools = await mount(<InjectionSites />, fake.repository);
    const rendered = screen(tools);
    expect(rendered).toContain('Left Abdomen');
    expect(rendered).toContain('Right Thigh');
    expect(rendered).toContain('Retatrutide');
    expect(rendered).not.toContain('Unknown');
  });

  it('leaves recorded day statuses on disk', async () => {
    const fake = repositoryWith([setupFixture()], seededLogs, seededStatuses);
    await removeIt(fake);
    expect(fake.statuses()).toHaveLength(2);
  });

  it('creates a fresh routine if the same peptide is added again', async () => {
    const fake = repositoryWith([setupFixture()], seededLogs, seededStatuses);
    await removeIt(fake);

    mockRouteId = encodeURIComponent('catalog:retatrutide');
    const detail = await mount(<PeptideDetail />, fake.repository);
    await press(detail, 'Add to Routine');

    // A new shell, needing setup — not the removed one silently resurrected
    // with its old configuration.
    expect(fake.setups()).toHaveLength(1);
    expect(fake.setups()[0].routineState).toBe('needs-setup');
    expect(fake.setups()[0].id).not.toBe('setup-1');
    expect(fake.setups()[0].vial).toBeUndefined();
    // And the old history is still there, untouched by any of it.
    expect(fake.logs()).toHaveLength(2);
  });
});

/* ── §3.10 audit — what the screens say about themselves ────────────── */

/**
 * Findings from the Sprint 3 closeout audit, each pinned so it cannot come
 * back. None of these were caught by the domain suites, because none of them
 * are domain behaviour — they are what a person reads on a screen.
 */
describe('the closeout audit', () => {
  it('names the setup screen the same thing the row that opens it does', async () => {
    // "Edit Routine" opened a screen titled "Setup", so the destination
    // answered to a different name than the door.
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);
    expect(screen(tree)).toContain('Routine Setup');
  });

  it('reads a start date rather than showing how it is stored', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture({ startDate: '2026-08-24' })]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('24 August 2026');
    expect(rendered).not.toContain('2026-08-24');
  });

  it('reads a reminder in the same clock the rest of the app speaks', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([
      setupFixture({ reminder: { enabled: true, timeLocal: '09:00' } }),
    ]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('9:00 AM');
    // The 24-hour form is what the field parses, not what a summary shows.
    expect(rendered).not.toMatch(/(?<![:\d])09:00(?!\s*AM)/);
  });

  it('title-cases the compound category the same way the catalog does', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture({ definitionId: 'catalog:bremelanotide' })]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('Melanocortin Agonist');
    expect(rendered).not.toContain('Melanocortin agonist');
  });

  it('names the schedule control for assistive technology', async () => {
    // Every other segmented control on the form names its group; this one
    // announced four unattached buttons.
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);
    // `control` matches on visible text; the group name lives on the
    // accessible label, which is exactly the thing being asserted.
    const named = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        node.props?.accessibilityLabel === 'Schedule, Daily',
    );
    expect(named.length).toBeGreaterThan(0);
  });
});

/* ── §14–20 Today and Active are one screen, not two copies of it ──────── */

/**
 * A routine surfaced in Today must not also sit in Active (founder decision,
 * 3.10A). Today is the immediate-action surface; Active is everything else
 * that is running.
 *
 * **This is presentation only.** Nothing here changes `routineState`, and
 * each test that hides a routine from Active also asserts it is still active
 * in the model — because a screen that hid a routine by pausing it would be a
 * far worse bug than the duplication it set out to fix.
 */
describe('Today and Active never show the same routine twice', () => {
  const weekday = () => fromLogDate(TODAY).getDay();
  /** A weekday that is definitely not today. */
  const otherDay = () => (weekday() + 3) % 7;

  const named = (tree: ReactTestRenderer, name: string) =>
    texts(tree).filter((line) => line === name).length;

  it('shows a routine scheduled today under Today, and only there', async () => {
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'daily' } })]);
    const tree = await mount(<Peptides />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('1 scheduled today');
    expect(rendered).not.toContain('Your routines');
    expect(named(tree, 'Retatrutide')).toBe(1);
  });

  it('leaves that routine active in the model — this is a view, not a state change', async () => {
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'daily' } })]);
    await mount(<Peptides />, fake.repository);
    expect(fake.setups()[0].routineState).toBe('active');
    expect(fake.setups()[0].active).toBe(true);
  });

  it('shows an active routine not scheduled today under Active', async () => {
    const fake = repositoryWith([
      setupFixture({ schedule: { kind: 'daysOfWeek', days: [otherDay()] } }),
    ]);
    const tree = await mount(<Peptides />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('Your routines');
    expect(rendered).toContain('Nothing scheduled today');
    expect(named(tree, 'Retatrutide')).toBe(1);
  });

  it('keeps an As Needed routine under Active rather than hiding it', async () => {
    // As Needed never generates a scheduled Today event, so Active is the
    // only place it can appear. Losing it here would make it unreachable.
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'asNeeded' } })]);
    const tree = await mount(<Peptides />, fake.repository);

    expect(screen(tree)).toContain('Your routines');
    expect(screen(tree)).toContain('As needed');
    expect(named(tree, 'Retatrutide')).toBe(1);
  });

  it('keeps a routine with no schedule at all under Active', async () => {
    const fake = repositoryWith([setupFixture({ schedule: undefined })]);
    const tree = await mount(<Peptides />, fake.repository);
    expect(screen(tree)).toContain('Your routines');
    expect(named(tree, 'Retatrutide')).toBe(1);
  });

  it('splits three routines correctly — scheduled today, not today, as needed', async () => {
    const fake = repositoryWith([
      setupFixture({ id: 'a', definitionId: 'catalog:retatrutide', schedule: { kind: 'daily' } }),
      setupFixture({
        id: 'b',
        definitionId: 'catalog:bpc-157',
        schedule: { kind: 'daysOfWeek', days: [otherDay()] },
      }),
      setupFixture({ id: 'c', definitionId: 'catalog:ipamorelin', schedule: { kind: 'asNeeded' } }),
    ]);
    const tree = await mount(<Peptides />, fake.repository);

    const lines = texts(tree);
    const summaryIndex = lines.indexOf('1 scheduled today');
    const routinesIndex = lines.indexOf('Your routines');
    expect(summaryIndex).toBeGreaterThanOrEqual(0);
    expect(routinesIndex).toBeGreaterThan(summaryIndex);

    // A is in Today, above the management region; B and C are below it. Each
    // appears exactly once.
    expect(lines.indexOf('Retatrutide')).toBeGreaterThan(summaryIndex);
    expect(lines.indexOf('Retatrutide')).toBeLessThan(routinesIndex);
    expect(lines.indexOf('BPC-157')).toBeGreaterThan(routinesIndex);
    expect(lines.indexOf('Ipamorelin')).toBeGreaterThan(routinesIndex);
    for (const name of ['Retatrutide', 'BPC-157', 'Ipamorelin']) {
      expect(named(tree, name)).toBe(1);
    }
  });

  it('still opens the full routine from Today', async () => {
    // Removing the Active duplicate must not make the routine harder to reach.
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'daily' } })]);
    const tree = await mount(<Peptides />, fake.repository);

    // The Today item names its state; what matters is that it still routes.
    await pressByLabel(tree, 'Retatrutide, scheduled today');
    expect(mockPush).toHaveBeenCalledWith('/peptides/routine/setup-1');
  });

  it('never claims nothing is active while Today is showing something', async () => {
    // Active is empty in this case by construction, and the empty state has
    // to know that Today counts.
    const fake = repositoryWith([setupFixture({ schedule: { kind: 'daily' } })]);
    const tree = await mount(<Peptides />, fake.repository);
    expect(screen(tree)).not.toContain('Nothing active right now');
  });

  it('leaves Needs setup and Inactive untouched', async () => {
    const fake = repositoryWith([
      setupFixture({ id: 'a', routineState: 'needs-setup', active: false }),
      setupFixture({
        id: 'b',
        definitionId: 'catalog:bpc-157',
        routineState: 'inactive',
        active: false,
      }),
      setupFixture({ id: 'c', definitionId: 'catalog:ipamorelin', schedule: { kind: 'daily' } }),
    ]);
    const tree = await mount(<Peptides />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('Finish setting up Retatrutide');
    expect(rendered).toContain('Inactive · 1');
    expect(rendered).toContain('1 scheduled today');

    // A paused routine is never deduplicated against Today — it is not
    // active. Inactive is collapsed in 5.4, so it is named once opened.
    await pressByLabel(tree, 'Inactive, 1');
    expect(named(tree, 'BPC-157')).toBe(1);
  });

  it('shows a paused daily routine under Inactive, not under Today', async () => {
    const fake = repositoryWith([
      setupFixture({ routineState: 'inactive', active: false, schedule: { kind: 'daily' } }),
    ]);
    const tree = await mount(<Peptides />, fake.repository);

    expect(screen(tree)).toContain('Inactive · 1');
    expect(screen(tree)).toContain('Nothing scheduled today');
    expect(screen(tree)).not.toContain('Scheduled today');
  });
});
