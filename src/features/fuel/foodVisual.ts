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
 * Categories point at drawings in `foodArt.ts`, not at an icon font. The
 * font could not say what this needs to say: it has no banana, no taco and
 * no burrito, and its one general food glyph is a **burger and a drink** —
 * so the generic fallback itself was a burger, and every food VITA could
 * not classify was confidently drawn as one. That is the defect this
 * mapping exists to prevent.
 *
 * **A category with no honest drawing points at `utensils`, the neutral
 * generic.** Fries do not become a bag of crisps and a protein bar does not
 * become a cookie; they become "food, unspecified", which is a correct
 * answer. Generic is preferable to wrong, always. New drawings are added to
 * `foodArt.ts` and pointed at here — no caller changes, no classifier
 * changes.
 *
 * The category is carried on the returned visual even when a real image
 * wins, so a caller can tint or label by category regardless of tier.
 *
 * ── On certainty ────────────────────────────────────────────────────────
 * Matching is deliberately conservative and returns `'food'` rather than
 * guessing. "Big Mac" is a burger to a person and nothing to a keyword
 * matcher, and inventing brand-name rules to cover it would be a list that
 * never ends and is wrong in every market it was not written for. An
 * unrecognized name gets the neutral treatment, which is a correct answer.
 */

import { palette } from '../../theme/tokens';
import type { ArtKey } from './foodArt';

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

export type CategoryVisual = { art: ArtKey; color: string };

/**
 * Category → drawing and accent. Colors come from the existing brand and
 * macro tokens only; this file introduces no new hex.
 *
 * Several categories share a drawing **only where the drawing is genuinely
 * correct for all of them** — a bowl serves oatmeal, pasta, rice, and salad
 * honestly. Where it would not be (fries, desserts, protein bars, shakes),
 * the category resolves to `utensils` rather than borrowing a picture of a
 * different food.
 */
const CATEGORY_VISUALS: Record<FoodCategory, CategoryVisual> = {
  banana: { art: 'banana', color: palette.carbs },
  fruit: { art: 'apple', color: palette.journey },
  burger: { art: 'burger', color: palette.primary },
  pizza: { art: 'pizza', color: palette.fat },
  taco: { art: 'taco', color: palette.carbs },
  burrito: { art: 'burrito', color: palette.gold },
  bowl: { art: 'bowl', color: palette.journey },
  oatmeal: { art: 'bowl', color: palette.gold },
  eggs: { art: 'egg', color: palette.carbs },
  chicken: { art: 'drumstick', color: palette.gold },
  meat: { art: 'drumstick', color: palette.fat },
  sandwich: { art: 'bread', color: palette.gold },
  // No fry drawing yet, and a crisp bag would be a different food.
  fries: { art: 'utensils', color: palette.carbs },
  chips: { art: 'chips', color: palette.carbs },
  coffee: { art: 'coffee', color: palette.cardWarm },
  // A shake is not a bottle and not a coffee cup.
  smoothie: { art: 'utensils', color: palette.peptide },
  bread: { art: 'bread', color: palette.gold },
  pasta: { art: 'bowl', color: palette.carbs },
  rice: { art: 'bowl', color: palette.sage },
  salad: { art: 'bowl', color: palette.journey },
  // A cookie is not an ice cream and not a cake.
  dessert: { art: 'utensils', color: palette.peptide },
  beverage: { art: 'bottle', color: palette.water },
  // "Protein bar" and "trail mix" are not a bag of crisps.
  snack: { art: 'utensils', color: palette.sage },
  food: { art: 'utensils', color: palette.primary },
};

/**
 * Product names that are their own category, checked before the keyword
 * rules because they are more specific than any word in them.
 *
 * Deliberately tiny and deliberately explicit. The founders named "Big Mac
 * → burger" and "Hot Cheetos → chips" as required behavior, and no amount
 * of generic word matching gets there — nothing in "Big Mac" means burger.
 * This is an exception list, not a strategy: it stays short, every entry
 * earns its place by being a household name, and anything not on it falls
 * through to the ordinary conservative rules.
 */
const BRANDED_TERMS: ReadonlyArray<{ term: string; category: FoodCategory }> = [
  { term: 'big mac', category: 'burger' },
  { term: 'quarter pounder', category: 'burger' },
  { term: 'whopper', category: 'burger' },
  { term: 'mcnugget', category: 'chicken' },
  { term: 'mcnuggets', category: 'chicken' },
  { term: 'cheetos', category: 'chips' },
  { term: 'doritos', category: 'chips' },
  { term: 'fritos', category: 'chips' },
  { term: 'pringles', category: 'chips' },
  { term: 'ruffles', category: 'chips' },
  { term: 'takis', category: 'chips' },
  { term: 'oreo', category: 'dessert' },
];

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
      'apple', 'orange', 'berry', 'berries', 'strawberry', 'strawberries',
      'blueberry', 'blueberries', 'raspberry', 'raspberries', 'grape', 'melon',
      'watermelon', 'peach', 'pear', 'mango', 'pineapple', 'kiwi', 'cherry',
      'cherries', 'avocado', 'fruit',
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
/**
 * Whole-word (or whole-phrase) matcher with a tolerated regular plural.
 *
 * Substring matching would classify "grapefruit juice" by `grape` and
 * "barbecue" by `bar`, so the word has to stand alone. The optional `s`/`es`
 * exists because "Blueberries" otherwise missed `blueberry` and fell all
 * the way through to generic — one rule beats maintaining two spellings of
 * every noun. Irregular plurals (`berries`, `cherries`) still need their
 * own entry, and have one.
 */
function wordPattern(keyword: string): RegExp {
  return new RegExp(
    `(^|[^a-z0-9])${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s|es)?([^a-z0-9]|$)`,
    'i',
  );
}

const COMPILED_BRANDS = BRANDED_TERMS.map((entry) => ({
  category: entry.category,
  pattern: wordPattern(entry.term),
}));

const COMPILED = RULES.map((rule) => ({
  category: rule.category,
  patterns: rule.keywords.map(wordPattern),
}));

/**
 * The broad category a food name suggests, or `'food'` when nothing does.
 * Exported separately from `resolveFoodVisual` so the rules can be exercised
 * directly without constructing a food.
 */
export function classifyFood(name: string): FoodCategory {
  const text = name.toLowerCase();
  for (const brand of COMPILED_BRANDS) {
    if (brand.pattern.test(text)) return brand.category;
  }
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
