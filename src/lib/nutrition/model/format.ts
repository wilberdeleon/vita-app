/**
 * Display formatting for nutrition numbers.
 *
 * Centralized so every screen rounds the same way. Values are always stored
 * exact and rounded only here at the edge — half a 105 kcal banana is
 * 52.5 kcal in the log and reads as 53 on screen, rather than accumulating
 * rounding error across a day of entries.
 */

import type { NutritionFacts } from './types';

/**
 * Calories read as whole numbers. Nobody thinks in tenths of a calorie, and
 * the precision would be false anyway — label data is rounded before it
 * ever reaches us.
 */
export function formatCalories(value: number): string {
  return Math.round(value).toLocaleString();
}

/**
 * Grams and milligrams keep one decimal only when they actually have one.
 * Half a serving of 7 g fat is 3.5 g, and rounding that to 4 g would be a
 * visible lie at exactly the moment the user is checking the math. Whole
 * values stay whole — "24 g", never "24.0 g".
 */
export function formatAmount(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Quantity as the user reads it: "1", "0.5", "1.5", "2". */
export function formatQuantity(value: number): string {
  return formatAmount(value);
}

/** "1 serving" / "1.5 servings" — pluralizes on the number, not the unit. */
export function formatServingCount(quantity: number, unit: string): string {
  const amount = formatQuantity(quantity);
  const plural = quantity === 1 ? unit : pluralizeUnit(unit);
  return `${amount} ${plural}`;
}

/**
 * Only pluralizes units that are countable words. Measurement abbreviations
 * ("g", "ml", "oz") are already invariant — "2 gs" would be wrong.
 */
const INVARIANT_UNITS = new Set(['g', 'kg', 'mg', 'ml', 'l', 'oz', 'fl oz', 'lb']);

export function pluralizeUnit(unit: string): string {
  const normalized = unit.trim().toLowerCase();
  if (INVARIANT_UNITS.has(normalized)) return unit;
  if (normalized.endsWith('s')) return unit;
  return `${unit}s`;
}

/** The four macro figures as display strings, in one call. */
export function formatMacros(nutrition: NutritionFacts): {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
} {
  return {
    calories: formatCalories(nutrition.calories),
    protein: formatAmount(nutrition.protein),
    carbs: formatAmount(nutrition.carbs),
    fat: formatAmount(nutrition.fat),
  };
}
