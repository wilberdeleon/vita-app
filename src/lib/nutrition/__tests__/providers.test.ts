/**
 * What the two live adapters make of a provider payload.
 *
 * **No network.** `fetch` is stubbed with fixed payloads, so these describe
 * normalization only: given what a source actually returns, what `VitaFood`
 * comes out. The fan-out, dedupe, ranking and barcode ordering around them
 * are `search.test.ts`.
 *
 * The rule under test throughout: **a field the source does not have must
 * come back absent, not zero.** An invented `0 g` sodium is indistinguishable
 * from a measured one, and every screen downstream would believe it.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { openFoodFactsProvider } from '../providers/openFoodFacts';
import { usdaProvider } from '../providers/usda';

const signal = () => new AbortController().signal;

/** Replies with one fixed payload, and records what was asked for. */
function stubFetch(payload: unknown, ok = true, status = 200) {
  const calls: string[] = [];
  global.fetch = jest.fn(async (url: string) => {
    calls.push(String(url));
    return {
      ok,
      status,
      json: async () => payload,
    } as unknown as Response;
  }) as unknown as typeof fetch;
  return calls;
}

const realFetch = global.fetch;
const realContact = process.env.EXPO_PUBLIC_OFF_CONTACT;
const realKey = process.env.EXPO_PUBLIC_USDA_API_KEY;

/**
 * Restored key by key rather than by replacing `process.env` wholesale —
 * reassigning the object detaches it from Node's own env and anything that
 * captured the original binding keeps reading the old one.
 */
beforeEach(() => {
  process.env.EXPO_PUBLIC_OFF_CONTACT = 'test@vita.test';
  process.env.EXPO_PUBLIC_USDA_API_KEY = 'test-key';
});

afterEach(() => {
  global.fetch = realFetch;
  if (realContact === undefined) delete process.env.EXPO_PUBLIC_OFF_CONTACT;
  else process.env.EXPO_PUBLIC_OFF_CONTACT = realContact;
  if (realKey === undefined) delete process.env.EXPO_PUBLIC_USDA_API_KEY;
  else process.env.EXPO_PUBLIC_USDA_API_KEY = realKey;
});

/* ── configuration ─────────────────────────────────────────────────────── */

describe('being configured', () => {
  it('Open Food Facts needs a contact', () => {
    expect(openFoodFactsProvider.isConfigured()).toBe(true);
    delete process.env.EXPO_PUBLIC_OFF_CONTACT;
    expect(openFoodFactsProvider.isConfigured()).toBe(false);
  });

  it('USDA needs a key', () => {
    expect(usdaProvider.isConfigured()).toBe(true);
    delete process.env.EXPO_PUBLIC_USDA_API_KEY;
    expect(usdaProvider.isConfigured()).toBe(false);
  });

  it('an unconfigured provider returns nothing rather than throwing', async () => {
    delete process.env.EXPO_PUBLIC_OFF_CONTACT;
    stubFetch({});
    expect(await openFoodFactsProvider.search('banana', signal())).toEqual([]);
  });

  it('both are declared live — USDA is shipped, not deferred', () => {
    // Recorded because planning documents described USDA as future work
    // long after the adapter landed. See the 5.6 audit.
    expect(usdaProvider.id).toBe('usda');
    expect(openFoodFactsProvider.id).toBe('openfoodfacts');
    expect(typeof usdaProvider.search).toBe('function');
  });
});

/* ── Open Food Facts ───────────────────────────────────────────────────── */

