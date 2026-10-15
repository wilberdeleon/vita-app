/**
 * The persistence boundary for Journey / Weight — the same swap point
 * `WaterRepository` is. AsyncStorage ships now; a networked implementation
 * later arrives as a second implementation of this interface.
 */

import type { WeightEntry, WeightPreferences } from '../model/types';

export interface WeightRepository {
  /** Every valid stored entry, newest first. `[]` on first run. */
  getEntries(): Promise<WeightEntry[]>;

  /** Replaces the collection wholesale. Callers pass the full post-mutation list. */
  saveEntries(entries: readonly WeightEntry[]): Promise<void>;

  /** `null` before the user has chosen a unit; callers apply the default. */
  getPreferences(): Promise<WeightPreferences | null>;

  savePreferences(preferences: WeightPreferences): Promise<void>;
}
