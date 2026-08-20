/**
 * Open Food Facts adapter.
 *
 * Free and open, no API key, and the strongest free source for packaged and
 * barcoded products — which also makes it the provider the barcode slice
 * will lean on.
 *
 * Two obligations shape this file:
 *  - **A custom User-Agent is required** by their API terms, in the form
 *    `AppName/Version (ContactEmail)`, so they can reach an abusive client.
 *    Without a contact configured this provider reports itself unconfigured
 *    rather than sending an anonymous or fake identifier.
 *  - **Data is crowdsourced and frequently incomplete.** Every field is
 *    treated as absent until proven otherwise; records that cannot yield
 *    the four macros are dropped rather than zero-filled.
 *
 * Licensing: data is ODbL, images CC-BY-SA. Attribution is required
 * wherever this data is shown — see the technical documentation.
 */

import { scaleNutrition } from '../model/nutrition';
import type { NutritionFacts, ServingOption, VitaFood } from '../model/types';
import { normalizeGtin } from './gtin';
import { asFiniteNumber, asNonEmptyString, asRecord, fetchJson } from './http';
import { ProviderError, PROVIDER_PAGE_SIZE, type FoodProvider } from './types';

/**
 * Full-text search goes through Search-a-licious, which is what Open Food
 * Facts' current API documentation points to for text queries.
 *
 * The legacy `cgi/search.pl` endpoint returns richer records — it carries
 * `serving_size`/`serving_quantity`, which Search-a-licious does not index
 * at all — but it is heavily loaded and was returning HTTP 503 during this
 * slice's verification. A search that intermittently fails is worse than
 * one that reports honest 100 g servings, so reliability wins here.
 *
 * The consequence is that OFF *search* results offer only the 100 g
 * baseline. Label servings are still available from the product endpoint
 * below, which `lookupBarcode` uses and which the barcode slice inherits.
 * Enriching an opened search result from that endpoint is a worthwhile
 * follow-up — one request per food the user actually opens, not per result.
 */
const SEARCH_URL = 'https://search.openfoodfacts.org/search';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';

/** Requested explicitly so responses stay small — full product records carry 40+ fields. */
const SEARCH_FIELDS = ['code', 'product_name', 'brands', 'image_front_small_url', 'nutriments'].join(',');
const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'brands',
  'image_front_small_url',
  'nutriments',
  'serving_size',
  'serving_quantity',
].join(',');

const APP_VERSION = '0.1';

function readContact(): string | null {
  const contact = process.env.EXPO_PUBLIC_OFF_CONTACT;
  return contact && contact.trim() !== '' ? contact.trim() : null;
}

function userAgent(contact: string): string {
  return `VITA/${APP_VERSION} (${contact})`;
}

/**
 * Reads the per-100 g nutriments block.
 *
 * Two conversions matter. Open Food Facts reports **sodium in grams**,
 * while the VITA model stores milligrams — passing it through unconverted
 * would understate sodium by 1000×. And energy is only trusted from the
 * explicit kcal field; the generic `energy_100g` is kilojoules on most
 * records and silently wrong when treated as calories.
 */
function readPer100(product: Record<string, unknown>): NutritionFacts | null {
  const nutriments = asRecord(product.nutriments);
  if (!nutriments) return null;

  const calories = asFiniteNumber(nutriments['energy-kcal_100g']);
  const protein = asFiniteNumber(nutriments.proteins_100g);
  const carbs = asFiniteNumber(nutriments.carbohydrates_100g);
  const fat = asFiniteNumber(nutriments.fat_100g);

  if (calories === null || protein === null || carbs === null || fat === null) return null;
  // Negative values appear in community data often enough to be worth rejecting.
  if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) return null;

  const nutrition: NutritionFacts = { calories, protein, carbs, fat };

  const saturatedFat = asFiniteNumber(nutriments['saturated-fat_100g']);
  const fiber = asFiniteNumber(nutriments.fiber_100g);
  const sugar = asFiniteNumber(nutriments.sugars_100g);
  const sodiumGrams = asFiniteNumber(nutriments.sodium_100g);

  if (saturatedFat !== null && saturatedFat >= 0) nutrition.saturatedFat = saturatedFat;
  if (fiber !== null && fiber >= 0) nutrition.fiber = fiber;
  if (sugar !== null && sugar >= 0) nutrition.sugar = sugar;
  if (sodiumGrams !== null && sodiumGrams >= 0) nutrition.sodium = sodiumGrams * 1000;

  return nutrition;
}

