/**
 * How a food is pictured, resolved in one place for every surface.
 *
 * Three tiers, in strict priority order:
 *
 *  1. **The real product image**, when the food carries one. A provider's
 *     own photograph is always more informative than anything we can infer.
 *  2. **A VITA category visual**, inferred conservatively from the name.
 *  3. **The generic food treatment**, when the name says nothing reliable.
 *
 * Every screen calls this rather than guessing for itself. That is the point:
 * a food must not be a banana in Search and a generic glyph in the log, and
 * one shared resolver is the only way to guarantee that without each screen
 * re-implementing the same rules slightly differently.
 *
 * ── On the artwork ──────────────────────────────────────────────────────
 * The **taxonomy** below is the durable part; the icons are not. Ionicons
 * has roughly a dozen food glyphs, so several categories currently share
 * one — `taco`, `burrito`, and `sandwich` all render the fast-food glyph,
 * separated only by accent color. That is an honest placeholder, not the
 * intended end state.
 *
 * When custom VITA artwork exists, it replaces the `icon`/`color` pair in
 * `CATEGORY_VISUALS` and nothing else changes: `FoodCategory`, the
 * classifier, and every caller stay exactly as they are. That is why the
 * category is carried on the returned visual even when an image wins — the
 * caller can tint or label by category regardless of which tier answered.
 *
 * ── On certainty ────────────────────────────────────────────────────────
 * Matching is deliberately conservative and returns `'food'` rather than
 * guessing. "Big Mac" is a burger to a person and nothing to a keyword
 * matcher, and inventing brand-name rules to cover it would be a list that
 * never ends and is wrong in every market it was not written for. An
 * unrecognized name gets the neutral treatment, which is a correct answer.
 */

