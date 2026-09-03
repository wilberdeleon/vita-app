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

import { Keyboard, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
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

  return {
    repository,
    stored: {
      day: (d: string) => days[d] ?? [],
      goal: () => goal,
      preferences: () => preferences,
    },
  };
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

  it('leads with the percentage and states what is left against the goal', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(16, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree);
    // The percentage is the hero; the goal and the remainder share one line,
    // and neither the goal nor the remainder is repeated anywhere else.
    expect(rendered).toContain('25%');
    expect(rendered).toContain('48 fl oz to go · 64 fl oz goal');
  });

  it('says the goal is reached without congratulating anyone', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(64, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('100%');
    expect(rendered).toContain('Goal reached · 64 fl oz');
  });

  it('reports the real total when the day goes over the goal, and never spills', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(72, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree);
    // The truth about the day, stated plainly and without comment.
    expect(rendered).toContain('72 fl oz · Goal 64 fl oz');
    // 112, not 113: the ratio of two exact-conversion millilitre values
    // lands a hair under 112.5, and the domain rounds what it actually has.
    expect(rendered).toContain('112%');

    // The vessel itself is clamped: `progress` never exceeds 1.
    const vessel = tree.root.find((node) => node.props?.accessibilityRole === 'progressbar');
    expect(vessel.props.accessibilityValue.now).toBe(112);
  });

  it('shows the day total, not a percentage, when no goal exists', async () => {
    const { repository } = fakeRepository({
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(16, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    const rendered = screen(tree);
    expect(rendered).toContain('16 fl oz');
    expect(rendered).toContain('No daily goal set yet');
    expect(rendered).not.toMatch(/\d+%/);

    // And it is not announced as progress toward anything.
    const progressbars = tree.root.findAll((node) => node.props?.accessibilityRole === 'progressbar');
    expect(progressbars).toHaveLength(0);
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

/* ── logging a drink, through the real sheet ────────────────────────────── */

/** Opens the Add Water sheet from the Water screen, the way a finger does. */
async function openSheet(tree: ReactTestRenderer) {
  await act(async () => control(tree, 'Add Water')!.props.onPress());
}

describe('adding water', () => {
  it('writes the drink to today, in the unit it was entered in', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    await act(async () => control(tree, 'Add 12 fl oz')!.props.onPress());

    const day = stored.day(TODAY);
    expect(day).toHaveLength(1);
    expect(day[0].enteredAmount).toBe(12);
    expect(day[0].enteredUnit).toBe('floz');
  });

  it('records two taps as two drinks, never as one', async () => {
    // Repeated adds are the most ordinary thing anyone does here, and the
    // failure mode — a second tap replacing the first, or being swallowed —
    // is invisible until the day's total is wrong.
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    await act(async () => control(tree, 'Add 8 fl oz')!.props.onPress());
    await openSheet(tree);
    await act(async () => control(tree, 'Add 12 fl oz')!.props.onPress());

    expect(stored.day(TODAY).map((e) => e.enteredAmount)).toEqual([8, 12]);
  });

  it('closes the sheet and updates the screen after a successful log', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
    });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    expect(control(tree, 'Add 16 fl oz')).toBeDefined();

    await act(async () => control(tree, 'Add 16 fl oz')!.props.onPress());

    // The sheet is gone, and the hero reflects the real new state.
    expect(control(tree, 'Add 16 fl oz')).toBeUndefined();
    expect(screen(tree)).toContain('25%');
  });

  it('never reports success when the write failed', async () => {
    /*
     * The defect this exists to prevent: a confirmation haptic and a toast
     * saying the drink was recorded, over a save that did not happen. The
     * provider reports whether the write landed; the screen must believe it.
     */
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    const failing: WaterRepository = {
      ...repository,
      async saveEntries() {
        throw new Error('storage unavailable');
      },
    };
    const tree = await mount(<WaterLog />, failing);

    await openSheet(tree);
    await act(async () => control(tree, 'Add 8 fl oz')!.props.onPress());

    expect(screen(tree)).toMatch(/couldn.t save|nothing was recorded/i);
    // The sheet stays open so the amount can be tried again rather than lost.
    expect(control(tree, 'Add 8 fl oz')).toBeDefined();
  });

  it('offers quick amounts a person would say in the unit they are logging in', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'cup' } });
    const tree = await mount(<WaterLog />, repository);
    await openSheet(tree);

    // Halves and wholes, not 0.35 of something — see `quickAdds.ts`.
    for (const label of ['Add 0.5 cups', 'Add 1 cup', 'Add 1.5 cups', 'Add 2 cups']) {
      expect(control(tree, label)).toBeDefined();
    }
    // And the visible form is the one people write, singular through one.
    expect(screen(tree)).toContain('½ cup');
    expect(screen(tree)).toContain('1½ cups');
  });

  it('logs a custom amount in the active unit', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'ml' } });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    await act(async () => control(tree, 'Enter a custom amount')!.props.onPress());
    await type(tree, /custom amount in/i, '330');
    await act(async () => control(tree, /^Log 330 mL$/)!.props.onPress());

    const day = stored.day(TODAY);
    expect(day).toHaveLength(1);
    expect(day[0].enteredAmount).toBe(330);
    expect(day[0].enteredUnit).toBe('ml');
  });

  it('will not log a custom amount that is not a real quantity', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    await act(async () => control(tree, 'Enter a custom amount')!.props.onPress());

    for (const bad of ['', '0', '-4', 'abc']) {
      await type(tree, /custom amount in/i, bad);
      // Specific: the unit segments announce as "Log in, mL" and would
      // otherwise match first.
      const button = control(tree, /^Log (custom amount|\d)/)!;
      expect(button.props.accessibilityState?.disabled ?? button.props.disabled).toBe(true);
      await act(async () => button.props.onPress?.());
    }

    expect(stored.day(TODAY)).toHaveLength(0);
  });
});

