/**
 * The one food-row derivation — what a row says, and what it refuses to say.
 *
 * Search, Recents and Favorites all render `FoodListRow`, which renders this.
 * Pinning it here means the same yogurt cannot read one way in search results
 * and another in the list of things you have already eaten, which is exactly
 * what the founder's visual-consistency contract exists to prevent.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { foodRowView } from '../foodRow';
import type { VitaFood } from '../../../lib/nutrition';

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Greek yogurt',
  brand: 'Fage',
  servings: [
    {
      label: '1 serving',
      quantity: 1,
      unit: 'serving',
      nutrition: { calories: 140, protein: 18, carbs: 6, fat: 4 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

describe('a complete food', () => {
  const view = foodRowView(food());

  it('leads with the name and supports it with brand and serving', () => {
    expect(view.name).toBe('Greek yogurt');
    expect(view.detail).toBe('Fage · 1 serving');
    expect(view.calories).toBe('140 cal');
  });

  it('speaks the same facts in sentences', () => {
    // Sentences rather than the visible separators — a screen reader says
    // "middle dot" out loud.
    expect(view.spoken).toBe('Greek yogurt. Fage. 1 serving. 140 calories.');
  });

  it('reads the default serving, not the first one', () => {
    const multi = food({
      defaultServingIndex: 1,
      servings: [
        { label: '100 g', quantity: 100, unit: 'g', nutrition: { calories: 59, protein: 10, carbs: 3, fat: 0 } },
        { label: '1 cup', quantity: 1, unit: 'cup', nutrition: { calories: 146, protein: 25, carbs: 8, fat: 1 } },
      ],
    });
    expect(foodRowView(multi).detail).toContain('1 cup');
    expect(foodRowView(multi).calories).toBe('146 cal');
  });
});

describe('what a provider did not give', () => {
  it('omits a missing brand without leaving a separator behind', () => {
    const view = foodRowView(food({ brand: undefined }));
    expect(view.detail).toBe('1 serving');
    expect(view.spoken).toBe('Greek yogurt. 1 serving. 140 calories.');
  });

  it('treats a blank brand as no brand', () => {
    expect(foodRowView(food({ brand: '   ' })).detail).toBe('1 serving');
  });

  it('omits a missing serving label', () => {
    const view = foodRowView(
      food({
        servings: [
          { label: '', quantity: 1, unit: 'serving', nutrition: { calories: 140, protein: 1, carbs: 1, fat: 1 } },
        ],
      }),
    );
    expect(view.detail).toBe('Fage');
    expect(view.spoken).toBe('Greek yogurt. Fage. 140 calories.');
  });

  it('omits calories the provider never supplied', () => {
    // Open Food Facts records routinely lack energy. `null`, never `NaN`.
    const view = foodRowView(
      food({
        servings: [
          {
            label: '1 serving',
            quantity: 1,
            unit: 'serving',
            nutrition: { calories: undefined as unknown as number, protein: 0, carbs: 0, fat: 0 },
          },
        ],
      }),
    );
    expect(view.calories).toBeNull();
    expect(view.spoken).toBe('Greek yogurt. Fage. 1 serving.');
  });

  it('keeps a genuine zero, which is a real answer', () => {
    // Black coffee, a diet soda. `0 cal` is information; hiding it is not.
    const view = foodRowView(
      food({
        servings: [
          { label: '1 cup', quantity: 1, unit: 'cup', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
        ],
      }),
    );
    expect(view.calories).toBe('0 cal');
    expect(view.spoken).toContain('0 calories');
  });

  it('survives a food with a name and nothing else', () => {
    const view = foodRowView(food({ brand: undefined, servings: [], defaultServingIndex: 0 }));
    expect(view.name).toBe('Greek yogurt');
    expect(view.detail).toBeNull();
    expect(view.calories).toBeNull();
    expect(view.spoken).toBe('Greek yogurt.');
  });

  it('never renders a placeholder where data is absent', () => {
    for (const candidate of [
      food({ brand: undefined }),
      food({ servings: [] }),
      food({ brand: '', servings: [] }),
    ]) {
      const view = foodRowView(candidate);
      const all = [view.name, view.detail, view.calories, view.spoken].filter(Boolean).join(' ');
      expect(all).not.toMatch(/undefined|NaN|null/);
      // No orphaned separator at either end, and never two in a row.
      expect(all).not.toMatch(/(^|\s)·(\s|$)\s*·|·\s*$|^\s*·/);
    }
  });
});

describe('long text', () => {
  it('is carried in full, never abbreviated', () => {
    /*
     * The row wraps rather than truncating, so the derivation must not be the
     * thing that shortens a name. Nothing here caps a length or appends an
     * ellipsis — that would put the loss somewhere no layout could undo it.
     */
    const long = food({
      name: 'Organic sprouted whole grain sourdough bread with sunflower and flax seeds',
      brand: 'A Very Long Artisanal Bakery Company Limited',
      servings: [
        {
          label: '1 thick slice, approximately 45 grams',
          quantity: 1,
          unit: 'slice',
          nutrition: { calories: 210, protein: 7, carbs: 38, fat: 3 },
        },
      ],
    });
    const view = foodRowView(long);

    expect(view.name).toBe(long.name);
    expect(view.detail).toContain(long.brand);
    expect(view.detail).toContain('1 thick slice, approximately 45 grams');
    expect(view.spoken).not.toContain('…');
  });
});

describe('formatting', () => {
  it('groups a large calorie figure the way the rest of Fuel does', () => {
    const view = foodRowView(
      food({
        servings: [
          { label: '1 tub', quantity: 1, unit: 'tub', nutrition: { calories: 1240, protein: 1, carbs: 1, fat: 1 } },
        ],
      }),
    );
    expect(view.calories).toBe('1,240 cal');
  });

  it('says nothing about which provider the food came from', () => {
    // `VitaFood` is the UI contract; OFF and USDA are implementation details.
    for (const source of ['usda', 'openfoodfacts', 'vita-custom'] as const) {
      const view = foodRowView(food({ source, vitaId: `${source}:1` }));
      const all = [view.name, view.detail, view.calories, view.spoken].filter(Boolean).join(' ');
      expect(all.toLowerCase()).not.toMatch(/usda|openfoodfacts|off|custom/);
    }
  });
});
