/**
 * Body-weight conversion, parsing and display.
 *
 * Mathematical, never medical: a weight is valid when it is a finite number
 * greater than zero. There are **no** "healthy" bounds, minimums or maximums
 * — the same rule slice 5.9 set for BMI input.
 */

import type { WeightUnit } from './types';

/**
 * The international avoirdupois pound, exactly (1959). The same definition
 * `src/lib/bmi` uses; a test pins the two together so they cannot drift,
 * without Journey importing from the BMI tool.
 */
export const KG_PER_LB = 0.45359237;

export function isWeightUnit(value: unknown): value is WeightUnit {
  return value === 'lb' || value === 'kg';
}

/** A mathematically valid weight: finite and greater than zero. */
export function isValidWeight(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/** To canonical kilograms. Unrounded. */
export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value * KG_PER_LB;
}

/** From canonical kilograms to a display unit. Unrounded. */
export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kg / KG_PER_LB;
}

/**
 * Parses a typed weight. `null` for anything that is not a real positive
 * number, so a failed parse can never become a stored zero. Accepts a decimal
 * comma as well as a point — `81,6` is how much of the world types a weight.
 */
export function parseWeight(input: string): number | null {
  const trimmed = input.trim().replace(',', '.');
  if (trimmed.length === 0 || !/^(\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return isValidWeight(value) ? value : null;
}

/** Display precision: one decimal, applied only here. */
export function roundForDisplay(value: number): number {
  return Math.round(value * 10) / 10;
}

/** `"180.0 lb"` / `"81.6 kg"` — the display boundary. */
export function formatWeight(kg: number, unit: WeightUnit): string {
  return `${roundForDisplay(fromKg(kg, unit)).toFixed(1)} ${unit}`;
}
