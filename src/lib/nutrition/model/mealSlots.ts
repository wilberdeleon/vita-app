/**
 * Meal-slot presentation helpers.
 *
 * Moved here from `src/features/dashboard/mealIcons.ts`, where it was an
 * odd fit: only Fuel's two screens ever imported it, so a Fuel concern was
 * reaching into the Dashboard feature — the exact cross-feature import
 * CLAUDE.md rule 4 forbids. Nothing under `src/features/dashboard/`
 * consumed it, so the move leaves Home untouched.
 *
 * Home's own meal rows keep their separate sun-cycle icon set in
 * `features/dashboard/components/MealRow.tsx`. That is the approved Home
 * treatment and is deliberately NOT unified with the list-row icons below —
 * they serve different layouts, and Home's visual design is locked.
 */

import type { Ionicons } from '@expo/vector-icons';
import type { MealSlot } from './types';

const LIST_ICONS: Record<MealSlot, keyof typeof Ionicons.glyphMap> = {
  Breakfast: 'cafe-outline',
  Lunch: 'restaurant-outline',
  Dinner: 'fish-outline',
  Snacks: 'nutrition-outline',
};

/** Icon for a meal slot in Fuel's list rows. */
export function mealSlotIcon(slot: MealSlot): keyof typeof Ionicons.glyphMap {
  return LIST_ICONS[slot];
}

/**
 * The meal a new entry should default to, from the current local hour.
 * A starting point the user can always override on Food Detail — never a
 * silent assignment they can't see or change.
 */
export function defaultMealForTime(date: Date = new Date()): MealSlot {
  const hour = date.getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 16) return 'Lunch';
  if (hour < 21) return 'Dinner';
  return 'Snacks';
}
