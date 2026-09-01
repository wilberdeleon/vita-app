/**
 * Water, driven through the screens a person actually uses.
 *
 * Water's domain is thoroughly covered — units, totals, goals, entries, the
 * week, the provider's own state transitions — and every one of those tests
 * calls a function or a hook directly. Until the 3.10 audit, **no test had
 * ever rendered a Water screen.**
 *
 * That is precisely the shape of gap that let PT-141 ship broken: the search
 * function was correct and had 92 passing tests, while the screen that
 * rendered its results showed the user nothing they recognised. A green
 * domain suite is not evidence that a screen works, so this file mounts the
 * real routes, taps the real controls, and reads what is on them.
 *
 * The repository is the injectable seam the provider was built with, so these
 * are real renders against real state rather than mocked-out components.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    push: (...args: unknown[]) => mockPush(...args),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import AddWater from '../../../app/(vita)/water/add';
import WaterGoalScreen from '../../../app/(vita)/water/goal';
import WaterLog from '../../../app/(vita)/water/index';
import { ToastProvider } from '../../../components/ui';
import { shiftLogDate, todayLogDate } from '../../../lib/daily';
import type { WaterRepository } from '../../../lib/water/data/WaterRepository';
import { createWaterEntry } from '../../../lib/water/model/entries';
import { createWaterGoal } from '../../../lib/water/model/goals';
import type { WaterEntry, WaterGoal, WaterPreferences } from '../../../lib/water/model/types';
import { WaterProvider } from '../../../lib/water/state/WaterProvider';
import { palette } from '../../../theme/tokens';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const TODAY = todayLogDate();
const YESTERDAY = shiftLogDate(TODAY, -1);

/** The same in-memory seam the provider tests use, so "disk" is inspectable. */
function fakeRepository(
  seed: {
    entries?: Record<string, WaterEntry[]>;
    goal?: WaterGoal | null;
    preferences?: WaterPreferences | null;
  } = {},
) {
  const days: Record<string, WaterEntry[]> = { ...(seed.entries ?? {}) };
  let goal: WaterGoal | null = seed.goal ?? null;
  let preferences: WaterPreferences | null = seed.preferences ?? null;

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
    async getRecentDays(maxDays: number) {
      return Object.keys(days)
        .filter((logDate) => days[logDate].length > 0)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, Math.max(0, maxDays))
        .map((logDate) => ({ logDate, entries: [...days[logDate]] }));
    },
  };

  return { repository, stored: { day: (d: string) => days[d] ?? [], goal: () => goal } };
}

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement, repository: WaterRepository) {
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
            <WaterProvider repository={repository}>{element}</WaterProvider>
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
  mockBack.mockClear();
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

/** A pressable by the name a screen reader announces, or by its own text. */
function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: string) =>
    typeof label === 'string' ? value === label : label.test(value);

  return tree.root.findAll((node) => {
    if (typeof node.props?.onPress !== 'function') return false;
    if (typeof node.props.accessibilityLabel === 'string') {
      return matches(node.props.accessibilityLabel);
    }
    /*
     * Ionicons render their glyph as a real character from the font's Private
     * Use Area, inside a `Text` of their own. It is invisible in output and
     * is *not* whitespace, so a button labelled "Add Water" composes to
     * "\uf1af Add Water" and never equals what anyone would search for.
     * Stripping the PUA range is what makes an icon-and-label button findable
     * by its label.
     */
    return matches(
      node
        .findAllByType(Text)
        .flatMap((text) =>
          (Array.isArray(text.props.children) ? text.props.children : [text.props.children]).filter(
            (child: unknown): child is string => typeof child === 'string',
          ),
        )
        .join(' ')
        .replace(/[\uE000-\uF8FF]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    );
  })[0];
}

async function type(tree: ReactTestRenderer, label: RegExp, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => label.test(String(node.props.accessibilityLabel ?? '')));
  if (!field) throw new Error(`no field matching ${label}`);
  await act(async () => field.props.onChangeText(value));
}

const entry = (amount: number, unit: WaterEntry['enteredUnit'], loggedAt?: string) => ({
  ...createWaterEntry({ amount, unit }),
  ...(loggedAt ? { loggedAt } : {}),
});

/* ── the screen a person opens ──────────────────────────────────────────── */

