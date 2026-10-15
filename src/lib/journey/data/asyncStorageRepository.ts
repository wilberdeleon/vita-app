/**
 * AsyncStorage implementation of `WeightRepository`.
 *
 * Validated on read, on the principle every VITA store holds: a malformed
 * record is **dropped, never repaired**. A guessed weight in someone's
 * history is worse than a missing one, and invisible. Reading never writes;
 * a corrupt record stays on disk until the collection is next saved for a
 * real reason. Unparseable JSON reads as absent (`readJson`), so corruption
 * costs the affected data, never the ability to open Journey.
 */

import { isNonEmptyString, isRecord } from '../../daily/guards';
import { readJson, removeKey, writeJson } from '../../daily/storage';
import { sortNewestFirst } from '../model/entries';
import type { WeightEntry, WeightPreferences } from '../model/types';
import { isValidWeight, isWeightUnit } from '../model/units';
import type { WeightRepository } from './WeightRepository';
import { JourneyKeys } from './keys';

/** A stored weigh-in survives only if every field is usable. Unknown fields are dropped. */
export function parseWeightEntry(value: unknown): WeightEntry | null {
  if (!isRecord(value)) return null;
  const { id, loggedAt, weightKg, enteredUnit } = value;
  if (!isNonEmptyString(id) || !isNonEmptyString(loggedAt)) return null;
  if (Number.isNaN(Date.parse(loggedAt))) return null;
  if (!isValidWeight(weightKg) || !isWeightUnit(enteredUnit)) return null;
  return { id, loggedAt, weightKg, enteredUnit };
}

function parsePreferences(value: unknown): WeightPreferences | null {
  if (!isRecord(value) || !isWeightUnit(value.unit)) return null;
  return { unit: value.unit };
}

export const asyncStorageWeightRepository: WeightRepository = {
  async getEntries() {
    const stored = await readJson(JourneyKeys.weight);
    if (!Array.isArray(stored)) return [];
    const entries: WeightEntry[] = [];
    const seen = new Set<string>();
    for (const candidate of stored) {
      const entry = parseWeightEntry(candidate);
      // A duplicated id would make edit/delete ambiguous; the first wins.
      if (entry && !seen.has(entry.id)) {
        seen.add(entry.id);
        entries.push(entry);
      }
    }
    return sortNewestFirst(entries);
  },

  async saveEntries(entries) {
    // Empty is removed rather than stored as `[]`, matching the rest of
    // VITA's collections — and it reads back as the same empty state.
    if (entries.length === 0) {
      await removeKey(JourneyKeys.weight);
      return;
    }
    await writeJson(JourneyKeys.weight, entries);
  },

  async getPreferences() {
    return parsePreferences(await readJson(JourneyKeys.preferences));
  },

  async savePreferences(preferences) {
    await writeJson(JourneyKeys.preferences, preferences);
  },
};
