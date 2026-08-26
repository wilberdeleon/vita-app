/**
 * Logging an administration, end to end through the screens.
 *
 * Driven the way a user drives it — an empty form, text typed into fields
 * found by accessibility label, buttons pressed by their rendered text. The
 * lesson from slice 3.6 is written into the shape of this file: nothing here
 * hands a component a value the UI would have had to produce.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// `mock`-prefixed so Babel allows the hoisted factories to close over these.
const mockPush = jest.fn();
const mockBack = jest.fn();
let mockRouteId = '';
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: () => mockBack() },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import LogPeptide from '../../../app/(vita)/peptides/setup/[id]/log';
import PeptideHistory from '../../../app/(vita)/peptides/setup/[id]/history';
import PeptideLogDetail from '../../../app/(vita)/peptides/log/[id]';
import EditPeptideSetup from '../../../app/(vita)/peptides/setup/[id]';
import InjectionSites from '../../../app/(vita)/settings/tools/injection-sites';
import NewPeptideSetup from '../../../app/(vita)/peptides/setup/new';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  createSiteSnapshot,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
} from '../../../lib/peptides';
import { ToastProvider } from '../../../components/ui';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const CREATED = '2026-08-25T10:00:00.000Z';

/** A 20 mg vial in 2 mL — 10 mg/mL, so 2 mg is 20 units. */
function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    active: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  };
}

/** In-memory repository — the injectable seam every provider test uses. */
function repositoryWith(setups: PeptideSetup[], seedLogs: PeptideLogEntry[] = []) {
  const days = new Map<string, PeptideLogEntry[]>();
  for (const entry of seedLogs) {
    days.set(entry.logDate, [...(days.get(entry.logDate) ?? []), entry]);
  }

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
  };

  return { repository, days };
}

/** Captures the buttons a confirmation offers, without showing one. */
let alertButtons: Array<{ text?: string; onPress?: () => void }> = [];
beforeEach(() => {
  alertButtons = [];
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    alertButtons = (buttons ?? []) as typeof alertButtons;
  });
});
afterEach(() => jest.restoreAllMocks());

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
  if (tree) await act(async () => tree.unmount());
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).map((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children
      .filter((child): child is string | number => typeof child === 'string' || typeof child === 'number')
      .join('');
  });
}

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');

async function type(tree: ReactTestRenderer, label: RegExp, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => label.test(String(node.props.accessibilityLabel ?? '')));
  if (!field) throw new Error(`no field matching ${label}`);
  await act(async () => field.props.onChangeText(value));
}

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

/** Presses a control identified by its accessibility label. */
async function pressByLabel(tree: ReactTestRenderer, label: string) {
  const [target] = tree.root.findAll(
    (node) =>
      typeof node.props?.onPress === 'function' && node.props?.accessibilityLabel === label,
  );
  if (!target) throw new Error(`no control labelled "${label}"`);
  await act(async () => target.props.onPress());
}

async function press(tree: ReactTestRenderer, label: string) {
  const target = control(tree, label);
  if (!target) throw new Error(`no "${label}" control on screen`);
  await act(async () => target.props.onPress());
}

/** Local noon on a given day, so the derived calendar date is unambiguous. */
const noonOn = (day: number) => new Date(2026, 7, day, 12, 0).toISOString();

describe('logging an administration', () => {
  it('shows the calculated units as soon as an amount is typed', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');

    expect(screen(tree)).toContain('20 units');
    expect(screen(tree)).toContain('Equivalent volume · 0.2 mL');
  });

  it('saves the entry, snapshot and all', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');
    await press(tree, 'Save log');

    const stored = [...days.values()].flat();
    expect(stored).toHaveLength(1);
    expect(stored[0].amount.amountMcg).toBe(2000);
    expect(stored[0].calculationSnapshot?.calculatedUnits).toBe(20);
    expect(mockBack).toHaveBeenCalled();
  });

  it('starts with a blank amount and suggests nothing', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    const amount = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Amount,/.test(String(node.props.accessibilityLabel ?? '')));
    expect(amount?.props.value).toBe('');

    const rendered = screen(tree).toLowerCase();
    for (const word of ['recommended', 'suggested', 'typical', 'starting dose', 'due', 'missed', 'overdue']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('cannot be saved until an amount is entered', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await press(tree, 'Save log');
    expect([...days.values()].flat()).toHaveLength(0);
  });

  it('defaults the amount unit to the setup’s preference', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture({ preferredDoseUnit: 'mcg' })]);
    const tree = await mount(<LogPeptide />, repository);

    const amount = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Amount,/.test(String(node.props.accessibilityLabel ?? '')));
    expect(amount?.props.accessibilityLabel).toBe('Amount, in mcg');
  });

  it('converts an mcg amount against the same vial', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([
      setupFixture({
        vial: { amountMcg: toMcg(5, 'mg'), authored: { amount: 5, unit: 'mg' } },
        preferredDoseUnit: 'mcg',
      }),
    ]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '500');
    expect(screen(tree)).toContain('20 units');
  });

  it('logs without a conversion when the setup has no vial', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture({ vial: undefined })]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');
    // No units shown, and logging is not blocked.
    expect(screen(tree)).not.toContain('CALCULATED SYRINGE UNITS');

    await press(tree, 'Save log');
    const stored = [...days.values()].flat();
    expect(stored).toHaveLength(1);
    expect(stored[0].calculationSnapshot).toBeUndefined();
  });

  it('records several administrations on one day', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);

    for (const amount of ['2', '1']) {
      const tree = await mount(<LogPeptide />, repository);
      await type(tree, /^Amount,/, amount);
      await press(tree, 'Save log');
      await act(async () => tree.unmount());
      mounted = null;
    }

    expect([...days.values()].flat()).toHaveLength(2);
  });

  it('rejects a malformed time rather than filing it at midnight', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');
    await type(tree, /^Time,/, '99:99');
    expect(screen(tree)).toContain('Enter a valid date and a time like 20:30.');

    await press(tree, 'Save log');
    expect([...days.values()].flat()).toHaveLength(0);
  });
});

