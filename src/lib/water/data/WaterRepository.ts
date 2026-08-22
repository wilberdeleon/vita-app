/**
 * The persistence boundary for Water.
 *
 * The same swap point `FoodLogRepository` is: Sprint 3 ships an AsyncStorage
 * implementation because Supabase is architecturally present but unconnected
 * — no env vars, no schema, no migrations, no auth flow — and turning it on
 * means auth, RLS, sync, and offline conflict handling, which is a backend
 * sprint of its own. When it arrives it arrives as a second implementation of
 * this interface, and no screen, hook, or calculation learns where the data
 * lives.
 *
 * Every method is async even where the current implementation could be
 * synchronous, so a networked implementation is a drop-in rather than a
 * signature change rippling outward.
 */

import type { LogDate } from '../../daily/dates';
import type { WaterEntry, WaterGoal, WaterPreferences } from '../model/types';

export interface WaterRepository {
  /** One day's drinks. `[]` for a day that was never written. */
  getEntries(logDate: LogDate): Promise<WaterEntry[]>;

  /** Replaces the day wholesale. Callers pass the full post-mutation array. */
  saveEntries(logDate: LogDate, entries: WaterEntry[]): Promise<void>;

  /**
   * `null` when the user has never set a goal — which is a real state with
   * its own UI, not a signal to substitute a default. VITA does not invent a
   * hydration recommendation.
   */
  getGoal(): Promise<WaterGoal | null>;

  saveGoal(goal: WaterGoal): Promise<void>;

  /** `null` before the user has expressed a preference; callers apply the default. */
  getPreferences(): Promise<WaterPreferences | null>;

  savePreferences(preferences: WaterPreferences): Promise<void>;

  /**
   * The most recent written days, newest first — what a short history view
   * needs, deliberately not a full history API. One storage key per day is
   * what makes it cheap.
   *
   * Present now because the day store already provides it and the repository
   * interface is the thing later slices code against; slice 3.4's 7-day view
   * is its first consumer.
   */
  getRecentDays(maxDays: number): Promise<{ logDate: LogDate; entries: WaterEntry[] }[]>;
}
