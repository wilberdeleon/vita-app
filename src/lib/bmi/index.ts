/**
 * Adult BMI — the whole of it.
 *
 * ## What this is, and the line it does not cross
 *
 * BMI from a height and a weight, and the adult reference category that
 * value falls in. **That is the entire domain.** There is no ideal weight,
 * no target BMI, no weight to lose or gain, no calorie, TDEE, BMR or macro
 * arithmetic, no risk score and no diagnosis — and none of that is a gap
 * waiting to be filled. A screening measure that starts telling people what
 * to weigh has stopped being a reference tool.
 *
 * Nothing here persists anything. The calculator that uses it is a scratch
 * pad, exactly like the Peptide Calculator: values live in component state
 * and die with the screen.
 *
 * ## One calculation path
 *
 * Every input, whichever system it was typed in, is normalized to
 * **kilograms and metres** before the formula runs:
 *
 * ```
 * BMI = kg / m²
 * ```
 *
 * There is deliberately **no second US formula**. The `703 × lb / in²`
 * shorthand is an approximation of this same equation, and keeping both is
 * how two unit systems start disagreeing in the third decimal — the drift
 * the 5.9 characterization set out to prevent. US input is converted with
 * the exact definitions (1 lb = 0.45359237 kg, 1 in = 0.0254 m) and then
 * takes the identical path metric input takes.
 */

/** Exact, by definition — not an approximation. */
export const LB_TO_KG = 0.45359237;
/** Exact, by definition (international inch). */
export const IN_TO_M = 0.0254;
export const IN_PER_FT = 12;
export const CM_PER_M = 100;

export type UnitSystem = 'us' | 'metric';

/**
 * The adult reference categories, in the order the scale runs.
 *
 * **Adult only.** No pediatric percentiles, no pregnancy adjustment, no
 * ethnicity or athlete variants, and no obesity class I/II/III — each of
 * those is a different measure with different inputs, and offering one of
 * them under an adult BMI label would be wrong rather than merely
 * incomplete. The screen says *adult* for the same reason.
 *
 * These are category names for a **number**, never labels for a person.
 * The UI says "BMI category: Obesity", never "you are obese".
 */
export type BmiCategory = 'Underweight' | 'Healthy weight' | 'Overweight' | 'Obesity';

export const BMI_CATEGORIES: readonly BmiCategory[] = [
  'Underweight',
  'Healthy weight',
  'Overweight',
  'Obesity',
];

/** The three thresholds the four categories sit between. */
export const BMI_THRESHOLDS = { healthy: 18.5, overweight: 25, obesity: 30 } as const;

/**
 * Raw BMI from already-normalized metric values.
 *
 * Returns `null` rather than `Infinity` or `NaN` for a non-positive or
 * non-finite input, so a caller can never render a divide-by-zero as a
 * result.
 */
export function bmiFromMetric(kilograms: number, metres: number): number | null {
  if (!Number.isFinite(kilograms) || !Number.isFinite(metres)) return null;
  if (kilograms <= 0 || metres <= 0) return null;
  return kilograms / (metres * metres);
}

/**
 * The displayed BMI: one decimal place.
 *
 * Kept as a **number** rather than a string so the classifier can read the
 * same value the user reads — see {@link categorize}.
 */
export function roundBmi(raw: number): number {
  return Math.round(raw * 10) / 10;
}

/** `27.4`. Derived from {@link roundBmi}, so text and classification agree. */
export function formatBmi(rounded: number): string {
  return rounded.toFixed(1);
}

/**
 * The category for a BMI value.
 *
 * **Classify the value the user is shown, not the raw one.** This is the
 * documented rounding policy and it is the whole reason {@link roundBmi}
 * returns a number:
 *
 * 1. compute raw BMI
 * 2. round to one decimal — that is the displayed value
 * 3. classify **that rounded value**
 *
 * A raw 24.9598 displays as `25.0`. Classifying the raw value would pair
 * `25.0` with *Healthy weight*, which reads as a bug to anyone who knows
 * where the threshold is, and is indefensible on a screen whose entire job
 * is to show a number next to its category. The pairing is always
 * internally consistent, and a test pins exactly this case.
 */
export function categorize(bmi: number): BmiCategory {
  if (bmi < BMI_THRESHOLDS.healthy) return 'Underweight';
  if (bmi < BMI_THRESHOLDS.overweight) return 'Healthy weight';
  if (bmi < BMI_THRESHOLDS.obesity) return 'Overweight';
  return 'Obesity';
}

