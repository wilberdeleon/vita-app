/**
 * Shared fetch plumbing for provider adapters.
 *
 * Wraps every network failure into a `ProviderError` so the aggregator can
 * treat providers uniformly, and layers a per-provider timeout on top of
 * the caller's abort signal — a user typing a new query cancels the old
 * request, and a silent provider cancels itself.
 */

import { ProviderError, PROVIDER_TIMEOUT_MS, type FoodProvider } from './types';

export async function fetchJson(
  provider: FoodProvider['id'],
  stage: string,
  url: string,
  signal: AbortSignal,
  headers: Record<string, string> = {},
): Promise<unknown> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), PROVIDER_TIMEOUT_MS);
  const onAbort = () => timeout.abort();
  signal.addEventListener('abort', onAbort);

  try {
    const response = await fetch(url, { signal: timeout.signal, headers });

    if (!response.ok) {
      // 429 is separated because it is the one failure worth backing off
      // from rather than retrying, and 401/403 means the key is wrong
      // rather than the network being down.
      const kind =
        response.status === 429 ? 'rate-limit' : response.status === 401 || response.status === 403 ? 'auth' : 'bad-response';
      throw new ProviderError(provider, kind, stage, response.status);
    }

    return (await response.json()) as unknown;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    // The caller aborting and the timeout firing are indistinguishable here;
    // both mean "these results are no longer wanted".
    if (signal.aborted || timeout.signal.aborted) throw new ProviderError(provider, 'aborted', stage);
    throw new ProviderError(provider, 'network', stage);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

/** Narrow an unknown JSON value to a record without trusting its shape. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Providers return numbers as strings often enough that this is worth centralizing. */
export function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}
