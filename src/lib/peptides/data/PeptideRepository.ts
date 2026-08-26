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

import type { LogDate } from '../../daily';
import type { PeptideDefinition, PeptideLogEntry, PeptideSetup } from '../model/types';

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

  /**
   * ── Administrations (slice 3.7) ──────────────────────────────────────
   *
   * Day-partitioned, unlike setups: a log grows without limit, and the day is
   * the unit that is read and written together. This is the same shape water
   * entries and the food log use, so it rides the shared day-keyed store
   * rather than inventing a third scheme.
   */

  /** One day's administrations. `[]` for a day that was never written. */
  getLogs(logDate: LogDate): Promise<PeptideLogEntry[]>;

  /** Replaces the day wholesale. Callers pass the full post-mutation array. */
  saveLogs(logDate: LogDate, entries: PeptideLogEntry[]): Promise<void>;

  /**
   * The most recent written days, newest first, flattened.
   *
   * Bounded by days rather than by entries because the underlying store
   * enumerates keys: gaps are normal — nobody logs every day — and counting
   * backwards from today would read nothing on every skipped one.
   */
  getRecentLogs(maxDays: number): Promise<PeptideLogEntry[]>;
}
