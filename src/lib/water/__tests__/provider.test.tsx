/**
 * `WaterProvider` behaviour, exercised through a real React render.
 *
 * Uses `react-test-renderer`, which `jest-expo` already brings in — no new
 * dependency, and no UI-testing stack installed for one slice. The probe
 * renders nothing; it exists only to hand the context out so the provider's
 * actual state transitions can be asserted rather than reasoned about.
 *
 * The founder correction from slice 3.2 is pinned here first, because it is a
 * product guarantee rather than an implementation detail: **the unit a drink
 * is logged in is not the unit the app displays.**
 */

// The provider's *default* repository is the AsyncStorage one, so importing
// it pulls the native module in even though every test here injects a fake.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { WaterRepository } from '../data/WaterRepository';
import { createWaterEntry } from '../model/entries';
import { createWaterGoal } from '../model/goals';
import type { WaterEntry, WaterGoal, WaterPreferences } from '../model/types';
import { toMl } from '../model/units';
import { WaterProvider, useWater, type WaterContextValue } from '../state/WaterProvider';
import { useWaterToday, type WaterToday } from '../state/useWaterToday';
import { shiftLogDate, todayLogDate } from '../../daily/dates';

/** An in-memory repository — the injectable seam the provider was built with. */
function fakeRepository(seed: {
  entries?: Record<string, WaterEntry[]>;
  goal?: WaterGoal | null;
  preferences?: WaterPreferences | null;
} = {}) {
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
      // Mirrors the real implementation's contract: written days only, newest
      // first, capped — so the provider is exercised against realistic input
      // rather than an empty stub.
      return Object.keys(days)
        .filter((logDate) => days[logDate].length > 0)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, Math.max(0, maxDays))
        .map((logDate) => ({ logDate, entries: [...days[logDate]] }));
    },
  };

  return {
    repository,
    /** What is actually on "disk" — asserted separately from React state. */
    stored: {
      day: (logDate: string) => days[logDate] ?? [],
      goal: () => goal,
      preferences: () => preferences,
    },
  };
}

let water: WaterContextValue;
let today: WaterToday;

function Probe() {
  water = useWater();
  today = useWaterToday();
  return null;
}

/**
 * The mounted tree, torn down in `afterEach`.
 *
 * Unmounting inside `act` matters: React flushes the provider's cleanup as a
 * state update, and doing it bare produces an "update was not wrapped in
 * act" warning per test — noise that trains people to stop reading test
 * output.
 */
let mounted: ReactTestRenderer | null = null;

async function mount(repository: WaterRepository): Promise<ReactTestRenderer> {
  await act(async () => {
    mounted = create(
      <WaterProvider repository={repository}>
        <Probe />
      </WaterProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
});

const TODAY = todayLogDate();

const entryOf = (amount: number, unit: WaterEntry['enteredUnit']) =>
  createWaterEntry({ amount, unit, logDate: TODAY });

describe('preferred unit is independent of the unit an entry is logged in', () => {
  /**
   * The founder correction, stated as the scenario they described: preference
   * is fluid ounces, one drink is logged in millilitres, and afterwards the
   * preference is still fluid ounces while the entry still says 500 mL.
   */
  it('logging 500 mL while the preference is fl oz leaves the preference alone', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    expect(water.preferences.unit).toBe('floz');

    await act(async () => {
      await water.addEntry(entryOf(500, 'ml'));
    });

    // The preference did not move, in state or in storage.
    expect(water.preferences.unit).toBe('floz');
    expect(today.unit).toBe('floz');
    expect(stored.preferences()).toEqual({ unit: 'floz' });

    // The entry kept what was typed.
    const [entry] = water.entries;
    expect(entry.enteredAmount).toBe(500);
    expect(entry.enteredUnit).toBe('ml');

    // And the derived total still reads in the preferred unit.
    expect(today.totalMl).toBeCloseTo(500, 9);
    expect(today.totalLabel).toBe('16.9 fl oz');

  });

  it('holds across several entries logged in different units', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(16, 'floz'));
      await water.addEntry(entryOf(1, 'cup'));
      await water.addEntry(entryOf(0.5, 'l'));
    });

    expect(water.preferences.unit).toBe('floz');
    expect(water.entries.map((e) => `${e.enteredAmount}${e.enteredUnit}`)).toEqual([
      '16floz',
      '1cup',
      '0.5l',
    ]);
    // 16 fl oz + 8 fl oz + 500 mL
    expect(today.totalMl).toBeCloseTo(toMl(16, 'floz') + toMl(1, 'cup') + 500, 9);

  });

  it('changes only when setUnit is called explicitly', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(500, 'ml'));
      await water.setUnit('ml');
    });

    expect(water.preferences.unit).toBe('ml');
    expect(stored.preferences()).toEqual({ unit: 'ml' });
    expect(today.totalLabel).toBe('500 mL');

  });

  it('never rewrites what a historical entry says, even after the preference changes', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(1, 'cup'));
      await water.setUnit('ml');
    });

    const [entry] = water.entries;
    expect(entry.enteredAmount).toBe(1);
    expect(entry.enteredUnit).toBe('cup');

  });

  it('falls back to fl oz when no preference has been saved', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    expect(water.preferences.unit).toBe('floz');
  });
});

