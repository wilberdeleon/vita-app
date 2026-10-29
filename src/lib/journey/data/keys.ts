/**
 * Journey's storage keys, built from the shared helpers so the namespace
 * cannot drift from the rest of the app.
 *
 * Two keys, following Water's split of records from preferences: the entry
 * collection and the display-unit preference are read and written for
 * different reasons, and a unit change must never rewrite history. Both are
 * new — no Sprint 5 key is read, repurposed or migrated.
 *
 * Versioning is VITA's: the `v1` namespace segment. A shape old data cannot
 * satisfy gets a `v2` key and a migration that reads the old one.
 */

import { singletonKey } from '../../daily/keys';

export const JOURNEY_DOMAIN = 'journey';

export const JourneyKeys = {
  /** `vita:v1:journey:weight` — every weigh-in, as one collection. */
  weight: singletonKey(JOURNEY_DOMAIN, 'weight'),
  /** `vita:v1:journey:prefs` — the body-weight display unit. */
  preferences: singletonKey(JOURNEY_DOMAIN, 'prefs'),
  /** `vita:v1:journey:journeys` — every Journey, active and completed (6.5). */
  journeys: singletonKey(JOURNEY_DOMAIN, 'journeys'),
  /** `vita:v1:journey:photos` — progress-photo metadata; images live in files (6.6). */
  photos: singletonKey(JOURNEY_DOMAIN, 'photos'),
} as const;