describe('the setup screen', () => {
  it('offers Log Peptide and navigates to it', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, repository);

    await press(tree, 'Log Peptide');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1/log');
  });

  it('shows recent logs once there are some', async () => {
    mockRouteId = 'setup-1';
    const setup = setupFixture();
    const seeded: PeptideLogEntry[] = [
      {
        id: 'plog-1',
        setupId: 'setup-1',
        definitionId: 'catalog:retatrutide',
        logDate: '2026-08-25',
        loggedAt: noonOn(25),
        amount: { authoredAmount: 2, authoredUnit: 'mg', amountMcg: 2000 },
        calculationSnapshot: {
          vialAmountMcg: 20_000,
          reconstitutionMl: 2,
          unitsPerMl: 100,
          calculatedUnits: 20,
          calculatedVolumeMl: 0.2,
        },
        createdAt: CREATED,
        updatedAt: CREATED,
      },
    ];
    const { repository } = repositoryWith([setup], seeded);
    const tree = await mount(<EditPeptideSetup />, repository);

    expect(texts(tree)).toContain('RECENT LOGS');
    expect(screen(tree)).toContain('2 mg');
    expect(screen(tree)).toContain('20 units');
  });

  it('shows no recent-logs section before anything is logged', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, repository);
    expect(texts(tree)).not.toContain('RECENT LOGS');
  });
});

describe('history', () => {
  function seededLogs(): PeptideLogEntry[] {
    return [21, 25].map((day, index) => ({
      id: `plog-${index}`,
      setupId: 'setup-1',
      definitionId: 'catalog:retatrutide',
      logDate: `2026-08-${day}`,
      loggedAt: noonOn(day),
      amount: { authoredAmount: 500, authoredUnit: 'mcg' as const, amountMcg: 500 },
      calculationSnapshot: {
        vialAmountMcg: 20_000,
        reconstitutionMl: 2,
        unitsPerMl: 100,
        calculatedUnits: 5,
        calculatedVolumeMl: 0.05,
      },
      createdAt: CREATED,
      updatedAt: CREATED,
    }));
  }

  it('lists entries newest first, grouped by day', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()], seededLogs());
    const tree = await mount(<PeptideHistory />, repository);

    const rendered = texts(tree).map((line) => line.toUpperCase());
    const newest = rendered.findIndex((line) => line.includes('AUGUST 25'));
    const older = rendered.findIndex((line) => line.includes('AUGUST 21'));
    expect(newest).toBeGreaterThanOrEqual(0);
    expect(newest).toBeLessThan(older);
  });

  it('shows the amount in the unit it was authored in', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()], seededLogs());
    const tree = await mount(<PeptideHistory />, repository);

    // Logged as 500 mcg; never rewritten to 0.5 mg.
    expect(screen(tree)).toContain('500 mcg');
    expect(screen(tree)).not.toContain('0.5 mg');
  });

  it('omits the unit line entirely when no conversion was saved', async () => {
    mockRouteId = 'setup-1';
    const [entry] = seededLogs();
    const { repository } = repositoryWith(
      [setupFixture()],
      [{ ...entry, calculationSnapshot: undefined }],
    );
    const tree = await mount(<PeptideHistory />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('500 mcg');
    // No "— units" or "0 units" placeholder implying something went missing.
    expect(rendered).not.toContain('units');
  });

  it('says so plainly when nothing has been logged', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<PeptideHistory />, repository);
    expect(screen(tree)).toContain('Nothing logged yet');
  });

  it('opens an entry when its row is tapped', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()], seededLogs());
    const tree = await mount(<PeptideHistory />, repository);

    // `PressableScale` wraps a `Pressable`, so both carry the handler — the
    // outermost is the one a tap would reach.
    const [row] = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        String(node.props?.accessibilityLabel ?? '').startsWith('500 mcg'),
    );
    await act(async () => row.props.onPress());
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/peptides/log/'));
  });
});