describe('Open Food Facts normalization', () => {
  const product = (overrides: Record<string, unknown> = {}) => ({
    code: '012345678905',
    product_name: 'Peanut Butter',
    brands: 'Acme',
    image_front_small_url: 'https://example.test/pb.jpg',
    nutriments: {
      'energy-kcal_100g': 588,
      proteins_100g: 25,
      carbohydrates_100g: 20,
      fat_100g: 50,
      'saturated-fat_100g': 10,
      fiber_100g: 6,
      sugars_100g: 9,
      sodium_100g: 0.4,
    },
    ...overrides,
  });

  it('turns a complete product into a food', async () => {
    stubFetch({ hits: [product()] });
    const [food] = await openFoodFactsProvider.search('peanut butter', signal());

    expect(food.name).toBe('Peanut Butter');
    expect(food.brand).toBe('Acme');
    expect(food.source).toBe('openfoodfacts');
    expect(food.imageUrl).toBe('https://example.test/pb.jpg');
    expect(food.servings.length).toBeGreaterThan(0);
    expect(food.servings[0].nutrition.calories).toBeGreaterThan(0);
  });

  it('normalizes the barcode to GTIN-14', async () => {
    stubFetch({ hits: [product()] });
    const [food] = await openFoodFactsProvider.search('x', signal());
    expect(food.barcode).toHaveLength(14);
  });

  it('handles a product with no image', async () => {
    stubFetch({ hits: [product({ image_front_small_url: undefined })] });
    const [food] = await openFoodFactsProvider.search('x', signal());
    expect(food.imageUrl).toBeUndefined();
  });

  it('handles a product with no brand', async () => {
    stubFetch({ hits: [product({ brands: undefined })] });
    const [food] = await openFoodFactsProvider.search('x', signal());
    expect(food.brand).toBeUndefined();
  });

  it('leaves an unknown optional nutrient absent rather than zero', async () => {
    stubFetch({
      hits: [
        product({
          nutriments: {
            'energy-kcal_100g': 100,
            proteins_100g: 5,
            carbohydrates_100g: 10,
            fat_100g: 2,
          },
        }),
      ],
    });
    const [food] = await openFoodFactsProvider.search('x', signal());
    const nutrition = food.servings[0].nutrition;

    expect(nutrition.calories).toBe(100);
    expect('sodium' in nutrition).toBe(false);
    expect('fiber' in nutrition).toBe(false);
  });

  it('drops a product with no usable name', async () => {
    stubFetch({ hits: [product({ product_name: '' })] });
    expect(await openFoodFactsProvider.search('x', signal())).toEqual([]);
  });

  it('survives a payload that is not shaped as expected', async () => {
    stubFetch({ unexpected: true });
    expect(await openFoodFactsProvider.search('x', signal())).toEqual([]);
  });

  it('raises a typed error for a rate limit', async () => {
    stubFetch({}, false, 429);
    await expect(openFoodFactsProvider.search('x', signal())).rejects.toMatchObject({
      kind: 'rate-limit',
      provider: 'openfoodfacts',
    });
  });

  it('looks a barcode up on the product endpoint', async () => {
    const calls = stubFetch({ status: 1, product: product() });
    const food = await openFoodFactsProvider.lookupBarcode!('00012345678905', signal());

    expect(food?.name).toBe('Peanut Butter');
    expect(calls[0]).toContain('12345678905');
  });

  it('returns null for a barcode the database does not have', async () => {
    stubFetch({ status: 0 });
    expect(await openFoodFactsProvider.lookupBarcode!('00012345678905', signal())).toBeNull();
  });
});

/* ── USDA ──────────────────────────────────────────────────────────────── */

describe('USDA normalization', () => {
  const usdaFood = (overrides: Record<string, unknown> = {}) => ({
    fdcId: 123456,
    description: 'Bananas, raw',
    dataType: 'Foundation',
    foodNutrients: [
      { nutrientId: 1008, value: 89 },
      { nutrientId: 1003, value: 1.09 },
      { nutrientId: 1005, value: 22.8 },
      { nutrientId: 1004, value: 0.33 },
    ],
    ...overrides,
  });

  it('turns a result into a food with servings', async () => {
    stubFetch({ foods: [usdaFood()] });
    const [food] = await usdaProvider.search('banana', signal());

    expect(food.name).toBe('Bananas, raw');
    expect(food.source).toBe('usda');
    expect(food.sourceId).toBe('123456');
    expect(food.servings.length).toBeGreaterThan(0);
    expect(food.servings[0].nutrition.calories).toBeGreaterThan(0);
  });

  it('handles a result carrying no optional nutrients', async () => {
    stubFetch({ foods: [usdaFood()] });
    const [food] = await usdaProvider.search('banana', signal());
    expect('sodium' in food.servings[0].nutrition).toBe(false);
  });

  it('drops a result with no description', async () => {
    stubFetch({ foods: [usdaFood({ description: '' })] });
    expect(await usdaProvider.search('x', signal())).toEqual([]);
  });

  it('survives an unexpected payload', async () => {
    stubFetch({ nope: 1 });
    expect(await usdaProvider.search('x', signal())).toEqual([]);
  });

  it('raises a typed auth error for a bad key', async () => {
    stubFetch({}, false, 401);
    await expect(usdaProvider.search('x', signal())).rejects.toMatchObject({
      kind: 'auth',
      provider: 'usda',
    });
  });

  it('never puts the key in the error', async () => {
    stubFetch({}, false, 401);
    const error = await usdaProvider.search('x', signal()).catch((e: unknown) => e);
    expect(String(error)).not.toContain('test-key');
  });
});
