/**
 * USDA FoodData Central adapter.
 *
 * Free, CC0 public-domain data, no commercial restrictions — the strongest
 * available source for generic and foundation foods, plus a large US
 * branded catalogue.
 *
 * The key comes from `api.data.gov`. It is a rate-limiting identifier
 * rather than a true secret, which is why it can sit in `EXPO_PUBLIC_` for
 * development. USDA does state that keys found published publicly get
 * deactivated, so a public release should move these calls behind a proxy —
 * recorded in the technical docs rather than solved here.
 */

import { scaleNutrition } from '../model/nutrition';
import type { NutritionFacts, ServingOption, VitaFood } from '../model/types';
import { normalizeGtin } from './gtin';
import { asFiniteNumber, asNonEmptyString, asRecord, fetchJson } from './http';
import { PROVIDER_PAGE_SIZE, type FoodProvider } from './types';

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

/**
 * FDC nutrient ids. Stable across data types, unlike the display names,
 * which vary ("Energy" vs "Energy (Atwater General Factors)").
 */
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
  saturatedFat: 1258,
} as const;

/**
 * Data types worth surfacing, in the order USDA should be trusted.
 * Experimental and market-acquisition types are excluded: they carry
 * research-grade records that are confusing as consumer search results.
 */
const DATA_TYPES = ['Foundation', 'SR Legacy', 'Branded', 'Survey (FNDDS)'];

/** Units USDA reports serving sizes in that we can convert to a real serving. */
const MASS_UNITS = new Set(['g', 'gram', 'grams', 'ml', 'milliliter', 'milliliters']);

function readApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_USDA_API_KEY;
  return key && key.trim() !== '' ? key.trim() : null;
}

/**
 * FDC reports every nutrient per 100 g (or 100 ml) regardless of data type,
 * so this is always the per-100 baseline that servings are scaled from.
 */
function readPer100(food: Record<string, unknown>): NutritionFacts | null {
  const list = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];
  const byId = new Map<number, number>();

  for (const raw of list) {
    const nutrient = asRecord(raw);
    if (!nutrient) continue;
    const id = asFiniteNumber(nutrient.nutrientId);
    const value = asFiniteNumber(nutrient.value);
    if (id !== null && value !== null && !byId.has(id)) byId.set(id, value);
  }

  const calories = byId.get(NUTRIENT_IDS.calories);
  const protein = byId.get(NUTRIENT_IDS.protein);
  const carbs = byId.get(NUTRIENT_IDS.carbs);
  const fat = byId.get(NUTRIENT_IDS.fat);

  // The four macros are the bar for loggability. A record missing any of
  // them cannot produce honest totals, and substituting zero would be
  // indistinguishable from a measured zero.
  if (calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return null;
  }

  const nutrition: NutritionFacts = { calories, protein, carbs, fat };
  const saturatedFat = byId.get(NUTRIENT_IDS.saturatedFat);
  const fiber = byId.get(NUTRIENT_IDS.fiber);
  const sugar = byId.get(NUTRIENT_IDS.sugar);
  const sodium = byId.get(NUTRIENT_IDS.sodium);
  if (saturatedFat !== undefined) nutrition.saturatedFat = saturatedFat;
  if (fiber !== undefined) nutrition.fiber = fiber;
  if (sugar !== undefined) nutrition.sugar = sugar;
  if (sodium !== undefined) nutrition.sodium = sodium;

  return nutrition;
}

/**
 * Builds the serving list.
 *
 * A label serving is offered first when USDA gives a usable one; the 100 g
 * baseline is always offered too, because it is the figure the data is
 * actually measured in and some foods have nothing better. No serving is
 * ever invented — an entry with only per-100 g data honestly says "100 g".
 */