describe('editing and deleting an entry', () => {
  const ENTRY: PeptideLogEntry = {
    id: 'plog-1',
    setupId: 'setup-1',
    definitionId: 'catalog:retatrutide',
    logDate: '2026-08-25',
    loggedAt: noonOn(25),
    amount: { authoredAmount: 2, authoredUnit: 'mg', amountMcg: 2000 },
    calculationSnapshot: {
      vialAmountMcg: 20_000,
      reconstitutionMl: 2,
      unitsPerMl: 100,
      calculatedUnits: 20,
      calculatedVolumeMl: 0.2,
    },
    createdAt: CREATED,
    updatedAt: CREATED,
  };

  it('prefills the entry and shows the conversion it was saved with', async () => {
    mockRouteId = 'plog-1';
    const { repository } = repositoryWith([setupFixture()], [ENTRY]);
    const tree = await mount(<PeptideLogDetail />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('20 units');
    expect(texts(tree)).toContain('CONVERSION USED');
    expect(rendered).toContain('20 mg');
    expect(rendered).toContain('2 mL');
    expect(rendered).toContain('Changing your setup later does not change this record.');
  });

  it('opens showing the entry’s local calendar day, not its UTC slice', async () => {
    /**
     * Caught in device QA: an 8:30 PM administration stores as the next day
     * in UTC, so slicing the ISO string showed tomorrow's date in the editor
     * and would have moved the entry on save.
     */
    mockRouteId = 'plog-evening';
    const evening = new Date(2026, 7, 25, 20, 30);
    const { repository } = repositoryWith(
      [setupFixture()],
      [{ ...ENTRY, id: 'plog-evening', loggedAt: evening.toISOString() }],
    );
    const tree = await mount(<PeptideLogDetail />, repository);

    const dateField = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Date,/.test(String(node.props.accessibilityLabel ?? '')));
    expect(dateField?.props.value).toBe('2026-08-25');

    const timeField = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Time,/.test(String(node.props.accessibilityLabel ?? '')));
    expect(timeField?.props.value).toBe('20:30');
  });

  it('does not move the entry’s day when saved without touching the date', async () => {
    mockRouteId = 'plog-evening';
    const evening = new Date(2026, 7, 25, 20, 30);
    const { repository, days } = repositoryWith(
      [setupFixture()],
      [{ ...ENTRY, id: 'plog-evening', logDate: '2026-08-25', loggedAt: evening.toISOString() }],
    );
    const tree = await mount(<PeptideLogDetail />, repository);

    await type(tree, /^Amount,/, '3');
    await press(tree, 'Save changes');

    const stored = [...days.values()].flat();
    expect(stored).toHaveLength(1);
    expect(stored[0].logDate).toBe('2026-08-25');
  });

  it('recomputes an edit inside the entry’s own original context', async () => {
    mockRouteId = 'plog-1';
    // The setup has since moved to 1 mL, which would make 1 mg = 10 units…
    const { repository, days } = repositoryWith(
      [setupFixture({ reconstitutionMl: 1 })],
      [ENTRY],
    );
    const tree = await mount(<PeptideLogDetail />, repository);

    await type(tree, /^Amount,/, '1');
    await press(tree, 'Save changes');

    // …and against the entry's own 2 mL context it also comes to 10 units,
    // but from the *original* concentration, with the snapshot preserved.
    const stored = [...days.values()].flat();
    expect(stored[0].amount.amountMcg).toBe(1000);
    expect(stored[0].calculationSnapshot?.reconstitutionMl).toBe(2);
    expect(stored[0].calculationSnapshot?.calculatedUnits).toBe(10);
  });

  it('deletes only after a deliberate confirmation', async () => {
    mockRouteId = 'plog-1';
    const { repository, days } = repositoryWith([setupFixture()], [ENTRY]);
    const tree = await mount(<PeptideLogDetail />, repository);

    await press(tree, 'Delete log');
    // The alert is up; nothing is gone yet.
    expect([...days.values()].flat()).toHaveLength(1);

    const confirm = alertButtons.find((button) => button.text === 'Delete');
    expect(confirm).toBeDefined();
    await act(async () => confirm!.onPress?.());

    expect([...days.values()].flat()).toHaveLength(0);
  });

  it('leaves the entry alone if the confirmation is cancelled', async () => {
    mockRouteId = 'plog-1';
    const { repository, days } = repositoryWith([setupFixture()], [ENTRY]);
    const tree = await mount(<PeptideLogDetail />, repository);

    await press(tree, 'Delete log');
    const cancel = alertButtons.find((button) => button.text === 'Cancel');
    await act(async () => cancel?.onPress?.());

    expect([...days.values()].flat()).toHaveLength(1);
  });

  it('renders an empty state for an entry that is already gone', async () => {
    mockRouteId = 'plog-missing';
    const { repository } = repositoryWith([setupFixture()], [ENTRY]);
    const tree = await mount(<PeptideLogDetail />, repository);
    expect(screen(tree)).toContain('no longer available');
  });

  it('shows no conversion section when the entry never had one', async () => {
    mockRouteId = 'plog-1';
    const { repository } = repositoryWith(
      [setupFixture()],
      [{ ...ENTRY, calculationSnapshot: undefined }],
    );
    const tree = await mount(<PeptideLogDetail />, repository);
    expect(texts(tree)).not.toContain('CONVERSION USED');
  });
});