describe('goal', () => {
  it('starts unset, and that is a valid state', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    expect(water.goal).toBeNull();
    expect(today.hasGoal).toBe(false);
    expect(today.goalMl).toBeNull();
    expect(today.percent).toBeNull();
    expect(today.remainingMl).toBeNull();
    expect(today.progress).toBe(0);

  });

  it('logging works with no goal set — the goal is never a gate', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(16, 'floz'));
    });

    expect(water.entries).toHaveLength(1);
    expect(stored.day(TODAY)).toHaveLength(1);
    expect(today.hasGoal).toBe(false);
    expect(today.totalLabel).toBe('16 fl oz');

  });

  it('saves the authored pair exactly and derives the canonical goal', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await water.setGoal(createWaterGoal(8, 'cup'));
    });

    // Not 1892.7 mL rounded back into a lossy 8.0000001.
    expect(water.goal).toEqual({ amount: 8, unit: 'cup' });
    expect(stored.goal()).toEqual({ amount: 8, unit: 'cup' });
    expect(today.goalMl).toBeCloseTo(toMl(8, 'cup'), 9);

  });

  it('can be edited, replacing the previous goal rather than accumulating', async () => {
    const { repository, stored } = fakeRepository({ goal: { amount: 64, unit: 'floz' } });
    await mount(repository);

    expect(water.goal).toEqual({ amount: 64, unit: 'floz' });

    await act(async () => {
      await water.setGoal(createWaterGoal(2, 'l'));
    });

    expect(water.goal).toEqual({ amount: 2, unit: 'l' });
    expect(stored.goal()).toEqual({ amount: 2, unit: 'l' });
    expect(today.goalMl).toBe(2000);

  });

  it('drives progress once set', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.setGoal(createWaterGoal(64, 'floz'));
      await water.addEntry(entryOf(16, 'floz'));
      await water.addEntry(entryOf(1, 'cup'));
    });

    expect(today.totalLabel).toBe('24 fl oz');
    expect(today.goalLabel).toBe('64 fl oz');
    expect(today.remainingLabel).toBe('40 fl oz');
    expect(today.percent).toBe(38);
    expect(today.isGoalMet).toBe(false);

  });

  it('reports an over-goal day honestly rather than capping the number', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.setGoal(createWaterGoal(16, 'floz'));
      await water.addEntry(entryOf(24, 'floz'));
    });

    expect(today.percent).toBe(150);
    expect(today.progress).toBe(1); // the bar clamps; the label does not
    expect(today.remainingLabel).toBe('0 fl oz');
    expect(today.overLabel).toBe('8 fl oz');
    expect(today.isGoalMet).toBe(true);

  });
});