function buildServings(food: Record<string, unknown>, per100: NutritionFacts): ServingOption[] {
  const servings: ServingOption[] = [];

  const size = asFiniteNumber(food.servingSize);
  const unit = asNonEmptyString(food.servingSizeUnit)?.toLowerCase() ?? null;
  const household = asNonEmptyString(food.householdServingFullText);

  if (size !== null && size > 0 && unit !== null && MASS_UNITS.has(unit)) {
    const baseUnit = unit.startsWith('m') ? 'ml' : 'g';
    servings.push({
      label: household ?? `${size} ${baseUnit}`,
      quantity: 1,
      // `unit` stays a countable noun; the descriptive phrase lives in `label`.
      unit: 'serving',
      gramWeight: size,
      nutrition: scaleNutrition(per100, size / 100),
    });
  }

  servings.push({
    label: '100 g',
    quantity: 100,
    unit: 'g',
    gramWeight: 100,
    nutrition: per100,
  });

  return servings;
}

function toVitaFood(raw: unknown): VitaFood | null {
  const food = asRecord(raw);
  if (!food) return null;

  const fdcId = asFiniteNumber(food.fdcId);
  const name = asNonEmptyString(food.description);
  if (fdcId === null || name === null) return null;

  const per100 = readPer100(food);
  if (!per100) return null;

  const servings = buildServings(food, per100);
  const brand = asNonEmptyString(food.brandName) ?? asNonEmptyString(food.brandOwner);
  const barcode = normalizeGtin(asNonEmptyString(food.gtinUpc));

  return {
    vitaId: `usda:${fdcId}`,
    source: 'usda',
    sourceId: String(fdcId),
    // USDA descriptions are shouty on branded items ("CHOBANI, GREEK YOGURT").
    name: toTitleCase(name),
    ...(brand ? { brand: toTitleCase(brand) } : {}),
    ...(barcode ? { barcode } : {}),
    servings,
    defaultServingIndex: 0,
    isCustom: false,
    fetchedAt: new Date().toISOString(),
  };
}

/** Only rewrites strings that are entirely uppercase, so "Nonfat milk" is left alone. */
function toTitleCase(value: string): string {
  if (value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
}

export const usdaProvider: FoodProvider = {
  id: 'usda',
  label: 'USDA FoodData Central',
  quality: 90,

  isConfigured: () => readApiKey() !== null,

  async search(query: string, signal: AbortSignal): Promise<VitaFood[]> {
    const key = readApiKey();
    if (!key) return [];

    const url =
      `${BASE_URL}?api_key=${encodeURIComponent(key)}` +
      `&query=${encodeURIComponent(query)}` +
      `&pageSize=${PROVIDER_PAGE_SIZE}` +
      `&dataType=${encodeURIComponent(DATA_TYPES.join(','))}`;

    const payload = asRecord(await fetchJson('usda', 'search', url, signal));
    const foods = payload && Array.isArray(payload.foods) ? payload.foods : [];

    const results: VitaFood[] = [];
    for (const entry of foods) {
      const food = toVitaFood(entry);
      // Unusable records are dropped here rather than shown disabled —
      // a result you cannot log is noise in a list you are scanning fast.
      if (food) results.push(food);
    }
    return results;
  },

  /**
   * Barcode lookup, with a caveat that matters.
   *
   * **FoodData Central has no barcode endpoint.** Passing a GTIN to
   * `/foods/search` is a fuzzy full-text query, so it will happily return
   * near-misses and unrelated products. Every candidate is therefore
   * re-checked against its own `gtinUpc` through `normalizeGtin`, and only
   * an exact GTIN identity is accepted — a barcode scan must return *that*
   * product or nothing, never something approximately like it.
   */
  async lookupBarcode(gtin: string, signal: AbortSignal): Promise<VitaFood | null> {
    const key = readApiKey();
    if (!key) return null;

    const target = normalizeGtin(gtin);
    if (!target) return null;

    const url =
      `${BASE_URL}?api_key=${encodeURIComponent(key)}` +
      `&query=${encodeURIComponent(gtin)}` +
      `&pageSize=10&dataType=${encodeURIComponent('Branded')}`;

    const payload = asRecord(await fetchJson('usda', 'barcode', url, signal));
    const foods = payload && Array.isArray(payload.foods) ? payload.foods : [];

    for (const entry of foods) {
      const food = toVitaFood(entry);
      if (food?.barcode && food.barcode === target) return food;
    }
    return null;
  },
};