describe('the founder’s real flow, route by route', () => {
  /**
   * Slice 3.8 was rejected with "injection site is not appearing in the Log
   * Peptide flow". The site row *was* on the log route — but nothing tested
   * the path a person actually walks to reach it, so nothing would have
   * caught it if it had not been. This test walks that path.
   */
  it('setup screen → Log Peptide → site selector → save → history', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);

    // 1. The tracked setup offers logging, prominently.
    const setup = await mount(<EditPeptideSetup />, repository);
    await press(setup, 'Log Peptide');
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1/log');
    await act(async () => setup.unmount());
    mounted = null;

    // 2. That href resolves to the log route, and the route shows the site row.
    const log = await mount(<LogPeptide />, repository);
    expect(texts(log)).toContain('INJECTION SITE');
    expect(screen(log)).toContain('Select Site');

    // 3. Two taps total: open the picker, name the site. No Done, no
    //    region-then-side, no figure in the way.
    await type(log, /^Amount,/, '2');
    await pressByLabel(log, 'Select injection site');
    await pressByLabel(log, 'Left Abdomen');
    expect(screen(log)).toContain('Left Abdomen');

    // 4. Saving persists it.
    await press(log, 'Save log');
    const stored = [...days.values()].flat();
    expect(stored[0].site?.key).toBe('abdomen-left');
    await act(async () => log.unmount());
    mounted = null;

    // 5. History shows it back.
    const history = await mount(<PeptideHistory />, repository);
    expect(screen(history)).toContain('Left Abdomen');
  });

  it('puts no site selector on New Setup, where it does not belong', async () => {
    // A setup says *how* a peptide is tracked; a site describes one
    // administration. The founder was looking here — which is why creating a
    // setup now lands on the setup screen, where Log Peptide is the first
    // action rather than a screen away.
    mockRouteId = '';
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<NewPeptideSetup />, repository);

    expect(texts(tree)).not.toContain('INJECTION SITE');
    expect(screen(tree)).not.toContain('Select Site');
  });
});

describe('injection sites', () => {
  /** The fast path: open the picker, tap the site. That is the whole flow. */
  async function chooseSite(tree: ReactTestRenderer, label: string) {
    await pressByLabel(tree, 'Select injection site');
    await pressByLabel(tree, label);
  }

  it('records a site chosen through the picker', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');
    await chooseSite(tree, 'Left Abdomen');
    expect(screen(tree)).toContain('Left Abdomen');

    await press(tree, 'Save log');
    const stored = [...days.values()].flat();
    expect(stored[0].site?.label).toBe('Left Abdomen');
    expect(stored[0].site?.key).toBe('abdomen-left');
  });

  it('saves perfectly well without one', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');
    await press(tree, 'Save log');

    const stored = [...days.values()].flat();
    expect(stored).toHaveLength(1);
    expect(stored[0].site).toBeUndefined();
  });

  it('records a custom site under the user’s own name', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');
    await pressByLabel(tree, 'Select injection site');
    await pressByLabel(tree, 'Other / Custom');
    await type(tree, /^Custom injection site name/, 'Left Hip');
    await press(tree, 'Done');
    await press(tree, 'Save log');

    // Never rewritten to "Other".
    expect([...days.values()].flat()[0].site?.label).toBe('Left Hip');
  });

  it('never preselects the last site', async () => {
    mockRouteId = 'setup-1';
    const seeded: PeptideLogEntry = {
      id: 'plog-prev',
      setupId: 'setup-1',
      definitionId: 'catalog:retatrutide',
      logDate: '2026-08-21',
      loggedAt: noonOn(21),
      amount: { authoredAmount: 2, authoredUnit: 'mg', amountMcg: 2000 },
      site: createSiteSnapshot('abdomen-left'),
      createdAt: CREATED,
      updatedAt: CREATED,
    };
    const { repository, days } = repositoryWith([setupFixture()], [seeded]);
    const tree = await mount(<LogPeptide />, repository);

    // Shown as context…
    expect(screen(tree)).toContain('Last recorded · Left Abdomen');
    // …but the field itself is empty, so accepting it is never implicit.
    expect(screen(tree)).toContain('Select Site');

    await type(tree, /^Amount,/, '2');
    await press(tree, 'Save log');
    const saved = [...days.values()].flat().find((entry) => entry.id !== 'plog-prev');
    expect(saved?.site).toBeUndefined();
  });

  it('offers no next-site suggestion anywhere on the log screen', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);
    await pressByLabel(tree, 'Select injection site');

    const rendered = screen(tree).toLowerCase();
    for (const word of ['recommended', 'suggested', 'next site', 'rotate', 'avoid', 'due', 'safe to use']) {
      expect(rendered).not.toContain(word);
    }
  });
});

