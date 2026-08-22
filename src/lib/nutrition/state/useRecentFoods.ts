/**
 * Recent foods, derived from real logging history.
 *
 * There is no separate "recents" list to keep in sync, because the log
 * already holds the truth: a food is recent precisely because the user
 * logged it. Maintaining a parallel store would only create a second thing
 * that can disagree with the first.
 *
 * Each recent is reconstructed from its entry snapshot, so a food stays
 * loggable even when the provider cache has expired, the custom food was
 * deleted, or the device is offline — no search re-run, no API call.
 */

import { useCallback, useEffect, useState } from 'react';
import { asyncStorageNutritionRepository } from '../data/asyncStorageRepository';
import type { NutritionRepository } from '../data/FoodLogRepository';
import { foodFromEntry } from '../model/foods';
import type { FoodEntry, VitaFood } from '../model/types';
import { rememberFoods } from '../search/cache';
import { useNutrition } from './NutritionProvider';

/**
 * How far back to look, and how many foods to show.
 *
 * 30 days is enough to cover anything a person eats with any regularity,
 * and one storage key per day means only those days are read. 25 rows is
 * comfortably scrollable without pagination — past that, Search is the
 * better tool anyway.
 */
export const RECENT_MAX_DAYS = 30;
export const RECENT_LIMIT = 25;

export type RecentFood = {
  food: VitaFood;
  /** ISO timestamp of the most recent time this food was logged. */
  lastLoggedAt: string;
};

/**
 * One row per food identity, newest first.
 *
 * Entries arrive newest-first, so the first occurrence of a `vitaId` is
 * already its most recent use — logging the same bar five times produces
 * one row that moves to the top, not five rows.
 */
export function collapseToRecents(entries: FoodEntry[], limit: number): RecentFood[] {
  const seen = new Set<string>();
  const recents: RecentFood[] = [];

  for (const entry of entries) {
    const id = entry.foodRef.vitaFoodId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    recents.push({ food: foodFromEntry(entry), lastLoggedAt: entry.loggedAt });
    if (recents.length >= limit) break;
  }

  return recents;
}

export function useRecentFoods(repository: NutritionRepository = asyncStorageNutritionRepository): {
  recents: RecentFood[];
  isLoading: boolean;
  reload: () => void;
} {
  // Today's entries come from shared state; re-reading when they change is
  // what makes a food appear in Recents the moment it is logged.
  const { entries } = useNutrition();
  const [recents, setRecents] = useState<RecentFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const history = await repository.getRecentEntries(RECENT_MAX_DAYS);
        if (!active) return;
        const collapsed = collapseToRecents(history, RECENT_LIMIT);
        // Re-seeds the food cache from history, so opening a recent always
        // resolves in Food Detail even after the search cache expired.
        rememberFoods(collapsed.map((recent) => recent.food));
        setRecents(collapsed);
      } catch {
        if (active) setRecents([]);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [repository, entries, attempt]);

  return { recents, isLoading, reload };
}
