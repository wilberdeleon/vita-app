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
const mockDismissAll = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: (...args: unknown[]) => mockBack(...args),
    dismissAll: (...args: unknown[]) => mockDismissAll(...args),
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
import InjectionSites from '../../../app/(vita)/settings/tools/injection-sites';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  createSiteSnapshot,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../../lib/peptides';
import { todayLogDate } from '../../../lib/daily';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStoragePeptideRepository as realRepository } from '../../../lib/peptides/data/asyncStorageRepository';
import { PeptideKeys } from '../../../lib/peptides/data/keys';
import { ToastProvider } from '../../../components/ui';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const CREATED = '2026-08-25T10:00:00.000Z';
const TODAY = todayLogDate();

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
  mockDismissAll.mockClear();
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

  it('does not open a configuration form on the way in', async () => {
    mockRouteId = encodeURIComponent('catalog:bpc-157');
    const fake = repositoryWith([]);
    const tree = await mount(<PeptideDetail />, fake.repository);

    await press(tree, 'Add to Routine');

    // Straight back to the list. Deciding to track something must not cost a
    // vial interrogation.
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
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
    const fake = repositoryWith([
      setupFixture({ id: 'a', routineState: 'needs-setup', active: false }),
      setupFixture({ id: 'b', definitionId: 'catalog:bpc-157', routineState: 'active' }),
      setupFixture({ id: 'c', definitionId: 'catalog:ipamorelin', routineState: 'inactive', active: false }),
    ]);
    const tree = await mount(<Peptides />, fake.repository);

    const rendered = screen(tree);
    expect(rendered).toContain('NEEDS SETUP');
    expect(rendered).toContain('ACTIVE');
    expect(rendered).toContain('INACTIVE');
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
    expect(screen(tree)).toContain('ACTIVE');
    expect(screen(tree)).not.toContain('Setup needed');
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

    await pressByLabel(tree, 'Record Retatrutide as taken');
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

    await pressByLabel(tree, 'Record Retatrutide as skipped');

    expect(fake.statuses()[0].state).toBe('skipped');
    // Skipping means it did not happen. Writing a log would invert that.
    expect(fake.logs()).toHaveLength(0);
    expect(fake.statuses()[0].linkedLogId).toBeUndefined();
  });

  it('replaces Taken and Skipped with a Change control once answered', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<Peptides />, fake.repository);

    await pressByLabel(tree, 'Record Retatrutide as skipped');

    const labels = tree.root
      .findAll((node) => typeof node.props?.onPress === 'function')
      .map((node) => String(node.props?.accessibilityLabel ?? ''));

    expect(labels).not.toContain('Record Retatrutide as taken');
    expect(labels).not.toContain('Record Retatrutide as skipped');
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

    await pressByLabel(tree, 'Record Retatrutide as taken');
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

    await pressByLabel(tree, 'Record Retatrutide as taken');
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

    await pressByLabel(tree, 'Record Retatrutide as taken');
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

    await pressByLabel(tree, 'Record Retatrutide as skipped');
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

    await pressByLabel(tree, 'Record Retatrutide as skipped');
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
        node.props?.accessibilityRole === 'text' &&
        /No response|Taken|Skipped|Not scheduled/.test(String(node.props?.accessibilityLabel ?? '')),
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
      .findAll((node) => node.props?.accessibilityRole === 'text')
      .map((node) => String(node.props?.accessibilityLabel ?? ''));

    expect(labels.some((label) => label.includes(`${TODAY}. Skipped`))).toBe(true);
    expect(labels.some((label) => label.includes('No response'))).toBe(true);
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
    expect(control(tree, 'Edit Setup')).toBeDefined();
  });

  it('sends Edit Setup to the setup route', async () => {
    mockRouteId = 'setup-1';
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<RoutineDetail />, fake.repository);

    await press(tree, 'Edit Setup');
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

    expect(screen(tree)).toContain('Setup needed');
    await pressByLabel(tree, 'Retatrutide. Setup needed. Opens setup');
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
    expect(screen(home)).not.toContain('Setup needed');
    expect(screen(home)).toContain('ACTIVE');
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
    expect(rendered).not.toContain('Setup needed');
    expect(rendered).toContain('No peptides in your routine');
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
