/**
 * The weight entry rules every later Journey slice depends on.
 */

import {
  MAX_FUTURE_SKEW_MS,
  addWeightEntry,
  isLoggableTime,
  createWeightEntry,
  latestEntry,
  removeWeightEntry,
  sortNewestFirst,
  updateWeightEntry,
} from '../model/entries';
import type { WeightEntry } from '../model/types';
import { toKg } from '../model/units';

const at = (iso: string) => new Date(iso);

function entry(id: string, loggedAt: string, weightKg: number): WeightEntry {
  return { id, loggedAt, weightKg, enteredUnit: 'kg' };
}

describe('createWeightEntry', () => {
  it('stores canonical kilograms, unrounded, and the unit typed', () => {
    const e = createWeightEntry({ weight: 180, unit: 'lb', loggedAt: at('2026-10-15T07:00:00.000Z') });
    expect(e.weightKg).toBe(180 * 0.45359237);
    expect(e.enteredUnit).toBe('lb');
    expect(e.loggedAt).toBe('2026-10-15T07:00:00.000Z');
    expect(e.id).toMatch(/^weight_/);
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])('refuses %p', (weight) => {
    expect(() => createWeightEntry({ weight, unit: 'kg' })).toThrow();
  });

  it('carries nothing but facts', () => {
    const e = createWeightEntry({ weight: 80, unit: 'kg' });
    expect(Object.keys(e).sort()).toEqual(['enteredUnit', 'id', 'loggedAt', 'weightKg']);
  });

  it('gives every entry its own id', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createWeightEntry({ weight: 80, unit: 'kg' }).id));
    expect(ids.size).toBe(200);
  });
});

describe('same-day weigh-ins', () => {
  it('are all kept — an add never replaces', () => {
    let entries: WeightEntry[] = [];
    entries = addWeightEntry(entries, createWeightEntry({ weight: 80.2, unit: 'kg', loggedAt: at('2026-10-15T06:00:00Z') }));
    entries = addWeightEntry(entries, createWeightEntry({ weight: 80.9, unit: 'kg', loggedAt: at('2026-10-15T20:00:00Z') }));
    entries = addWeightEntry(entries, createWeightEntry({ weight: 80.9, unit: 'kg', loggedAt: at('2026-10-15T20:00:00Z') }));
    expect(entries).toHaveLength(3);
    expect(new Set(entries.map((e) => e.id)).size).toBe(3);
  });
});

describe('ordering — newest first', () => {
  const a = entry('a', '2026-10-01T08:00:00.000Z', 80);
  const b = entry('b', '2026-10-08T08:00:00.000Z', 81);
  const c = entry('c', '2026-10-15T08:00:00.000Z', 82);

  it('sorts by absolute time, newest first', () => {
    expect(sortNewestFirst([a, c, b]).map((e) => e.id)).toEqual(['c', 'b', 'a']);
  });

  it('orders by the instant, not by how the string reads in another offset', () => {
    const early = entry('early', '2026-10-15T23:30:00-07:00', 80); // 06:30Z on the 16th
    const late = entry('late', '2026-10-16T05:00:00.000Z', 80);
    expect(sortNewestFirst([late, early]).map((e) => e.id)).toEqual(['early', 'late']);
  });

  it('places a new entry ahead of an existing one at the same instant', () => {
    const twin = entry('twin', c.loggedAt, 83);
    expect(addWeightEntry([c, b, a], twin).map((e) => e.id)).toEqual(['twin', 'c', 'b', 'a']);
  });

  it('keeps history newest first after adding an older reading', () => {
    const backfill = entry('old', '2026-09-01T08:00:00.000Z', 79);
    expect(addWeightEntry([c, b, a], backfill).map((e) => e.id)).toEqual(['c', 'b', 'a', 'old']);
  });
});

describe('current weight is derived', () => {
  const a = entry('a', '2026-10-01T08:00:00.000Z', 80);
  const b = entry('b', '2026-10-15T08:00:00.000Z', 81);

  it('is absent with no entries', () => {
    expect(latestEntry([])).toBeNull();
  });

  it('is the newest entry, regardless of array order', () => {
    expect(latestEntry([a, b])?.id).toBe('b');
    expect(latestEntry([b, a])?.id).toBe('b');
  });

  it('falls to the next newest when the newest is deleted — no repair step', () => {
    expect(latestEntry(removeWeightEntry([b, a], 'b'))?.id).toBe('a');
  });
});

describe('edit', () => {
  const a = entry('a', '2026-10-01T08:00:00.000Z', 80);
  const b = entry('b', '2026-10-15T08:00:00.000Z', 81);

  it('changes one entry and preserves its id', () => {
    const next = updateWeightEntry([b, a], 'a', { weight: { value: 176, unit: 'lb' } });
    const edited = next.find((e) => e.id === 'a')!;
    expect(edited.weightKg).toBe(toKg(176, 'lb'));
    expect(edited.enteredUnit).toBe('lb');
    expect(edited.loggedAt).toBe(a.loggedAt);
    expect(next.find((e) => e.id === 'b')).toEqual(b);
  });

  it('does not mutate the input', () => {
    const list = [b, a];
    updateWeightEntry(list, 'a', { weight: { value: 70, unit: 'kg' } });
    expect(list).toEqual([b, a]);
    expect(a.weightKg).toBe(80);
  });

  it('can correct the time, and re-sorts', () => {
    const next = updateWeightEntry([b, a], 'a', { loggedAt: at('2026-10-20T08:00:00.000Z') });
    expect(next.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('refuses an invalid weight', () => {
    expect(() => updateWeightEntry([a], 'a', { weight: { value: 0, unit: 'kg' } })).toThrow();
  });

  it('is a no-op for an unknown id', () => {
    expect(updateWeightEntry([b, a], 'nope', { weight: { value: 1, unit: 'kg' } })).toEqual([b, a]);
  });
});

describe('delete', () => {
  const a = entry('a', '2026-10-01T08:00:00.000Z', 80);
  const b = entry('b', '2026-10-15T08:00:00.000Z', 81);

  it('removes exactly one entry and leaves the rest untouched', () => {
    expect(removeWeightEntry([b, a], 'b')).toEqual([a]);
  });

  it('is a no-op for an unknown id', () => {
    expect(removeWeightEntry([b, a], 'nope')).toEqual([b, a]);
  });
});

describe('isLoggableTime (6.4)', () => {
  const now = new Date('2026-10-28T12:00:00.000Z');

  it('accepts the past and the present', () => {
    expect(isLoggableTime(new Date('2020-01-01T00:00:00Z'), now)).toBe(true);
    expect(isLoggableTime(now, now)).toBe(true);
  });

  it('tolerates a minute of clock skew, and no more', () => {
    expect(isLoggableTime(new Date(now.getTime() + MAX_FUTURE_SKEW_MS), now)).toBe(true);
    expect(isLoggableTime(new Date(now.getTime() + MAX_FUTURE_SKEW_MS + 1), now)).toBe(false);
    expect(isLoggableTime(new Date('2026-10-29T12:00:00Z'), now)).toBe(false);
  });

  it('refuses an invalid date', () => {
    expect(isLoggableTime(new Date('nonsense'), now)).toBe(false);
  });
});