import type { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme/tokens';

export type FoodCategory =
  | 'banana'
  | 'fruit'
  | 'burger'
  | 'pizza'
  | 'taco'
  | 'burrito'
  | 'bowl'
  | 'oatmeal'
  | 'eggs'
  | 'chicken'
  | 'meat'
  | 'sandwich'
  | 'fries'
  | 'chips'
  | 'coffee'
  | 'smoothie'
  | 'bread'
  | 'pasta'
  | 'rice'
  | 'salad'
  | 'dessert'
  | 'beverage'
  | 'snack'
  | 'food';

type IconName = keyof typeof Ionicons.glyphMap;

export type CategoryVisual = { icon: IconName; color: string };

/**
 * Category → placeholder glyph and accent. Colors come from the existing
 * brand and macro tokens only; this file introduces no new hex.
 */
const CATEGORY_VISUALS: Record<FoodCategory, CategoryVisual> = {
  banana: { icon: 'nutrition-outline', color: palette.carbs },
  fruit: { icon: 'nutrition-outline', color: palette.journey },
  burger: { icon: 'fast-food-outline', color: palette.primary },
  pizza: { icon: 'pizza-outline', color: palette.fat },
  taco: { icon: 'fast-food-outline', color: palette.carbs },
  burrito: { icon: 'fast-food-outline', color: palette.gold },
  bowl: { icon: 'restaurant-outline', color: palette.journey },
  oatmeal: { icon: 'nutrition-outline', color: palette.gold },
  eggs: { icon: 'egg-outline', color: palette.carbs },
  chicken: { icon: 'restaurant-outline', color: palette.gold },
  meat: { icon: 'flame-outline', color: palette.fat },
  sandwich: { icon: 'fast-food-outline', color: palette.gold },
  fries: { icon: 'fast-food-outline', color: palette.carbs },
  chips: { icon: 'bag-handle-outline', color: palette.carbs },
  coffee: { icon: 'cafe-outline', color: palette.cardWarm },
  smoothie: { icon: 'pint-outline', color: palette.peptide },
  bread: { icon: 'nutrition-outline', color: palette.gold },
  pasta: { icon: 'restaurant-outline', color: palette.carbs },
  rice: { icon: 'restaurant-outline', color: palette.sage },
  salad: { icon: 'leaf-outline', color: palette.journey },
  dessert: { icon: 'ice-cream-outline', color: palette.peptide },
  beverage: { icon: 'water-outline', color: palette.water },
  snack: { icon: 'bag-handle-outline', color: palette.sage },
  food: { icon: 'fast-food-outline', color: palette.primary },
};

/**
 * Keyword rules, evaluated **in order, most specific first**.
 *
 * Order is the whole design. "Chicken burrito bowl" contains three of these
 * words; `bowl` is listed before `burrito` and `burrito` before `chicken`,
 * so it resolves to the form the food actually takes rather than to its
 * first-mentioned ingredient. Likewise `salad` precedes `chicken`, so a
 * chicken salad is greens rather than poultry, and `dessert` precedes
 * `chips` so a chocolate chip cookie is a cookie rather than a crisp.
 */
const RULES: ReadonlyArray<{ category: FoodCategory; keywords: readonly string[] }> = [
  { category: 'banana', keywords: ['banana', 'bananas', 'plantain'] },
  { category: 'pizza', keywords: ['pizza', 'calzone'] },
  { category: 'fries', keywords: ['fries', 'french fry', 'tater tot', 'hash brown'] },
  { category: 'burger', keywords: ['burger', 'cheeseburger', 'hamburger', 'patty melt'] },
  { category: 'bowl', keywords: ['bowl', 'poke'] },
  { category: 'burrito', keywords: ['burrito', 'chimichanga', 'wrap'] },
  { category: 'taco', keywords: ['taco', 'tacos', 'quesadilla', 'nacho', 'nachos', 'enchilada'] },
  { category: 'salad', keywords: ['salad', 'lettuce', 'spinach', 'kale', 'greens', 'arugula'] },
  { category: 'sandwich', keywords: ['sandwich', 'sub', 'hoagie', 'panini', 'bagel', 'toast', 'melt'] },
  { category: 'eggs', keywords: ['egg', 'eggs', 'omelet', 'omelette', 'frittata'] },
  { category: 'oatmeal', keywords: ['oat', 'oats', 'oatmeal', 'granola', 'cereal', 'muesli', 'porridge'] },
  { category: 'pasta', keywords: ['pasta', 'spaghetti', 'penne', 'macaroni', 'lasagna', 'noodle', 'noodles', 'ramen'] },
  { category: 'rice', keywords: ['rice', 'risotto', 'quinoa', 'couscous'] },
  { category: 'chicken', keywords: ['chicken', 'turkey', 'poultry', 'nugget', 'nuggets'] },
  { category: 'meat', keywords: ['steak', 'beef', 'pork', 'bacon', 'sausage', 'ham', 'brisket', 'ribs', 'lamb', 'meat'] },
  { category: 'coffee', keywords: ['coffee', 'espresso', 'latte', 'cappuccino', 'americano', 'mocha', 'cold brew'] },
  { category: 'smoothie', keywords: ['smoothie', 'shake', 'protein shake', 'milkshake'] },
  { category: 'dessert', keywords: ['ice cream', 'cookie', 'cookies', 'brownie', 'cake', 'donut', 'doughnut', 'candy', 'chocolate', 'pie', 'pudding'] },
  { category: 'chips', keywords: ['chip', 'chips', 'crisps', 'puffs', 'pretzel', 'pretzels', 'popcorn', 'cracker', 'crackers'] },
  { category: 'bread', keywords: ['bread', 'roll', 'rolls', 'tortilla', 'baguette', 'biscuit', 'croissant', 'muffin'] },
  { category: 'beverage', keywords: ['water', 'juice', 'soda', 'cola', 'tea', 'lemonade', 'seltzer', 'sparkling', 'drink', 'beverage'] },
  {
    category: 'fruit',
    keywords: [
      'apple', 'orange', 'berry', 'berries', 'strawberry', 'blueberry', 'raspberry',
      'grape', 'grapes', 'melon', 'watermelon', 'peach', 'pear', 'mango', 'pineapple',
      'kiwi', 'cherry', 'cherries', 'avocado', 'fruit',
    ],
  },
  { category: 'snack', keywords: ['snack', 'trail mix', 'granola bar', 'protein bar', 'energy bar'] },
];

/**
 * Word-boundary matchers, compiled once. Substring matching would classify
 * "grapefruit juice" by `grape` and "barbecue" by `bar`; requiring whole
 * words keeps the rules from firing on fragments of unrelated words.
 * Multi-word keywords are matched as phrases.
 */
const COMPILED = RULES.map((rule) => ({
  category: rule.category,
  patterns: rule.keywords.map(
    (keyword) => new RegExp(`(^|[^a-z0-9])${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i'),
  ),
}));

/**
 * The broad category a food name suggests, or `'food'` when nothing does.
 * Exported separately from `resolveFoodVisual` so the rules can be exercised
 * directly without constructing a food.
 */
export function classifyFood(name: string): FoodCategory {
  const text = name.toLowerCase();
  for (const rule of COMPILED) {
    if (rule.patterns.some((pattern) => pattern.test(text))) return rule.category;
  }
  return 'food';
}

export function categoryVisual(category: FoodCategory): CategoryVisual {
  return CATEGORY_VISUALS[category];
}

export type FoodVisual =
  | { kind: 'image'; uri: string; category: FoodCategory }
  | ({ kind: 'icon'; category: FoodCategory } & CategoryVisual);

/**
 * Anything with a name and possibly an image. Structural rather than a
 * concrete type so a `VitaFood` and a `FoodEntry` both satisfy it — the two
 * shapes that get displayed — without either one being converted first.
 */
export type PicturableFood = {
  name: string;
  imageUrl?: string;
};

/** Only http(s) images are rendered; see the repository's read-side guard. */
function usableImage(url: string | undefined): url is string {
  return typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));
}

export function resolveFoodVisual(food: PicturableFood): FoodVisual {
  const category = classifyFood(food.name);
  if (usableImage(food.imageUrl)) return { kind: 'image', uri: food.imageUrl, category };
  return { kind: 'icon', category, ...CATEGORY_VISUALS[category] };
}
