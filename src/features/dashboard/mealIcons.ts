import type { Ionicons } from '@expo/vector-icons';
import type { MealEntry } from './types';

const ICONS: Record<MealEntry['slot'], keyof typeof Ionicons.glyphMap> = {
  Breakfast: 'cafe-outline',
  Lunch: 'restaurant-outline',
  Dinner: 'fish-outline',
  Snack: 'nutrition-outline',
};

export function restaurantIconFor(slot: MealEntry['slot']): keyof typeof Ionicons.glyphMap {
  return ICONS[slot];
}
