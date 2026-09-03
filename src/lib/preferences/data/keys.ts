/**
 * The app-preferences storage key, built from the shared helper so the
 * namespace cannot drift from the rest of the app.
 *
 * The `settings` domain segment isolates these from every feature's own
 * storage: `vita:v1:settings:prefs` can never collide with
 * `vita:v1:water:prefs`, which is a different record owned by a different
 * part of the app and deliberately left where it is.
 */

import { singletonKey } from '../../daily/keys';

export const PREFERENCES_DOMAIN = 'settings';

export const PreferenceKeys = {
  /** `vita:v1:settings:prefs` */
  app: singletonKey(PREFERENCES_DOMAIN, 'prefs'),
} as const;
