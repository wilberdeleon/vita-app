/**
 * The persistence boundary for Peptides.
 *
 * The same swap point `FoodLogRepository` and `WaterRepository` are: an
 * AsyncStorage implementation ships now, and Supabase arrives later as a
 * second implementation without any screen, hook, or calculation learning
 * where the data lives.
 *
 * Whole-collection semantics — callers pass the full post-mutation array —
 * matching how nutrition stores My Foods and favorites. Setups are few and
 * day-independent, so there is nothing for a day-keyed store to key on.
 *
 * Every method is async even where the current implementation need not be, so
 * a networked implementation is a drop-in rather than a signature change.
 */

import type { PeptideDefinition, PeptideSetup } from '../model/types';

export interface PeptideRepository {
  /** Every setup, active and inactive. `[]` before the user has made one. */
  getSetups(): Promise<PeptideSetup[]>;

  saveSetups(setups: PeptideSetup[]): Promise<void>;

  /**
   * Definitions the user created. Stored separately from setups so a custom
   * compound stays reusable across several setups and survives deleting one.
   */
  getCustomDefinitions(): Promise<PeptideDefinition[]>;

  saveCustomDefinitions(definitions: PeptideDefinition[]): Promise<void>;
}
