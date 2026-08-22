/**
 * Two small caches. Deliberately not a caching subsystem.
 *
 * **Query cache** — in memory only, short TTL. It exists to stop a user
 * backing out of Food Detail and re-running the same search from hitting
 * the network again. Queries are too varied to be worth persisting, and
 * search results should feel live.
 *
 * **Food cache** — persisted with a long TTL. This one is load-bearing:
 * Food Detail resolves a food by `vitaId`, and a food that came from a
 * provider is not in My Foods. Nutrition-label data is immutable in
 * practice, so 30 days is safe.
 *
 * On provider terms: caching individually-fetched items for performance is
 * ordinary API use. Neither cache accumulates a redistributable copy of a
 * provider's database — the food cache is bounded and expires, and nothing
 * bulk-downloads. USDA is CC0; Open Food Facts is ODbL, whose share-alike
 * obligation attaches to publishing a derived *database*, which this is not.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../data/keys';
import type { VitaFood } from '../model/types';

const QUERY_TTL_MS = 5 * 60 * 1000;
const FOOD_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Bounded so a long session can't grow the map without limit. */
const MAX_QUERY_ENTRIES = 40;

type QueryEntry = { at: number; foods: VitaFood[] };

const queryCache = new Map<string, QueryEntry>();
/** Mirrors recent provider results so Food Detail resolves without a round-trip. */
const foodMemo = new Map<string, VitaFood>();

function queryKey(query: string): string {
  return query.trim().toLowerCase();
}

export function readQueryCache(query: string): VitaFood[] | null {
  const entry = queryCache.get(queryKey(query));
  if (!entry) return null;
  if (Date.now() - entry.at > QUERY_TTL_MS) {
    queryCache.delete(queryKey(query));
    return null;
  }
  return entry.foods;
}

export function writeQueryCache(query: string, foods: VitaFood[]): void {
  if (queryCache.size >= MAX_QUERY_ENTRIES) {
    const oldest = queryCache.keys().next().value;
    if (oldest !== undefined) queryCache.delete(oldest);
  }
  queryCache.set(queryKey(query), { at: Date.now(), foods });
}

/**
 * Remembers every food a search returned so Food Detail can resolve it.
 * Writes are fire-and-forget: a failed cache write must never block the
 * user from opening a result they can already see.
 */
export function rememberFoods(foods: VitaFood[]): void {
  for (const food of foods) {
    foodMemo.set(food.vitaId, food);
    void AsyncStorage.setItem(
      StorageKeys.cachedFood(food.vitaId),
      JSON.stringify({ at: Date.now(), food }),
    ).catch(() => undefined);
  }
}

export function readCachedFoodSync(vitaId: string): VitaFood | undefined {
  return foodMemo.get(vitaId);
}

/** Persisted fallback, for when the app restarted between search and detail. */
export async function readCachedFood(vitaId: string): Promise<VitaFood | null> {
  const memo = foodMemo.get(vitaId);
  if (memo) return memo;

  try {
    const raw = await AsyncStorage.getItem(StorageKeys.cachedFood(vitaId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: number; food?: VitaFood };
    if (!parsed?.food || typeof parsed.at !== 'number') return null;
    if (Date.now() - parsed.at > FOOD_TTL_MS) {
      void AsyncStorage.removeItem(StorageKeys.cachedFood(vitaId)).catch(() => undefined);
      return null;
    }
    foodMemo.set(vitaId, parsed.food);
    return parsed.food;
  } catch {
    return null;
  }
}
