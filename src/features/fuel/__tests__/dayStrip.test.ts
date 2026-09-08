/**
 * The Day Strip's arithmetic — order, meal boundaries, and what it speaks.
 *
 * Kept apart from the rendered screen for the same reason `dragLayout.ts`
 * and `weekSwipe.ts` are: the decisions here are functions of a few values,
 * and the strip is only as trustworthy as its ordering.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { createEntry, type FoodEntry, type MealSlot, type VitaFood } from '../../../lib/nutrition';
import { dayStripItems, loggedMeals, spokenStripItem } from '../dayStrip';

const food = (name = 'Oats', calories = 300): VitaFood => ({
  vitaId: `usda:${name}`,
  source: 'usda',
  sourceId: name,
  name,
  servings: [
    { label: '1 cup', quantity: 1, unit: 'cup', nutrition: { calories, protein: 10, carbs: 54, fat: 5 } },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
});

/** An entry logged at a given time, since `createEntry` stamps "now". */
function at(time: string, meal: MealSlot, name = 'Oats', id?: string): FoodEntry {
  const entry = createEntry({ food: food(name), quantity: 1, meal, logDate: '2026-09-07' });
  return { ...entry, loggedAt: `2026-09-07T${time}:00.000Z`, ...(id ? { id } : {}) };
}

describe('ordering the day', () => {
  it('is empty for a day with nothing on it', () => {
    expect(dayStripItems([])).toEqual([]);
  });

  it('sorts by when the food was logged, oldest first', () => {
    const items = dayStripItems([
      at('19:00', 'Dinner', 'Salmon'),
      at('08:00', 'Breakfast', 'Eggs'),
      at('13:00', 'Lunch', 'Salad'),
    ]);
    expect(items.map((item) => item.entry.name)).toEqual(['Eggs', 'Salad', 'Salmon']);
  });

  it('never reorders around calories or meal importance', () => {
    // A day that rearranged itself around which food was biggest would stop
    // being a record of what happened.
    const small = { ...at('08:00', 'Breakfast', 'Apple'), nutrition: { calories: 90, protein: 0, carbs: 25, fat: 0 } };
    const large = { ...at('09:00', 'Snacks', 'Pizza'), nutrition: { calories: 1200, protein: 40, carbs: 140, fat: 50 } };

    expect(dayStripItems([large, small]).map((item) => item.entry.name)).toEqual(['Apple', 'Pizza']);
  });

  it('is deterministic when two foods share a timestamp', () => {
    // Two items logged in the same second must not swap between renders.
    const a = at('08:00', 'Breakfast', 'Eggs', 'entry-a');
    const b = at('08:00', 'Breakfast', 'Toast', 'entry-b');

    expect(dayStripItems([b, a]).map((item) => item.entry.id)).toEqual(['entry-a', 'entry-b']);
    expect(dayStripItems([a, b]).map((item) => item.entry.id)).toEqual(['entry-a', 'entry-b']);
  });

  it('does not mutate the array it was given', () => {
    const entries = [at('19:00', 'Dinner'), at('08:00', 'Breakfast')];
    const order = entries.map((entry) => entry.id);
    dayStripItems(entries);
    expect(entries.map((entry) => entry.id)).toEqual(order);
  });

  it('carries a readable time for every item', () => {
    const [item] = dayStripItems([at('08:00', 'Breakfast')]);
    expect(item.timeLabel).toMatch(/\d/);
    expect(item.timeLabel).not.toContain('T');
  });
});

describe('meal boundaries', () => {
  it('marks the first item of each meal, and no other', () => {
    const items = dayStripItems([
      at('08:00', 'Breakfast', 'Eggs'),
      at('08:10', 'Breakfast', 'Toast'),
      at('13:00', 'Lunch', 'Salad'),
    ]);
    expect(items.map((item) => item.startsMeal)).toEqual([true, false, true]);
  });

  it('marks a meal again when the day returns to it', () => {
    // Someone can snack, eat lunch, then snack again. Both snack blocks are
    // real, and the strip is chronological rather than grouped.
    const items = dayStripItems([
      at('10:00', 'Snacks', 'Nuts'),
      at('13:00', 'Lunch', 'Salad'),
      at('16:00', 'Snacks', 'Apple'),
    ]);
    expect(items.map((item) => item.startsMeal)).toEqual([true, true, true]);
  });
});

describe('what an item says out loud', () => {
  it('names the food, its meal, the time and the calories', () => {
    const [item] = dayStripItems([at('08:00', 'Breakfast', 'Eggs')]);
    const spoken = spokenStripItem(item);

    expect(spoken).toContain('Eggs');
    expect(spoken).toContain('Breakfast');
    expect(spoken).toContain('300 calories');
  });
});

describe('grouping into meals', () => {
  it('lists only meals with something in them, in canonical order', () => {
    const meals = loggedMeals([at('19:00', 'Dinner'), at('08:00', 'Breakfast')]);
    expect(meals.map((meal) => meal.slot)).toEqual(['Breakfast', 'Dinner']);
  });

  it('subtotals each meal', () => {
    const meals = loggedMeals([
      at('08:00', 'Breakfast', 'Eggs'),
      at('08:10', 'Breakfast', 'Toast'),
    ]);
    expect(meals[0].calories).toBe(600);
  });

  it('is empty for a day with nothing logged', () => {
    // Four "No foods logged" rows is a list of things not done, not a list.
    expect(loggedMeals([])).toEqual([]);
  });
});