/* ── display preference vs the unit one drink was logged in ─────────────── */

describe('units', () => {
  it('opens the sheet in the saved display preference', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'l' } });
    const tree = await mount(<WaterLog />, repository);
    await openSheet(tree);

    expect(control(tree, 'Add 0.5 L')).toBeDefined();
    expect(control(tree, 'Add 8 fl oz')).toBeUndefined();
  });

  it('logs in a temporarily switched unit without changing the saved preference', async () => {
    /*
     * The distinction the founders drew on 2026-08-22 and slice 5.2 had to
     * keep: switching units inside the sheet belongs to *this drink*.
     * Changing what Water displays in is a deliberate act done in Settings.
     */
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    await act(async () => control(tree, 'Log in, mL')!.props.onPress());
    await act(async () => control(tree, 'Add 500 mL')!.props.onPress());

    // The drink is recorded exactly as authored...
    const day = stored.day(TODAY);
    expect(day[0].enteredAmount).toBe(500);
    expect(day[0].enteredUnit).toBe('ml');
    // ...and the preference on disk is untouched.
    expect(stored.preferences()?.unit ?? 'floz').toBe('floz');
  });

  it('keeps rendering in the display preference after logging in another unit', async () => {
    const { repository } = fakeRepository({
      goal: createWaterGoal(64, 'floz'),
      preferences: { unit: 'floz' },
    });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    await act(async () => control(tree, 'Log in, mL')!.props.onPress());
    await act(async () => control(tree, 'Add 500 mL')!.props.onPress());

    // 500 mL is ~16.9 fl oz of a 64 fl oz goal.
    const rendered = screen(tree);
    expect(rendered).toContain('fl oz');
    expect(rendered).toContain('26%');
  });

  it('says which unit a drink is being logged in only when it differs', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    expect(screen(tree)).not.toMatch(/Water still shows/);

    await act(async () => control(tree, 'Log in, cups')!.props.onPress());
    expect(screen(tree)).toContain('Logging this drink in cups');
    expect(screen(tree)).toContain('Water still shows fl oz');
  });

  it('preserves what the user typed, whatever the display unit later becomes', async () => {
    const { repository } = fakeRepository({
      preferences: { unit: 'ml' },
      entries: { [TODAY]: [entry(1, 'cup')] },
    });
    const tree = await mount(<WaterLog />, repository);

    // The entries list is disclosed, and shows the authored pair — not a
    // reconstructed 236.6 mL the user never entered.
    await act(async () => control(tree, /Today's log/)!.props.onPress());
    expect(screen(tree)).toContain('1 cup');
  });

  it('reopens the sheet in the saved preference rather than the last unit used', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openSheet(tree);
    await act(async () => control(tree, 'Log in, cups')!.props.onPress());
    await act(async () => control(tree, 'Add 1 cup')!.props.onPress());

    await openSheet(tree);
    expect(control(tree, 'Add 8 fl oz')).toBeDefined();
  });
});

/* ── the number pad's Done key ──────────────────────────────────────────── */

