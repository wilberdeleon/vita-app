/**
 * Search fan-out, dedupe, ranking and barcode lookup — characterized.
 *
 * **No network.** Every provider here is a fake pushed into the registry's
 * own `PROVIDERS` array, which is what makes these deterministic: the real
 * USDA and Open Food Facts adapters are exercised for *normalization* in
 * `providers.test.ts`, over fixed payloads, and never over a socket.
 *
 * The guarantees being pinned are the ones a redesign could quietly break:
 * one provider failing must degrade a search rather than fail it, the same
 * food from two sources must arrive as one row, and a barcode must stop at
 * the first source that actually has it.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { PROVIDERS, lookupBarcodeAcrossProviders, searchAllProviders } from '../providers/registry';
import { ProviderError, type FoodProvider } from '../providers/types';
import { gtinEquals, isValidGtin, normalizeGtin } from '../providers/gtin';
import { dedupeFoods, normalizeName } from '../search/dedupe';
import { rankFoods, scoreFood } from '../search/rank';
import type { FoodSource, VitaFood } from '../model/types';

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Banana',
  servings: [
    { label: '1 medium', quantity: 1, unit: 'item', nutrition: { calories: 105, protein: 1, carbs: 27, fat: 0 } },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

function fakeProvider(
  id: FoodSource,
  behaviour: {
    results?: VitaFood[];
    fails?: ProviderError;
    configured?: boolean;
    barcode?: VitaFood | null;
    barcodeFails?: ProviderError;
    quality?: number;
  } = {},
): FoodProvider & { searched: string[]; barcodeCalls: string[] } {
  const searched: string[] = [];
  const barcodeCalls: string[] = [];

  return {
    id,
    label: id,
    quality: behaviour.quality ?? 50,
    searched,
    barcodeCalls,
    isConfigured: () => behaviour.configured ?? true,
    async search(query) {
      searched.push(query);
      if (behaviour.fails) throw behaviour.fails;
      return behaviour.results ?? [];
    },
    async lookupBarcode(gtin) {
      barcodeCalls.push(gtin);
      if (behaviour.barcodeFails) throw behaviour.barcodeFails;
      return behaviour.barcode ?? null;
    },
  };
}

const original = [...PROVIDERS];
/** Swaps the registry's providers for this test, in place. */
function useProviders(...providers: FoodProvider[]) {
  PROVIDERS.splice(0, PROVIDERS.length, ...providers);
}

afterEach(() => {
  PROVIDERS.splice(0, PROVIDERS.length, ...original);
});

const signal = () => new AbortController().signal;

/* ── fan-out ───────────────────────────────────────────────────────────── */

describe('searching every provider', () => {
  it('asks all configured providers and merges what they return', async () => {
    const usda = fakeProvider('usda', { results: [food()] });
    const off = fakeProvider('openfoodfacts', {
      results: [food({ vitaId: 'openfoodfacts:9', source: 'openfoodfacts', sourceId: '9', name: 'Bread' })],
    });
    useProviders(usda, off);

    const result = await searchAllProviders('banana', signal());

    expect(usda.searched).toEqual(['banana']);
    expect(off.searched).toEqual(['banana']);
    expect(result.foods).toHaveLength(2);
    expect(result.allFailed).toBe(false);
  });

  it('skips an unconfigured provider without calling or failing it', async () => {
    // Unconfigured is a setup problem, not a failure — see the registry.
    const configured = fakeProvider('usda', { results: [food()] });
    const missing = fakeProvider('openfoodfacts', { configured: false });
    useProviders(configured, missing);

    const result = await searchAllProviders('banana', signal());

    expect(missing.searched).toEqual([]);
    expect(result.foods).toHaveLength(1);
    expect(result.allFailed).toBe(false);
  });

  it('degrades rather than fails when one provider errors', async () => {
    /*
     * The isolation guarantee. One source being down must still return the
     * other's results — a search that failed entirely because a secondary
     * provider rate-limited would be a worse product than a shorter list.
     */
    const good = fakeProvider('usda', { results: [food()] });
    const bad = fakeProvider('openfoodfacts', {
      fails: new ProviderError('openfoodfacts', 'rate-limit', 'search', 429),
    });
    useProviders(good, bad);

    const result = await searchAllProviders('banana', signal());

    expect(result.foods).toHaveLength(1);
    expect(result.allFailed).toBe(false);
    const failure = result.outcomes.find((outcome) => outcome.provider === 'openfoodfacts')!;
    expect(failure.ok).toBe(false);
    expect(failure.error).toMatchObject({ kind: 'rate-limit', stage: 'search' });
  });

  it('reports an error only when every provider failed', async () => {
    useProviders(
      fakeProvider('usda', { fails: new ProviderError('usda', 'network', 'search') }),
      fakeProvider('openfoodfacts', { fails: new ProviderError('openfoodfacts', 'network', 'search') }),
    );

    const result = await searchAllProviders('banana', signal());
    expect(result.allFailed).toBe(true);
    expect(result.foods).toEqual([]);
  });

  it('records an outcome per provider, with counts', async () => {
    useProviders(
      fakeProvider('usda', { results: [food(), food({ vitaId: 'usda:2', sourceId: '2', name: 'Bagel' })] }),
      fakeProvider('openfoodfacts', { results: [] }),
    );

    const result = await searchAllProviders('b', signal());
    expect(result.outcomes.find((o) => o.provider === 'usda')).toMatchObject({ ok: true, count: 2 });
    expect(result.outcomes.find((o) => o.provider === 'openfoodfacts')).toMatchObject({ ok: true, count: 0 });
  });

  it('never leaks a key or a header into an outcome', async () => {
    // Outcomes are logged; they carry a category and a stage, nothing more.
    useProviders(fakeProvider('usda', { fails: new ProviderError('usda', 'auth', 'search', 401) }));

    const result = await searchAllProviders('x', signal());
    const serialized = JSON.stringify(result.outcomes);
    expect(serialized).toContain('auth');
    expect(serialized).not.toMatch(/key|token|authorization/i);
  });
});

