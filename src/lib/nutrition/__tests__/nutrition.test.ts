/**
 * The nutrition arithmetic, characterized.
 *
 * Slice 5.6A's first job is a safety net. Fuel is the second-largest domain
 * in VITA and had **no tests at all** — the provider, both external
 * adapters, the repository, dedupe, ranking and all nine routes were
 * uncovered. These describe the behaviour *as it already is*, so the goal
 * changes that follow can be shown not to have moved anything else.
 *
 * The rule this file exists to pin: **totals are derived, never stored.**
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import {
  EMPTY_NUTRITION,
  MEAL_SLOTS,
  addNutrition,
  createEntry,
  dailyTotals,
  groupByMeal,
  nutritionForServing,
  scaleNutrition,
  summarizeMeals,
  sumEntries,
  type FoodEntry,
  type NutritionFacts,
  type VitaFood,
} from '..';

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Oats',
  servings: [
    {
      label: '1 cup',
      quantity: 1,
      unit: 'cup',
      nutrition: { calories: 300, protein: 10, carbs: 54, fat: 5 },
    },
    {
      label: '100 g',
      quantity: 100,
      unit: 'g',
      gramWeight: 100,
      nutrition: { calories: 389, protein: 17, carbs: 66, fat: 7 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

describe('scaling nutrition', () => {
  it('multiplies the four macros', () => {
    expect(scaleNutrition({ calories: 100, protein: 10, carbs: 20, fat: 5 }, 2)).toEqual({
      calories: 200,
      protein: 20,
      carbs: 40,
      fat: 10,
    });
  });

  it('scales an optional nutrient that is present', () => {
    const scaled = scaleNutrition(
      { calories: 100, protein: 1, carbs: 2, fat: 3, fiber: 4 },
      0.5,
    );
    expect(scaled.fiber).toBe(2);
  });

  it('leaves an absent optional nutrient absent', () => {
    /*
     * The distinction the whole model turns on: "we don't know this food's
     * sodium" is not "this food has 0 mg of sodium". Inventing the zero
     * would make the two indistinguishable downstream.
     */
    const scaled = scaleNutrition({ calories: 100, protein: 1, carbs: 2, fat: 3 }, 2);
    expect('sodium' in scaled).toBe(false);
    expect('fiber' in scaled).toBe(false);
  });

  it('handles a half serving without rounding', () => {
    expect(scaleNutrition({ calories: 301, protein: 1, carbs: 1, fat: 1 }, 0.5).calories).toBe(150.5);
  });
});

describe('adding nutrition', () => {
  it('sums the macros', () => {
    const total = addNutrition(
      { calories: 100, protein: 10, carbs: 20, fat: 5 },
      { calories: 50, protein: 5, carbs: 10, fat: 2 },
    );
    expect(total).toEqual({ calories: 150, protein: 15, carbs: 30, fat: 7 });
  });

  it('keeps a partial total when only one side knows an optional nutrient', () => {
    // "At least this much fibre" beats a day's fibre vanishing because one
    // food lacked the field.
    const total = addNutrition(
      { calories: 100, protein: 1, carbs: 1, fat: 1, fiber: 6 },
      { calories: 100, protein: 1, carbs: 1, fat: 1 },
    );
    expect(total.fiber).toBe(6);
  });

  it('leaves an optional nutrient absent when neither side knows it', () => {
    const total = addNutrition(
      { calories: 100, protein: 1, carbs: 1, fat: 1 },
      { calories: 100, protein: 1, carbs: 1, fat: 1 },
    );
    expect('fiber' in total).toBe(false);
  });
});

describe('summing entries', () => {
  const entry = (nutrition: NutritionFacts, meal: FoodEntry['meal'] = 'Breakfast') =>
    ({ ...createEntry({ food: food(), quantity: 1, meal }), nutrition }) as FoodEntry;

  it('is empty for no entries', () => {
    expect(sumEntries([])).toEqual(EMPTY_NUTRITION);
  });

  it('returns a single entry unchanged', () => {
    expect(sumEntries([entry({ calories: 300, protein: 10, carbs: 54, fat: 5 })])).toEqual({
      calories: 300,
      protein: 10,
      carbs: 54,
      fat: 5,
    });
  });

  it('adds several entries', () => {
    const total = sumEntries([
      entry({ calories: 300, protein: 10, carbs: 54, fat: 5 }),
      entry({ calories: 200, protein: 20, carbs: 10, fat: 8 }),
      entry({ calories: 100, protein: 2, carbs: 20, fat: 1 }),
    ]);
    expect(total).toEqual({ calories: 600, protein: 32, carbs: 84, fat: 14 });
  });
});

