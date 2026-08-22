/**
 * Entry construction. Small, but it is the only place both representations
 * of an amount are written, and getting them out of step would mean history
 * that disagrees with the totals computed from it.
 */

import { createWaterEntry } from '../model/entries';
import { toMl } from '../model/units';

const AT = new Date(2026, 7, 22, 14, 30, 0);

describe('createWaterEntry', () => {
  it('writes both representations of the amount', () => {
    const entry = createWaterEntry({ amount: 16, unit: 'floz', logDate: '2026-08-22', loggedAt: AT });

    expect(entry.enteredAmount).toBe(16);
    expect(entry.enteredUnit).toBe('floz');
    expect(entry.amountMl).toBeCloseTo(toMl(16, 'floz'), 9);
  });

  it('keeps the authored unit even when it is already canonical', () => {
    const entry = createWaterEntry({ amount: 500, unit: 'ml', loggedAt: AT });
    expect(entry.amountMl).toBe(500);
    expect(entry.enteredUnit).toBe('ml');
  });

  it('derives the log date from the local calendar day', () => {
    const entry = createWaterEntry({ amount: 1, unit: 'cup', loggedAt: AT });
    expect(entry.logDate).toBe('2026-08-22');
  });

  it('files a late-night drink under the local day, not the UTC one', () => {
    // 11:45pm local. In any timezone east of UTC this instant is already
    // tomorrow in UTC, and the user still means today.
    const lateNight = new Date(2026, 7, 22, 23, 45, 0);
    expect(createWaterEntry({ amount: 1, unit: 'cup', loggedAt: lateNight }).logDate).toBe('2026-08-22');
  });

  it('accepts an explicit log date for logging onto another day', () => {
    const entry = createWaterEntry({ amount: 1, unit: 'cup', logDate: '2026-08-20', loggedAt: AT });
    expect(entry.logDate).toBe('2026-08-20');
  });

  it('records a real ISO instant, separate from the calendar day', () => {
    const entry = createWaterEntry({ amount: 1, unit: 'cup', loggedAt: AT });
    expect(entry.loggedAt).toBe(AT.toISOString());
    expect(new Date(entry.loggedAt).getTime()).toBe(AT.getTime());
  });

  it('gives every entry a distinct water-prefixed id', () => {
    const ids = new Set(
      Array.from({ length: 200 }, () => createWaterEntry({ amount: 1, unit: 'cup' }).id),
    );
    expect(ids.size).toBe(200);
    for (const id of ids) expect(id.startsWith('water_')).toBe(true);
  });

  it('refuses to build an entry from an amount that is not a drink', () => {
    for (const amount of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => createWaterEntry({ amount, unit: 'floz' })).toThrow();
    }
  });
});
