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

import { todayLogDate, type LogDate } from '../../daily/dates';
import { newId } from '../../daily/ids';
import { scaleNutrition } from './nutrition';
import type { FoodEntry, MealSlot, NutritionFacts, ServingOption, VitaFood } from './types';

/**
 * Re-exported, not redefined. `newId` moved to `src/lib/daily/ids.ts` in
 * Sprint 3 slice 3.1 so Water and Peptides share one id scheme; keeping the
 * name exported from here means nothing that imports it had to change.
 */
export { newId };

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
    ...(food.imageUrl ? { imageUrl: food.imageUrl } : {}),
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
 * Reconstructs a one-serving option from a logged entry alone.
 *
 * An entry stores nutrition already multiplied by quantity, so dividing back
 * out recovers what a single serving was worth at the moment it was logged.
 * That is what lets an entry stay editable after its food definition is
 * gone — a deleted custom food, or a provider result that is no longer
 * cached. The snapshot design pays off here: history is self-sufficient.
 */
export function servingFromEntry(entry: FoodEntry): ServingOption {
  const divisor = entry.serving.quantity > 0 ? entry.serving.quantity : 1;
  return {
    label: entry.serving.label,
    quantity: 1,
    unit: entry.serving.unit,
    ...(entry.serving.gramWeight !== undefined
      ? { gramWeight: entry.serving.gramWeight / divisor }
      : {}),
    nutrition: scaleNutrition(entry.nutrition, 1 / divisor),
  };
}

/**
 * Rebuilds a usable `VitaFood` from a logged entry alone.
 *
 * This is what makes Recents work without the network. An entry already
 * carries the food's name, brand, provenance, and a nutrition snapshot, so
 * a food the user logged three weeks ago stays loggable even after the
 * provider cache expired, the custom food was deleted, or the device went
 * offline. No API call, no fabricated data — only what the user's own
 * history already recorded.
 *
 * The result carries a single serving: the one they actually used.
 */
export function foodFromEntry(entry: FoodEntry): VitaFood {
  return {
    vitaId: entry.foodRef.vitaFoodId,
    source: entry.foodRef.source,
    sourceId: entry.foodRef.sourceId,
    name: entry.name,
    ...(entry.brand ? { brand: entry.brand } : {}),
    ...(entry.imageUrl ? { imageUrl: entry.imageUrl } : {}),
    servings: [servingFromEntry(entry)],
    defaultServingIndex: 0,
    isCustom: entry.foodRef.source === 'vita-custom',
    fetchedAt: entry.loggedAt,
  };
}

/**
 * The serving options to offer when editing an entry, plus which one is
 * currently selected.
 *
 * Three cases, in order of preference:
 *  1. The food resolves and one of its servings matches the entry — offer
 *     the food's full set, selected on the match.
 *  2. The food resolves but nothing matches (its servings changed since the
 *     entry was logged) — keep the entry's own serving as the first option
 *     so the stored value is never silently rewritten, then the rest.
 *  3. The food is gone — the entry's own serving is all there is.
 */
export function editableServings(
  entry: FoodEntry,
  food: VitaFood | undefined,
): { servings: ServingOption[]; selectedIndex: number } {
  const own = servingFromEntry(entry);
  if (!food || food.servings.length === 0) {
    return { servings: [own], selectedIndex: 0 };
  }

  const matched = food.servings.findIndex(
    (option) => option.label === entry.serving.label && option.unit === entry.serving.unit,
  );
  if (matched >= 0) {
    return { servings: food.servings, selectedIndex: matched };
  }
  return { servings: [own, ...food.servings], selectedIndex: 0 };
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
