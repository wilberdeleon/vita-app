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
import { fromMcg, roundForDisplay, toMcg } from './units';

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

/**
 * ── The unit conversion reference ──────────────────────────────────────
 *
 * What the calculator surfaces actually show. A user with a reconstituted
 * vial does not want to be asked a third number; they want to know what the
 * marks on their syringe are worth. So the whole reference is derived from
 * the vial and the water alone.
 */

/** One line of the reference: a mass, and the units it corresponds to. */
export type ConversionRow = {
  amountMcg: number;
  syringeUnits: number;
};

export type UnitConversion = {
  concentrationMcgPerMl: number;
  unitsPerMl: number;
  /** The headline relationship — "1 mg = 10 units". */
  primary: ConversionRow;
  /** A short ladder around the primary, for reading a syringe at a glance. */
  rows: ConversionRow[];
};

export type UnitConversionResult =
  | ({ ok: true } & UnitConversion)
  | { ok: false; reason: DoseCalculationError };

/**
 * Candidate display amounts, in the unit the vial was authored in.
 *
 * Used only when the natural choice — a single whole unit, "1 mg" — lands
 * somewhere unreadable. A vial authored in micrograms makes "1 mcg" a
 * hundredth of a syringe mark, which tells nobody anything.
 */
const DISPLAY_LADDER: Record<MassUnit, readonly number[]> = {
  mg: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  mcg: [10, 25, 50, 100, 250, 500, 1000, 2500],
};

/** Units below this are unreadable on a syringe; above it, off the barrel. */
const READABLE_MIN_UNITS = 1;
const READABLE_MAX_UNITS = 100;

/** The ladder the reference walks, as multiples of the primary amount. */
const ROW_MULTIPLIERS = [0.5, 1, 2, 3, 4, 5] as const;

/**
 * Picks the mass to headline.
 *
 * **One whole authored unit wins whenever it is legible**, because "1 mg =
 * 10 units" is the sentence people actually repeat to themselves, and a
 * reference that opened on "0.5 mg = 5 units" instead would be technically
 * equivalent and harder to carry around. Only when that lands outside the
 * readable band does this fall back to the ladder, choosing whichever
 * candidate sits closest to the middle of a syringe barrel.
 */
function pickPrimaryAmount(concentrationMcgPerMl: number, unitsPerMl: number, unit: MassUnit): number {
  const unitsFor = (amount: number) => (toMcg(amount, unit) / concentrationMcgPerMl) * unitsPerMl;

  const natural = unitsFor(1);
  if (natural >= READABLE_MIN_UNITS && natural <= READABLE_MAX_UNITS) return 1;

  const candidates = DISPLAY_LADDER[unit].filter((amount) => {
    const units = unitsFor(amount);
    return units >= READABLE_MIN_UNITS && units <= READABLE_MAX_UNITS;
  });
  if (candidates.length === 0) return 1;

  // Closest to a comfortable mid-barrel reading.
  const target = 20;
  return candidates.reduce((best, amount) =>
    Math.abs(unitsFor(amount) - target) < Math.abs(unitsFor(best) - target) ? amount : best,
  );
}

/**
 * Builds the whole reference from the vial alone.
 *
 * **No target amount is an input, and none is implied.** Every row is a
 * neutral restatement of the same ratio — none is marked, ordered, or
 * described as a suggestion, because VITA has no basis for suggesting one.
 * The rows exist so a user can read their own syringe, not so VITA can point
 * at a line on it.
 */
export function unitConversionReference(vial: VialInputs, unit: MassUnit): UnitConversionResult {
  const concentration = resolveConcentration(vial);
  if (!concentration.ok) return concentration;

  const { concentrationMcgPerMl, unitsPerMl } = concentration;
  const primaryAmount = pickPrimaryAmount(concentrationMcgPerMl, unitsPerMl, unit);

  const row = (amount: number): ConversionRow => {
    const amountMcg = toMcg(amount, unit);
    return {
      amountMcg,
      syringeUnits: (amountMcg / concentrationMcgPerMl) * unitsPerMl,
    };
  };

  /**
   * Two rows may never *read* the same, whatever they are underneath.
   *
   * Micrograms display as whole numbers, so a `0.5 mcg` row and a `1 mcg`
   * row both render as "1 mcg" — two adjacent lines with identical amounts
   * and different syringe values, which is a table that contradicts itself.
   * Reachable today with a sub-microgram vial: `1 mcg / 1 mL` produced
   * `1 mcg = 50 units` directly above `1 mcg = 100 units`.
   *
   * The collision is in the *rendering*, so that is what is compared. The
   * lower row is the one dropped, since the ladder climbs and the primary is
   * never the first entry it would discard. Nothing is rounded away silently:
   * a row that cannot be told apart from another is simply not shown.
   */
  const seen = new Set<number>();
  const rows = ROW_MULTIPLIERS.map((multiplier) => row(primaryAmount * multiplier))
    // A row nobody could draw is noise. The primary always survives, so the
    // reference can never come back empty.
    .filter((candidate) => candidate.syringeUnits <= READABLE_MAX_UNITS * 2)
    .filter((candidate) => {
      const displayed = roundForDisplay(fromMcg(candidate.amountMcg, unit), unit);
      if (seen.has(displayed)) return false;
      seen.add(displayed);
      return true;
    });

  return {
    ok: true,
    concentrationMcgPerMl,
    unitsPerMl,
    primary: row(primaryAmount),
    rows,
  };
}