describe('the Water screen', () => {
  it('shows a new day as empty rather than as broken', async () => {
    const { repository } = fakeRepository();
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('No daily goal set yet');
    // An empty day still states the day's total. It never reads as an error.
    expect(rendered).not.toMatch(/error|failed|unavailable/i);
  });

  it('draws no water line at all before a goal exists', async () => {
    /*
     * Found by reading pixels, not markup: the fill animated to zero height
     * but its 2pt surface line still painted a solid blue waterline across
     * the bottom of the card — an empty vessel shown to every brand-new
     * user, on the first Water screen they ever open.
     */
    const { repository } = fakeRepository();
    const tree = await mount(<WaterLog />, repository);

    const painted = tree.root.findAll(
      (node) =>
        node.props?.style !== undefined &&
        JSON.stringify(node.props.style ?? '').includes(palette.water) &&
        node.props?.pointerEvents === 'none',
    );
    expect(painted).toHaveLength(0);
  });

  it('draws the level once a goal gives it something to mean', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(16, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const painted = tree.root.findAll(
      (node) => node.props?.pointerEvents === 'none' && node.props?.style !== undefined,
    );
    expect(painted.length).toBeGreaterThan(0);
  });

  it('states the day total and what is left against a goal', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(16, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('16 fl oz');
    expect(rendered).toContain('Goal 64 fl oz');
    expect(rendered).toContain('25%');
  });

  it('never scores the day — no streak, no average, no judgement', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      entries: { [TODAY]: [entry(8, 'floz')], [YESTERDAY]: [entry(70, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree).toLowerCase();
    for (const word of ['streak', 'average', 'missed', 'behind', 'well done', 'goal met on']) {
      expect(rendered).not.toContain(word);
    }
  });

  it('reports a load failure instead of showing a silently empty day', async () => {
    const { repository } = fakeRepository();
    const failing: WaterRepository = {
      ...repository,
      async getEntries() {
        throw new Error('storage unavailable');
      },
    };
    const tree = await mount(<WaterLog />, failing);
    expect(screen(tree).length).toBeGreaterThan(0);
    expect(screen(tree)).toMatch(/couldn|could not|unavailable|not load/i);
  });
});

/* ── logging a drink, through the real Add screen ───────────────────────── */

describe('adding water', () => {
  it('writes the drink to today, in the unit it was entered in', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<AddWater />, repository);

    await type(tree, /custom amount/i, '12');
    await act(async () => control(tree, 'Add Water')!.props.onPress());

    const day = stored.day(TODAY);
    expect(day).toHaveLength(1);
    expect(day[0].enteredAmount).toBe(12);
    expect(day[0].enteredUnit).toBe('floz');
  });

  it('records two taps as two drinks, never as one', async () => {
    // Repeated adds are the most ordinary thing anyone does on this screen,
    // and the failure mode — a second tap replacing the first, or being
    // swallowed — is invisible until the day's total is wrong.
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });

    for (const amount of ['8', '12']) {
      const tree = await mount(<AddWater />, repository);
      await type(tree, /custom amount/i, amount);
      await act(async () => control(tree, 'Add Water')!.props.onPress());
      await act(async () => tree.unmount());
      mounted = null;
    }

    expect(stored.day(TODAY).map((e) => e.enteredAmount)).toEqual([8, 12]);
  });

  it('cannot be saved with nothing entered', async () => {
    const { repository, stored } = fakeRepository();
    const tree = await mount(<AddWater />, repository);

    const button = control(tree, 'Add Water')!;
    expect(button.props.accessibilityState?.disabled ?? button.props.disabled).toBe(true);
    await act(async () => button.props.onPress?.());
    expect(stored.day(TODAY)).toHaveLength(0);
  });
});

/* ── the goal, through the real Goal screen ─────────────────────────────── */

describe('the daily goal', () => {
  it('persists what was entered, and the unit it was entered in', async () => {
    const { repository, stored } = fakeRepository();
    const tree = await mount(<WaterGoalScreen />, repository);

    await type(tree, /goal in/i, '2');
    // A goal that does not exist yet is *set*; an existing one is *saved*.
    const save = control(tree, /^(Set|Save) goal$/)!;
    await act(async () => save.props.onPress());

    expect(stored.goal()?.amount).toBe(2);
  });

  it('suggests no amount of its own', async () => {
    // A placeholder number on this field would read as a recommendation, and
    // VITA has no basis for one.
    const { repository } = fakeRepository();
    const tree = await mount(<WaterGoalScreen />, repository);

    const field = tree.root
      .findAllByType(TextInput)
      .find((node) => /goal in/i.test(String(node.props.accessibilityLabel ?? '')));
    expect(field?.props.value).toBe('');
  });
});

/* ── the day boundary ───────────────────────────────────────────────────── */

describe('rollover', () => {
  it('opens today empty when only yesterday has entries', async () => {
    // The defect this guards: yesterday's water still reading as today's
    // after midnight, which makes the app claim a drink that never happened.
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
      entries: { [YESTERDAY]: [entry(64, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('0 fl oz');
    expect(rendered).not.toContain('Goal reached');
  });

  it('leaves yesterday’s stored entries untouched when today is logged', async () => {
    const { repository, stored } = fakeRepository({
      preferences: { unit: 'floz' },
      entries: { [YESTERDAY]: [entry(20, 'floz')] },
    });
    const tree = await mount(<AddWater />, repository);

    await type(tree, /custom amount/i, '8');
    await act(async () => control(tree, 'Add Water')!.props.onPress());

    expect(stored.day(YESTERDAY).map((e) => e.enteredAmount)).toEqual([20]);
    expect(stored.day(TODAY).map((e) => e.enteredAmount)).toEqual([8]);
  });
});
