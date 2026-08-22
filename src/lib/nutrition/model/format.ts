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

/**
 * How a portion reads when the serving's own label already describes one
 * of it — "1 bar (68 g)", "100 g", "1 serving".
 *
 * Provider labels are full phrases, not unit nouns, so gluing the quantity
 * in front produces "1 1 serving (68 g)". Multiplying instead gives
 * "2 × 1 bar (68 g)", which is also exactly how a logged entry already
 * reads in the Food Log — one convention across both surfaces.
 */
export function formatPortion(quantity: number, servingLabel: string): string {
  if (quantity === 1) return servingLabel;
  return `${formatQuantity(quantity)} × ${servingLabel}`;
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
