/**
 * Adapter from the interim fixture catalog to the normalized food model.
 *
 * This is a provider adapter in miniature, and deliberately so: Food Detail,
 * Search, Recent, and Favorites all speak `VitaFood` and know nothing about
 * where a food came from. When USDA, Open Food Facts, and FatSecret adapters
 * land in slice 2.6 they slot in exactly here, and this file is deleted with
 * nothing downstream changing.
 *
 * The fixture foods carry `source: 'vita-fixture'` rather than pretending to
 * be user-created — provenance stays honest even for placeholder data.
 */

import type { NutritionFacts, ServingOption, VitaFood } from '../../lib/nutrition';
import { FOODS, RECENT_FOOD_IDS } from './mock';
import type { FoodItem } from './types';

function toNutrition(item: FoodItem): NutritionFacts {
  return {
    calories: item.kcal,
    protein: item.nutrition.protein,
    carbs: item.nutrition.totalCarbs,
    fat: item.nutrition.totalFat,
    saturatedFat: item.nutrition.saturatedFat,
    sugar: item.nutrition.totalSugars,
    sodium: item.nutrition.sodium,
  };
}

/**
 * The fixture catalog describes each food with a single prose serving
 * ("Per bowl", "Per medium"), so each maps to exactly one `ServingOption`.
 * Real providers supply several; nothing here assumes one, and Food Detail
 * renders a picker whenever more than one exists.
 */
function toServing(item: FoodItem): ServingOption {
  return {
    // "Per serving" is a description, not a label the user picks — reduced
    // to the noun so the quantity control reads "1 serving", not "1 Per serving".
    label: item.perServing.replace(/^per\s+/i, '') || 'serving',
    quantity: 1,
    unit: item.perServing.replace(/^per\s+/i, '') || 'serving',
    nutrition: toNutrition(item),
  };
}

export function toVitaFood(item: FoodItem): VitaFood {
  return {
    vitaId: `vita-fixture:${item.id}`,
    source: 'vita-fixture',
    sourceId: item.id,
    name: item.name,
    ...(item.brand ? { brand: item.brand } : {}),
    servings: [toServing(item)],
    defaultServingIndex: 0,
    isCustom: false,
    fetchedAt: new Date(0).toISOString(),
  };
}

export function getFixtureFood(vitaId: string): VitaFood | undefined {
  const sourceId = vitaId.startsWith('vita-fixture:') ? vitaId.slice('vita-fixture:'.length) : vitaId;
  const item = FOODS.find((food) => food.id === sourceId);
  return item ? toVitaFood(item) : undefined;
}

export function searchFixtureFoods(query: string): VitaFood[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FOODS.filter((food) => food.name.toLowerCase().includes(q)).map(toVitaFood);
}

export function getFixtureRecents(): VitaFood[] {
  return RECENT_FOOD_IDS.map((id) => FOODS.find((food) => food.id === id))
    .filter((food): food is FoodItem => Boolean(food))
    .map(toVitaFood);
}

export function getFixtureFavorites(): VitaFood[] {
  return FOODS.filter((food) => food.favorite).map(toVitaFood);
}
