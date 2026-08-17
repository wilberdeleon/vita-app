/**
 * The persistence boundary for nutrition.
 *
 * This interface is the swap point. Sprint 2 ships an AsyncStorage
 * implementation because Supabase is architecturally present but not
 * connected — no env vars, no schema, no migrations, no auth flow — and
 * turning it on would mean auth, RLS, sync, and offline conflict handling,
 * which is a backend sprint the founders explicitly ruled out of Sprint 2.
 *
 * When Supabase does arrive, it arrives as a second implementation of this
 * interface. Nothing above this line changes: no screen, no hook, and no
 * calculation ever learns where the data lives.
 *
 * Every method is async even where the current implementation could be
 * synchronous, so a networked implementation is a drop-in rather than a
 * signature change rippling through the app.
 */

import type { LogDate } from '../model/dates';
import type { FoodEntry, NutritionTargets } from '../model/types';

export interface FoodLogRepository {
  /** Entries for one day. Returns `[]` for a day that was never written. */
  getEntries(logDate: LogDate): Promise<FoodEntry[]>;

  /** Replaces the day wholesale. Callers pass the full post-mutation array. */
  saveEntries(logDate: LogDate, entries: FoodEntry[]): Promise<void>;

  /** `null` when the user has never set targets, so callers can apply defaults. */
  getTargets(): Promise<NutritionTargets | null>;

  saveTargets(targets: NutritionTargets): Promise<void>;
}
