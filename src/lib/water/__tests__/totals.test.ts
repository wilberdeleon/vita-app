/**
 * Daily arithmetic, with the emphasis on the states that break naive code:
 * an empty day, no goal set, and a total past the goal.
 *
 * The governing rule is that **nothing here may return `NaN` or `Infinity`**.
 * A hydration screen showing "NaN mL" is a bug the user reports; a progress
 * bar quietly fed `Infinity` is one they never see and never trust again.
 */

import {
  goalMl,
  isGoalMet,
  overMl,
  percent,
  progress,
  ratio,
  remainingMl,
  sortByLoggedAt,
  totalMl,
} from '../model/totals';
import type { WaterEntry, WaterGoal } from '../model/types';
import { toMl } from '../model/units';

const entry = (id: string, amountMl: number, loggedAt = '2026-08-22T10:00:00.000Z'): WaterEntry => ({
  id,
  logDate: '2026-08-22',
  loggedAt,
  amountMl,
  enteredAmount: amountMl,
  enteredUnit: 'ml',
});

describe('totalMl', () => {
  it('is zero for an empty day', () => {
    expect(totalMl([])).toBe(0);
  });

  it('sums every entry', () => {
    expect(totalMl([entry('a', 250), entry('b', 500), entry('c', 250)])).toBe(1000);
  });

  it('sums fractional millilitres from converted units', () => {
    const entries = [entry('a', toMl(8, 'floz')), entry('b', toMl(8, 'floz'))];
    expect(totalMl(entries)).toBeCloseTo(toMl(16, 'floz'), 9);
  });
});

describe('goalMl', () => {
  it('is null when no goal is set', () => {
    expect(goalMl(null)).toBeNull();
  });

  it('derives millilitres from the authored pair', () => {
    expect(goalMl({ amount: 2, unit: 'l' })).toBe(2000);
    expect(goalMl({ amount: 64, unit: 'floz' })).toBeCloseTo(1892.706, 3);
  });

  it('treats a non-positive or non-finite goal as no goal at all', () => {
    // Progress toward zero is worse than no progress shown.
    for (const goal of [
      { amount: 0, unit: 'ml' },
      { amount: -5, unit: 'floz' },
      { amount: Number.NaN, unit: 'ml' },
      { amount: Number.POSITIVE_INFINITY, unit: 'ml' },
    ] as WaterGoal[]) {
      expect(goalMl(goal)).toBeNull();
    }
  });
});

describe('ratio', () => {
  it('is null without a goal', () => {
    expect(ratio(500, null)).toBeNull();
  });

  it('is null rather than Infinity for a zero or negative goal', () => {
    expect(ratio(500, 0)).toBeNull();
    expect(ratio(500, -100)).toBeNull();
  });

  it('is unclamped, so an over-goal day tells the truth', () => {
    expect(ratio(2000, 1000)).toBe(2);
  });
});

describe('progress', () => {
  it('is zero on an empty day', () => {
    expect(progress(0, 2000)).toBe(0);
  });

  it('is zero without a goal — an empty track reads as "no target set"', () => {
    expect(progress(500, null)).toBe(0);
  });

  it('clamps to 1 so a bar never overflows its track', () => {
    expect(progress(3000, 2000)).toBe(1);
    expect(progress(2000, 2000)).toBe(1);
  });

  it('is proportional in between', () => {
    expect(progress(500, 2000)).toBe(0.25);
    expect(progress(1500, 2000)).toBe(0.75);
  });

  it('never produces NaN or Infinity for any combination', () => {
    const totals = [0, 1, 500, 1e9];
    const goals = [null, 0, -1, 1, 2000];
    for (const total of totals) {
      for (const goal of goals) {
        const value = progress(total, goal);
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('percent', () => {
  it('is null without a goal', () => {
    expect(percent(500, null)).toBeNull();
  });

  it('is unclamped, so 118% is allowed to say 118%', () => {
    expect(percent(2360, 2000)).toBe(118);
  });

  it('rounds to a whole number', () => {
    expect(percent(667, 2000)).toBe(33);
  });
});

describe('remainingMl', () => {
  it('is null without a goal', () => {
    expect(remainingMl(500, null)).toBeNull();
  });

  it('is the whole goal on an empty day', () => {
    expect(remainingMl(0, 2000)).toBe(2000);
  });

  it('never goes negative once the goal is passed', () => {
    expect(remainingMl(2500, 2000)).toBe(0);
  });
});

describe('overMl', () => {
  it('is null without a goal', () => {
    expect(overMl(500, null)).toBeNull();
  });

  it('is zero while still under the goal', () => {
    expect(overMl(500, 2000)).toBe(0);
    expect(overMl(2000, 2000)).toBe(0);
  });

  it('is the excess once past it', () => {
    expect(overMl(2500, 2000)).toBe(500);
  });
});

describe('isGoalMet', () => {
  it('is false without a goal — there is nothing to meet', () => {
    expect(isGoalMet(5000, null)).toBe(false);
  });

  it('is true at exactly the goal and beyond', () => {
    expect(isGoalMet(2000, 2000)).toBe(true);
    expect(isGoalMet(2001, 2000)).toBe(true);
  });

  it('is false below it, including an empty day', () => {
    expect(isGoalMet(1999, 2000)).toBe(false);
    expect(isGoalMet(0, 2000)).toBe(false);
  });
});

describe('sortByLoggedAt', () => {
  it('puts the newest drink first', () => {
    const sorted = sortByLoggedAt([
      entry('morning', 250, '2026-08-22T08:00:00.000Z'),
      entry('evening', 250, '2026-08-22T20:00:00.000Z'),
      entry('noon', 250, '2026-08-22T12:00:00.000Z'),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(['evening', 'noon', 'morning']);
  });

  it('breaks ties by id so the order is stable, not arbitrary', () => {
    const same = '2026-08-22T08:00:00.000Z';
    const sorted = sortByLoggedAt([entry('a', 250, same), entry('b', 250, same)]);
    expect(sorted.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('does not mutate the array it was given', () => {
    const entries = [
      entry('a', 250, '2026-08-22T08:00:00.000Z'),
      entry('b', 250, '2026-08-22T20:00:00.000Z'),
    ];
    sortByLoggedAt(entries);
    expect(entries.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('handles an empty day', () => {
    expect(sortByLoggedAt([])).toEqual([]);
  });
});
