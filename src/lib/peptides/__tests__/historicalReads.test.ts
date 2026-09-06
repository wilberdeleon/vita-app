/**
 * The historical read layer added in slice 5.5B.
 *
 * The premise being protected: **the provider's sixty-day warm window was
 * always a loading decision, never a retention one.** Every day the user
 * recorded is still on disk — nothing prunes by age, and a day key is only
 * removed when its last record is cleared. These tests pin that, and pin that
 * the new reads are reads: bounded by their range, and incapable of writing,
 * migrating or touching a key.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStoragePeptideRepository as repository } from '../data/asyncStorageRepository';
import { toMcg, type PeptideLogEntry, type RoutineDayStatus } from '../index';
import type { LogDate } from '../../daily';

const CREATED = '2026-01-01T10:00:00.000Z';

function log(id: string, logDate: string): PeptideLogEntry {
  return {
    id,
    setupId: 'setup-1',
    definitionId: 'catalog:retatrutide',
    logDate: logDate as LogDate,
    loggedAt: `${logDate}T09:00:00.000Z`,
    // `parseLogEntry` requires the authored amount too — a stored log carries
    // what the user typed alongside the canonical micrograms.
    amount: { authoredAmount: 1, authoredUnit: 'mg', amountMcg: toMcg(1, 'mg') },
    createdAt: CREATED,
    updatedAt: CREATED,
  } as PeptideLogEntry;
}

function status(logDate: string, state: 'taken' | 'skipped'): RoutineDayStatus {
  return {
    id: `rds-${logDate}`,
    setupId: 'setup-1',
    logDate: logDate as LogDate,
    state,
    createdAt: CREATED,
    updatedAt: CREATED,
  };
}

/** Writes through the repository's own API — no hand-built keys. */
async function seed() {
  await repository.saveLogs('2025-03-14' as LogDate, [log('ancient', '2025-03-14')]);
  await repository.saveLogs('2026-07-02' as LogDate, [log('july', '2026-07-02')]);
  await repository.saveLogs('2026-07-20' as LogDate, [log('july-late', '2026-07-20')]);
  await repository.saveLogs('2026-09-01' as LogDate, [log('recent', '2026-09-01')]);
  await repository.saveRoutineStatuses('2026-07-02' as LogDate, [status('2026-07-02', 'taken')]);
  await repository.saveRoutineStatuses('2026-08-11' as LogDate, [status('2026-08-11', 'skipped')]);
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('history is kept, not windowed', () => {
  it('still holds a day far older than the warm window', async () => {
    // `RECENT_DAYS` is 60. This one is over a year back and must survive.
    await seed();
    expect(await repository.getLogs('2025-03-14' as LogDate)).toHaveLength(1);
  });

  it('removes a day only when its last record is cleared', async () => {
    await seed();
    await repository.saveLogs('2026-07-02' as LogDate, []);

    expect(await repository.getLogs('2026-07-02' as LogDate)).toEqual([]);
    // And nothing else went with it.
    expect(await repository.getLogs('2026-07-20' as LogDate)).toHaveLength(1);
    expect(await repository.getLogs('2025-03-14' as LogDate)).toHaveLength(1);
  });
});

describe('reading a range', () => {
  it('returns exactly the days inside it, oldest first', async () => {
    await seed();
    const july = await repository.getLogsInRange('2026-07-01' as LogDate, '2026-07-31' as LogDate);

    expect(july.map((entry) => entry.id)).toEqual(['july', 'july-late']);
  });

  it('excludes the day after the end and the day before the start', async () => {
    await seed();
    const narrow = await repository.getLogsInRange(
      '2026-07-03' as LogDate,
      '2026-07-19' as LogDate,
    );
    expect(narrow).toEqual([]);
  });

  it('includes both endpoints', async () => {
    await seed();
    const exact = await repository.getLogsInRange('2026-07-02' as LogDate, '2026-07-20' as LogDate);
    expect(exact).toHaveLength(2);
  });

  it('reads statuses over the same range independently of logs', async () => {
    await seed();
    const august = await repository.getRoutineStatusesInRange(
      '2026-08-01' as LogDate,
      '2026-08-31' as LogDate,
    );
    expect(august.map((entry) => entry.logDate)).toEqual(['2026-08-11']);
    // A skipped day has a status and no administration.
    expect(await repository.getLogsInRange('2026-08-01' as LogDate, '2026-08-31' as LogDate)).toEqual(
      [],
    );
  });

  it('returns nothing for a backwards range rather than everything', async () => {
    await seed();
    expect(
      await repository.getLogsInRange('2026-07-31' as LogDate, '2026-07-01' as LogDate),
    ).toEqual([]);
  });

  it('returns nothing for a month that genuinely holds nothing', async () => {
    await seed();
    expect(
      await repository.getLogsInRange('2026-06-01' as LogDate, '2026-06-30' as LogDate),
    ).toEqual([]);
  });
});

describe('the earliest day history exists for', () => {
  it('is null when there is none', async () => {
    expect(await repository.getEarliestHistoryDate()).toBeNull();
  });

  it('spans both stores, because either may hold the oldest day', async () => {
    await repository.saveRoutineStatuses('2025-01-05' as LogDate, [status('2025-01-05', 'taken')]);
    await repository.saveLogs('2026-09-01' as LogDate, [log('recent', '2026-09-01')]);
    expect(await repository.getEarliestHistoryDate()).toBe('2025-01-05');

    await repository.saveLogs('2024-11-30' as LogDate, [log('older', '2024-11-30')]);
    expect(await repository.getEarliestHistoryDate()).toBe('2024-11-30');
  });
});

describe('the reads are reads', () => {
  it('changes no key and no record', async () => {
    await seed();
    const before = (await AsyncStorage.getAllKeys()).slice().sort();
    const snapshot = await Promise.all(
      before.map(async (key) => [key, await AsyncStorage.getItem(key)] as const),
    );

    await repository.getLogsInRange('2020-01-01' as LogDate, '2030-01-01' as LogDate);
    await repository.getRoutineStatusesInRange('2020-01-01' as LogDate, '2030-01-01' as LogDate);
    await repository.getEarliestHistoryDate();

    const after = (await AsyncStorage.getAllKeys()).slice().sort();
    expect(after).toEqual(before);
    for (const [key, value] of snapshot) {
      expect(await AsyncStorage.getItem(key)).toBe(value);
    }
  });

  it('leaves the existing recent-window reads working exactly as before', async () => {
    await seed();
    const recent = await repository.getRecentLogs(60);
    // Newest-first day order is the contract those screens rely on.
    expect(recent.map((entry) => entry.id)).toEqual(['recent', 'july-late', 'july', 'ancient']);
  });

  it('writes no persistence key of its own', async () => {
    await seed();
    const before = await AsyncStorage.getAllKeys();

    await repository.getLogsInRange('2026-07-01' as LogDate, '2026-07-31' as LogDate);
    await repository.getEarliestHistoryDate();

    // Only the day-keyed stores this feature already used, unchanged. A new
    // key here would mean the read layer had grown a cache on disk.
    const after = await AsyncStorage.getAllKeys();
    expect(after.slice().sort()).toEqual(before.slice().sort());
    for (const key of after) {
      expect(key.startsWith('vita:v1:peptides:')).toBe(true);
    }
  });
});
