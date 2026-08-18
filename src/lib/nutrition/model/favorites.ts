/**
 * Favorites.
 *
 * A favorite is keyed by `vitaId` — the stable normalized identity — not by
 * a search-result object reference, so favoriting a food once keeps it
 * favorited every time it is encountered again, from any surface.
 */

import type { FoodSource, VitaFood } from './types';

export type FavoriteFood = {
  vitaId: string;
  source: FoodSource;
  favoritedAt: string;
  /**
   * The normalized definition, stored so a favorite stays usable after the
   * short-lived search cache expires. Absent for sources whose terms don't
   * permit local retention — see `PERSISTABLE_SOURCES`.
   */
  food?: VitaFood;
};

/**
 * Sources whose food definitions we may keep on the device.
 *
 * - `usda` — CC0 public domain, no restriction.
 * - `openfoodfacts` — ODbL. Retaining individual records a user chose, on
 *   their own device, is ordinary API use; ODbL's share-alike obligation
 *   attaches to *publishing* a derived database, which this is not.
 * - `vita-custom` — the user's own food.
 *
 * `fatsecret` is deliberately absent. Its terms around caching and storage
 * differ and have not been verified, so when that adapter lands a favorite
 * from it will store the identity only and resolve the definition live —
 * the behavior below already handles that without any UI change.
 */
export const PERSISTABLE_SOURCES: ReadonlySet<FoodSource> = new Set<FoodSource>([
  'usda',
  'openfoodfacts',
  'vita-custom',
]);

export function canPersistDefinition(source: FoodSource): boolean {
  return PERSISTABLE_SOURCES.has(source);
}

export function toFavorite(food: VitaFood): FavoriteFood {
  return {
    vitaId: food.vitaId,
    source: food.source,
    favoritedAt: new Date().toISOString(),
    ...(canPersistDefinition(food.source) ? { food } : {}),
  };
}