describe('every canonical site can be recorded', () => {
  const ALL: Array<[string, string]> = [
    ['Left Abdomen', 'abdomen-left'],
    ['Center Abdomen', 'abdomen-center'],
    ['Right Abdomen', 'abdomen-right'],
    ['Left Thigh', 'thigh-left'],
    ['Right Thigh', 'thigh-right'],
    ['Left Upper Arm', 'upper-arm-left'],
    ['Right Upper Arm', 'upper-arm-right'],
  ];

  for (const [label, key] of ALL) {
    it(label, async () => {
      mockRouteId = 'setup-1';
      const { repository, days } = repositoryWith([setupFixture()]);
      const tree = await mount(<LogPeptide />, repository);

      await type(tree, /^Amount,/, '2');
      await pressByLabel(tree, 'Select injection site');
      await pressByLabel(tree, label);
      await press(tree, 'Save log');

      expect([...days.values()].flat()[0].site?.key).toBe(key);
    });
  }

  it('reaches glutes from the same list, with no view to switch', async () => {
    // The figure can only draw glutes from behind. The list has no such
    // constraint, which is the point of it being the primary path.
    for (const [label, key] of [
      ['Left Glute', 'glute-left'],
      ['Right Glute', 'glute-right'],
    ] as Array<[string, string]>) {
      mockRouteId = 'setup-1';
      const { repository, days } = repositoryWith([setupFixture()]);
      const tree = await mount(<LogPeptide />, repository);

      await type(tree, /^Amount,/, '2');
      await pressByLabel(tree, 'Select injection site');
      await pressByLabel(tree, label);
      await press(tree, 'Save log');

      expect([...days.values()].flat()[0].site?.key).toBe(key);
      await act(async () => tree.unmount());
      mounted = null;
    }
  });
});

describe('the fast site list', () => {
  async function openList() {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);
    await pressByLabel(tree, 'Select injection site');
    return { tree, days };
  }

  it('lists every canonical site as its own row', async () => {
    const { tree } = await openList();
    const rendered = screen(tree);
    for (const label of [
      'Left Upper Arm',
      'Right Upper Arm',
      'Left Abdomen',
      'Center Abdomen',
      'Right Abdomen',
      'Left Thigh',
      'Right Thigh',
      'Left Glute',
      'Right Glute',
      'Other / Custom',
    ]) {
      expect(rendered).toContain(label);
    }
  });

  it('never asks for a region and then a side', async () => {
    const { tree } = await openList();
    const rendered = screen(tree);
    // The bare region words were the two-step picker's first screen.
    for (const heading of ['ABDOMEN', 'THIGH', 'UPPER ARM', 'GLUTE']) {
      expect(rendered).not.toContain(heading);
    }
  });

  it('commits on the single tap, with no confirmation step', async () => {
    const { tree } = await openList();
    await pressByLabel(tree, 'Right Upper Arm');

    // The sheet is gone and the control already reads the choice.
    expect(screen(tree)).toContain('Right Upper Arm');
    expect(screen(tree)).not.toContain('Other / Custom');
  });

  it('marks the current value in the list when reopened', async () => {
    const { tree } = await openList();
    await pressByLabel(tree, 'Center Abdomen');
    await pressByLabel(tree, 'Injection site, currently Center Abdomen. Opens the site picker');

    const rows = tree.root.findAll(
      (node) =>
        node.props?.accessibilityRole === 'button' &&
        node.props?.accessibilityLabel === 'Center Abdomen',
    );
    expect(rows.some((node) => node.props.accessibilityState?.selected === true)).toBe(true);
  });

  it('clears the site again', async () => {
    const { tree, days } = await openList();
    await pressByLabel(tree, 'Left Thigh');
    await pressByLabel(tree, 'Clear injection site');
    expect(screen(tree)).toContain('Select Site');

    await type(tree, /^Amount,/, '2');
    await press(tree, 'Save log');
    expect([...days.values()].flat()[0].site).toBeUndefined();
  });

  it('offers the body model without making anyone use it', async () => {
    const { tree } = await openList();
    expect(screen(tree)).toContain('View Body Model');
  });
});

