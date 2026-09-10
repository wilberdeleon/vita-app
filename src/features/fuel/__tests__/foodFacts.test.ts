/**
 * The one item-level nutrition derivation — what a food's panel says, and what
 * it refuses to say.
 *
 * Food Detail, Edit Entry and the manual form all render `FoodFacts`, which
 * renders this. Pinning it here means the same yogurt cannot read one way on
 * the screen that logs it and another on the screen that edits it — and, more
 * importantly, that no daily goal can find its way into an item panel by
 * accident.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { foodFacts, foodIdentity, servingFacts } from '../foodFacts';
import type { NutritionFacts, VitaFood } from '../../../lib/nutrition';

const full: NutritionFacts = { calories: 140, protein: 18, carbs: 6, fat: 4 };

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Greek yogurt',
  brand: 'Fage',
  servings: [
    { label: '1 container', quantity: 1, unit: 'container', nutrition: full },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

describe('a complete food', () => {
  const view = foodFacts(full, '1 container');

  it('states the calories in this portion', () => {
    expect(view.calories).toBe('140');
    expect(view.portion).toBe('1 container');
  });

  it('captions them as calories and nothing more', () => {
    /*
     * **Not `Calories consumed`.** That is Fuel Home's sentence about a day,
     * and this food has not been eaten. Confusing the two is the exact
     * ambiguity 5.6B.4 fixed on Fuel Home, in the other direction.
     */
    expect(view.caption).toBe('Calories');
    expect(view.caption).not.toMatch(/consumed|left|remaining|goal/i);
  });

  it('carries the three macros in Fuel’s order', () => {
    expect(view.macros.map((macro) => macro.key)).toEqual(['protein', 'carbs', 'fat']);
    expect(view.macros.map((macro) => macro.value)).toEqual(['18 g', '6 g', '4 g']);
  });

  it('speaks grams rather than a unit glyph', () => {
    // "18 g" read aloud is "eighteen gee".
    expect(view.macros[0].spoken).toBe('18 grams protein.');
    expect(view.macros[1].spoken).toBe('6 grams carbohydrates.');
    expect(view.spoken).toContain('140 calories.');
  });
});

describe('what the panel will not say', () => {
  const view = foodFacts(full, '1 container');
  const everything = [
    view.calories,
    view.caption,
    view.portion,
    view.spoken,
    ...view.macros.flatMap((macro) => [macro.label, macro.value, macro.spoken]),
  ]
    .filter(Boolean)
    .join(' ');

  it('never mentions a goal, a target, a remainder or a percentage', () => {
    // §37, §45, §87 — a food is not measured against a person's day.
    expect(everything).not.toMatch(/goal|target|left|remaining|allowance|ceiling|%/i);
  });

  it('never grades, scores or recommends', () => {
    expect(everything).not.toMatch(/score|grade|healthy|good|bad|better|worse|recommend/i);
  });

  it('carries no colour, no rail and no progress of any kind', () => {
    // The view model has no field for one, which is the point: a presentation
    // that cannot express a rail cannot grow one by accident.
    expect(Object.keys(view)).toEqual(['calories', 'caption', 'portion', 'macros', 'spoken']);
    expect(Object.keys(view.macros[0])).toEqual(['key', 'label', 'value', 'spoken']);
  });
});

