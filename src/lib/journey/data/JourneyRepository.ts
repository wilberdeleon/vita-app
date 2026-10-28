/**
 * The persistence boundary for Journeys (slice 6.5) — the same all-async swap
 * point every VITA repository is.
 */

import type { Journey } from '../model/journeys';

export interface JourneyRepository {
  /** Every valid stored Journey. `[]` on first run — nothing is ever created for the user. */
  getJourneys(): Promise<Journey[]>;

  /** Replaces the collection wholesale. */
  saveJourneys(journeys: readonly Journey[]): Promise<void>;
}