describe('the body map', () => {
  /** The optional visual path: open the picker, then open the figure. */
  async function openMap() {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);
    await pressByLabel(tree, 'Select injection site');
    await pressByLabel(tree, 'View Body Model');
    return { tree, days };
  }

  it('opens on the front view with nothing chosen', async () => {
    const { tree } = await openMap();
    expect(screen(tree)).toContain('No site selected');

    await pressByLabel(tree, 'Left Thigh');
    expect(screen(tree)).toContain('Left Thigh');
  });

  it('shows the selection as it is made, and names the confirm action', async () => {
    const { tree } = await openMap();
    await pressByLabel(tree, 'Center Abdomen');

    // Not a bare "Done" — nobody should have to wonder whether the tap on
    // the figure registered, or what it registered as.
    expect(screen(tree)).toContain('Use Center Abdomen');
  });

  it('keeps a selection across a view switch', async () => {
    const { tree } = await openMap();
    await pressByLabel(tree, 'Left Abdomen');
    await pressByLabel(tree, 'Body view, Back');

    // An arm chosen from the front is the same arm from behind; switching
    // views must not silently discard what was picked.
    expect(screen(tree)).toContain('Left Abdomen');
  });

  it('reaches a back-only site through the Front / Back toggle', async () => {
    const { tree } = await openMap();
    await pressByLabel(tree, 'Body view, Back');
    await pressByLabel(tree, 'Left Glute');
    expect(screen(tree)).toContain('Use Left Glute');
  });

  it('marks the chosen zone as selected for assistive technology', async () => {
    const { tree } = await openMap();
    await pressByLabel(tree, 'Right Thigh');

    const zones = tree.root.findAll(
      (node) =>
        node.props?.accessibilityRole === 'button' &&
        node.props?.accessibilityLabel === 'Right Thigh',
    );
    expect(zones.some((node) => node.props.accessibilityState?.selected === true)).toBe(true);
  });

  it('can be backed out of, returning to the list', async () => {
    const { tree } = await openMap();
    await pressByLabel(tree, 'Back to site list');
    expect(screen(tree)).toContain('Other / Custom');
  });

  /**
   * The figure is a self-view, not a clinical illustration.
   *
   * VITA's reader is the person injecting themselves, so *your left* sits on
   * the left of the screen — where your own left hand is when you look down.
   * Turning the body around to see the back has to swap that, and the bug
   * this pins had Left Abdomen and Left Glute rendering on the *same* side,
   * which is wrong under either convention.
   */
  function zoneCentre(tree: ReactTestRenderer, label: string): number {
    const hit = tree.root.findAll(
      (node) =>
        node.props?.accessibilityRole === 'button' &&
        node.props?.accessibilityLabel === label &&
        node.props?.style !== undefined,
    );
    const flat = hit
      .map((node) => StyleSheet.flatten(node.props.style) as { left?: number; width?: number })
      .find((style) => typeof style.left === 'number' && typeof style.width === 'number');
    if (!flat) throw new Error(`no positioned hit target for ${label}`);
    return flat.left! + flat.width! / 2;
  }

  it('puts your left on the left of the screen in the front view', async () => {
    const { tree } = await openMap();
    expect(zoneCentre(tree, 'Left Abdomen')).toBeLessThan(zoneCentre(tree, 'Right Abdomen'));
    expect(zoneCentre(tree, 'Left Thigh')).toBeLessThan(zoneCentre(tree, 'Right Thigh'));
  });

  it('mirrors the sides when the body is turned around', async () => {
    const { tree } = await openMap();
    const frontLeftArm = zoneCentre(tree, 'Left Upper Arm');

    await pressByLabel(tree, 'Body view, Back');

    // Same arm, other side of the screen — because the body turned, not
    // because the map relabelled anything.
    expect(zoneCentre(tree, 'Left Upper Arm')).toBeGreaterThan(frontLeftArm);
    expect(zoneCentre(tree, 'Left Glute')).toBeGreaterThan(zoneCentre(tree, 'Right Glute'));
  });

  it('records nothing if the figure is dismissed without confirming', async () => {
    const { tree, days } = await openMap();
    await pressByLabel(tree, 'Left Abdomen');
    await pressByLabel(tree, 'Close');

    await type(tree, /^Amount,/, '2');
    await press(tree, 'Save log');
    expect([...days.values()].flat()[0].site).toBeUndefined();
  });

  /**
   * The whole supplemental path, end to end, on the real route (§23).
   *
   * Log Peptide → Injection Site → View Body Model → tap a zone → confirm →
   * back on the form → save → the stored record says Right Thigh.
   */
  it('log route → body model → confirm → save, with the site persisted', async () => {
    mockRouteId = 'setup-1';
    const { repository, days } = repositoryWith([setupFixture()]);
    const tree = await mount(<LogPeptide />, repository);

    await type(tree, /^Amount,/, '2');
    await pressByLabel(tree, 'Select injection site');
    await pressByLabel(tree, 'View Body Model');
    await pressByLabel(tree, 'Right Thigh');
    await press(tree, 'Use Right Thigh');

    // Back on the form, with the choice visible before anything is saved.
    expect(screen(tree)).toContain('Right Thigh');
    expect(screen(tree)).not.toContain('No site selected');

    await press(tree, 'Save log');
    const stored = [...days.values()].flat();
    expect(stored[0].site?.key).toBe('thigh-right');
    expect(stored[0].site?.label).toBe('Right Thigh');
  });
});

