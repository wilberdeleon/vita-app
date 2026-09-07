/**
 * New Routine Setup, as slice 5.5C reordered it.
 *
 * The founder's reading of the old screen was that it was too technical and
 * too long: it opened on Routine and then exposed amount, schedule, reminder,
 * more options, preparation, vial amount, reconstitution, a conversion table
 * and a custom conversion. The model they asked for instead is *prepare it,
 * then track it* — and, crucially, a way to say **there was nothing to
 * prepare**, for someone whose compound arrives ready to use.
 *
 * These tests are about that flow and its two boundaries: that answering
 * "already prepared" stores nothing, and that nothing anywhere on this screen
 * suggests an amount.
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
const mockNavigate = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: (...args: unknown[]) => mockBack(...args),
    navigate: (...args: unknown[]) => mockNavigate(...args),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import EditPeptideSetup from '../../../app/(vita)/peptides/setup/[id]';
import { ToastProvider } from '../../../components/ui';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../../lib/peptides';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const CREATED = '2026-08-25T10:00:00.000Z';

function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    routineState: 'needs-setup',
    active: false,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  } as PeptideSetup;
}

function repositoryWith(seedSetups: PeptideSetup[]): {
  repository: PeptideRepository;
  setups: () => PeptideSetup[];
} {
  let setups = [...seedSetups];
  const days = new Map<string, PeptideLogEntry[]>();
  const statusDays = new Map<string, RoutineDayStatus[]>();

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
    async getLogsInRange() {
      return [];
    },
    async getRoutineStatusesInRange() {
      return [];
    },
    async getEarliestHistoryDate() {
      return null;
    },
  };

  return { repository, setups: () => setups };
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
  mockRouteId = 'setup-1';
  mockNavigate.mockClear();
  mockBack.mockClear();
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

async function press(tree: ReactTestRenderer, label: string | RegExp) {
  const target = control(tree, label);
  if (!target) throw new Error(`no control labelled ${String(label)}`);
  await act(async () => target.props.onPress());
}

async function type(tree: ReactTestRenderer, label: RegExp, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => label.test(String(node.props.accessibilityLabel ?? '')));
  if (!field) throw new Error(`no field matching ${String(label)}`);
  await act(async () => field.props.onChangeText(value));
}

const field = (tree: ReactTestRenderer, label: RegExp) =>
  tree.root
    .findAllByType(TextInput)
    .find((node) => label.test(String(node.props.accessibilityLabel ?? '')));

/* ── identity ──────────────────────────────────────────────────────────── */

describe('the peptide it is about', () => {
  it('says what the compound is, in the catalog’s own words', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);

    const lines = texts(tree);
    expect(lines).toContain('Retatrutide');
    // The class, directly under the name — not a stacked badge and a raw
    // category three lines apart.
    expect(screen(tree)).toContain('Triple Agonist · GIP / GLP-1 / Glucagon');
    expect(lines.indexOf('Retatrutide')).toBeLessThan(
      lines.indexOf('Triple Agonist · GIP / GLP-1 / Glucagon'),
    );
  });

  it('makes no claim about what the compound does', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    const rendered = screen(tree).toLowerCase();

    for (const phrase of ['helps', 'best for', 'burns', 'boosts', 'improves', 'treats']) {
      expect(rendered).not.toContain(phrase);
    }
  });
});

/* ── the order ─────────────────────────────────────────────────────────── */

describe('a routine being set up for the first time', () => {
  it('asks how the compound reaches you before anything else', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    const lines = texts(tree);

    expect(lines.indexOf('Preparation')).toBeLessThan(lines.indexOf('Routine'));
    expect(screen(tree)).toContain('Set up vial');
    expect(screen(tree)).toContain('Already prepared');
  });

  it('never gates the routine behind that question', async () => {
    // §11: preparation is optional, and putting it first must not change that.
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    expect(field(tree, /^Routine amount/)).toBeDefined();
  });

  it('saves a routine with no preparation answered at all', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await type(tree, /^Routine amount/, '2');
    await press(tree, 'Add to Routine');

    const saved = fake.setups()[0];
    expect(saved.routineState).toBe('active');
    expect(saved.vial).toBeUndefined();
    expect(saved.reconstitutionMl).toBeUndefined();
  });

  it('calls the action what it does', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    expect(screen(tree)).toContain('Add to Routine');
    expect(screen(tree)).not.toContain('Save Setup');
  });

  it('ends on Peptides rather than wherever it was opened from', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, 'Add to Routine');
    expect(mockNavigate).toHaveBeenCalledWith('/peptides');
  });
});

