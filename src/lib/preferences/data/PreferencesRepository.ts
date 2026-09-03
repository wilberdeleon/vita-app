/**
 * The persistence boundary for app-level preferences.
 *
 * The same swap point `WaterRepository` and `FoodLogRepository` are: the
 * AsyncStorage implementation ships now, and a networked one later arrives
 * as a second implementation of this interface without any consumer
 * learning where the data lives.
 *
 * Both methods are async even though the current implementation could
 * resolve immediately, so a networked implementation is a drop-in rather
 * than a signature change rippling out to `ThemeProvider`.
 */

import type { AppPreferences } from '../model/types';

export interface PreferencesRepository {
  /**
   * `null` when the user has never expressed a preference — a real state
   * that the caller answers with `DEFAULT_APP_PREFERENCES`, rather than
   * something this layer papers over.
   */
  get(): Promise<AppPreferences | null>;

  /**
   * Writes the whole record. Callers hold the current value and pass the
   * full post-change object, exactly as `WaterProvider.setUnit` does — so
   * there is no invisible read-modify-write hiding in the repository.
   */
  save(preferences: AppPreferences): Promise<void>;
}
