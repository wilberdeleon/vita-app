/**
 * `useFoodSearch` — the debounce, the stale-response guard, and the three
 * failure shapes.
 *
 * The 5.6 audit listed this hook as uncovered, and it is the one piece of Fuel
 * where getting it wrong is invisible in a screenshot: a missing debounce is
 * fifteen requests per word against a provider that documents ten per minute,
 * and a missing sequence check is results that visibly jump backwards when a
 * slow response lands after a fast one.
 *
 * **No network call is made here.** `searchAllProviders` is stubbed at the
 * registry seam, which is also the only way the all-failed and no-provider
 * branches can be reached at all.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockSearchAllProviders = jest.fn();
jest.mock('../providers/registry', () => ({
  ...jest.requireActual('../providers/registry'),
  searchAllProviders: (...args: unknown[]) => mockSearchAllProviders(...args),
}));

import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { MIN_QUERY_LENGTH, useFoodSearch, type FoodSearchState } from '../state/useFoodSearch';
import type { VitaFood } from '../model/types';

const food = (name: string): VitaFood => ({
  vitaId: `usda:${name}`,
  source: 'usda',
  sourceId: name,
  name,
  servings: [
    { label: '1 serving', quantity: 1, unit: 'serving', nutrition: { calories: 100, protein: 1, carbs: 1, fat: 1 } },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
});

const outcome = (over: Partial<{ foods: VitaFood[]; allFailed: boolean; noProviders: boolean }> = {}) => ({
  foods: [],
  outcomes: [],
  allFailed: false,
  noProviders: false,
  ...over,
});

/** A probe that renders nothing and exposes the hook's latest state. */
let latest: FoodSearchState;
function Probe({ query }: { query: string }) {
  latest = useFoodSearch(query);
  return <Text>{latest.status}</Text>;
}

let tree: ReactTestRenderer | null = null;

async function render(query: string) {
  await act(async () => {
    tree = create(<Probe query={query} />);
  });
}

async function rerender(query: string) {
  await act(async () => tree!.update(<Probe query={query} />));
}

/** Lets the debounce elapse and the resolved promise flush. */
async function settle(ms = 400) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
  await act(async () => undefined);
}

/**
 * A query nothing else in the file uses.
 *
 * The hook consults an in-memory query cache before searching — deliberately,
 * so backing out of Food Detail does not re-hit the network. Each case gets
 * its own term rather than the module adding a reset hatch for tests.
 */
let counter = 0;
const q = () => `probe${(counter += 1)}`;

beforeEach(() => {
  jest.useFakeTimers();
  mockSearchAllProviders.mockReset();
  mockSearchAllProviders.mockResolvedValue(outcome());
});

afterEach(async () => {
  if (tree) await act(async () => tree!.unmount());
  tree = null;
  jest.useRealTimers();
});

describe('the query floor', () => {
  it('does not search a query shorter than the floor', async () => {
    await render('a');
    await settle();
    expect(latest.status).toBe('idle');
    expect(mockSearchAllProviders).not.toHaveBeenCalled();
  });

  it('does not search an empty or whitespace query', async () => {
    await render('   ');
    await settle();
    expect(latest.status).toBe('idle');
    expect(mockSearchAllProviders).not.toHaveBeenCalled();
  });

  it('searches once the floor is reached', async () => {
    // Two characters — enough for "ox" and "pb", short of the single letter
    // someone is always mid-typing.
    expect(MIN_QUERY_LENGTH).toBe(2);
    await render('ox');
    await settle();
    expect(mockSearchAllProviders).toHaveBeenCalledTimes(1);
  });
});

describe('the debounce', () => {
  it('makes one request for a word typed letter by letter', async () => {
    const term = q();
    await render(term.slice(0, 2));
    for (let i = 3; i <= term.length; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(80);
      });
      await rerender(term.slice(0, i));
    }
    await settle();

    // Not one per keystroke — Open Food Facts documents 10 requests/minute.
    expect(mockSearchAllProviders).toHaveBeenCalledTimes(1);
    expect(mockSearchAllProviders.mock.calls[0][0]).toBe(term);
  });

  it('reports itself as searching while the request is in flight', async () => {
    let release: (value: unknown) => void = () => undefined;
    mockSearchAllProviders.mockReturnValue(new Promise((resolve) => (release = resolve)));

    await render(q());
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(latest.status).toBe('searching');

    await act(async () => {
      release(outcome({ foods: [food('Oats')] }));
    });
    expect(latest.status).toBe('results');
  });
});

