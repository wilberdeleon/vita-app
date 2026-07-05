import { FOODS, FUEL_TODAY, RECENT_FOOD_IDS } from './mock';
import type { FoodItem, FuelToday } from './types';

/**
 * Data boundary for Fuel. Sprint 0 serves fixtures; later sprints replace
 * these bodies with Supabase queries — screen contracts stay stable.
 */
export function getFuelToday(): FuelToday {
  return FUEL_TODAY;
}

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