describe('meals', () => {
  it('has exactly four canonical slots, in order', () => {
    // The model is the source of truth; nothing invents a fifth meal.
    expect(MEAL_SLOTS).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snacks']);
  });

  it('groups every slot, empty ones included', () => {
    const grouped = groupByMeal([]);
    expect(Object.keys(grouped).sort()).toEqual([...MEAL_SLOTS].sort());
    for (const slot of MEAL_SLOTS) expect(grouped[slot]).toEqual([]);
  });

  it('files each entry under its own meal', () => {
    const breakfast = createEntry({ food: food(), quantity: 1, meal: 'Breakfast' });
    const dinner = createEntry({ food: food(), quantity: 2, meal: 'Dinner' });

    const grouped = groupByMeal([breakfast, dinner]);
    expect(grouped.Breakfast).toHaveLength(1);
    expect(grouped.Dinner).toHaveLength(1);
    expect(grouped.Lunch).toHaveLength(0);
  });

  it('summarizes slots in canonical order with their own totals', () => {
    const summaries = summarizeMeals([
      createEntry({ food: food(), quantity: 1, meal: 'Lunch' }),
      createEntry({ food: food(), quantity: 1, meal: 'Lunch' }),
    ]);

    expect(summaries.map((meal) => meal.slot)).toEqual([...MEAL_SLOTS]);
    const lunch = summaries.find((meal) => meal.slot === 'Lunch')!;
    expect(lunch.itemCount).toBe(2);
    expect(lunch.nutrition.calories).toBe(600);
    expect(summaries.find((meal) => meal.slot === 'Dinner')!.itemCount).toBe(0);
  });
});

describe('creating an entry from a food', () => {
  it('stores the nutrition already multiplied', () => {
    const entry = createEntry({ food: food(), quantity: 2, meal: 'Breakfast' });
    expect(entry.nutrition).toEqual({ calories: 600, protein: 20, carbs: 108, fat: 10 });
  });

  it('snapshots the name, the serving and the source', () => {
    /*
     * The snapshot rule: nothing downstream re-derives an entry from its
     * food, so a later provider revision — or deleting the custom food
     * outright — cannot alter or blank what was already logged.
     */
    const entry = createEntry({ food: food({ brand: 'Quaker' }), quantity: 1, meal: 'Lunch' });
    expect(entry.name).toBe('Oats');
    expect(entry.brand).toBe('Quaker');
    expect(entry.serving).toMatchObject({ label: '1 cup', quantity: 1, unit: 'cup' });
    expect(entry.foodRef).toEqual({ source: 'usda', sourceId: '1', vitaFoodId: 'usda:1' });
  });

  it('carries the image forward when the food has one', () => {
    const entry = createEntry({
      food: food({ imageUrl: 'https://example.test/oats.jpg' }),
      quantity: 1,
      meal: 'Snacks',
    });
    expect(entry.imageUrl).toBe('https://example.test/oats.jpg');
  });

  it('omits the image entirely when the food has none', () => {
    const entry = createEntry({ food: food(), quantity: 1, meal: 'Snacks' });
    expect('imageUrl' in entry).toBe(false);
  });

  it('uses the named serving, and scales its gram weight', () => {
    const entry = createEntry({ food: food(), servingIndex: 1, quantity: 2, meal: 'Dinner' });
    expect(entry.serving.label).toBe('100 g');
    expect(entry.serving.gramWeight).toBe(200);
  });

  it('falls back to the default serving when the index is out of range', () => {
    const entry = createEntry({ food: food(), servingIndex: 99, quantity: 1, meal: 'Dinner' });
    expect(entry.serving.label).toBe('1 cup');
  });

  it('never mutates the food it was built from', () => {
    const source = food();
    const before = JSON.stringify(source);
    createEntry({ food: source, quantity: 3, meal: 'Breakfast' });
    expect(JSON.stringify(source)).toBe(before);
  });

  it('records when it was logged, and on which day', () => {
    const entry = createEntry({
      food: food(),
      quantity: 1,
      meal: 'Breakfast',
      logDate: '2026-09-01',
    });
    expect(entry.logDate).toBe('2026-09-01');
    expect(Number.isNaN(Date.parse(entry.loggedAt))).toBe(false);
  });

  it('gives every entry its own id', () => {
    const a = createEntry({ food: food(), quantity: 1, meal: 'Breakfast' });
    const b = createEntry({ food: food(), quantity: 1, meal: 'Breakfast' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('nutrition for a serving', () => {
  it('multiplies the chosen serving', () => {
    expect(nutritionForServing(food().servings[1], 1.5).calories).toBe(583.5);
  });
});

describe('the day, derived', () => {
  const goals = { calories: 2000, protein: 150, carbs: 200, fat: 60 };

  it('is empty with no entries', () => {
    const totals = dailyTotals([], goals);
    expect(totals.nutrition).toEqual(EMPTY_NUTRITION);
  });

  it('sums what was logged', () => {
    const totals = dailyTotals(
      [createEntry({ food: food(), quantity: 2, meal: 'Breakfast' })],
      goals,
    );
    expect(totals.nutrition.calories).toBe(600);
  });
});
