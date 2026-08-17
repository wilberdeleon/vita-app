import { FOODS, RECENT_FOOD_IDS } from './mock';
import type { FoodItem } from './types';

/**
 * Fuel's interim food-catalog boundary. `getFuelToday()` was removed in
 * slice 2.1 — daily nutrition is served by `src/lib/nutrition` from real
 * logged entries. What remains here is the fixture catalog behind Search,
 * Recent, Favorites, and Food Detail, replaced by the provider layer in
 * slice 2.6.
 */
export function getRecentFoods(): FoodItem[] {
  return RECENT_FOOD_IDS.map((id) => FOODS.find((food) => food.id === id)).filter(
    (food): food is FoodItem => Boolean(food),
  );
}

export function getFavoriteFoods(): FoodItem[] {
  return FOODS.filter((food) => food.favorite);
}

export function searchFoods(query: string): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FOODS.filter((food) => food.name.toLowerCase().includes(q));
}

export function getFoodById(id: string): FoodItem | undefined {
  return FOODS.find((food) => food.id === id);
}