/**
 * A label serving when the product declares a usable one, plus the 100 g
 * baseline. `serving_quantity` is grams; `serving_size` is the human text
 * ("30 g", "1 bar (45g)"). Neither is invented when missing.
 */
function buildServings(product: Record<string, unknown>, per100: NutritionFacts): ServingOption[] {
  const servings: ServingOption[] = [];

  const grams = asFiniteNumber(product.serving_quantity);
  const label = asNonEmptyString(product.serving_size);

  if (grams !== null && grams > 0) {
    const text = label ?? `${grams} g`;
    servings.push({
      label: text,
      quantity: 1,
      // `unit` stays a countable noun; the descriptive phrase lives in `label`.
      unit: 'serving',
      gramWeight: grams,
      nutrition: scaleNutrition(per100, grams / 100),
    });
  }

  servings.push({ label: '100 g', quantity: 100, unit: 'g', gramWeight: 100, nutrition: per100 });
  return servings;
}

function readPrimaryBrand(value: unknown): string | null {
  if (Array.isArray(value)) {
    const first = value.find((entry) => asNonEmptyString(entry) !== null);
    return first ? asNonEmptyString(first) : null;
  }
  return asNonEmptyString(value)?.split(',')[0]?.trim() || null;
}

function toVitaFood(raw: unknown): VitaFood | null {
  const product = asRecord(raw);
  if (!product) return null;

  const code = asNonEmptyString(product.code);
  const name = asNonEmptyString(product.product_name);
  // A nameless product is unusable in a list the user scans by name.
  if (code === null || name === null) return null;

  const per100 = readPer100(product);
  if (!per100) return null;

  // `brands` is a comma-separated string on the product endpoint and an
  // array on Search-a-licious. Either way the first entry is the primary brand.
  const brand = readPrimaryBrand(product.brands);
  const image = asNonEmptyString(product.image_front_small_url);
  const barcode = normalizeGtin(code);

  return {
    vitaId: `openfoodfacts:${code}`,
    source: 'openfoodfacts',
    sourceId: code,
    name,
    ...(brand ? { brand } : {}),
    ...(barcode ? { barcode } : {}),
    ...(image ? { imageUrl: image } : {}),
    servings: buildServings(product, per100),
    defaultServingIndex: 0,
    isCustom: false,
    // Community-maintained: excellent packaged-goods coverage, variable
    // per-record completeness. One flat value — OFF exposes no per-record
    // verification signal we can map onto this.
    dataQuality: 70,
    fetchedAt: new Date().toISOString(),
  };
}

export const openFoodFactsProvider: FoodProvider = {
  id: 'openfoodfacts',
  label: 'Open Food Facts',
  quality: 70,

  isConfigured: () => readContact() !== null,

  async search(query: string, signal: AbortSignal): Promise<VitaFood[]> {
    const contact = readContact();
    if (!contact) return [];

    const url =
      `${SEARCH_URL}?q=${encodeURIComponent(query)}` +
      `&page_size=${PROVIDER_PAGE_SIZE}` +
      `&fields=${encodeURIComponent(SEARCH_FIELDS)}`;

    const payload = asRecord(await fetchJson('openfoodfacts', 'search', url, signal, {
      'User-Agent': userAgent(contact),
    }));
    const products = payload && Array.isArray(payload.hits) ? payload.hits : [];

    const results: VitaFood[] = [];
    for (const entry of products) {
      const food = toVitaFood(entry);
      if (food) results.push(food);
    }
    return results;
  },

  async lookupBarcode(gtin: string, signal: AbortSignal): Promise<VitaFood | null> {
    const contact = readContact();
    if (!contact) return null;

    const url = `${PRODUCT_URL}/${encodeURIComponent(gtin)}.json?fields=${encodeURIComponent(PRODUCT_FIELDS)}`;

    let payload: Record<string, unknown> | null;
    try {
      payload = asRecord(
        await fetchJson('openfoodfacts', 'barcode', url, signal, { 'User-Agent': userAgent(contact) }),
      );
    } catch (error) {
      /**
       * Open Food Facts answers an unknown barcode with **HTTP 404**, not a
       * 200 carrying `status: 0`. Left to the generic handler that surfaces
       * as a lookup *error*, which would tell the user to retry something
       * that can never succeed instead of offering manual entry.
       *
       * A 404 here is a definitive answer — the database was reached and
       * does not have this product — so it maps to "not found".
       */
      if (error instanceof ProviderError && error.status === 404) return null;
      throw error;
    }

    // Some responses still return 200 with `status: 0`; treated the same way.
    if (!payload || asFiniteNumber(payload.status) !== 1) return null;
    return toVitaFood(payload.product);
  },
};
