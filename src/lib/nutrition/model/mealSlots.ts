/**
 * Meal-slot helpers.
 *
 * The `mealSlotIcon` catalog that used to live here is gone: the Fuel
 * redesign gave meals a warm sunrise-to-sunset color language, so icon and
 * accent are chosen together in `features/fuel/mealAccent.ts` and the old
 * icon-only lookup had no remaining caller. Home keeps its own approved
 * icon set in `features/dashboard/components/MealRow.tsx` — deliberately
 * not unified, since Home's visual design is locked.
 */

import { MEAL_SLOTS, type MealSlot } from './types';

/**
 * Reads a meal slot off a route parameter.
 *
 * Fuel's meal rows deep-link into the logging flow with the meal already
 * chosen (`/fuel/add?meal=Lunch`), and a URL is only as trustworthy as
 * whatever produced it. Anything that isn't one of the four canonical slots
 * returns `undefined`, and the caller falls back to its normal default
 * rather than writing an entry into a meal that doesn't exist.
 */
export function parseMealSlot(value: unknown): MealSlot | undefined {
  return typeof value === 'string' && (MEAL_SLOTS as readonly string[]).includes(value)
    ? (value as MealSlot)
    : undefined;
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
