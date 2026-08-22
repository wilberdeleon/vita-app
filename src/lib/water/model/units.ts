/**
 * Volume conversion and display.
 *
 * One canonical unit — millilitres — and conversion only at the edges. The
 * rule that matters: **never convert a rounded display value back into
 * storage.** "16 fl oz" shown as "473 mL" and re-entered as 473 mL is a
 * different drink from the one that was logged, and doing that repeatedly
 * walks a day's total away from the truth.
 *
 * Millilitres rather than fluid ounces because metric users' amounts land on
 * whole numbers there (250, 500, 750) while US amounts convert exactly in
 * either direction — the constants below are exact by definition, not
 * approximations.
 */

import { DEFAULT_VOLUME_UNIT, type VolumeUnit } from './types';

/** Exact by international agreement: 1 US fl oz = 29.5735295625 mL. */
export const ML_PER_FLOZ = 29.5735295625;
/** A US customary cup is exactly 8 US fluid ounces. */
export const FLOZ_PER_CUP = 8;
export const ML_PER_CUP = ML_PER_FLOZ * FLOZ_PER_CUP;
export const ML_PER_L = 1000;

const ML_PER_UNIT: Record<VolumeUnit, number> = {
  ml: 1,
  l: ML_PER_L,
  floz: ML_PER_FLOZ,
  cup: ML_PER_CUP,
};

/**
 * Guards a unit read back from storage.
 *
 * `hasOwnProperty`, not `in`: `in` walks the prototype chain, so `'toString'`
 * and `'constructor'` would both pass and then index the conversion table to
 * a function — making `toMl` return `NaN` and silently poisoning the day's
 * total. Caught by test rather than in production, but it is exactly the
 * corruption this validator exists to stop.
 */
export function isVolumeUnit(value: unknown): value is VolumeUnit {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ML_PER_UNIT, value);
}

/** An authored amount in canonical millilitres. */
export function toMl(amount: number, unit: VolumeUnit): number {
  return amount * ML_PER_UNIT[unit];
}

/** Canonical millilitres expressed in some unit. Unrounded — see `formatVolume`. */
export function fromMl(ml: number, unit: VolumeUnit): number {
  return ml / ML_PER_UNIT[unit];
}

/**
 * Display precision, per unit.
 *
 * Millilitres get none: nobody drank 236.588 mL, they drank a cup, and a
 * decimal there is noise. The US units get one, because a half-cup and a
 * 16.9 oz bottle are both things people actually say. Litres get two, since
 * 0.25 L is a normal amount and 0 L would be a lie.
 */
const DISPLAY_DECIMALS: Record<VolumeUnit, number> = {
  ml: 0,
  l: 2,
  floz: 1,
  cup: 1,
};

/** Rounds for display only. Storage keeps the exact value. */
export function roundForDisplay(amount: number, unit: VolumeUnit): number {
  const factor = 10 ** DISPLAY_DECIMALS[unit];
  return Math.round(amount * factor) / factor;
}

const UNIT_LABELS: Record<VolumeUnit, { singular: string; plural: string }> = {
  ml: { singular: 'mL', plural: 'mL' },
  l: { singular: 'L', plural: 'L' },
  floz: { singular: 'fl oz', plural: 'fl oz' },
  cup: { singular: 'cup', plural: 'cups' },
};

/** The unit as written beside a number. Only `cup` inflects. */
export function unitLabel(unit: VolumeUnit, amount: number): string {
  const labels = UNIT_LABELS[unit];
  return amount === 1 ? labels.singular : labels.plural;
}

/** The unit as written on its own — a picker, a segmented control. */
export function unitName(unit: VolumeUnit): string {
  return UNIT_LABELS[unit].plural;
}

/** A number as written, with no trailing `.0` on whole amounts. */
export function formatAmount(amount: number, unit: VolumeUnit): string {
  return String(roundForDisplay(amount, unit));
}

/** An authored amount with its unit, e.g. `16 fl oz` · `1 cup` · `500 mL`. */
export function formatEntered(amount: number, unit: VolumeUnit): string {
  const rounded = roundForDisplay(amount, unit);
  return `${rounded} ${unitLabel(unit, rounded)}`;
}

/** Canonical millilitres rendered in the user's unit, e.g. `473.2 mL` → `16 fl oz`. */
export function formatVolume(ml: number, unit: VolumeUnit = DEFAULT_VOLUME_UNIT): string {
  return formatEntered(fromMl(ml, unit), unit);
}

/**
 * Parses a typed amount.
 *
 * Returns `null` rather than `NaN` for anything that is not a real positive
 * quantity, so a caller cannot accidentally treat a failed parse as zero and
 * save an empty drink. Rejects `Infinity`, negatives, and zero; accepts a
 * leading `.5`, which is a normal way to type half a cup.
 */
export function parseAmount(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}