describe('editing a site', () => {
  const WITH_SITE: PeptideLogEntry = {
    id: 'plog-site',
    setupId: 'setup-1',
    definitionId: 'catalog:retatrutide',
    logDate: '2026-08-25',
    loggedAt: noonOn(25),
    amount: { authoredAmount: 2, authoredUnit: 'mg', amountMcg: 2000 },
    calculationSnapshot: {
      vialAmountMcg: 20_000,
      reconstitutionMl: 2,
      unitsPerMl: 100,
      calculatedUnits: 20,
      calculatedVolumeMl: 0.2,
    },
    site: createSiteSnapshot('abdomen-left'),
    createdAt: CREATED,
    updatedAt: CREATED,
  };

  it('prefills the recorded site', async () => {
    mockRouteId = 'plog-site';
    const { repository } = repositoryWith([setupFixture()], [WITH_SITE]);
    const tree = await mount(<PeptideLogDetail />, repository);
    expect(screen(tree)).toContain('Left Abdomen');
  });

  it('changes the site without touching the conversion', async () => {
    mockRouteId = 'plog-site';
    const { repository, days } = repositoryWith([setupFixture()], [WITH_SITE]);
    const tree = await mount(<PeptideLogDetail />, repository);

    await pressByLabel(tree, 'Injection site, currently Left Abdomen. Opens the site picker');
    await pressByLabel(tree, 'Right Thigh');
    await press(tree, 'Save changes');

    const stored = [...days.values()].flat()[0];
    expect(stored.site?.label).toBe('Right Thigh');
    // Where it happened cannot change what was drawn.
    expect(stored.calculationSnapshot?.calculatedUnits).toBe(20);
    expect(stored.amount.amountMcg).toBe(2000);
  });

  it('clears the site and leaves a valid log', async () => {
    mockRouteId = 'plog-site';
    const { repository, days } = repositoryWith([setupFixture()], [WITH_SITE]);
    const tree = await mount(<PeptideLogDetail />, repository);

    await pressByLabel(tree, 'Clear injection site');
    await press(tree, 'Save changes');

    const stored = [...days.values()].flat()[0];
    expect(stored.site).toBeUndefined();
    expect(stored.amount.amountMcg).toBe(2000);
  });

  /**
   * Editing through the figure, with the existing value already on it (§24).
   *
   * The map opens on the view the current site lives on — a glute is on the
   * back — and shows it as selected, so nobody has to hunt for what the log
   * already says before changing it.
   */
  it('opens the body model on the recorded site and can change it', async () => {
    mockRouteId = 'plog-glute';
    const withGlute: PeptideLogEntry = {
      ...WITH_SITE,
      id: 'plog-glute',
      site: createSiteSnapshot('glute-left'),
    };
    const { repository, days } = repositoryWith([setupFixture()], [withGlute]);
    const tree = await mount(<PeptideLogDetail />, repository);

    await pressByLabel(tree, 'Injection site, currently Left Glute. Opens the site picker');
    await pressByLabel(tree, 'View Body Model');

    // Already on the back view, already highlighted, already confirmable.
    expect(screen(tree)).toContain('Use Left Glute');
    const zones = tree.root.findAll(
      (node) =>
        node.props?.accessibilityRole === 'button' &&
        node.props?.accessibilityLabel === 'Left Glute',
    );
    expect(zones.some((node) => node.props.accessibilityState?.selected === true)).toBe(true);

    await pressByLabel(tree, 'Right Glute');
    await press(tree, 'Use Right Glute');
    expect(screen(tree)).toContain('Right Glute');

    await press(tree, 'Save changes');
    expect([...days.values()].flat()[0].site?.key).toBe('glute-right');
  });

  it('restores the site when a deletion is undone', async () => {
    mockRouteId = 'plog-site';
    const { repository, days } = repositoryWith([setupFixture()], [WITH_SITE]);
    const tree = await mount(<PeptideLogDetail />, repository);

    await press(tree, 'Delete log');
    const confirm = alertButtons.find((button) => button.text === 'Delete');
    await act(async () => confirm!.onPress?.());
    expect([...days.values()].flat()).toHaveLength(0);

    // Undo puts back the whole record, site included.
    await act(async () => press(tree, 'Undo'));
    const restored = [...days.values()].flat();
    expect(restored).toHaveLength(1);
    expect(restored[0].site?.label).toBe('Left Abdomen');
  });
});

