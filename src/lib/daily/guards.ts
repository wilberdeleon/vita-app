/**
 * Type guards for reading persisted data back.
 *
 * Stored JSON is only as trustworthy as the last write. A torn write, a
 * hand-edited dev build, or a record from an older shape would otherwise
 * surface as `NaN` propagating silently into a total the user reads as fact.
 * Every domain that reads from storage validates first, and these are the
 * primitives it validates with.
 *
 * Pure and dependency-free on purpose — the parsers built on them stay
 * testable without touching AsyncStorage.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Rejects NaN and Infinity, which `typeof === 'number'` alone lets through. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** A positive, finite quantity — an amount, a volume, a dose. */
export function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}
