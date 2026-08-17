/**
 * Fuel's remaining local types. Macro/FuelToday/LoggedMeal were removed in
 * Sprint 2 slice 2.1 — daily nutrition now lives in `src/lib/nutrition`,
 * shared with Home, instead of being a second fixture shape.
 *
 * `FoodItem` is the old fixture-catalog shape still backing Search, Recent,
 * Favorites, and Food Detail. It is replaced by `VitaFood` when the provider
 * layer lands (slice 2.6).
 */

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  kcal: number;
  perServing: string;
  favorite: boolean;
  nutrition: {
    totalCarbs: number;
    totalFat: number;
    saturatedFat: number;
    totalSugars: number;
    protein: number;
    sodium: number;
  };
};
