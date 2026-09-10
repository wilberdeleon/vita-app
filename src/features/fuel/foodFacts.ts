import {
  MACROS,
  formatAmount,
  formatCalories,
  formatPortion,
  type MacroKey,
  type NutritionFacts,
  type VitaFood,
} from '../../lib/nutrition';

/**
 * **What one food, at one portion, contains** — derived once for every screen
 * that shows it.
 *
 * ## Why this exists alongside `calorieSummary`
 *
 * `calorieSummary` answers *how is the day going*: it knows about goals, what
 * is left, and whether a target was passed. This answers a different question
 * — *what is in this thing* — and it deliberately knows about none of that.
 *
 * They were the same function once, in effect: Food Detail rendered a big
 * number over the word `Calories` in the same display face Fuel Home uses for
 * `Calories consumed`, and the two could be read as the same measurement. They
 * are not. **The figure here belongs to a food that has not been logged**, and
 * a person looking at 140 on Food Detail is being told what a container of
 * yogurt holds, not what they have eaten today. So the caption is `Calories`
 * with the portion stated beside it, and the words `consumed`, `left`, `goal`
 * and `remaining` do not appear on this screen at all.
 *
 * ## No goals, ever, at item level
 *
 * Founder ruling, §37 and §45. Nothing derived here carries a target, a
 * remainder, a percentage, a rail or a denominator. A food is not measured
 * against a person's day, because doing that is one short step from telling
 * them whether they should eat it — which VITA does not do. There is no score,
 * no grade, no traffic light, and nothing here ranks one food against another.
 *
 * ## Missing is missing
 *
 * Providers routinely omit values. A macro the food does not carry is `null`,
 * never `0`, and never `NaN` or the string `undefined` — the model draws that
 * distinction deliberately at the provider boundary and flattening it here
 * would throw it away at the one point where a reader would notice.
 */

export type MacroFact = {
  key: MacroKey;
  /** `PROTEIN` — the eyebrow, uppercased by the component that draws it. */
  label: string;
  /** `18 g`, or `null` where the provider gave nothing. */
  value: string | null;
  /** `18 grams protein.` — a sentence, not a fragment with a unit glyph. */
  spoken: string;
};

export type FoodFactsView = {
  /** `140` — this portion of this food. Never the day. */
  calories: string | null;
  /** Always the bare word. The portion is stated separately. */
  caption: string;
  /** `1 container` / `2 containers` — what the figures above are for. */
  portion: string;
  macros: MacroFact[];
  /** The whole panel as one sentence, for a screen reader. */
  spoken: string;
};

const has = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * The nutrition panel for a portion.
 *
 * `portionLabel` comes from `formatPortion`, the same helper the log uses, so
 * a screen cannot invent its own pluralisation of `1.5 containers`.
 */
export function foodFacts(nutrition: NutritionFacts, portionLabel: string): FoodFactsView {
  const calories = has(nutrition.calories) ? formatCalories(nutrition.calories) : null;

  const macros: MacroFact[] = MACROS.map((macro) => {
    const amount = nutrition[macro.key];
    return {
      key: macro.key,
      label: macro.label,
      value: has(amount) ? `${formatAmount(amount)} ${macro.unit}` : null,
      spoken: has(amount)
        ? `${formatAmount(amount)} grams ${macro.key === 'carbs' ? 'carbohydrates' : macro.key}.`
        : `${macro.label} not listed.`,
    };
  });

  return {
    calories,
    caption: 'Calories',
    portion: portionLabel,
    macros,
    spoken: [
      portionLabel + '.',
      calories ? `${calories} calories.` : 'Calories not listed.',
      ...macros.map((macro) => macro.spoken),
    ].join(' '),
  };
}

/**
 * The same panel, for a food's currently selected serving and quantity.
 *
 * A convenience over `foodFacts` so a caller does not re-derive the portion
 * label — which is exactly the kind of small duplication that let Search and
 * Recents word one food two ways before 5.6C.
 */
export function servingFacts(
  nutrition: NutritionFacts,
  servingLabel: string,
  quantity: number,
): FoodFactsView {
  return foodFacts(nutrition, formatPortion(quantity, servingLabel));
}

/**
 * The food's own identity line — the picture's caption, in words.
 *
 * Deliberately the same shape `foodRowView` produces for a list row, and for
 * the same reason: the yogurt a person tapped in Search must read as the same
 * object on the screen that opens. The difference is that a row states the
 * default serving, because that is all it knows, while a detail screen states
 * the serving *selected*, which the row cannot.
 */
export function foodIdentity(food: VitaFood, servingLabel?: string | null): {
  name: string;
  detail: string | null;
  spoken: string;
} {
  const brand = food.brand?.trim() || null;
  const restaurant = food.restaurant?.trim() || null;
  const serving = servingLabel?.trim() || null;

  return {
    name: food.name,
    detail: [brand, restaurant, serving].filter(Boolean).join(' · ') || null,
    spoken: [food.name, brand, restaurant, serving].filter(Boolean).join('. ') + '.',
  };
}
