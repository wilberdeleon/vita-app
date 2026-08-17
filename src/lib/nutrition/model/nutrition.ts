/**
 * Pure nutrition arithmetic. No I/O, no React, no storage — every function
 * here is a plain input→output transform, which is what makes the daily
 * totals cheap enough to recompute on every render and testable without a
 * running app.
 */

import {
  CORE_NUTRIENTS,
  MEAL_SLOTS,
  OPTIONAL_NUTRIENTS,
  type FoodEntry,
  type MealSlot,
  type NutritionFacts,
  type NutritionTargets,
  type ServingOption,
} from './types';

export const EMPTY_NUTRITION: NutritionFacts = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

/**
 * Scale nutrition by a quantity multiplier.
 *
 * Optional nutrients stay absent when absent — scaling an unknown sodium
 * must not invent a 0 mg sodium, because the UI needs to tell "we don't
 * know" apart from "genuinely none".
 */
export function scaleNutrition(nutrition: NutritionFacts, factor: number): NutritionFacts {
  const scaled: NutritionFacts = {
    calories: nutrition.calories * factor,
    protein: nutrition.protein * factor,
    carbs: nutrition.carbs * factor,
    fat: nutrition.fat * factor,
  };

  for (const key of OPTIONAL_NUTRIENTS) {
    const value = nutrition[key];
    if (value !== undefined) scaled[key] = value * factor;
  }

  return scaled;
}

/**
 * Add two nutrition records.
 *
 * An optional nutrient known on one side and unknown on the other is
 * treated as a partial total rather than dropped — "at least this much
 * fiber" is more useful than no fiber figure at all, and dropping it would
 * make a day's fiber vanish the moment one food lacked the field.
 */
export function addNutrition(a: NutritionFacts, b: NutritionFacts): NutritionFacts {
  const sum: NutritionFacts = {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };

  for (const key of OPTIONAL_NUTRIENTS) {
    const left = a[key];
    const right = b[key];
    if (left === undefined && right === undefined) continue;
    sum[key] = (left ?? 0) + (right ?? 0);
  }

  return sum;
}

/** Total nutrition across any set of entries. */
export function sumEntries(entries: readonly FoodEntry[]): NutritionFacts {
  return entries.reduce<NutritionFacts>((total, entry) => addNutrition(total, entry.nutrition), EMPTY_NUTRITION);
}

/** Nutrition for `quantity` of a given serving option. */
export function nutritionForServing(serving: ServingOption, quantity: number): NutritionFacts {
  return scaleNutrition(serving.nutrition, quantity);
}

/** Group entries by meal. Every slot is present, empty ones included. */
export function groupByMeal(entries: readonly FoodEntry[]): Record<MealSlot, FoodEntry[]> {
  const grouped = {} as Record<MealSlot, FoodEntry[]>;
  for (const slot of MEAL_SLOTS) grouped[slot] = [];
  for (const entry of entries) grouped[entry.meal].push(entry);
  return grouped;
}

export type MealSummary = {
  slot: MealSlot;
  entries: FoodEntry[];
  nutrition: NutritionFacts;
  itemCount: number;
};

/** Per-slot totals in canonical order — what the Food Log and Home render. */
export function summarizeMeals(entries: readonly FoodEntry[]): MealSummary[] {
  const grouped = groupByMeal(entries);
  return MEAL_SLOTS.map((slot) => ({
    slot,
    entries: grouped[slot],
    nutrition: sumEntries(grouped[slot]),
    itemCount: grouped[slot].length,
  }));
}

/**
 * Remaining against a target. Floors at zero: "−180 kcal remaining" reads
 * as a penalty, and VITA does not use guilt mechanics. Going over is shown
 * by the progress bar passing 100%, not by a negative number.
 */
export function remaining(consumed: number, target: number): number {
  return Math.max(0, target - consumed);
}

/**
 * Progress as 0..1 for bars and rings, clamped so an over-target day fills
 * the track rather than overflowing its container. Callers that need the
 * true ratio (e.g. a percentage label that should read 118%) use `ratio`.
 */
export function progress(consumed: number, target: number): number {
  return Math.min(1, Math.max(0, ratio(consumed, target)));
}

/** Unclamped ratio. Returns 0 rather than Infinity when the target is 0. */
export function ratio(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return consumed / target;
}

/** Whole-number percentage for display, unclamped. */
export function percent(consumed: number, target: number): number {
  return Math.round(ratio(consumed, target) * 100);
}

/**
 * Display rounding, applied at the edge so stored values stay exact — a
 * half-serving of a 105 kcal banana is 52.5 kcal in the log and reads as
 * 53 on screen, rather than accumulating rounding error across a day.
 */
export function roundForDisplay(nutrition: NutritionFacts): NutritionFacts {
  const rounded = { ...nutrition };
  for (const key of CORE_NUTRIENTS) rounded[key] = Math.round(nutrition[key]);
  for (const key of OPTIONAL_NUTRIENTS) {
    const value = nutrition[key];
    if (value !== undefined) rounded[key] = Math.round(value);
  }
  return rounded;
}

export type DailyTotals = {
  nutrition: NutritionFacts;
  targets: NutritionTargets;
  caloriesRemaining: number;
  calorieProgress: number;
  caloriePercent: number;
};

/** The headline numbers Fuel and Home both show. */
export function dailyTotals(entries: readonly FoodEntry[], targets: NutritionTargets): DailyTotals {
  const nutrition = sumEntries(entries);
  return {
    nutrition,
    targets,
    caloriesRemaining: remaining(nutrition.calories, targets.calories),
    calorieProgress: progress(nutrition.calories, targets.calories),
    caloriePercent: percent(nutrition.calories, targets.calories),
  };
}
