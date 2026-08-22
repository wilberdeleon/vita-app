/**
 * Water's storage keys, built from the shared helpers so the namespace and
 * the day-key format cannot drift from the rest of the app.
 *
 * `WATER_DOMAIN` is the segment that isolates Water from nutrition and, later,
 * peptides: `vita:v1:water:log:2026-08-22` can never be mistaken for
 * `vita:v1:foodlog:2026-08-22` or match another domain's key prefix.
 */

import { singletonKey } from '../../daily/keys';

export const WATER_DOMAIN = 'water';

export const WaterKeys = {
  goal: singletonKey(WATER_DOMAIN, 'goal'),
  preferences: singletonKey(WATER_DOMAIN, 'prefs'),
} as const;
