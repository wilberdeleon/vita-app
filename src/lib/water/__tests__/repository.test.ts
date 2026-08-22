/**
 * The persistence boundary, exercised against a real AsyncStorage mock.
 *
 * Two things are being proven. First, the ordinary path: what is saved comes
 * back, days stay separate, and a restart is just another read. Second — and
 * this is most of the file — that a corrupted store degrades to *less* data
 * rather than to *wrong* data. Every malformed-record case below asserts the
 * record is dropped and the healthy ones around it survive.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { dayKey } from '../../daily/keys';
import { asyncStorageWaterRepository as repo } from '../data/asyncStorageRepository';
import { WATER_DOMAIN, WaterKeys } from '../data/keys';
import { createWaterEntry } from '../model/entries';
import type { WaterEntry } from '../model/types';

const TODAY = '2026-08-22';
const YESTERDAY = '2026-08-21';

const entry = (overrides: Partial<WaterEntry> = {}): WaterEntry => ({
  id: 'water_1',
  logDate: TODAY,
  loggedAt: '2026-08-22T10:00:00.000Z',
  amountMl: 500,
  enteredAmount: 500,
  enteredUnit: 'ml',
  ...overrides,
});

/** Writes a raw payload under a day key, bypassing the repository. */
async function putRaw(logDate: string, payload: unknown): Promise<void> {
  await AsyncStorage.setItem(dayKey(WATER_DOMAIN, logDate), JSON.stringify(payload));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('storage keys', () => {
  it('are namespaced under vita:v1 and isolated to water', () => {
    expect(dayKey(WATER_DOMAIN, TODAY)).toBe('vita:v1:water:log:2026-08-22');
    expect(WaterKeys.goal).toBe('vita:v1:water:goal');
    expect(WaterKeys.preferences).toBe('vita:v1:water:prefs');
  });

  it('cannot collide with the nutrition food log', () => {
    expect(dayKey(WATER_DOMAIN, TODAY)).not.toBe(`vita:v1:foodlog:${TODAY}`);
  });
});

describe('entries — round trip', () => {
  it('returns an empty day before anything is logged', async () => {
    expect(await repo.getEntries(TODAY)).toEqual([]);
  });

  it('saves and reads back an entry unchanged', async () => {
    const saved = entry();
    await repo.saveEntries(TODAY, [saved]);
    expect(await repo.getEntries(TODAY)).toEqual([saved]);
  });

  it('preserves the authored pair, not just the canonical amount', async () => {
    const logged = createWaterEntry({
      amount: 16,
      unit: 'floz',
      logDate: TODAY,
      loggedAt: new Date('2026-08-22T10:00:00.000Z'),
    });
    await repo.saveEntries(TODAY, [logged]);

    const [read] = await repo.getEntries(TODAY);
    expect(read.enteredAmount).toBe(16);
    expect(read.enteredUnit).toBe('floz');
    expect(read.amountMl).toBeCloseTo(473.176, 3);
  });

  it('survives a "restart" — a fresh read with no in-memory state', async () => {
    await repo.saveEntries(TODAY, [entry({ id: 'a' }), entry({ id: 'b' })]);
    // Nothing is cached in the repository; a second read is what relaunching
    // the app does.
    const reread = await repo.getEntries(TODAY);
    expect(reread.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('replaces the day wholesale rather than appending', async () => {
    await repo.saveEntries(TODAY, [entry({ id: 'a' })]);
    await repo.saveEntries(TODAY, [entry({ id: 'b' })]);
    expect((await repo.getEntries(TODAY)).map((e) => e.id)).toEqual(['b']);
  });

  it('removes the key when a day is emptied, leaving no residue', async () => {
    await repo.saveEntries(TODAY, [entry()]);
    await repo.saveEntries(TODAY, []);
    expect(await repo.getEntries(TODAY)).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).not.toContain(dayKey(WATER_DOMAIN, TODAY));
  });
});

describe('entries — date isolation', () => {
  it('keeps days independent', async () => {
    await repo.saveEntries(YESTERDAY, [entry({ id: 'y', logDate: YESTERDAY })]);
    await repo.saveEntries(TODAY, [entry({ id: 't' })]);

    expect((await repo.getEntries(YESTERDAY)).map((e) => e.id)).toEqual(['y']);
    expect((await repo.getEntries(TODAY)).map((e) => e.id)).toEqual(['t']);
  });

  it('leaves yesterday intact when today is written', async () => {
    await repo.saveEntries(YESTERDAY, [entry({ id: 'y', logDate: YESTERDAY })]);
    await repo.saveEntries(TODAY, [entry({ id: 't' })]);
    await repo.saveEntries(TODAY, [entry({ id: 't' }), entry({ id: 't2' })]);

    expect((await repo.getEntries(YESTERDAY)).map((e) => e.id)).toEqual(['y']);
  });

  it('reports a future day as empty rather than borrowing today', async () => {
    await repo.saveEntries(TODAY, [entry()]);
    expect(await repo.getEntries('2026-08-23')).toEqual([]);
  });

  it('rejects an entry whose own logDate contradicts the key it was stored under', async () => {
    // The double-count bug this prevents: the stale record would be counted
    // today *and* again the moment its real day is opened.
    await putRaw(TODAY, [entry({ id: 'ok' }), entry({ id: 'stale', logDate: YESTERDAY })]);
    expect((await repo.getEntries(TODAY)).map((e) => e.id)).toEqual(['ok']);
  });
});

describe('entries — read-time validation', () => {
  it('treats unparseable JSON as an empty day rather than crashing', async () => {
    await AsyncStorage.setItem(dayKey(WATER_DOMAIN, TODAY), '{ not json at all');
    expect(await repo.getEntries(TODAY)).toEqual([]);
  });

  it('treats a non-array payload as an empty day', async () => {
    await putRaw(TODAY, { amountMl: 500 });
    expect(await repo.getEntries(TODAY)).toEqual([]);
    await putRaw(TODAY, 'a string');
    expect(await repo.getEntries(TODAY)).toEqual([]);
    await putRaw(TODAY, 42);
    expect(await repo.getEntries(TODAY)).toEqual([]);
  });

  it('drops malformed records and keeps the healthy ones', async () => {
    await putRaw(TODAY, [
      entry({ id: 'good-1' }),
      null,
      'not a record',
      [],
      { id: 'no-amount', logDate: TODAY, loggedAt: '2026-08-22T10:00:00.000Z' },
      entry({ id: 'good-2' }),
    ]);
    expect((await repo.getEntries(TODAY)).map((e) => e.id)).toEqual(['good-1', 'good-2']);
  });

  it('rejects NaN and Infinity amounts, which would poison the whole total', async () => {
    // JSON cannot hold NaN, so corruption arrives as null or a string —
    // both of which must be rejected just as firmly.
    await putRaw(TODAY, [
      entry({ id: 'good' }),
      { ...entry({ id: 'nan' }), amountMl: null },
      { ...entry({ id: 'str' }), amountMl: '500' },
      { ...entry({ id: 'inf' }), amountMl: 1e999 },
    ]);
    const entries = await repo.getEntries(TODAY);
    expect(entries.map((e) => e.id)).toEqual(['good']);
    expect(Number.isFinite(entries.reduce((sum, e) => sum + e.amountMl, 0))).toBe(true);
  });

  it('rejects zero and negative amounts — neither is a drink', async () => {
    await putRaw(TODAY, [
      { ...entry({ id: 'zero' }), amountMl: 0 },
      { ...entry({ id: 'negative' }), amountMl: -250 },
      entry({ id: 'good' }),
    ]);
    expect((await repo.getEntries(TODAY)).map((e) => e.id)).toEqual(['good']);
  });

  it('rejects a missing or unusable authored pair', async () => {
    await putRaw(TODAY, [
      { ...entry({ id: 'no-entered-amount' }), enteredAmount: undefined },
      { ...entry({ id: 'no-entered-unit' }), enteredUnit: undefined },
      { ...entry({ id: 'bad-unit' }), enteredUnit: 'gallons' },
      { ...entry({ id: 'proto-unit' }), enteredUnit: 'toString' },
      entry({ id: 'good' }),
    ]);
    expect((await repo.getEntries(TODAY)).map((e) => e.id)).toEqual(['good']);
  });

  it('rejects a record with no id or no timestamp', async () => {
    await putRaw(TODAY, [
      { ...entry({ id: '' }) },
      { ...entry({ id: 'no-time' }), loggedAt: '' },
      entry({ id: 'good' }),
    ]);
    expect((await repo.getEntries(TODAY)).map((e) => e.id)).toEqual(['good']);
  });

  it('rejects an impossible calendar date, now that LogDate validation is hardened', async () => {
    await putRaw('2026-02-29', [entry({ id: 'impossible', logDate: '2026-02-29' })]);
    expect(await repo.getEntries('2026-02-29')).toEqual([]);
  });

  it('does not rewrite storage to "fix" what it read', async () => {
    const corrupt = [entry({ id: 'good' }), { ...entry({ id: 'bad' }), amountMl: -1 }];
    await putRaw(TODAY, corrupt);
    await repo.getEntries(TODAY);

    // Reading is not a repair operation. The bad record is still on disk,
    // untouched, until the day is saved again for a real reason.
    const raw = JSON.parse((await AsyncStorage.getItem(dayKey(WATER_DOMAIN, TODAY))) ?? 'null');
    expect(raw).toHaveLength(2);
  });
});

describe('goal', () => {
  it('is null before the user sets one — never a default VITA invented', async () => {
    expect(await repo.getGoal()).toBeNull();
  });

  it('round-trips the authored pair exactly', async () => {
    await repo.saveGoal({ amount: 8, unit: 'cup' });
    // Not 1892.7 mL converted back into a lossy 8.0000001.
    expect(await repo.getGoal()).toEqual({ amount: 8, unit: 'cup' });
  });

  it('falls back to null on a malformed goal instead of guessing', async () => {
    for (const bad of [
      { amount: 'lots', unit: 'floz' },
      { amount: 64 },
      { unit: 'floz' },
      { amount: 0, unit: 'floz' },
      { amount: -64, unit: 'floz' },
      { amount: 64, unit: 'gallons' },
      'not an object',
      [],
      null,
    ]) {
      await AsyncStorage.setItem(WaterKeys.goal, JSON.stringify(bad));
      expect(await repo.getGoal()).toBeNull();
    }
  });

  it('falls back to null on unparseable JSON', async () => {
    await AsyncStorage.setItem(WaterKeys.goal, '{{{');
    expect(await repo.getGoal()).toBeNull();
  });
});

describe('preferences', () => {
  it('are null before the user expresses one, so callers apply the default', async () => {
    expect(await repo.getPreferences()).toBeNull();
  });

  it('round-trip', async () => {
    await repo.savePreferences({ unit: 'ml' });
    expect(await repo.getPreferences()).toEqual({ unit: 'ml' });
  });

  it('fall back to null when malformed', async () => {
    for (const bad of [{ unit: 'gallons' }, { unit: 4 }, {}, 'ml', null]) {
      await AsyncStorage.setItem(WaterKeys.preferences, JSON.stringify(bad));
      expect(await repo.getPreferences()).toBeNull();
    }
  });
});

describe('getRecentDays', () => {
  it('returns written days newest first', async () => {
    await repo.saveEntries('2026-08-20', [entry({ id: 'a', logDate: '2026-08-20' })]);
    await repo.saveEntries('2026-08-22', [entry({ id: 'b', logDate: '2026-08-22' })]);
    await repo.saveEntries('2026-08-21', [entry({ id: 'c', logDate: '2026-08-21' })]);

    const days = await repo.getRecentDays(7);
    expect(days.map((d) => d.logDate)).toEqual(['2026-08-22', '2026-08-21', '2026-08-20']);
    expect(days[0].entries.map((e) => e.id)).toEqual(['b']);
  });

  it('skips days with nothing in them', async () => {
    await repo.saveEntries('2026-08-22', [entry({ id: 'a' })]);
    await repo.saveEntries('2026-08-18', [entry({ id: 'b', logDate: '2026-08-18' })]);
    expect((await repo.getRecentDays(7)).map((d) => d.logDate)).toEqual(['2026-08-22', '2026-08-18']);
  });

  it('ignores the nutrition food log entirely', async () => {
    await AsyncStorage.setItem(`vita:v1:foodlog:${TODAY}`, JSON.stringify([{ id: 'food' }]));
    await repo.saveEntries(TODAY, [entry()]);

    const days = await repo.getRecentDays(7);
    expect(days).toHaveLength(1);
    expect(days[0].entries.map((e) => e.id)).toEqual(['water_1']);
  });
});
