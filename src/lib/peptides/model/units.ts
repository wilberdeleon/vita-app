/**
 * Units for peptide setups, and how they read on screen.
 *
 * Mass conversion, plus the display formatting for the three quantities the
 * dose calculator produces — mass, volume, and syringe units. Formatting lives
 * here rather than in components so one rounding rule serves every screen: the
 * arithmetic in `dose.ts` keeps full precision and rounds exactly once, at the
 * edge, on the way to a string.
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

/**
 * ── Volume and syringe units ───────────────────────────────────────────
 */

/**
 * Millilitres, at up to three decimals.
 *
 * Three because 0.025 mL is a real quantity in this domain and two would
 * silently flatten it to 0.03. Trailing zeros are dropped, so a clean 0.2 mL
 * does not render as "0.200 mL".
 */
export function formatVolume(ml: number): string {
  return `${Math.round(ml * 1000) / 1000} mL`;
}

/**
 * Syringe units — whole when the answer is whole, one decimal when it is not.
 *
 * The founder's rule: `20 units`, never `20.000000 units`, and `12.5 units`
 * when the value genuinely is. A third of a vial produces 13.333… units, and
 * showing all of that is false precision on a syringe nobody can read to more
 * than half a mark. The underlying number is never mutated — only this string.
 */
export function formatSyringeUnits(units: number): string {
  const rounded = Math.round(units * 10) / 10;
  const value = Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
  return `${value} ${units === 1 ? 'unit' : 'units'}`;
}

/**
 * Concentration, in whichever mass unit the user authored their vial in.
 *
 * Rendered as a rate (`10 mg/mL`) rather than as a bare number, because the
 * per-millilitre part is the half people forget when comparing two vials.
 */
export function formatConcentration(mcgPerMl: number, unit: MassUnit): string {
  return `${roundForDisplay(fromMcg(mcgPerMl, unit), unit)} ${unit}/mL`;
}

/**
 * Restates a typed amount in a different unit, preserving the quantity.
 *
 * `20 mg` becomes `20000 mcg`, not `20 mcg`. When someone taps a unit toggle
 * they are renaming the same physical amount, so the value has to travel with
 * the label — reinterpreting instead would move a vial or a dose by a factor
 * of a thousand while the digits sat still, which is the most dangerous thing
 * any of these screens could do.
 *
 * **Only a complete number is rewritten.** `Number('1.')` is `1`, so parsing
 * alone would turn someone half-way through typing "1.5" into "1000". Blank
 * or mid-typing text comes back untouched, so a unit toggle can never destroy
 * what was being written.
 *
 * Call it on an explicit toggle press only. Running it while typing would
 * rewrite the field under the cursor on every keystroke.
 */
export function convertAuthoredAmount(text: string, from: MassUnit, to: MassUnit): string {
  if (from === to) return text;
  const trimmed = text.trim();
  if (!/^\d*\.?\d+$/.test(trimmed)) return text;
  const value = Number(trimmed);
  if (!(value > 0)) return text;
  return String(fromMcg(toMcg(value, from), to));
}
