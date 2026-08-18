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
  exactBrandAndName: 25,
  namePrefix: 18,
  nameContains: 8,
  hasLabelServing: 10,
  hasCompleteMacros: 6,
  hasImage: 3,
  /** Long descriptions are usually research records, not what someone is scanning for. */
  verbosePenalty: -6,
} as const;

/** Beyond this a name reads as a lab description rather than a food. */
const VERBOSE_NAME_LENGTH = 60;

export function scoreFood(food: VitaFood, query: string, providerQuality: number): number {
  const name = normalizeName(food.name);
  const normalizedQuery = normalizeName(query);
  let score = providerQuality;

  if (name === normalizedQuery) {
    score += RANK_WEIGHTS.exactName;
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

  return score;
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
