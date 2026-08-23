/**
 * Mass conversion for peptide setups.
 *
 * Micrograms are canonical. The conversion is an exact power of ten, so
 * unlike volume there is no representation error to reason about — but the
 * authored pair is still preserved, because a user who entered "10 mg" should
 * keep seeing 10 mg rather than 10000 mcg.
 *
 * Micrograms rather than milligrams because research peptides are commonly
 * described in mcg (250 mcg), and keeping the small end whole avoids a domain
 * where the most common values are all fractions.
 */

import type { MassUnit } from './types';

export const MCG_PER_MG = 1000;

const MCG_PER_UNIT: Record<MassUnit, number> = {
  mcg: 1,
  mg: MCG_PER_MG,
};

/**
 * Guards a unit read back from storage.
 *
 * `hasOwnProperty`, not `in`: `in` walks the prototype chain, so `'toString'`
 * would pass and then index the table to a function, making conversion return
 * `NaN`. The water domain shipped that bug and its tests caught it; this is
 * the same shape of lookup.
 */
export function isMassUnit(value: unknown): value is MassUnit {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(MCG_PER_UNIT, value);
}

export function toMcg(amount: number, unit: MassUnit): number {
  return amount * MCG_PER_UNIT[unit];
}

export function fromMcg(mcg: number, unit: MassUnit): number {
  return mcg / MCG_PER_UNIT[unit];
}

/** Display precision: whole micrograms, two decimals for milligrams. */
const DISPLAY_DECIMALS: Record<MassUnit, number> = { mcg: 0, mg: 2 };

export function roundForDisplay(amount: number, unit: MassUnit): number {
  const factor = 10 ** DISPLAY_DECIMALS[unit];
  return Math.round(amount * factor) / factor;
}

/** An amount with its unit, with no trailing zeros — `10 mg`, `250 mcg`. */
export function formatMass(amount: number, unit: MassUnit): string {
  return `${roundForDisplay(amount, unit)} ${unit}`;
}

/** Canonical micrograms rendered in some unit. */
export function formatMcg(mcg: number, unit: MassUnit): string {
  return formatMass(fromMcg(mcg, unit), unit);
}

/**
 * Parses a typed amount.
 *
 * Returns `null` rather than `NaN` for anything that is not a real positive
 * quantity, so a caller cannot mistake a failed parse for zero. Same contract
 * as the water domain's parser.
 */
export function parseAmount(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}