describe('entries', () => {
  it('adds and persists', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(16, 'floz'));
    });

    expect(water.entries).toHaveLength(1);
    expect(stored.day(TODAY)).toHaveLength(1);
  });

  it('updates in place — same id, recomputed canonical amount, no duplicate', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(16, 'floz'));
    });
    const original = water.entries[0];

    await act(async () => {
      await water.updateEntry(original.id, {
        amountMl: toMl(500, 'ml'),
        enteredAmount: 500,
        enteredUnit: 'ml',
      });
    });

    expect(water.entries).toHaveLength(1);
    const updated = water.entries[0];
    expect(updated.id).toBe(original.id);
    expect(updated.loggedAt).toBe(original.loggedAt);
    expect(updated.logDate).toBe(original.logDate);
    expect(updated.amountMl).toBe(500);
    expect(updated.enteredAmount).toBe(500);
    expect(updated.enteredUnit).toBe('ml');
    expect(stored.day(TODAY)).toHaveLength(1);

  });

  it('an edit changes the day total', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'ml' } });
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(250, 'ml'));
    });
    expect(today.totalMl).toBe(250);

    await act(async () => {
      await water.updateEntry(water.entries[0].id, {
        amountMl: 750,
        enteredAmount: 750,
        enteredUnit: 'ml',
      });
    });
    expect(today.totalMl).toBe(750);
    expect(today.totalLabel).toBe('750 mL');

  });

  it('keeps an edited entry in its original position', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(1, 'cup'));
      await water.addEntry(entryOf(2, 'cup'));
      await water.addEntry(entryOf(3, 'cup'));
    });
    const middleId = water.entries[1].id;

    await act(async () => {
      await water.updateEntry(middleId, { amountMl: 4000, enteredAmount: 4, enteredUnit: 'l' });
    });

    expect(water.entries[1].id).toBe(middleId);
    expect(water.entries.map((e) => e.enteredAmount)).toEqual([1, 4, 3]);

  });
});

describe('delete and undo', () => {
  it('removes, updates the total, then restores the exact entry to its position', async () => {
    const { repository, stored } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(8, 'floz'));
      await water.addEntry(entryOf(16, 'floz'));
      await water.addEntry(entryOf(24, 'floz'));
    });
    expect(today.totalLabel).toBe('48 fl oz');

    const removed = water.entries[1];
    const index = 1;

    await act(async () => {
      await water.removeEntry(removed.id);
    });

    expect(water.entries).toHaveLength(2);
    expect(today.totalLabel).toBe('32 fl oz');
    expect(stored.day(TODAY)).toHaveLength(2);

    await act(async () => {
      await water.restoreEntry(removed, index);
    });

    // Byte-identical, and back where it was — not appended to the end.
    expect(water.entries[1]).toEqual(removed);
    expect(water.entries.map((e) => e.id)).toEqual([
      water.entries[0].id,
      removed.id,
      water.entries[2].id,
    ]);
    expect(today.totalLabel).toBe('48 fl oz');

  });

  it('restores a first entry to the front, not the back', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(1, 'cup'));
      await water.addEntry(entryOf(2, 'cup'));
    });
    const first = water.entries[0];

    await act(async () => {
      await water.removeEntry(first.id);
      await water.restoreEntry(first, 0);
    });

    expect(water.entries.map((e) => e.enteredAmount)).toEqual([1, 2]);
  });

  it('emptying the day leaves an honest empty state', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(1, 'cup'));
    });
    await act(async () => {
      await water.removeEntry(water.entries[0].id);
    });

    expect(today.isEmpty).toBe(true);
    expect(today.totalMl).toBe(0);
    expect(stored.day(TODAY)).toHaveLength(0);

  });
});

describe('loading and failure', () => {
  it('hydrates a day that already had entries', async () => {
    const existing = createWaterEntry({ amount: 16, unit: 'floz', logDate: TODAY });
    const { repository } = fakeRepository({
      entries: { [TODAY]: [existing] },
      goal: { amount: 64, unit: 'floz' },
      preferences: { unit: 'floz' },
    });
    await mount(repository);

    expect(today.isLoading).toBe(false);
    expect(water.entries).toEqual([existing]);
    expect(today.totalLabel).toBe('16 fl oz');
    expect(water.goal).toEqual({ amount: 64, unit: 'floz' });

  });

  it('surfaces a load failure instead of showing a silently empty day', async () => {
    const { repository } = fakeRepository();
    const failing: WaterRepository = {
      ...repository,
      async getEntries() {
        throw new Error('storage unavailable');
      },
    };
    await mount(failing);

    expect(today.error).toBe("We couldn't load your water log.");
    expect(today.isLoading).toBe(false);

  });

  it('keeps the optimistic value on a save failure and says it may not persist', async () => {
    const { repository } = fakeRepository();
    const failing: WaterRepository = {
      ...repository,
      async saveEntries() {
        throw new Error('disk full');
      },
    };
    await mount(failing);

    await act(async () => {
      await water.addEntry(entryOf(16, 'floz'));
    });

    // Reverting would throw away what the user just did; the message is what
    // tells them it isn't saved.
    expect(water.entries).toHaveLength(1);
    expect(today.error).toBe("We couldn't save that. Your water log may not persist.");

  });
});

