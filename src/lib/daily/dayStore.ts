/**
 * A day-keyed collection in local storage.
 *
 * The shape every daily log in VITA has: records grouped by the calendar day
 * the user experienced them on, one storage key per day, read and written as
 * a whole day at a time. Nutrition proved the pattern in Sprint 2; water
 * entries and peptide administrations are the same shape, so slice 3.1
 * promotes the mechanics rather than writing them a third time.
 *
 * What it deliberately does NOT know: what a record is, what its fields mean,
 * how to sort them, or what "recent" means for a given feature. It moves
 * arrays of already-validated records in and out of keys. Everything
 * domain-specific lives in the caller's parser and repository.
 *
 * `src/lib/nutrition` is NOT retrofitted onto this. It is approved, merged,
 * and working; rewriting its storage layer to prove a new abstraction would
 * be regression risk bought with no user-visible gain. Consolidating it is a
 * later opportunity, not slice 3.1 work.
 */

import { isValidLogDate, type LogDate } from './dates';
import { dayKey, dayKeyPrefix, type StorageDomain } from './keys';
import { allKeys, readJson, removeKey, writeJson } from './storage';

/**
 * Validates one stored record.
 *
 * Receives the day it was read from so a domain can reject a record whose own
 * date contradicts its key — keeping it would double-count it the moment its
 * real day is opened. Returns `null` to drop the record: a malformed entry is
 * dropped rather than repaired, because a guessed value in a health log is
 * worse than a missing one.
 */
export type RecordParser<T> = (value: unknown, logDate: LogDate) => T | null;

/** One day's worth of records, as returned by a history read. */
export type DayRecords<T> = {
  logDate: LogDate;
  records: T[];
};

export type DayKeyedStore<T> = {
  /** One day's records. `[]` for a day that was never written. */
  getDay(logDate: LogDate): Promise<T[]>;
  /** Replaces the day wholesale. Callers pass the full post-mutation array. */
  saveDay(logDate: LogDate, records: T[]): Promise<void>;
  /**
   * The most recent written days, newest day first, up to `maxDays`.
   *
   * Keys are enumerated rather than counted backwards from today: gaps are
   * normal — nobody logs every day — and walking dates would read nothing on
   * every skipped one. Days are returned grouped and unflattened, because how
   * to order records *within* a day is a domain question, not this one's.
   */
  getRecentDays(maxDays: number): Promise<DayRecords<T>[]>;
};

export function createDayKeyedStore<T>(domain: StorageDomain, parse: RecordParser<T>): DayKeyedStore<T> {
  const prefix = dayKeyPrefix(domain);

  async function getDay(logDate: LogDate): Promise<T[]> {
    const parsed = await readJson(dayKey(domain, logDate));
    if (!Array.isArray(parsed)) return [];

    const records: T[] = [];
    for (const candidate of parsed) {
      const record = parse(candidate, logDate);
      if (record !== null) records.push(record);
    }
    return records;
  }

  return {
    getDay,

    async saveDay(logDate: LogDate, records: T[]): Promise<void> {
      const key = dayKey(domain, logDate);
      if (records.length === 0) {
        // Empty days are removed rather than stored as `[]`, so clearing a day
        // leaves no residue and a history view can treat key presence as
        // "this day has something in it".
        await removeKey(key);
        return;
      }
      await writeJson(key, records);
    },

    async getRecentDays(maxDays: number): Promise<DayRecords<T>[]> {
      if (maxDays <= 0) return [];

      const keys = await allKeys();
      const logDates = keys
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length))
        .filter(isValidLogDate)
        // ISO dates sort lexicographically, so this is a real date sort.
        .sort((a, b) => b.localeCompare(a))
        .slice(0, maxDays);

      const days = await Promise.all(
        logDates.map(async (logDate) => ({ logDate, records: await getDay(logDate) })),
      );

      // A day whose records all failed validation is not a day with history.
      return days.filter((day) => day.records.length > 0);
    },
  };
}
