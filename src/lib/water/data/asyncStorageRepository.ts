/**
 * AsyncStorage implementation of `WaterRepository`.
 *
 * Everything read back is validated before use, on the same principle as the
 * nutrition repository: persisted JSON is only as trustworthy as the last
 * write, and a malformed record is **dropped rather than repaired**. A
 * guessed amount in a health log is worse than a missing one — and unlike a
 * missing one, it is invisible.
 *
 * Nothing here rewrites storage to "fix" what it read. A corrupted record is
 * ignored on read and disappears the next time the day is saved for a real
 * reason; it is never silently repaired behind the user's back.
 */

import { isValidLogDate, type LogDate } from '../../daily/dates';
import { createDayKeyedStore } from '../../daily/dayStore';
import { isNonEmptyString, isPositiveNumber, isRecord } from '../../daily/guards';
import { readJson, writeJson } from '../../daily/storage';
import type { WaterEntry, WaterGoal, WaterPreferences } from '../model/types';
import { isVolumeUnit } from '../model/units';
import type { WaterRepository } from './WaterRepository';
import { WATER_DOMAIN, WaterKeys } from './keys';

/* ── validation ─────────────────────────────────────────────────────── */

/**
 * A stored drink survives only if every field is usable.
 *
 * `amountMl` must be positive: zero and negative are not quantities anyone
 * logged, and `isPositiveNumber` also rejects `NaN` and `Infinity`, either of
 * which would poison the day's total silently — a single `NaN` entry makes
 * the whole sum `NaN`.
 *
 * The authored pair is required too. Without it the entry cannot honestly
 * report what the user typed, which is the reason it is stored at all; a
 * record missing it is from a shape this app never wrote.
 */
function parseEntry(value: unknown, logDate: LogDate): WaterEntry | null {
  if (!isRecord(value)) return null;

  const { id, loggedAt, amountMl, enteredAmount, enteredUnit } = value;

  if (!isNonEmptyString(id) || !isNonEmptyString(loggedAt)) return null;
  if (!isPositiveNumber(amountMl) || !isPositiveNumber(enteredAmount)) return null;
  if (!isVolumeUnit(enteredUnit)) return null;

  // A stored entry whose own date contradicts the key it was read from
  // belongs to another day; counting it here would double it the moment that
  // day is opened. `isValidLogDate` also rejects impossible calendar dates.
  if (!isValidLogDate(value.logDate) || value.logDate !== logDate) return null;

  return { id, logDate, loggedAt, amountMl, enteredAmount, enteredUnit };
}

/**
 * A goal is the pair the user authored, so both halves must be intact.
 * A non-positive amount is not a goal — `null` means "not set", and that is
 * a better answer than progress toward zero.
 */
function parseGoal(value: unknown): WaterGoal | null {
  if (!isRecord(value)) return null;
  if (!isPositiveNumber(value.amount) || !isVolumeUnit(value.unit)) return null;
  return { amount: value.amount, unit: value.unit };
}

/** An unreadable preference falls back to the default rather than blocking. */
function parsePreferences(value: unknown): WaterPreferences | null {
  if (!isRecord(value)) return null;
  if (!isVolumeUnit(value.unit)) return null;
  return { unit: value.unit };
}

/* ── implementation ─────────────────────────────────────────────────── */

const dayStore = createDayKeyedStore<WaterEntry>(WATER_DOMAIN, parseEntry);

export const asyncStorageWaterRepository: WaterRepository = {
  getEntries(logDate: LogDate): Promise<WaterEntry[]> {
    return dayStore.getDay(logDate);
  },

  saveEntries(logDate: LogDate, entries: WaterEntry[]): Promise<void> {
    return dayStore.saveDay(logDate, entries);
  },

  async getGoal(): Promise<WaterGoal | null> {
    return parseGoal(await readJson(WaterKeys.goal));
  },

  async saveGoal(goal: WaterGoal): Promise<void> {
    await writeJson(WaterKeys.goal, goal);
  },

  async getPreferences(): Promise<WaterPreferences | null> {
    return parsePreferences(await readJson(WaterKeys.preferences));
  },

  async savePreferences(preferences: WaterPreferences): Promise<void> {
    // Writing the default is not a no-op: it records that the user made a
    // choice, so a later change to what VITA defaults to cannot silently
    // move a preference someone already set.
    await writeJson(WaterKeys.preferences, preferences);
  },

  async getRecentDays(maxDays: number) {
    const days = await dayStore.getRecentDays(maxDays);
    return days.map((day) => ({ logDate: day.logDate, entries: day.records }));
  },
};