/* ── already prepared ──────────────────────────────────────────────────── */

describe('“Already prepared”', () => {
  it('asks for no vial, no water and no conversion', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    await press(tree, /^Already prepared\./);

    const rendered = screen(tree);
    expect(rendered).not.toContain('Vial Amount (MG)');
    expect(rendered).not.toContain('Reconstitution Volume (ML)');
    expect(rendered).not.toContain('Unit conversion calculator');
    // And says so without implying anything was skipped or left incomplete.
    expect(rendered).toContain('You can add preparation details later.');
  });

  it('announces itself as the current answer', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    await press(tree, /^Already prepared\./);

    expect(control(tree, /^Already prepared\./).props.accessibilityState.selected).toBe(true);
    expect(control(tree, /^Set up vial\./).props.accessibilityState.selected).toBe(false);
  });

  it('still lets the amount be entered, and saves it', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, /^Already prepared\./);
    await type(tree, /^Routine amount/, '0.5');
    await press(tree, 'Add to Routine');

    const saved = fake.setups()[0];
    expect(saved.routineAmount?.authored.amount).toBe(0.5);
    // Nothing was inferred to fill the gap.
    expect(saved.vial).toBeUndefined();
    expect(saved.reconstitutionMl).toBeUndefined();
    expect(saved.routineState).toBe('active');
  });

  it('clears a half-typed vial rather than saving it underneath', async () => {
    /*
     * §10: no fake preparation values and no hidden defaults. A value the
     * form has stopped showing is a value the user cannot correct, so saying
     * "it arrives ready to use" discards what was typed before that.
     */
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, /^Set up vial\./);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /^Reconstitution volume/, '2');

    await press(tree, /^Already prepared\./);
    await press(tree, 'Add to Routine');

    expect(fake.setups()[0].vial).toBeUndefined();
    expect(fake.setups()[0].reconstitutionMl).toBeUndefined();
  });

  it('can be changed back, with the fields empty rather than remembered', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);

    await press(tree, /^Set up vial\./);
    await type(tree, /^Vial amount/, '10');
    await press(tree, /^Already prepared\./);
    await press(tree, /^Set up vial\./);

    expect(field(tree, /^Vial amount/)?.props.value).toBe('');
  });
});

/* ── the calculator ────────────────────────────────────────────────────── */

describe('the unit conversion calculator', () => {
  it('is collapsed, with the one line most people open it for', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);

    await press(tree, /^Set up vial\./);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /^Reconstitution volume/, '2');

    // The headline is legible without expanding anything…
    expect(screen(tree)).toContain('1 mg = 20 units');
    // …and the table itself is still folded away.
    expect(screen(tree)).not.toContain('Concentration · 5 mg/mL');
  });

  it('opens to the full table, unchanged', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);

    await press(tree, /^Set up vial\./);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /^Reconstitution volume/, '2');
    await press(tree, /^Unit conversion calculator/);

    expect(screen(tree)).toContain('Concentration · 5 mg/mL');
    expect(screen(tree)).toContain('Using U-100 · 100 units/mL');
  });

  it('announces whether it is open', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    await press(tree, /^Set up vial\./);

    expect(control(tree, /^Unit conversion calculator/).props.accessibilityState.expanded).toBe(
      false,
    );
    await press(tree, /^Unit conversion calculator/);
    expect(control(tree, /^Unit conversion calculator/).props.accessibilityState.expanded).toBe(
      true,
    );
  });

  it('suggests no amount, anywhere, at any point', async () => {
    /*
     * The boundary the founder restated in §16 and §58. The calculator
     * answers "how many syringe units is the amount I chose"; it must never
     * answer "how much should I take".
     */
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    await press(tree, /^Set up vial\./);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /^Reconstitution volume/, '2');
    await press(tree, /^Unit conversion calculator/);

    const rendered = screen(tree).toLowerCase();
    for (const phrase of [
      'popular',
      'common dose',
      'typical',
      'starting dose',
      'recommended',
      'suggested',
      'most users',
      'titration',
      'protocol',
      'beginner',
    ]) {
      expect(rendered).not.toContain(phrase);
    }
  });
});

/* ── the routine fields ────────────────────────────────────────────────── */

