/**
 * Factories for the two things the user creates: custom foods and log
 * entries.
 *
 * Kept pure and separate from storage so the same functions serve manual
 * entry today and provider results later — a food built from a USDA
 * response and a food the user typed in produce the identical `VitaFood`,
 * which is what lets Favorites, Recents, and Food Detail stay
 * source-agnostic.
 */

import { todayLogDate, type LogDate } from './dates';
import { scaleNutrition } from './nutrition';
import type { FoodEntry, MealSlot, NutritionFacts, ServingOption, VitaFood } from './types';

/**
 * Collision-resistant enough for a local log: a millisecond timestamp plus
 * random suffix. Deliberately not a uuid dependency — ids never leave the
 * device in Sprint 2, and when Supabase arrives it issues its own.
 */
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export type CustomFoodInput = {
  name: string;
  brand?: string;
  servingQuantity: number;
  servingUnit: string;
  nutrition: NutritionFacts;
};

/**
 * Builds the serving label the user sees. "1 serving" rather than
 * "1 serving of 1", and no trailing ".0" on whole numbers.
 */
export function servingLabel(quantity: number, unit: string): string {
  const amount = Number.isInteger(quantity) ? String(quantity) : String(Number(quantity.toFixed(2)));
  return `${amount} ${unit}`;
}

/**
 * A user-created food, shaped exactly like a provider-sourced one.
 *
 * The nutrition entered describes ONE serving of the size given, which is
 * how nutrition labels read — a 240 ml serving with 120 kcal means 120 kcal
 * per 240 ml, not per ml. Storing it as a single `ServingOption` keeps that
 * honest instead of normalizing to a per-unit figure the user never saw.
 */
export function createCustomFood(input: CustomFoodInput): VitaFood {
  const sourceId = newId('custom');
  const serving: ServingOption = {
    label: servingLabel(input.servingQuantity, input.servingUnit),
    quantity: input.servingQuantity,
    unit: input.servingUnit,
    nutrition: input.nutrition,
  };

  return {
    vitaId: `vita-custom:${sourceId}`,
    source: 'vita-custom',
    sourceId,
    name: input.name.trim(),
    ...(input.brand?.trim() ? { brand: input.brand.trim() } : {}),
    servings: [serving],
    defaultServingIndex: 0,
    isCustom: true,
    fetchedAt: new Date().toISOString(),
  };
}

export type CreateEntryInput = {
  food: VitaFood;
  /** Index into `food.servings`. Falls back to the food's default if out of range. */
  servingIndex?: number;
  /** How many of that serving — supports 0.5, 1.5, and so on. */
  quantity: number;
  meal: MealSlot;
  /** Defaults to today. Explicit only for tests and future history editing. */
  logDate?: LogDate;
};

/**
 * Turns a food + serving + quantity into a logged entry.
 *
 * The nutrition is computed here and **stored on the entry**, already
 * multiplied. Nothing downstream re-derives it from the food, so a later
 * provider revision — or deleting the custom food outright — cannot alter
 * or blank out what was already logged.
 */
export function createEntry({ food, servingIndex, quantity, meal, logDate }: CreateEntryInput): FoodEntry {
  const index =
    servingIndex !== undefined && servingIndex >= 0 && servingIndex < food.servings.length
      ? servingIndex
      : food.defaultServingIndex;
  const serving = food.servings[index] ?? food.servings[0];
  const now = new Date();

  return {
    id: newId('entry'),
    logDate: logDate ?? todayLogDate(),
    loggedAt: now.toISOString(),
    meal,
    foodRef: {
      source: food.source,
      sourceId: food.sourceId,
      vitaFoodId: food.vitaId,
    },
    name: food.name,
    ...(food.brand ? { brand: food.brand } : {}),
    serving: {
      label: serving.label,
      quantity,
      unit: serving.unit,
      ...(serving.gramWeight !== undefined ? { gramWeight: serving.gramWeight * quantity } : {}),
    },
    nutrition: scaleNutrition(serving.nutrition, quantity),
  };
}

/**
 * How an entry's serving reads in the log: "1 serving", "2 × 1 cup".
 * A single serving doesn't need a multiplier in front of it.
 */
export function entryServingLabel(entry: FoodEntry): string {
  if (entry.serving.quantity === 1) return entry.serving.label;
  const amount = Number.isInteger(entry.serving.quantity)
    ? String(entry.serving.quantity)
    : String(Number(entry.serving.quantity.toFixed(2)));
  return `${amount} × ${entry.serving.label}`;
}
