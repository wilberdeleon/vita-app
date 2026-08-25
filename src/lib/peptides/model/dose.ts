/**
 * The dose / unit calculator — arithmetic, and nothing else.
 *
 * **VITA converts; the user decides.** Every mass in this module originates
 * from something the user typed: the vial they bought, the water they added,
 * the amount they are using. Nothing here proposes, defaults, bounds, or
 * optimises an amount, and no function in this file has a "recommended" or
 * "typical" input to supply one. That boundary is the reason the module is
 * pure and lives outside every screen — arithmetic that cannot reach state
 * cannot quietly acquire an opinion.
 *
 * **Micrograms are canonical**, matching the rest of the peptide domain, and
 * `MCG_PER_MG` is an exact power of ten, so mg↔mcg round-trips without
 * representation error. Volume in millilitres and syringe units are computed
 * at full `number` precision; rounding happens once, at the display edge, in
 * `formatSyringeUnits` and friends. Rounding earlier is how a calculator ends
 * up disagreeing with itself between two screens.
 *
 * **Units are not a volume.** A syringe unit only means something relative to
 * a graduation density, which is why `unitsPerMl` is a required input to every
 * conversion rather than a constant baked into a formula.
 */

import { DEFAULT_UNITS_PER_ML, type MassUnit } from './types';
import { toMcg } from './units';

/**
 * V1 assumes the ordinary U-100 insulin scale and says so beside every result.
 * The constant lives on the setup model (it is a property of the syringe, not
 * of this calculation) and is deliberately *not* a capacity — a 0.3 mL, 0.5 mL
 * and 1 mL syringe are all U-100, and the capacity selector that conflated the
 * two was removed in slice 3.5B.
 */
export { DEFAULT_UNITS_PER_ML };

/**
 * Why a calculation could not be performed.
 *
 * Typed rather than a message string so the screen owns its own copy and the
 * domain stays free of user-facing English. Missing input and invalid input
 * are separate: a blank field is a normal state on first open, while a
 * negative vial amount means something is actually wrong.
 */
export type DoseCalculationError =
  | 'missing-vial-amount'
  | 'invalid-vial-amount'
  | 'missing-reconstitution'
  | 'invalid-reconstitution'
  | 'missing-amount'
  | 'invalid-amount'
  | 'invalid-units-per-ml'
  | 'missing-units'
  | 'invalid-units';

/**
 * A successful conversion, reported in every unit it passed through.
 *
 * The intermediate values are returned rather than recomputed by the caller
 * because the screen shows the working — `10 mg/mL · 2 mg = 0.2 mL = 20 units`
 * is one calculation displayed four ways, and re-deriving any step in a
 * component is how the shown maths drifts from the shown answer.
 */
export type DoseCalculation = {
  concentrationMcgPerMl: number;
  amountMcg: number;
  volumeMl: number;
  syringeUnits: number;
  unitsPerMl: number;
};

/** Never partially valid: either every field is meaningful or none is. */
export type DoseCalculationResult =
  | ({ ok: true } & DoseCalculation)
  | { ok: false; reason: DoseCalculationError };

/** What the calculator knows about the vial, from the user's saved setup. */
export type VialInputs = {
  /** Canonical micrograms of compound in the vial, as authored in the setup. */
  vialAmountMcg?: number;
  /** Bacteriostatic water added, in millilitres. */
  reconstitutionMl?: number;
  /** Graduation density. Defaults to U-100 when the setup does not say. */
  unitsPerMl?: number;
};

