/**
 * Deterministic result ranking.
 *
 * Named constants and a pure function, on purpose — no learning, no model,
 * and no dependence on which provider happened to answer first. The same
 * query and the same results always produce the same order, which is what
 * makes search feel stable rather than shuffling under the user.
 */

import type { VitaFood } from '../model/types';
import { normalizeName } from './dedupe';

export const RANK_WEIGHTS = {
  /** Base weight by source quality — set on each provider. */
  exactName: 45,
  /**
   * An exact name match on a *branded* product, when the query never
   * mentioned that brand.
   *
   * Worth far less than a generic exact match, because the coincidence is
   * common and the result is usually wrong: USDA returns a peanut butter
   * spread named "BANANA" and three separate branded products named "EGG".
   * Someone typing a bare generic term wants the food, not a product that
   * happens to share its name. Naming the brand restores the full bonus.
   */
  exactNameBranded: 15,
  exactBrandAndName: 25,
  namePrefix: 18,
  nameContains: 8,
  hasLabelServing: 10,
  hasCompleteMacros: 6,
  hasImage: 3,
  /** Long descriptions are usually research records, not what someone is scanning for. */
  verbosePenalty: -6,
  /**
   * Per extra word beyond the query's own length. "Bananas, raw" beats
   * "Bananas, dehydrated, or banana powder" for the query "banana" because
   * every additional qualifier moves the record further from what was
   * actually asked for.
   *
   * **Capped** by `MAX_EXTRA_WORD_PENALTY`. This is a tiebreak among records
   * of similar standing, not a force strong enough to invert a data-quality
   * tier — uncapped it pushed the verbose but canonical "Eggs, Grade A,
   * Large, egg whole" below the composite dish "Egg burrito".
   */
  extraWordPenalty: -2,
} as const;

/** Ceiling on the cumulative word penalty, in points. */
const MAX_EXTRA_WORD_PENALTY = 8;

/** Beyond this a name reads as a lab description rather than a food. */
const VERBOSE_NAME_LENGTH = 60;

export function scoreFood(food: VitaFood, query: string, providerQuality: number): number {
  const name = normalizeName(food.name);
  const normalizedQuery = normalizeName(query);
  // Per-record trust when the adapter knows it; the provider's flat base otherwise.
  let score = food.dataQuality ?? providerQuality;

  const brandMentioned =
    food.brand !== undefined && normalizedQuery.includes(normalizeName(food.brand));

  if (name === normalizedQuery) {
    score += food.brand && !brandMentioned ? RANK_WEIGHTS.exactNameBranded : RANK_WEIGHTS.exactName;
  } else if (name.startsWith(normalizedQuery)) {
    score += RANK_WEIGHTS.namePrefix;
  } else if (name.includes(normalizedQuery)) {
    score += RANK_WEIGHTS.nameContains;
  }

  if (food.brand && normalizeName(`${food.brand} ${food.name}`) === normalizedQuery) {
    score += RANK_WEIGHTS.exactBrandAndName;
  }

  // A food whose first serving is a real label serving ("1 bar (45g)") is
  // more useful than one offering only the 100 g baseline.
  const primary = food.servings[food.defaultServingIndex] ?? food.servings[0];
  if (primary && primary.unit !== 'g') score += RANK_WEIGHTS.hasLabelServing;

  if (primary && primary.nutrition.fiber !== undefined && primary.nutrition.sugar !== undefined) {
    score += RANK_WEIGHTS.hasCompleteMacros;
  }

  if (food.imageUrl) score += RANK_WEIGHTS.hasImage;
  if (food.name.length > VERBOSE_NAME_LENGTH) score += RANK_WEIGHTS.verbosePenalty;

  const extraWords = Math.max(0, countWords(name) - countWords(normalizedQuery));
  score -= Math.min(MAX_EXTRA_WORD_PENALTY, extraWords * Math.abs(RANK_WEIGHTS.extraWordPenalty));

  return score;
}

function countWords(value: string): number {
  return value.split(' ').filter(Boolean).length;
}

export type ScoredFood = { food: VitaFood; score: number };

/**
 * Sorts by score, then by name as a tiebreak. The tiebreak matters: without
 * it, equally-scored results fall back on provider response order, which
 * varies between identical searches.
 */
export function rankFoods(scored: ScoredFood[]): VitaFood[] {
  return [...scored]
    .sort((a, b) => (b.score - a.score) || a.food.name.localeCompare(b.food.name))
    .map((entry) => entry.food);
}
