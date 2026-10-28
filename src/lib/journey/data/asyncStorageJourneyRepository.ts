/**
 * AsyncStorage implementation of `JourneyRepository`.
 *
 * Validated on read like every VITA store: a malformed Journey is **dropped,
 * never repaired**, and nothing is invented to fill the gap — an unreadable
 * store reads as "no Journey yet", which the screen answers with Start a New
 * Journey. Reading never writes.
 *
 * **One active Journey** is enforced on write by the domain. Should a store
 * ever hold two (a torn write, a hand edit), only the most recently created
 * is treated as active; the others are left on disk untouched and shown
 * nowhere until a real save rewrites the collection.
 */

import { isValidLogDate } from '../../daily/dates';
import { isNonEmptyString, isRecord } from '../../daily/guards';
import { readJson, removeKey, writeJson } from '../../daily/storage';
import { JOURNEY_NAME_MAX, type Journey } from '../model/journeys';
import type { JourneyRepository } from './JourneyRepository';
import { JourneyKeys } from './keys';

export function parseJourney(value: unknown): Journey | null {
  if (!isRecord(value)) return null;
  const { id, name, startDate, plannedEndDate, status, createdAt, completedAt } = value;
  if (!isNonEmptyString(id) || !isNonEmptyString(name) || name.trim() !== name || name.length > JOURNEY_NAME_MAX) return null;
  if (!isValidLogDate(startDate) || !isValidLogDate(plannedEndDate) || plannedEndDate < startDate) return null;
  if (!isNonEmptyString(createdAt) || Number.isNaN(Date.parse(createdAt))) return null;
  if (status === 'active') {
    if (completedAt !== undefined) return null;
    return { id, name, startDate, plannedEndDate, status, createdAt };
  }
  if (status === 'completed') {
    if (!isNonEmptyString(completedAt) || Number.isNaN(Date.parse(completedAt))) return null;
    return { id, name, startDate, plannedEndDate, status, createdAt, completedAt };
  }
  return null;
}

export const asyncStorageJourneyRepository: JourneyRepository = {
  async getJourneys() {
    const stored = await readJson(JourneyKeys.journeys);
    if (!Array.isArray(stored)) return [];
    const journeys: Journey[] = [];
    const seen = new Set<string>();
    for (const candidate of stored) {
      const journey = parseJourney(candidate);
      if (journey && !seen.has(journey.id)) {
        seen.add(journey.id);
        journeys.push(journey);
      }
    }
    const active = journeys
      .filter((journey) => journey.status === 'active')
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    if (active.length <= 1) return journeys;
    const keep = active[0].id;
    return journeys.filter((journey) => journey.status !== 'active' || journey.id === keep);
  },

  async saveJourneys(journeys) {
    if (journeys.length === 0) {
      await removeKey(JourneyKeys.journeys);
      return;
    }
    await writeJson(JourneyKeys.journeys, journeys);
  },
};
