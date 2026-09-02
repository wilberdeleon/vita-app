/**
 * The goal factory.
 *
 * Short, and most of what it asserts is what the file does *not* do: there is
 * no default, no suggestion, and no rounding. VITA stores the number the user
 * chose, and these tests are what keep a "sensible default" from being added
 * later by someone who means well.
 */

import { goalMl } from '../model/totals';
import { createWaterGoal } from '../model/goals';
import { VOLUME_UNITS } from '../model/types';
import { toMl } from '../model/units';

describe('createWaterGoal', () => {
  it('stores exactly what the user authored', () => {
    expect(createWaterGoal(64, 'floz')).toEqual({ amount: 64, unit: 'floz' });
    expect(createWaterGoal(8, 'cup')).toEqual({ amount: 8, unit: 'cup' });
    expect(createWaterGoal(2, 'l')).toEqual({ amount: 2, unit: 'l' });
  });

  it('does not round the authored amount', () => {
    // 2.4 L is a goal someone could reasonably set; storing 2 would be VITA
    // quietly changing their target.
    expect(createWaterGoal(2.4, 'l').amount).toBe(2.4);
    expect(createWaterGoal(16.9, 'floz').amount).toBe(16.9);
  });

  it('round-trips to canonical millilitres without drift', () => {
    for (const unit of VOLUME_UNITS) {
      const goal = createWaterGoal(3, unit);
      expect(goalMl(goal)).toBeCloseTo(toMl(3, unit), 9);
    }
  });

  it('rejects an amount that is not a real target', () => {
    for (const amount of [0, -1, -0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => createWaterGoal(amount, 'floz')).toThrow();
    }
  });

  it('accepts a small but real goal', () => {
    // Not VITA's business to decide this is too little.
    expect(createWaterGoal(0.5, 'cup')).toEqual({ amount: 0.5, unit: 'cup' });
  });
});