describe('Tools — Injection Sites', () => {
  function siteLog(id: string, setupId: string, definitionId: string, day: number, hour: number, site: PeptideLogEntry['site']): PeptideLogEntry {
    return {
      id,
      setupId,
      definitionId,
      logDate: `2026-08-${day}`,
      loggedAt: new Date(2026, 7, day, hour, 0).toISOString(),
      amount: { authoredAmount: 2, authoredUnit: 'mg', amountMcg: 2000 },
      site,
      createdAt: CREATED,
      updatedAt: CREATED,
    };
  }

  it('says so plainly when nothing has been recorded', async () => {
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<InjectionSites />, repository);
    expect(screen(tree)).toContain('Nothing recorded yet');
  });

  it('aggregates sites across different peptides, newest first', async () => {
    const { repository } = repositoryWith(
      [setupFixture(), setupFixture({ id: 'setup-2', definitionId: 'catalog:mots-c' })],
      [
        siteLog('a', 'setup-1', 'catalog:retatrutide', 25, 20, createSiteSnapshot('abdomen-left')),
        siteLog('b', 'setup-2', 'catalog:mots-c', 23, 19, createSiteSnapshot('thigh-right')),
      ],
    );
    const tree = await mount(<InjectionSites />, repository);

    const rendered = texts(tree);
    const newest = rendered.findIndex((line) => line.includes('Left Abdomen'));
    const older = rendered.findIndex((line) => line.includes('Right Thigh'));
    expect(newest).toBeGreaterThanOrEqual(0);
    expect(newest).toBeLessThan(older);
    // Each row names its own compound, since sites rotate across them.
    expect(screen(tree)).toContain('Retatrutide');
    expect(screen(tree)).toContain('MOTS-c');
  });

  it('keeps history for an inactive setup', async () => {
    const { repository } = repositoryWith(
      [setupFixture({ active: false })],
      [siteLog('a', 'setup-1', 'catalog:retatrutide', 25, 20, createSiteSnapshot('glute-left'))],
    );
    const tree = await mount(<InjectionSites />, repository);
    expect(screen(tree)).toContain('Left Glute');
  });

  it('renders a custom label as written', async () => {
    const { repository } = repositoryWith(
      [setupFixture()],
      [siteLog('a', 'setup-1', 'catalog:retatrutide', 25, 20, createSiteSnapshot('custom', 'Left Hip'))],
    );
    const tree = await mount(<InjectionSites />, repository);
    expect(screen(tree)).toContain('Left Hip');
    expect(screen(tree)).not.toContain('Other · Left Hip');
  });

  it('reports one zone’s history when it is selected, and nothing about others', async () => {
    const { repository } = repositoryWith(
      [setupFixture()],
      [
        siteLog('a', 'setup-1', 'catalog:retatrutide', 25, 20, createSiteSnapshot('abdomen-left')),
        siteLog('b', 'setup-1', 'catalog:retatrutide', 24, 20, createSiteSnapshot('abdomen-left')),
        siteLog('c', 'setup-1', 'catalog:retatrutide', 23, 20, createSiteSnapshot('thigh-right')),
      ],
    );
    const tree = await mount(<InjectionSites />, repository);
    expect(screen(tree)).toContain('Tap a location to see its history.');

    await pressByLabel(tree, 'Left Abdomen');
    expect(screen(tree)).toContain('2 logs');

    await pressByLabel(tree, 'Right Thigh');
    expect(screen(tree)).toContain('1 log');
    expect(screen(tree)).not.toContain('2 logs');
  });

  it('says plainly when a zone has no history', async () => {
    const { repository } = repositoryWith(
      [setupFixture()],
      [siteLog('a', 'setup-1', 'catalog:retatrutide', 25, 20, createSiteSnapshot('abdomen-left'))],
    );
    const tree = await mount(<InjectionSites />, repository);

    await pressByLabel(tree, 'Center Abdomen');
    // Not styled as available or suggested — just empty.
    expect(screen(tree)).toContain('No history recorded here.');
  });

  it('reaches back-view zones through the Front / Back toggle', async () => {
    const { repository } = repositoryWith(
      [setupFixture()],
      [siteLog('a', 'setup-1', 'catalog:retatrutide', 25, 20, createSiteSnapshot('glute-right'))],
    );
    const tree = await mount(<InjectionSites />, repository);

    // Glutes only exist on the back silhouette.
    expect(() => control(tree, 'Right Glute')).not.toThrow();
    await pressByLabel(tree, 'Body view, Back');
    await pressByLabel(tree, 'Right Glute');
    expect(screen(tree)).toContain('1 log');
  });

  it('carries a Site Reference with no technique or peptide-specific advice', async () => {
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<InjectionSites />, repository);

    expect(texts(tree)).toContain('SITE REFERENCE');
    // Including Other, so the custom option is explained rather than left
    // as the one entry with no reference line.
    for (const region of ['Abdomen', 'Thigh', 'Upper Arm', 'Glute', 'Other']) {
      expect(texts(tree)).toContain(region);
    }

    const rendered = screen(tree).toLowerCase();
    for (const word of ['needle', 'angle', 'depth', 'pinch', 'best for', 'recommended', 'rotate', 'avoid this']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('states the tracking boundary once, not beside every block', async () => {
    // The boundary is real and is stated. Repeating it under each section
    // made the screen read as nervous, and nothing here offers advice.
    const { repository } = repositoryWith([setupFixture()]);
    const tree = await mount(<InjectionSites />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('For tracking and anatomical reference only.');
    expect(rendered.match(/for tracking/gi)).toHaveLength(1);
  });
});

describe('no adherence, anywhere', () => {
  it('never scores a log against a schedule', async () => {
    mockRouteId = 'setup-1';
    const { repository } = repositoryWith([
      setupFixture({ schedule: { kind: 'daily' } }),
    ]);
    const tree = await mount(<EditPeptideSetup />, repository);

    const rendered = screen(tree).toLowerCase();
    for (const word of ['missed', 'overdue', 'adherence', 'compliance', 'streak', 'on track', 'due today']) {
      expect(rendered).not.toContain(word);
    }
  });
});