describe('what a provider did not give', () => {
  it('reports a missing macro as absent, never as zero', () => {
    const sparse = { calories: 90, protein: undefined, carbs: 4, fat: undefined } as unknown as NutritionFacts;
    const view = foodFacts(sparse, '1 serving');

    expect(view.macros[0].value).toBeNull();
    expect(view.macros[1].value).toBe('4 g');
    expect(view.macros[2].value).toBeNull();
    expect(view.macros[0].spoken).toBe('Protein not listed.');
  });

  it('keeps a genuine zero, which is a real answer', () => {
    // Black coffee has 0 g of fat. That is information; hiding it is not.
    const view = foodFacts({ calories: 0, protein: 0, carbs: 0, fat: 0 }, '1 cup');
    expect(view.calories).toBe('0');
    expect(view.macros.map((macro) => macro.value)).toEqual(['0 g', '0 g', '0 g']);
  });

  it('reports missing calories rather than printing nothing', () => {
    const view = foodFacts({ protein: 1, carbs: 1, fat: 1 } as unknown as NutritionFacts, '1 serving');
    expect(view.calories).toBeNull();
    expect(view.spoken).toContain('Calories not listed.');
  });

  it('never produces NaN, undefined or null as text', () => {
    for (const nutrition of [
      { calories: NaN, protein: NaN, carbs: NaN, fat: NaN },
      {} as NutritionFacts,
      { calories: 100 } as NutritionFacts,
    ]) {
      const view = foodFacts(nutrition as NutritionFacts, '1 serving');
      const text = [view.calories, view.spoken, ...view.macros.map((macro) => macro.value)]
        .filter(Boolean)
        .join(' ');
      expect(text).not.toMatch(/NaN|undefined|null/);
    }
  });
});

describe('the portion', () => {
  it('pluralises through the same helper the log uses', () => {
    expect(servingFacts(full, '1 container', 1).portion).toBe('1 container');
    expect(servingFacts(full, '1 container', 2).portion).toContain('2');
  });

  it('leads the spoken description, so the figures have a subject', () => {
    expect(servingFacts(full, '1 container', 1).spoken.startsWith('1 container.')).toBe(true);
  });

  it('groups a large calorie figure the way the rest of Fuel does', () => {
    expect(foodFacts({ ...full, calories: 1240 }, '1 tub').calories).toBe('1,240');
  });
});

describe('the identity line', () => {
  it('joins only the parts that exist', () => {
    expect(foodIdentity(food(), '1 container').detail).toBe('Fage · 1 container');
    expect(foodIdentity(food({ brand: undefined }), '1 container').detail).toBe('1 container');
    expect(foodIdentity(food({ brand: undefined }), null).detail).toBeNull();
  });

  it('treats a blank brand as no brand', () => {
    expect(foodIdentity(food({ brand: '   ' }), '1 container').detail).toBe('1 container');
  });

  it('never leaves a separator where a value is missing', () => {
    for (const candidate of [
      food({ brand: undefined }),
      food({ brand: '' }),
      food({ brand: '  ', restaurant: undefined }),
    ]) {
      for (const serving of ['1 container', null, '', '  ']) {
        const view = foodIdentity(candidate, serving);
        const text = [view.name, view.detail, view.spoken].filter(Boolean).join(' ');
        expect(text).not.toMatch(/undefined|NaN|null/);
        expect(text).not.toMatch(/·\s*·|·\s*$|^\s*·/);
      }
    }
  });

  it('carries a long name in full, never abbreviated', () => {
    const long = food({
      name: 'Organic sprouted whole grain sourdough bread with sunflower and flax seeds',
    });
    expect(foodIdentity(long, '1 slice').name).toBe(long.name);
    expect(foodIdentity(long, '1 slice').spoken).not.toContain('…');
  });

  it('says nothing about which provider the food came from', () => {
    for (const source of ['usda', 'openfoodfacts', 'vita-custom'] as const) {
      const view = foodIdentity(food({ source }), '1 container');
      const text = [view.name, view.detail, view.spoken].filter(Boolean).join(' ');
      expect(text.toLowerCase()).not.toMatch(/usda|openfoodfacts|custom/);
    }
  });

  it('states the serving the user selected, not the food’s default', () => {
    /*
     * The one deliberate difference from `foodRowView`. A row shows the default
     * serving because that is all it knows; a detail screen shows the one
     * chosen, which is what the figures beside it are for.
     */
    const multi = food({
      servings: [
        { label: '1 container', quantity: 1, unit: 'container', nutrition: full },
        { label: '100 g', quantity: 100, unit: 'g', nutrition: { calories: 59, protein: 10, carbs: 3, fat: 0 } },
      ],
    });
    expect(foodIdentity(multi, '100 g').detail).toContain('100 g');
  });
});