describe('the routine', () => {
  it('describes the amount without assuming a daily schedule', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);

    // §19: three of the four schedules this same form offers are not daily.
    expect(screen(tree)).toContain(
      'The amount you usually use. Used to prefill your log — you can change it when logging.',
    );
    expect(screen(tree)).not.toContain('daily log');
  });

  it('starts blank, and prefills nothing', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    expect(field(tree, /^Routine amount/)?.props.value).toBe('');
    expect(field(tree, /^Routine amount/)?.props.placeholder).toBe('e.g. 2');
  });

  it('records an amount in micrograms when that is what was chosen', async () => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, 'Routine amount unit, mcg');
    await type(tree, /^Routine amount/, '500');
    await press(tree, 'Add to Routine');

    expect(fake.setups()[0].routineAmount?.amountMcg).toBe(500);
    expect(fake.setups()[0].routineAmount?.authored).toEqual({ amount: 500, unit: 'mcg' });
  });

  it('restates a typed amount when the unit changes, never reinterprets it', async () => {
    /*
     * The rule every unit toggle in this app follows. Typing 2 mg and then
     * switching to mcg means 2000 mcg — the same quantity said differently.
     * Reading it as 2 mcg would silently divide someone's routine by a
     * thousand.
     */
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await type(tree, /^Routine amount/, '2');
    await press(tree, 'Routine amount unit, mcg');

    expect(field(tree, /^Routine amount/)?.props.value).toBe('2000');
    await press(tree, 'Add to Routine');
    expect(fake.setups()[0].routineAmount?.amountMcg).toBe(2000);
  });

  it.each([
    ['Daily', 'daily'],
    ['As needed', 'asNeeded'],
  ])('saves the %s schedule', async (label, kind) => {
    const fake = repositoryWith([setupFixture()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await press(tree, new RegExp(`^Schedule, ${label}`));
    await press(tree, 'Add to Routine');

    expect(fake.setups()[0].schedule?.kind).toBe(kind);
  });

  it('keeps start date and notes, one tap away', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);
    await press(tree, /^More options/);

    expect(screen(tree)).toContain('Start date');
    expect(field(tree, /^Notes/)).toBeDefined();
  });
});

/* ── editing, which is a different job ─────────────────────────────────── */

describe('editing a routine that already runs', () => {
  const running = () =>
    setupFixture({
      routineState: 'active',
      active: true,
      vial: { amountMcg: toMcg(10, 'mg'), authored: { amount: 10, unit: 'mg' } },
      reconstitutionMl: 2,
      schedule: { kind: 'daily' },
    });

  it('opens on Routine, with Preparation collapsed beneath it', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([running()]).repository);
    const lines = texts(tree);

    expect(lines.indexOf('Routine')).toBeLessThan(lines.indexOf('Preparation'));
    // No decision to make — this routine answered it by having a vial.
    expect(screen(tree)).not.toContain('Set up vial');
  });

  it('summarises the vial without opening anything', async () => {
    const tree = await mount(<EditPeptideSetup />, repositoryWith([running()]).repository);
    expect(screen(tree)).toContain('10 mg vial · 2 mL');
  });

  it('saves changes and goes back where it came from', async () => {
    const fake = repositoryWith([running()]);
    const tree = await mount(<EditPeptideSetup />, fake.repository);

    await type(tree, /^Routine amount/, '3');
    await press(tree, 'Save Changes');

    expect(fake.setups()[0].routineAmount?.authored.amount).toBe(3);
    expect(mockBack).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

/* ── Dynamic Type ──────────────────────────────────────────────────────── */

describe('at an accessibility text size', () => {
  it('renders one responsive screen, with nothing opted out', async () => {
    mockFontScale = 1.9;
    const tree = await mount(<EditPeptideSetup />, repositoryWith([setupFixture()]).repository);

    const copy = tree.root.findAllByType(Text).filter((node) => {
      const style = Object.assign({}, ...[node.props.style].flat(2).filter(Boolean));
      return style.fontFamily !== 'ionicons';
    });
    expect(copy.length).toBeGreaterThan(3);
    for (const node of copy) {
      expect(node.props.allowFontScaling).not.toBe(false);
    }

    // The decision is still both options, still readable, still first.
    expect(screen(tree)).toContain('Set up vial');
    expect(screen(tree)).toContain('Already prepared');
  });
});