export type BmiResult = {
  /** Unrounded, for anything that needs the true value. Never displayed. */
  raw: number;
  /** One decimal, and the value {@link BmiResult.category} was derived from. */
  rounded: number;
  /** `'27.4'`. */
  text: string;
  category: BmiCategory;
};

/** The whole pipeline, so no caller has to remember the ordering. */
export function bmiResult(kilograms: number, metres: number): BmiResult | null {
  const raw = bmiFromMetric(kilograms, metres);
  if (raw === null) return null;
  const rounded = roundBmi(raw);
  return { raw, rounded, text: formatBmi(rounded), category: categorize(rounded) };
}

/**
 * ── Input parsing ──────────────────────────────────────────────────────
 *
 * Two parsers, because the fields genuinely differ: every measurement must
 * be greater than zero, but **inches may be zero** — `5 ft 0 in` is a real
 * height and refusing it would be a bug dressed as validation.
 */

/** A measurement: finite and strictly positive. `null` for anything else. */
export function parseMeasurement(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

/**
 * Inches: `0 <= value < 12`, and **an empty field means zero**.
 *
 * Someone entering `5` feet and leaving inches blank means five feet, and
 * making them type a `0` to be understood is friction with no safety value.
 * `12` and above is genuinely wrong — that is another foot — so it is
 * rejected rather than silently carried.
 *
 * Returns `null` only for input that is present and invalid.
 */
export function parseInches(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return 0;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0 || value >= IN_PER_FT) return null;
  return value;
}

/**
 * ── Normalization ──────────────────────────────────────────────────────
 */

export function heightFromUs(feet: number, inches: number): number {
  return (feet * IN_PER_FT + inches) * IN_TO_M;
}

export function heightFromCm(cm: number): number {
  return cm / CM_PER_M;
}

export function weightFromLb(lb: number): number {
  return lb * LB_TO_KG;
}

/**
 * ── Switching unit systems ─────────────────────────────────────────────
 *
 * **Valid values are converted, not reinterpreted.** The failure this
 * prevents is the obvious one: `180 lb` becoming `180 kg` because only the
 * label changed. Switching to Metric with `5 ft 8 in / 180 lb` entered
 * yields `172.7 cm / 81.6 kg`, which is the same body.
 *
 * **Anything not valid is left exactly as typed.** An empty field stays
 * empty and half-typed text stays on screen with its error — clearing a
 * field because the user touched a unit toggle would destroy input they
 * never asked to lose.
 *
 * **Display precision settles rather than drifting.** Converting rounds to
 * the precision each field shows, so one round trip can move `180 lb` to
 * `179.9 lb`. It then stops: the converted value is already a fixed point,
 * and toggling repeatedly does not keep eroding it. A test toggles ten
 * times and asserts the values after the first conversion never move again.
 */

/** One decimal, with a trailing `.0` dropped — `172.7`, `81.6`, `68`. */
function toField(value: number): string {
  return String(Math.round(value * 10) / 10);
}

export type UsFields = { feet: string; inches: string; pounds: string };
export type MetricFields = { centimetres: string; kilograms: string };

export function usToMetric(fields: UsFields): MetricFields {
  const feet = parseMeasurement(fields.feet);
  const inches = parseInches(fields.inches);
  const pounds = parseMeasurement(fields.pounds);

  const centimetres =
    feet !== null && inches !== null ? toField(heightFromUs(feet, inches) * CM_PER_M) : '';
  const kilograms = pounds !== null ? toField(weightFromLb(pounds)) : '';

  return { centimetres, kilograms };
}

export function metricToUs(fields: MetricFields): UsFields {
  const cm = parseMeasurement(fields.centimetres);
  const kg = parseMeasurement(fields.kilograms);

  let feet = '';
  let inches = '';
  if (cm !== null) {
    const totalInches = heightFromCm(cm) / IN_TO_M;
    const wholeFeet = Math.floor(totalInches / IN_PER_FT);
    const remainder = Math.round((totalInches - wholeFeet * IN_PER_FT) * 10) / 10;
    // Rounding the remainder can land on a full 12 inches — carry it rather
    // than rendering `5 ft 12 in`, which the inches field itself rejects.
    if (remainder >= IN_PER_FT) {
      feet = String(wholeFeet + 1);
      inches = '0';
    } else {
      feet = String(wholeFeet);
      inches = String(remainder);
    }
  }

  return { feet, inches, pounds: kg !== null ? toField(kg / LB_TO_KG) : '' };
}
