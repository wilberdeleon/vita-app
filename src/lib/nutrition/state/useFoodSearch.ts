/**
 * Debounced, cancellable food search.
 *
 * Three things this has to get right, in order of how badly they bite:
 *
 *  1. **No request per keystroke.** A 350 ms debounce means "chicken breast"
 *     is one search, not fifteen. That matters for Open Food Facts, whose
 *     documented search limit is 10 requests/minute.
 *  2. **No stale results.** Each run gets a sequence number and an
 *     `AbortController`; a slower earlier response is discarded rather than
 *     overwriting a newer one. Without this, results visibly jump.
 *  3. **No false errors.** One provider failing is not a failed search.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchAllProviders } from '../providers/registry';
import type { MergedFood } from '../search/dedupe';
import { readQueryCache, rememberFoods, writeQueryCache } from '../search/cache';

/**
 * Below this a query matches almost everything and wastes a provider call.
 * Two characters is the floor that still allows real short searches — "ox",
 * "pb" — while skipping the single letter that a user is always mid-typing.
 */
export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

export type FoodSearchStatus = 'idle' | 'searching' | 'results' | 'empty' | 'error' | 'unconfigured';

export type FoodSearchState = {
  status: FoodSearchStatus;
  results: MergedFood[];
  /** Set when every provider failed, for the error state's copy. */
  error: string | null;
  /** Safe diagnostics: which provider failed and where. Dev-only surface. */
  diagnostics: string[];
  retry: () => void;
};

export function useFoodSearch(query: string): FoodSearchState {
  const [status, setStatus] = useState<FoodSearchStatus>('idle');
  const [results, setResults] = useState<MergedFood[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  const runId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const trimmed = query.trim();

    controller.current?.abort();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      runId.current += 1;
      setStatus('idle');
      setResults([]);
      setError(null);
      return;
    }

    const cached = readQueryCache(trimmed);
    if (cached) {
      runId.current += 1;
      setResults(cached as MergedFood[]);
      setStatus(cached.length > 0 ? 'results' : 'empty');
      setError(null);
      return;
    }

    setStatus('searching');
    const id = (runId.current += 1);
    const abort = new AbortController();
    controller.current = abort;

    const timer = setTimeout(async () => {
      try {
        const outcome = await searchAllProviders(trimmed, abort.signal);
        // A newer search started while this one was in flight.
        if (id !== runId.current) return;

        setDiagnostics(
          outcome.outcomes
            .filter((entry) => !entry.ok)
            .map((entry) => `${entry.provider}: ${entry.error?.kind ?? 'unknown'} @ ${entry.error?.stage ?? '?'}`),
        );

        if (outcome.noProviders) {
          setStatus('unconfigured');
          setResults([]);
          return;
        }

        if (outcome.allFailed) {
          setStatus('error');
          setResults([]);
          setError("We couldn't load results.");
          return;
        }

        writeQueryCache(trimmed, outcome.foods);
        rememberFoods(outcome.foods);
        setResults(outcome.foods);
        setError(null);
        setStatus(outcome.foods.length > 0 ? 'results' : 'empty');
      } catch {
        if (id !== runId.current) return;
        setStatus('error');
        setResults([]);
        setError("We couldn't load results.");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [query, attempt]);

  return { status, results, error, diagnostics, retry };
}