/** A real, usable positive quantity — not NaN, not Infinity, not zero or less. */
function isUsableQuantity(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Validates the vial half of the calculation, which both directions share.
 *
 * Returns the concentration on success. Splitting this out is what lets the
 * forward and reverse conversions be genuine inverses of each other rather
 * than two hand-written formulas that agree by coincidence.
 */
function resolveConcentration(
  vial: VialInputs,
): { ok: true; concentrationMcgPerMl: number; unitsPerMl: number } | { ok: false; reason: DoseCalculationError } {
  const { vialAmountMcg, reconstitutionMl } = vial;
  const unitsPerMl = vial.unitsPerMl ?? DEFAULT_UNITS_PER_ML;

  if (vialAmountMcg === undefined) return { ok: false, reason: 'missing-vial-amount' };
  if (!isUsableQuantity(vialAmountMcg)) return { ok: false, reason: 'invalid-vial-amount' };

  if (reconstitutionMl === undefined) return { ok: false, reason: 'missing-reconstitution' };
  // Zero is rejected here and not further down: it is the divide-by-zero.
  if (!isUsableQuantity(reconstitutionMl)) return { ok: false, reason: 'invalid-reconstitution' };

  if (!isUsableQuantity(unitsPerMl)) return { ok: false, reason: 'invalid-units-per-ml' };

  return { ok: true, concentrationMcgPerMl: vialAmountMcg / reconstitutionMl, unitsPerMl };
}

/**
 * Concentration alone — how much compound sits in each millilitre.
 *
 * Exposed separately because the setup summary shows it before the user has
 * entered any amount at all, and that display must not have to invent a
 * placeholder amount to get a number out of the calculator.
 */
export function calculateConcentration(
  vial: VialInputs,
): { ok: true; concentrationMcgPerMl: number; unitsPerMl: number } | { ok: false; reason: DoseCalculationError } {
  return resolveConcentration(vial);
}

/**
 * Forward conversion: the amount the user is using → syringe units.
 *
 *   concentration = vialAmountMcg / reconstitutionMl
 *   volumeMl      = amountMcg / concentration
 *   syringeUnits  = volumeMl * unitsPerMl
 *
 * The founder's worked example: a 10 mg vial in 1 mL is 10 mg/mL, so 2 mg is
 * 0.2 mL, which on a U-100 scale is 20 units.
 */
export function calculateSyringeUnits(
  vial: VialInputs,
  amountMcg: number | undefined,
): DoseCalculationResult {
  const concentration = resolveConcentration(vial);
  if (!concentration.ok) return concentration;

  if (amountMcg === undefined) return { ok: false, reason: 'missing-amount' };
  if (!isUsableQuantity(amountMcg)) return { ok: false, reason: 'invalid-amount' };

  const volumeMl = amountMcg / concentration.concentrationMcgPerMl;
  const syringeUnits = volumeMl * concentration.unitsPerMl;

  return {
    ok: true,
    concentrationMcgPerMl: concentration.concentrationMcgPerMl,
    amountMcg,
    volumeMl,
    syringeUnits,
    unitsPerMl: concentration.unitsPerMl,
  };
}

/**
 * Reverse conversion: syringe units → the mass they contain.
 *
 *   volumeMl = syringeUnits / unitsPerMl
 *   amountMcg = volumeMl * concentration
 *
 * Answers "what does 15 units come to with this vial?", which is the question
 * a user asks when reading a syringe rather than filling one.
 */
export function calculateAmountFromUnits(
  vial: VialInputs,
  syringeUnits: number | undefined,
): DoseCalculationResult {
  const concentration = resolveConcentration(vial);
  if (!concentration.ok) return concentration;

  if (syringeUnits === undefined) return { ok: false, reason: 'missing-units' };
  if (!isUsableQuantity(syringeUnits)) return { ok: false, reason: 'invalid-units' };

  const volumeMl = syringeUnits / concentration.unitsPerMl;
  const amountMcg = volumeMl * concentration.concentrationMcgPerMl;

  return {
    ok: true,
    concentrationMcgPerMl: concentration.concentrationMcgPerMl,
    amountMcg,
    volumeMl,
    syringeUnits,
    unitsPerMl: concentration.unitsPerMl,
  };
}

/** Convenience for callers holding an authored `{ amount, unit }` pair. */
export function calculateSyringeUnitsForMass(
  vial: VialInputs,
  amount: number | null,
  unit: MassUnit,
): DoseCalculationResult {
  return calculateSyringeUnits(vial, amount === null ? undefined : toMcg(amount, unit));
}

/**
 * Data-consistency observations — **not** medical judgements.
 *
 * The only thing being compared is one number the user entered against
 * another number the user entered. An amount larger than the whole vial is
 * arithmetically fine and VITA still calculates it; it is worth mentioning
 * only because it usually means a typo in one of the two fields.
 *
 * Deliberately absent: any notion of a large dose, a safe dose, a maximum, or
 * what to do about a result that exceeds a syringe's capacity. VITA does not
 * know any of those things and must not imply that it does.
 */
export type DoseConsistencyNote = 'amount-exceeds-vial' | 'volume-exceeds-reconstitution';

export function doseConsistencyNotes(
  vial: VialInputs,
  calculation: DoseCalculation,
): DoseConsistencyNote[] {
  const notes: DoseConsistencyNote[] = [];

  if (vial.vialAmountMcg !== undefined && calculation.amountMcg > vial.vialAmountMcg) {
    notes.push('amount-exceeds-vial');
  }
  /**
   * Strictly this follows from the first — same ratio, different units — so it
   * is only reported when the first is absent, to avoid saying one thing
   * twice. It can stand alone if a future input path sets volume directly.
   */
  if (
    notes.length === 0 &&
    vial.reconstitutionMl !== undefined &&
    calculation.volumeMl > vial.reconstitutionMl
  ) {
    notes.push('volume-exceeds-reconstitution');
  }

  return notes;
}
