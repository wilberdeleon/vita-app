import type { Ionicons } from '@expo/vector-icons';

type FuelMealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

const ICONS: Record<FuelMealSlot, keyof typeof Ionicons.glyphMap> = {
  Breakfast: 'cafe-outline',
  Lunch: 'restaurant-outline',
  Dinner: 'fish-outline',
  Snack: 'nutrition-outline',
};

/** Shared with the Fuel feature's meal log — keep the signature/export name stable. */
export function restaurantIconFor(slot: FuelMealSlot): keyof typeof Ionicons.glyphMap {
  return ICONS[slot];
}