/* ── dedupe ────────────────────────────────────────────────────────────── */

describe('deduping', () => {
  it('normalizes names for comparison', () => {
    expect(normalizeName('  Banana, RAW  ')).toBe(normalizeName('banana raw'));
  });

  it('merges the same food returned by two providers into one row', async () => {
    const merged = dedupeFoods([
      food({ vitaId: 'usda:1', source: 'usda', name: 'Banana', brand: 'Dole' }),
      food({ vitaId: 'openfoodfacts:2', source: 'openfoodfacts', sourceId: '2', name: 'Banana', brand: 'Dole' }),
    ]);

    expect(merged).toHaveLength(1);
  });

  it('keeps genuinely different foods apart', () => {
    const merged = dedupeFoods([
      food({ name: 'Banana' }),
      food({ vitaId: 'usda:2', sourceId: '2', name: 'Banana bread' }),
    ]);
    expect(merged).toHaveLength(2);
  });

  it('treats an empty list as empty', () => {
    expect(dedupeFoods([])).toEqual([]);
  });
});

/* ── ranking ───────────────────────────────────────────────────────────── */

describe('ranking', () => {
  it('scores an exact name match above an unrelated one', () => {
    const exact = scoreFood(food({ name: 'Banana' }), 'banana', 80);
    const loose = scoreFood(food({ name: 'Banana bread pudding mix' }), 'banana', 80);
    expect(exact).toBeGreaterThan(loose);
  });

  it('prefers the higher-quality source when names are equal', () => {
    const better = scoreFood(food({ name: 'Banana' }), 'banana', 90);
    const worse = scoreFood(food({ name: 'Banana' }), 'banana', 10);
    expect(better).toBeGreaterThan(worse);
  });

  it('orders by score, best first', () => {
    const top = food({ vitaId: 'usda:top', name: 'Banana' });
    const bottom = food({ vitaId: 'usda:bottom', sourceId: 'b', name: 'Banana' });
    expect(rankFoods([{ food: bottom, score: 1 }, { food: top, score: 99 }])[0].vitaId).toBe('usda:top');
  });
});

/* ── barcodes ──────────────────────────────────────────────────────────── */

describe('GTIN normalization', () => {
  it('zero-pads to 14 so UPC-A and EAN-13 compare equal', () => {
    expect(normalizeGtin('012345678905')).toHaveLength(14);
    expect(gtinEquals('012345678905', '0012345678905')).toBe(true);
  });

  it('rejects what is not a barcode', () => {
    for (const bad of ['', 'abc', null, undefined]) {
      expect(normalizeGtin(bad as string)).toBeNull();
      expect(isValidGtin(bad as string)).toBe(false);
    }
  });
});

describe('barcode lookup', () => {
  it('asks Open Food Facts first and stops when it finds the product', async () => {
    /*
     * The ordering that matters: OFF is barcode-native (one O(1) product
     * endpoint), USDA has no barcode endpoint at all and has to fuzzy-search
     * the digits. Running USDA first spent a request on every scan.
     */
    const off = fakeProvider('openfoodfacts', { barcode: food({ source: 'openfoodfacts' }) });
    const usda = fakeProvider('usda', { barcode: food() });
    useProviders(usda, off);

    const result = await lookupBarcodeAcrossProviders('012345678905', signal());

    expect(result.status).toBe('found');
    expect(off.barcodeCalls).toHaveLength(1);
    expect(usda.barcodeCalls).toEqual([]);
  });

  it('falls through to the next provider when the first has nothing', async () => {
    const off = fakeProvider('openfoodfacts', { barcode: null });
    const usda = fakeProvider('usda', { barcode: food() });
    useProviders(usda, off);

    const result = await lookupBarcodeAcrossProviders('012345678905', signal());
    expect(result.status).toBe('found');
    expect(usda.barcodeCalls).toHaveLength(1);
  });

  it('reports not-found when a provider answered and simply did not have it', async () => {
    useProviders(fakeProvider('openfoodfacts', { barcode: null }));
    expect((await lookupBarcodeAcrossProviders('012345678905', signal())).status).toBe('not-found');
  });

  it('reports an error only when nothing completed', async () => {
    useProviders(
      fakeProvider('openfoodfacts', {
        barcodeFails: new ProviderError('openfoodfacts', 'network', 'barcode'),
      }),
    );
    const result = await lookupBarcodeAcrossProviders('012345678905', signal());
    expect(result.status).toBe('error');
  });

  it('says so when no provider is configured at all', async () => {
    useProviders(fakeProvider('openfoodfacts', { configured: false }));
    expect((await lookupBarcodeAcrossProviders('012345678905', signal())).status).toBe('no-providers');
  });

  it('rejects a malformed barcode before asking anyone', async () => {
    const off = fakeProvider('openfoodfacts', { barcode: food() });
    useProviders(off);

    expect((await lookupBarcodeAcrossProviders('nonsense', signal())).status).toBe('not-found');
    expect(off.barcodeCalls).toEqual([]);
  });
});
