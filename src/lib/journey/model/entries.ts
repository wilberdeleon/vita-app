/**
 * Building, ordering and changing weight entries — pure functions.
 *
 * Every rule a later screen depends on is decided here once, so 6.3's add
 * sheet, 6.4's history and 6.6's edit/delete cannot each invent their own:
 *
 * - **Every add is a new record.** Same day, same minute, same value — it is
 *   still its own weigh-in (founder ruling, 2026-10-15). Nothing here merges,
 *   replaces or de-duplicates by date.
 * - **Ordering is newest first**, by `loggedAt`. Ties keep their existing
 *   relative order, and a new entry is placed ahead of existing ones.
 * - **Current weight is derived**: the newest entry, or `null`. It is never
 *   stored, so deleting the newest entry needs no repair step.
 * - **An unknown id is a no-op**: update and remove return the list
 *   unchanged, the same outcome `WaterProvider`'s map/filter produce.
 */

import { newId } from '../../daily/ids';
import type { WeightEntry, WeightUnit } from './types';
import { isValidWeight, toKg } from './units';

export type CreateWeightEntryInput = {
  weight: number;
  unit: WeightUnit;
  /** Injectable so tests are deterministic; defaults to now. */
  loggedAt?: Date;
  /** The owning Journey. Every weigh-in recorded since 6.5 has one. */
  journeyId?: string;
};

/**
 * Throws on an invalid weight rather than storing it. Callers parse user
 * input with `parseWeight` first; reaching here with a bad value is a
 * programming error — the same contract as `createWaterEntry`.
 */
export function createWeightEntry({ weight, unit, loggedAt = new Date(), journeyId }: CreateWeightEntryInput): WeightEntry {
  if (!isValidWeight(weight)) {
    throw new Error(`createWeightEntry: weight must be a positive finite number, got ${weight}`);
  }
  return {
    id: newId('weight'),
    loggedAt: loggedAt.toISOString(),
    weightKg: toKg(weight, unit),
    enteredUnit: unit,
    ...(journeyId ? { journeyId } : {}),
  };
}

/**
 * One Journey's weigh-ins, keeping the input's order. Legacy entries (no
 * `journeyId`) belong to no Journey, so they never appear here.
 */
export function entriesForJourney(entries: readonly WeightEntry[], journeyId: string): WeightEntry[] {
  return entries.filter((entry) => entry.journeyId === journeyId);
}

/**
 * What an edit may change. Weight and unit travel together so the canonical
 * value can never contradict its own label; `loggedAt` may be corrected too,
 * for when a later slice authorizes date/time editing. `id` and `journeyId`
 * never change — an edit cannot move a weigh-in to another Journey.
 */
export type WeightEntryChanges = {
  weight?: { value: number; unit: WeightUnit };
  loggedAt?: Date;
};

function applyChanges(entry: WeightEntry, changes: WeightEntryChanges): WeightEntry {
  const next = { ...entry };
  if (changes.weight) {
    if (!isValidWeight(changes.weight.value)) {
      throw new Error(`updateWeightEntry: weight must be a positive finite number, got ${changes.weight.value}`);
    }
    next.weightKg = toKg(changes.weight.value, changes.weight.unit);
    next.enteredUnit = changes.weight.unit;
  }
  if (changes.loggedAt) {
    if (Number.isNaN(changes.loggedAt.getTime())) throw new Error('updateWeightEntry: invalid loggedAt');
    next.loggedAt = changes.loggedAt.toISOString();
  }
  return next;
}

function timeOf(entry: WeightEntry): number {
  return Date.parse(entry.loggedAt);
}

/** Newest first, stable. Returns a new array. */
export function sortNewestFirst(entries: readonly WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) => timeOf(b) - timeOf(a));
}

/** The derived current weight: the newest entry, or `null` with no entries. */
export function latestEntry(entries: readonly WeightEntry[]): WeightEntry | null {
  return sortNewestFirst(entries)[0] ?? null;
}

/** Adds a distinct record. Never replaces an existing one. */
export function addWeightEntry(entries: readonly WeightEntry[], entry: WeightEntry): WeightEntry[] {
  return sortNewestFirst([entry, ...entries]);
}

/** Changes exactly one entry, by id. Unknown id → the same entries, unchanged. */
export function updateWeightEntry(
  entries: readonly WeightEntry[],
  id: string,
  changes: WeightEntryChanges,
): WeightEntry[] {
  if (!entries.some((entry) => entry.id === id)) return [...entries];
  return sortNewestFirst(entries.map((entry) => (entry.id === id ? applyChanges(entry, changes) : entry)));
}

/** Removes exactly one entry, by id. Unknown id → the same entries, unchanged. */
export function removeWeightEntry(entries: readonly WeightEntry[], id: string): WeightEntry[] {
  return entries.filter((entry) => entry.id !== id);
}

/**
 * How far past "now" a weigh-in time may sit (slice 6.4): one minute, for
 * clock skew between reading the time and pressing Save. A weigh-in is
 * something that already happened — this is factual validation, not medical.
 */
export const MAX_FUTURE_SKEW_MS = 60_000;

/** `true` when `at` is a real instant that is not in the future. */
export function isLoggableTime(at: Date, now: Date = new Date()): boolean {
  const time = at.getTime();
  return Number.isFinite(time) && time <= now.getTime() + MAX_FUTURE_SKEW_MS;
}

