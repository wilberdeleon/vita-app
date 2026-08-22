/**
 * The day-keyed store is where a mistake costs a user their history, so it is
 * exercised against a real AsyncStorage mock rather than asserted about.
 *
 * The parser is the store's only opinion about what a record is, so most of
 * what is checked here is that the store honors it: dropped records stay
 * dropped, and a record that claims a different day than its key never counts
 * toward that key's day.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDayKeyedStore, type RecordParser } from '../dayStore';
import type { LogDate } from '../dates';
import { dayKey } from '../keys';

type Sip = { id: string; logDate: LogDate; amountMl: number };

/** Mirrors how a real repository validates: shape first, then day agreement. */
const parseSip: RecordParser<Sip> = (value, logDate) => {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || candidate.id.length === 0) return null;
  if (typeof candidate.amountMl !== 'number' || !Number.isFinite(candidate.amountMl)) return null;
  if (candidate.logDate !== logDate) return null;
  return { id: candidate.id, logDate, amountMl: candidate.amountMl };
};

const store = createDayKeyedStore<Sip>('watertest', parseSip);

const sip = (id: string, logDate: LogDate, amountMl: number): Sip => ({ id, logDate, amountMl });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('getDay', () => {
  it('returns an empty array for a day that was never written', async () => {
    expect(await store.getDay('2026-08-22')).toEqual([]);
  });

  it('returns what was saved, in order', async () => {
    const records = [sip('a', '2026-08-22', 250), sip('b', '2026-08-22', 500)];
    await store.saveDay('2026-08-22', records);
    expect(await store.getDay('2026-08-22')).toEqual(records);
  });

  it('drops records the parser rejects and keeps the rest', async () => {
    await AsyncStorage.setItem(
      dayKey('watertest', '2026-08-22'),
      JSON.stringify([
        sip('a', '2026-08-22', 250),
        { id: 'b', logDate: '2026-08-22', amountMl: Number.NaN },
        { id: '', logDate: '2026-08-22', amountMl: 100 },
        null,
        'not a record',
        sip('c', '2026-08-22', 750),
      ]),
    );

    const records = await store.getDay('2026-08-22');
    expect(records.map((record) => record.id)).toEqual(['a', 'c']);
  });

  it('lets the parser reject a record whose own day contradicts its key', async () => {
    await AsyncStorage.setItem(
      dayKey('watertest', '2026-08-22'),
      JSON.stringify([sip('a', '2026-08-22', 250), sip('stale', '2026-08-21', 500)]),
    );

    const records = await store.getDay('2026-08-22');
    expect(records.map((record) => record.id)).toEqual(['a']);
  });

  it('treats unparseable JSON as an empty day rather than throwing', async () => {
    await AsyncStorage.setItem(dayKey('watertest', '2026-08-22'), '{ not json');
    expect(await store.getDay('2026-08-22')).toEqual([]);
  });

  it('treats a stored non-array as an empty day', async () => {
    await AsyncStorage.setItem(dayKey('watertest', '2026-08-22'), JSON.stringify({ amountMl: 250 }));
    expect(await store.getDay('2026-08-22')).toEqual([]);
  });
});

describe('saveDay', () => {
  it('replaces the day wholesale', async () => {
    await store.saveDay('2026-08-22', [sip('a', '2026-08-22', 250)]);
    await store.saveDay('2026-08-22', [sip('b', '2026-08-22', 500)]);

    const records = await store.getDay('2026-08-22');
    expect(records.map((record) => record.id)).toEqual(['b']);
  });

  it('removes the key entirely when a day is cleared, leaving no residue', async () => {
    await store.saveDay('2026-08-22', [sip('a', '2026-08-22', 250)]);
    await store.saveDay('2026-08-22', []);

    expect(await store.getDay('2026-08-22')).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).not.toContain(dayKey('watertest', '2026-08-22'));
  });

  it('keeps days independent of one another', async () => {
    await store.saveDay('2026-08-21', [sip('yesterday', '2026-08-21', 250)]);
    await store.saveDay('2026-08-22', [sip('today', '2026-08-22', 500)]);

    expect((await store.getDay('2026-08-21')).map((r) => r.id)).toEqual(['yesterday']);
    expect((await store.getDay('2026-08-22')).map((r) => r.id)).toEqual(['today']);
  });
});

describe('getRecentDays', () => {
  it('returns written days newest first', async () => {
    await store.saveDay('2026-08-20', [sip('a', '2026-08-20', 100)]);
    await store.saveDay('2026-08-22', [sip('b', '2026-08-22', 200)]);
    await store.saveDay('2026-08-21', [sip('c', '2026-08-21', 300)]);

    const days = await store.getRecentDays(10);
    expect(days.map((day) => day.logDate)).toEqual(['2026-08-22', '2026-08-21', '2026-08-20']);
  });

  it('skips gaps instead of returning empty days for them', async () => {
    await store.saveDay('2026-08-22', [sip('a', '2026-08-22', 100)]);
    await store.saveDay('2026-08-19', [sip('b', '2026-08-19', 200)]);

    const days = await store.getRecentDays(10);
    expect(days.map((day) => day.logDate)).toEqual(['2026-08-22', '2026-08-19']);
  });

  it('honors maxDays, counting days rather than records', async () => {
    for (const day of ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21']) {
      await store.saveDay(day, [sip(`a-${day}`, day, 100), sip(`b-${day}`, day, 200)]);
    }

    const days = await store.getRecentDays(2);
    expect(days.map((day) => day.logDate)).toEqual(['2026-08-21', '2026-08-20']);
  });

  it('returns nothing for a non-positive maxDays', async () => {
    await store.saveDay('2026-08-22', [sip('a', '2026-08-22', 100)]);
    expect(await store.getRecentDays(0)).toEqual([]);
    expect(await store.getRecentDays(-1)).toEqual([]);
  });

  it('ignores other domains and unrelated keys', async () => {
    await store.saveDay('2026-08-22', [sip('mine', '2026-08-22', 100)]);
    await AsyncStorage.setItem(dayKey('peptidestest', '2026-08-23'), JSON.stringify([{ id: 'theirs' }]));
    await AsyncStorage.setItem('vita:v1:targets', JSON.stringify({ calories: 2000 }));

    const days = await store.getRecentDays(10);
    expect(days.map((day) => day.logDate)).toEqual(['2026-08-22']);
  });

  it('ignores keys whose date segment is malformed', async () => {
    await store.saveDay('2026-08-22', [sip('good', '2026-08-22', 100)]);
    await AsyncStorage.setItem('vita:v1:watertest:log:not-a-date', JSON.stringify([{ id: 'bad' }]));

    const days = await store.getRecentDays(10);
    expect(days.map((day) => day.logDate)).toEqual(['2026-08-22']);
  });

  it('omits a day whose records all failed validation', async () => {
    await store.saveDay('2026-08-22', [sip('good', '2026-08-22', 100)]);
    await AsyncStorage.setItem(
      dayKey('watertest', '2026-08-21'),
      JSON.stringify([{ id: 'bad', logDate: '2026-08-21', amountMl: 'lots' }]),
    );

    const days = await store.getRecentDays(10);
    expect(days.map((day) => day.logDate)).toEqual(['2026-08-22']);
  });
});