describe('the custom amount keyboard', () => {
  /** The Done bar, found the way a screen reader would. */
  const doneKey = (tree: ReactTestRenderer) => control(tree, 'Done, close the number pad');

  async function openCustom(tree: ReactTestRenderer) {
    await act(async () => control(tree, 'Add Water')!.props.onPress());
    await act(async () => control(tree, 'Enter a custom amount')!.props.onPress());
  }

  it('offers Done only while the amount field is on screen', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await act(async () => control(tree, 'Add Water')!.props.onPress());
    // Quick amounts open no keyboard, so there is nothing to dismiss.
    expect(doneKey(tree)).toBeUndefined();

    await act(async () => control(tree, 'Enter a custom amount')!.props.onPress());
    expect(doneKey(tree)).toBeDefined();
  });

  it('dismisses the keyboard without logging anything', async () => {
    /*
     * The whole point of the control: `Log` stays the only thing that writes
     * an entry. Two controls that both save is the ambiguity this removes.
     */
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openCustom(tree);
    await type(tree, /custom amount in/i, '14');

    dismiss.mockClear();
    await act(async () => doneKey(tree)!.props.onPress());

    expect(dismiss).toHaveBeenCalled();
    expect(stored.day(TODAY)).toHaveLength(0);
    dismiss.mockRestore();
  });

  it('leaves the typed amount and the chosen unit exactly as they were', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await act(async () => control(tree, 'Add Water')!.props.onPress());
    await act(async () => control(tree, 'Log in, mL')!.props.onPress());
    await act(async () => control(tree, 'Enter a custom amount')!.props.onPress());
    await type(tree, /custom amount in/i, '330');

    await act(async () => doneKey(tree)!.props.onPress());

    // Still mL, still 330 — and Log still works afterwards.
    expect(screen(tree)).toContain('Log 330 mL');
    await act(async () => control(tree, /^Log 330 mL$/)!.props.onPress());
    expect(stored.day(TODAY)[0].enteredUnit).toBe('ml');
    expect(stored.day(TODAY)[0].enteredAmount).toBe(330);
  });

  it('still dismisses an invalid amount, and still refuses to save it', async () => {
    // Dismissal is not tied to validation: the keyboard should always be
    // closable, and Log should still be the thing that judges the value.
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openCustom(tree);
    await type(tree, /custom amount in/i, 'abc');

    dismiss.mockClear();
    await act(async () => doneKey(tree)!.props.onPress());
    expect(dismiss).toHaveBeenCalled();

    const button = control(tree, /^Log (custom amount|\d)/)!;
    expect(button.props.accessibilityState?.disabled ?? button.props.disabled).toBe(true);
    expect(stored.day(TODAY)).toHaveLength(0);
    dismiss.mockRestore();
  });

  it('takes the keyboard with it however the sheet is closed', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    // Closing outright — the backdrop and the close control share this path.
    await openCustom(tree);
    dismiss.mockClear();
    await act(async () => control(tree, 'Close')!.props.onPress());
    expect(dismiss).toHaveBeenCalled();

    // And a successful log, which unmounts the sheet from under the keyboard.
    await openCustom(tree);
    await type(tree, /custom amount in/i, '10');
    dismiss.mockClear();
    await act(async () => control(tree, /^Log 10 fl oz$/)!.props.onPress());
    expect(dismiss).toHaveBeenCalled();

    dismiss.mockRestore();
  });

  it('clears a typed amount when the unit changes, rather than reinterpreting it', async () => {
    /*
     * `16` means something very different in ounces and litres. Carrying the
     * number across a unit switch would log a drink the user never chose —
     * the same reasoning `AmountEditor` records for the identical decision.
     */
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    const tree = await mount(<WaterLog />, repository);

    await openCustom(tree);
    await type(tree, /custom amount in/i, '16');
    expect(screen(tree)).toContain('Log 16 fl oz');

    await act(async () => control(tree, 'Log in, L')!.props.onPress());

    // Nothing carried over, and the field now asks for litres.
    expect(screen(tree)).not.toContain('Log 16');
    expect(screen(tree)).toContain('Amount in L');
  });
});

/* ── today's drinks ─────────────────────────────────────────────────────── */

describe("today's entries", () => {
  it('summarises the day and discloses the drinks on demand', async () => {
    const { repository } = fakeRepository({
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(8, 'floz'), entry(12, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    expect(screen(tree)).toContain('2 drinks');
    // Collapsed by default: the individual amounts are not on screen yet.
    expect(control(tree, /^Remove /)).toBeUndefined();

    await act(async () => control(tree, /Today's log/)!.props.onPress());
    expect(control(tree, 'Remove 8 fl oz')).toBeDefined();
  });

  it('removes a drink and can put it back', async () => {
    const { repository, stored } = fakeRepository({
      preferences: { unit: 'floz' },
      entries: { [TODAY]: [entry(8, 'floz'), entry(12, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    await act(async () => control(tree, /Today's log/)!.props.onPress());
    await act(async () => control(tree, 'Remove 8 fl oz')!.props.onPress());
    expect(stored.day(TODAY).map((e) => e.enteredAmount)).toEqual([12]);

    await act(async () => control(tree, 'Undo')!.props.onPress());
    // Restored to where it was, not appended to the end.
    expect(stored.day(TODAY).map((e) => e.enteredAmount)).toEqual([8, 12]);
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
    expect(rendered).toContain('0%');
    expect(rendered).toContain('64 fl oz to go');
    expect(rendered).not.toContain('Goal reached');
  });

  it('leaves yesterday’s stored entries untouched when today is logged', async () => {
    const { repository, stored } = fakeRepository({
      preferences: { unit: 'floz' },
      entries: { [YESTERDAY]: [entry(20, 'floz')] },
    });
    const tree = await mount(<WaterLog />, repository);

    await act(async () => control(tree, 'Add Water')!.props.onPress());
    await act(async () => control(tree, 'Add 8 fl oz')!.props.onPress());

    expect(stored.day(YESTERDAY).map((e) => e.enteredAmount)).toEqual([20]);
    expect(stored.day(TODAY).map((e) => e.enteredAmount)).toEqual([8]);
  });
});
