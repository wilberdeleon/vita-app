/**
 * Entry construction. Small, but it is the only place both representations
 * of an amount are written, and getting them out of step would mean history
 * that disagrees with the totals computed from it.
 */

import { toLogDate } from '../../daily/dates';
import { createWaterEntry, waterAmountChanges } from '../model/entries';
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
    expect(entry.logDate).toBe(toLogDate(AT));
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

  /**
   * Caught by this suite when the date rolled over mid-sprint: `logDate` used
   * to default to *today* rather than to the day of the entry's own
   * `loggedAt`, so an entry could carry a calendar day that contradicted its
   * timestamp. Identical behaviour for a drink logged now — which is every
   * drink the app logs — and coherent for every other call.
   */
  it('always agrees with its own timestamp, whatever day the test runs on', () => {
    const instants = [
      new Date(2020, 0, 1, 0, 0, 0),
      new Date(2024, 1, 29, 12, 0, 0),
      new Date(2026, 7, 22, 23, 45, 0),
      new Date(2030, 11, 31, 23, 59, 59),
      new Date(),
    ];
    for (const at of instants) {
      const entry = createWaterEntry({ amount: 1, unit: 'cup', loggedAt: at });
      expect(entry.logDate).toBe(toLogDate(at));
    }
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

describe('waterAmountChanges', () => {
  it('recomputes the canonical amount alongside the authored pair', () => {
    expect(waterAmountChanges(500, 'ml')).toEqual({
      amountMl: 500,
      enteredAmount: 500,
      enteredUnit: 'ml',
    });
  });

  it('converts when the unit changes', () => {
    const changes = waterAmountChanges(16, 'floz');
    expect(changes.amountMl).toBeCloseTo(toMl(16, 'floz'), 9);
    expect(changes.enteredUnit).toBe('floz');
  });

  /**
   * The failure this shape exists to prevent: an entry whose canonical value
   * says one thing while its label says another. Every total built on it would
   * be wrong while looking right.
   */
  it('never returns a canonical amount that contradicts its own label', () => {
    for (const [amount, unit] of [
      [1, 'cup'],
      [0.5, 'l'],
      [24, 'floz'],
      [250, 'ml'],
    ] as const) {
      const changes = waterAmountChanges(amount, unit);
      expect(changes.amountMl).toBeCloseTo(toMl(changes.enteredAmount, changes.enteredUnit), 9);
    }
  });

  it('does not offer to change id, logDate, or loggedAt', () => {
    // Editing how much you drank does not make it a different drink at a
    // different time. The returned object is the whole editable surface.
    expect(Object.keys(waterAmountChanges(1, 'cup')).sort()).toEqual([
      'amountMl',
      'enteredAmount',
      'enteredUnit',
    ]);
  });

  it('refuses an amount that is not a drink', () => {
    for (const amount of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => waterAmountChanges(amount, 'floz')).toThrow();
    }
  });
});
