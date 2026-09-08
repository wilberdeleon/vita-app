/**
 * Today's food, arranged along the day — the data behind Fuel's hero.
 *
 * **A presentation selector, outside the domain.** Nothing here reads or
 * writes storage, and nothing recomputes nutrition: the entries arrive
 * already summed and snapshotted, and this only orders them and decides what
 * each one should look like. The same split `features/peptides/month.ts`
 * uses, and the reason the Day Strip can be tested without a running app.
 *
 * ## Why the strip is chronological rather than grouped by meal
 *
 * Because the question it answers is *what did I eat today*, in the order it
 * happened. Meals are a filing system the user chose at logging time; the
 * day is what actually occurred. Meal identity is still carried on every
 * item so the strip can mark a boundary where one begins, but it never
 * reorders around it.
 */

import { formatClockTime } from '../../lib/daily';
import type { FoodEntry, MealSlot } from '../../lib/nutrition';
import { MEAL_SLOTS } from '../../lib/nutrition';

export type DayStripItem = {
  entry: FoodEntry;
  /** `8:12 AM` — the moment it was logged, not the meal it was filed under. */
  timeLabel: string;
  meal: MealSlot;
  /** True when this item opens a meal the previous one was not part of. */
  startsMeal: boolean;
};

/**
 * The day in order, oldest first.
 *
 * **Sorted by `loggedAt`, never by calories or meal importance.** A day that
 * reordered itself around which food was biggest would stop being a record
 * of what happened. Identical timestamps fall back to entry id, so the order
 * is deterministic rather than dependent on however storage returned them —
 * two foods logged in the same second must not swap places between renders.
 */
export function dayStripItems(entries: readonly FoodEntry[]): DayStripItem[] {
  const ordered = [...entries].sort((a, b) => {
    const byTime = a.loggedAt.localeCompare(b.loggedAt);
    return byTime !== 0 ? byTime : a.id.localeCompare(b.id);
  });

  let previousMeal: MealSlot | null = null;
  return ordered.map((entry) => {
    const startsMeal = entry.meal !== previousMeal;
    previousMeal = entry.meal;
    return {
      entry,
      timeLabel: formatClockTime(entry.loggedAt),
      meal: entry.meal,
      startsMeal,
    };
  });
}

/**
 * How one item is spoken — §68.
 *
 * `Greek yogurt, Breakfast, 8:12 AM, 140 calories`. The drawing is never the
 * only way to know what is on this strip, which is the rule `BodyMap`
 * established: anything a figure says must also exist as text.
 */
export function spokenStripItem(item: DayStripItem): string {
  const calories = Math.round(item.entry.nutrition.calories);
  return `${item.entry.name}, ${item.meal}, ${item.timeLabel}, ${calories} calories`;
}

export type MealGroup = {
  slot: MealSlot;
  entries: FoodEntry[];
  calories: number;
};

/**
 * All four meals, in canonical order, with what is in each.
 *
 * **Empty slots are kept** (founder ruling, 5.6B.1). 5.6B hid them, which
 * made the section disappear entirely on an untouched day and cost the
 * structure people navigate by — *this is what a day is made of*. What made
 * the original version heavy was not their presence but their weight: four
 * full rows saying *No foods logged* inside a card. They are one compact
 * line each now.
 */
export function mealGroups(entries: readonly FoodEntry[]): MealGroup[] {
  return MEAL_SLOTS.map((slot) => {
    const inMeal = entries.filter((entry) => entry.meal === slot);
    return {
      slot,
      entries: inMeal,
      calories: inMeal.reduce((total, entry) => total + entry.nutrition.calories, 0),
    };
  });
}

/** Only the meals with something in them — for callers that need just those. */
export function loggedMeals(entries: readonly FoodEntry[]): MealGroup[] {
  return mealGroups(entries).filter((meal) => meal.entries.length > 0);
}
