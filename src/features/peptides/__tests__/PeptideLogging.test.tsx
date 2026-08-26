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

import { Alert, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import LogPeptide from '../../../app/(vita)/peptides/setup/[id]/log';
import PeptideHistory from '../../../app/(vita)/peptides/setup/[id]/history';
import PeptideLogDetail from '../../../app/(vita)/peptides/log/[id]';
import EditPeptideSetup from '../../../app/(vita)/peptides/setup/[id]';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import { PeptideProvider, toMcg, type PeptideLogEntry, type PeptideSetup } from '../../../lib/peptides';
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
