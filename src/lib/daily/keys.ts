/**
 * Storage key construction, namespaced and versioned.
 *
 * The `v1` segment is deliberate: when a record shape changes in a way old
 * data can't satisfy, a `v2` namespace lets a migration read the old keys and
 * write new ones without a destructive in-place rewrite.
 *
 * Day-keyed domains get one key per day rather than one key for the whole
 * log — a day's records are the unit that's read and written together, so
 * every operation stays small no matter how much history accumulates.
 *
 * `NAMESPACE` lives here rather than in each domain so Water, Peptides, and
 * nutrition cannot drift onto different prefixes. `src/lib/nutrition/data/
 * keys.ts` imports it and builds its own key strings exactly as before — the
 * strings it produces are unchanged, which `__tests__/keys.test.ts` pins.
 */

import type { LogDate } from './dates';

export const NAMESPACE = 'vita:v1';

/** A domain's slice of the namespace, e.g. `water` → `vita:v1:water`. */
export type StorageDomain = string;

/** One day of one domain: `vita:v1:water:log:2026-08-22`. */
export function dayKey(domain: StorageDomain, logDate: LogDate): string {
  return `${dayKeyPrefix(domain)}${logDate}`;
}

/**
 * Everything before the date, so a domain can enumerate its own days.
 * Returned with the trailing colon included, so callers slice by its length
 * rather than hardcoding an offset.
 */
export function dayKeyPrefix(domain: StorageDomain): string {
  return `${NAMESPACE}:${domain}:log:`;
}

/** A single day-independent value: `vita:v1:water:goal`. */
export function singletonKey(domain: StorageDomain, name: string): string {
  return `${NAMESPACE}:${domain}:${name}`;
}
