/**
 * Provider fan-out and result aggregation.
 *
 * Providers are queried **in parallel**, not in sequence. A waterfall would
 * make every search as slow as the sum of its providers; in parallel it is
 * as slow as the slowest, and each provider already caps itself with a
 * timeout. (Barcode lookup will want the opposite — an exact GTIN hit from
 * the first trustworthy source means there is no reason to spend a second
 * request — which is why `lookupBarcode` is not wired here yet.)
 *
 * **Failure is isolated per provider.** One provider erroring, timing out,
 * or being unconfigured degrades the result set; it never fails the search.
 * The search only reports an error when *every* configured provider failed.
 */

import { dedupeFoods, type MergedFood } from '../search/dedupe';
import { rankFoods, scoreFood, type ScoredFood } from '../search/rank';
import type { VitaFood } from '../model/types';
import { openFoodFactsProvider } from './openFoodFacts';
import { usdaProvider } from './usda';
import { ProviderError, type FoodProvider } from './types';

/** Registration order is irrelevant to output order — ranking decides that. */
export const PROVIDERS: FoodProvider[] = [usdaProvider, openFoodFactsProvider];

export function configuredProviders(): FoodProvider[] {
  return PROVIDERS.filter((provider) => provider.isConfigured());
}

export type ProviderOutcome = {
  provider: FoodProvider['id'];
  ok: boolean;
  count: number;
  /** Safe to log — a category and a stage, never a key or raw header. */
  error?: { kind: string; stage: string; status?: number };
};

export type AggregatedSearch = {
  foods: MergedFood[];
  outcomes: ProviderOutcome[];
  /** True when every configured provider failed — the only case that is a real error. */
  allFailed: boolean;
  /** True when nothing is configured, which is a setup problem, not a failure. */
  noProviders: boolean;
};

export async function searchAllProviders(query: string, signal: AbortSignal): Promise<AggregatedSearch> {
  const providers = configuredProviders();
  if (providers.length === 0) {
    return { foods: [], outcomes: [], allFailed: false, noProviders: true };
  }

  const settled = await Promise.all(
    providers.map(async (provider): Promise<{ provider: FoodProvider; foods: VitaFood[]; outcome: ProviderOutcome }> => {
      try {
        const foods = await provider.search(query, signal);
        return { provider, foods, outcome: { provider: provider.id, ok: true, count: foods.length } };
      } catch (error) {
        const detail =
          error instanceof ProviderError
            ? { kind: error.kind, stage: error.stage, ...(error.status ? { status: error.status } : {}) }
            : { kind: 'unknown', stage: 'search' };
        return { provider, foods: [], outcome: { provider: provider.id, ok: false, count: 0, error: detail } };
      }
    }),
  );

  const outcomes = settled.map((entry) => entry.outcome);
  const allFailed = outcomes.length > 0 && outcomes.every((outcome) => !outcome.ok);

  // Score before deduping so the highest-ranked copy of a food is the one
  // that survives the merge and absorbs the others.
  const scored: ScoredFood[] = [];
  for (const { provider, foods } of settled) {
    for (const food of foods) scored.push({ food, score: scoreFood(food, query, provider.quality) });
  }

  return { foods: dedupeFoods(rankFoods(scored)), outcomes, allFailed, noProviders: false };
}