/**
 * What Home reads.
 *
 * Home derives its Water tile and its Water goal pillar from exactly these
 * three fields — `totalLabel`, `progress`, and `isGoalMet`. Asserting them
 * here covers the integration at the read-model level without standing up a
 * component-testing stack for the Dashboard.
 */
describe('the values Home consumes', () => {
  it('an empty day reads as zero in the preferred unit, not as a blank', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    expect(today.totalLabel).toBe('0 fl oz');
    expect(today.progress).toBe(0);
    expect(today.isGoalMet).toBe(false);

  });

  it('a logged day reads in the user’s preferred unit', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'l' } });
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(500, 'ml'));
      await water.addEntry(entryOf(750, 'ml'));
    });

    expect(today.totalLabel).toBe('1.25 L');
  });

  /**
   * The old fixture marked Water complete for every user forever. Without a
   * goal there is nothing to complete — and equally, nothing the user has
   * failed. `isGoalMet` is false, so Home shows the pillar incomplete without
   * inventing a target.
   */
  it('is never complete when no goal has been set, however much is logged', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.addEntry(entryOf(200, 'floz'));
    });

    expect(today.hasGoal).toBe(false);
    expect(today.isGoalMet).toBe(false);
    // And no progress is fabricated for the tile's accent bar.
    expect(today.progress).toBe(0);

  });

  it('is incomplete while the goal is unmet', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.setGoal(createWaterGoal(64, 'floz'));
      await water.addEntry(entryOf(63, 'floz'));
    });

    expect(today.isGoalMet).toBe(false);
    expect(today.progress).toBeCloseTo(63 / 64, 6);

  });

  it('is complete at exactly the goal', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.setGoal(createWaterGoal(64, 'floz'));
      await water.addEntry(entryOf(64, 'floz'));
    });

    expect(today.isGoalMet).toBe(true);
    expect(today.progress).toBe(1);

  });

  it('is complete past the goal, with the bar clamped', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.setGoal(createWaterGoal(64, 'floz'));
      await water.addEntry(entryOf(100, 'floz'));
    });

    expect(today.isGoalMet).toBe(true);
    expect(today.progress).toBe(1);
    expect(today.percent).toBe(156);

  });

  it('counts the goal as met across mixed authored units', async () => {
    const { repository } = fakeRepository({ preferences: { unit: 'floz' } });
    await mount(repository);

    await act(async () => {
      await water.setGoal(createWaterGoal(1, 'l'));
      await water.addEntry(entryOf(500, 'ml'));
      await water.addEntry(entryOf(17, 'floz')); // ~502.75 mL, tipping past 1 L
    });

    expect(today.isGoalMet).toBe(true);
  });
});

describe('the recent-days window Home and Water share', () => {
  it('loads previous days and excludes today from history', async () => {
    const yesterday = shiftLogDate(TODAY, -1);
    const { repository } = fakeRepository({
      entries: {
        [TODAY]: [createWaterEntry({ amount: 8, unit: 'floz', logDate: TODAY })],
        [yesterday]: [createWaterEntry({ amount: 16, unit: 'floz', logDate: yesterday })],
      },
    });
    await mount(repository);

    // Today is derived live from `entries`, so carrying it in history too
    // would be a second copy that can disagree with the first.
    expect(water.history.some((day) => day.logDate === TODAY)).toBe(false);
    expect(water.history.find((day) => day.logDate === yesterday)?.totalMl).toBeCloseTo(
      toMl(16, 'floz'),
      9,
    );

  });
});
