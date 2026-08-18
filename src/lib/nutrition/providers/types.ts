/**
 * The provider boundary.
 *
 * Everything above this line is provider-specific and lives inside a single
 * adapter file. Everything below it — search, dedupe, ranking, Food Detail,
 * the log, Fuel, Home — sees only `VitaFood`. Raw provider payloads never
 * escape an adapter, which is what keeps the UI free of `if (source ===
 * 'usda')` branching.
 */

import type { FoodSource, VitaFood } from '../model/types';

export type ProviderErrorKind =
  | 'not-configured'
  | 'network'
  | 'rate-limit'
  | 'auth'
  | 'bad-response'
  | 'aborted';

/**
 * A provider failure with enough context to debug without leaking secrets.
 * The `stage` and `kind` are safe to log; the user-facing copy never comes
 * from here.
 */
export class ProviderError extends Error {
  readonly provider: FoodSource;
  readonly kind: ProviderErrorKind;
  readonly stage: string;
  readonly status?: number;

  constructor(provider: FoodSource, kind: ProviderErrorKind, stage: string, status?: number) {
    super(`[${provider}] ${kind} during ${stage}${status ? ` (HTTP ${status})` : ''}`);
    this.name = 'ProviderError';
    this.provider = provider;
    this.kind = kind;
    this.stage = stage;
    this.status = status;
  }
}

export interface FoodProvider {
  readonly id: FoodSource;
  /** Human label for attribution surfaces. */
  readonly label: string;
  /**
   * Base ranking weight. USDA outranks Open Food Facts because its data is
   * laboratory- or label-verified rather than crowdsourced — not because
   * one is "better", but because completeness and consistency are more
   * reliable when a search returns both for the same food.
   */
  readonly quality: number;
  /** False when a required key or contact is missing; the provider is then skipped, not failed. */
  isConfigured(): boolean;
  search(query: string, signal: AbortSignal): Promise<VitaFood[]>;
  lookupBarcode?(gtin: string, signal: AbortSignal): Promise<VitaFood | null>;
}

/** How many results to ask each provider for. Enough to rank meaningfully, few enough to stay fast. */
export const PROVIDER_PAGE_SIZE = 25;

/**
 * Per-provider timeout. A provider that hasn't answered by now is dropped
 * from this search rather than holding up the results that did arrive —
 * a slow provider degrades the result set, it doesn't block the screen.
 */
export const PROVIDER_TIMEOUT_MS = 6000;
