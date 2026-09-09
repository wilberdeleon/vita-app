import { formatCalories, type VitaFood } from '../../lib/nutrition';

/**
 * Everything a food row shows, derived once.
 *
 * Strings only — no `VitaFood`, no provider, no formatting decisions left to
 * the component. A row renders this and nothing else.
 */
export type FoodRowView = {
  /** The food's name, as the provider normalized it. */
  name: string;
  /** `Fage · 1 serving`, or whichever half of it exists, or `null`. */
  detail: string | null;
  /** `140 cal`, or `null` when the provider gave no energy value. */
  calories: string | null;
  /** `Greek yogurt. Fage. 1 serving. 140 calories.` */
  spoken: string;
};

/**
 * **The one derivation behind every food row in Fuel.**
 *
 * ## Why it is a function
 *
 * Before 5.6C, Search, Recents and Favorites each rendered `FoodRow` but the
 * Favorites screen wrapped it in its own layout, and the row itself assembled
 * its subtitle inline. Four screens formatting the same food is four chances
 * for the same yogurt to read differently depending on where you found it —
 * the exact inconsistency the founder's visual contract exists to remove. One
 * function, one set of words, every surface.
 *
 * ## It states what exists and invents nothing
 *
 * A provider food routinely arrives without a brand, without a serving label,
 * or — for an incomplete Open Food Facts record — without calories. Each is
 * simply omitted rather than filled with a placeholder: **no `undefined`, no
 * `NaN`, and no orphaned `·` separator**. A food with only a name renders as a
 * food with only a name.
 *
 * ## The spoken form carries the same facts
 *
 * Sentences rather than the visible line's separators, because a screen reader
 * reading `Fage · 1 serving` says the punctuation. Nothing is added to it that
 * the row does not show, and nothing shown is left out of it.
 */
export function foodRowView(food: VitaFood): FoodRowView {
  const serving = food.servings[food.defaultServingIndex] ?? food.servings[0];
  const brand = food.brand?.trim() || null;
  const servingLabel = serving?.label?.trim() || null;

  /*
   * `0` is a real answer — black coffee, a diet soda — so only a missing or
   * non-finite value counts as absent. `?? null` on a number would let a
   * genuine zero through and `|| null` would not, which is the bug this
   * spells out rather than relies on.
   */
  const energy = serving?.nutrition.calories;
  const hasEnergy = typeof energy === 'number' && Number.isFinite(energy);

  return {
    name: food.name,
    detail: [brand, servingLabel].filter(Boolean).join(' · ') || null,
    calories: hasEnergy ? `${formatCalories(energy)} cal` : null,
    spoken: [
      food.name,
      brand,
      servingLabel,
      hasEnergy ? `${formatCalories(energy)} calories` : null,
    ]
      .filter(Boolean)
      .join('. ')
      .concat('.'),
  };
}