describe('stale responses', () => {
  it('discards a slow earlier response when a newer query has started', async () => {
    /*
     * The failure this prevents: type "chi", pause, type "chicken"; the first
     * request answers second and overwrites the results the user is looking
     * at. Each run carries a sequence number and a late one is dropped.
     */
    const first = q();
    const second = q();
    let releaseFirst: (value: unknown) => void = () => undefined;

    mockSearchAllProviders
      .mockReturnValueOnce(new Promise((resolve) => (releaseFirst = resolve)))
      .mockResolvedValueOnce(outcome({ foods: [food('Second')] }));

    await render(first);
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    await rerender(second);
    await settle();
    expect(latest.results.map((item) => item.name)).toEqual(['Second']);

    // The first request finally answers — and is ignored.
    await act(async () => {
      releaseFirst(outcome({ foods: [food('First')] }));
    });
    expect(latest.results.map((item) => item.name)).toEqual(['Second']);
  });

  it('abandons a pending search when the query is cleared', async () => {
    // Held open, so the search is genuinely still in flight when it is cleared.
    mockSearchAllProviders.mockReturnValue(new Promise(() => undefined));
    await render(q());
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(latest.status).toBe('searching');

    await rerender('');
    expect(latest.status).toBe('idle');
    expect(latest.results).toEqual([]);
  });
});

describe('outcomes', () => {
  it('reports results', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [food('Oats'), food('Rice')] }));
    await render(q());
    await settle();

    expect(latest.status).toBe('results');
    expect(latest.results).toHaveLength(2);
    expect(latest.error).toBeNull();
  });

  it('reports an empty result set as empty, not as an error', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [] }));
    await render(q());
    await settle();

    expect(latest.status).toBe('empty');
    expect(latest.error).toBeNull();
  });

  it('treats one provider failing as a successful search', async () => {
    // The rule that matters most: a partial failure is not a failed search,
    // and the user is never told a provider's name.
    mockSearchAllProviders.mockResolvedValue({
      foods: [food('Oats')],
      outcomes: [{ provider: 'usda', ok: false, error: { kind: 'network', stage: 'fetch' } }],
      allFailed: false,
      noProviders: false,
    });
    await render(q());
    await settle();

    expect(latest.status).toBe('results');
    expect(latest.error).toBeNull();
  });

  it('reports an error only when every provider failed', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ allFailed: true }));
    await render(q());
    await settle();

    expect(latest.status).toBe('error');
    expect(latest.results).toEqual([]);
    expect(latest.error).toBeTruthy();
    // Plain words: no status code, endpoint or provider in what a screen shows.
    expect(latest.error).not.toMatch(/HTTP|\d{3}|usda|openfoodfacts/i);
  });

  it('reports a thrown request as an error rather than crashing', async () => {
    mockSearchAllProviders.mockRejectedValue(new Error('boom'));
    await render(q());
    await settle();

    expect(latest.status).toBe('error');
    expect(latest.error).not.toContain('boom');
  });

  it('says so when no provider is configured at all', async () => {
    mockSearchAllProviders.mockResolvedValue(outcome({ noProviders: true }));
    await render(q());
    await settle();

    expect(latest.status).toBe('unconfigured');
  });

  it('retries on demand after a failure', async () => {
    mockSearchAllProviders.mockResolvedValueOnce(outcome({ allFailed: true }));
    await render(q());
    await settle();
    expect(latest.status).toBe('error');

    mockSearchAllProviders.mockResolvedValueOnce(outcome({ foods: [food('Oats')] }));
    await act(async () => latest.retry());
    await settle();
    expect(latest.status).toBe('results');
  });
});

describe('the query cache', () => {
  it('answers a repeated query without asking a provider again', async () => {
    /*
     * What this is for: backing out of Food Detail and landing on the same
     * search should not spend another request. Short TTL, in memory only.
     */
    const term = q();
    mockSearchAllProviders.mockResolvedValue(outcome({ foods: [food('Oats')] }));
    await render(term);
    await settle();
    expect(mockSearchAllProviders).toHaveBeenCalledTimes(1);

    await rerender('');
    await rerender(term);
    await settle();

    expect(mockSearchAllProviders).toHaveBeenCalledTimes(1);
    expect(latest.status).toBe('results');
    expect(latest.results.map((item) => item.name)).toEqual(['Oats']);
  });

  it('does not serve one query’s results to another', async () => {
    mockSearchAllProviders.mockResolvedValueOnce(outcome({ foods: [food('Oats')] }));
    await render(q());
    await settle();

    mockSearchAllProviders.mockResolvedValueOnce(outcome({ foods: [food('Rice')] }));
    await rerender(q());
    await settle();

    expect(latest.results.map((item) => item.name)).toEqual(['Rice']);
    expect(mockSearchAllProviders).toHaveBeenCalledTimes(2);
  });
});
