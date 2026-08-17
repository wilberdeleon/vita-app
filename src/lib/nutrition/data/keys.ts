/**
 * Storage keys, namespaced and versioned.
 *
 * The `v1` segment is deliberate: when the entry shape changes in a way old
 * data can't satisfy, a `v2` namespace lets a migration read the old keys
 * and write new ones without a destructive in-place rewrite.
 *
 * One key per day rather than one key for the whole log — a day's entries
 * are the unit that's read and written together, so this keeps every
 * operation small regardless of how much history accumulates.
 */

import type { LogDate } from '../model/dates';

const NAMESPACE = 'vita:v1';

export const StorageKeys = {
  foodLog: (logDate: LogDate) => `${NAMESPACE}:foodlog:${logDate}`,
  targets: `${NAMESPACE}:targets`,
  /** Reserved for later Sprint 2 slices; listed here so the namespace has one owner. */
  myFoods: `${NAMESPACE}:myfoods`,
  favorites: `${NAMESPACE}:favorites`,
  recents: `${NAMESPACE}:recents`,
} as const;

export const FOOD_LOG_KEY_PREFIX = `${NAMESPACE}:foodlog:`;
