/**
 * The read side of the nutrition engine — what screens actually consume.
 *
 * Everything below is derived on each render from the entry array. Nothing
 * here is stored, so there is no second copy of a total that can drift out
 * of sync with the entries it came from. Summing a day of entries is a few
 * dozen additions; caching it would cost more in staleness risk than it
 * saves in work.
 */

import { useMemo } from 'react';
import {
  dailyTotals,
  summarizeMeals,
  type DailyTotals,
  type MealSummary,
} from '../model/nutrition';
import type { LogDate } from '../../daily/dates';
import type { FoodEntry, NutritionTargets } from '../model/types';
import { useNutrition } from './NutritionProvider';

export type DailyNutrition = DailyTotals & {
  logDate: LogDate;
  /** True until the day's entries have been read from storage. */
  isLoading: boolean;
  /** Persistence failure message, or null. */
  error: string | null;
  entries: FoodEntry[];
  /** All four slots, in canonical order, empty ones included. */
  meals: MealSummary[];
  targets: NutritionTargets;
  /** Nothing logged yet — drives the empty states. */
  isEmpty: boolean;
  /** How many slots have at least one entry, e.g. "2 / 4 meals logged". */
  mealsLoggedCount: number;
  totalMealSlots: number;
};

export function useDailyNutrition(): DailyNutrition {
  const { status, logDate, entries, targets, error } = useNutrition();

  return useMemo(() => {
    const totals = dailyTotals(entries, targets);
    const meals = summarizeMeals(entries);

    return {
      ...totals,
      logDate,
      isLoading: status === 'loading',
      error,
      entries,
      meals,
      targets,
      isEmpty: entries.length === 0,
      mealsLoggedCount: meals.filter((meal) => meal.itemCount > 0).length,
      totalMealSlots: meals.length,
    };
  }, [status, logDate, entries, targets, error]);
}
