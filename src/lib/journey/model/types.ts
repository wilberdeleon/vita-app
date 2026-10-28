/**
 * The Journey / Weight domain model (slice 6.2).
 *
 * Small on purpose: a weigh-in is one number at one moment. The model stores
 * **facts only** — no delta, trend, direction, goal, BMI, streak or anything
 * that grades a change. Those are either derived on demand from the entries
 * or not authorized at all (goal weight and BMI integration are deferred by
 * founder ruling, 2026-10-15).
 *
 * Lives in `src/lib/` rather than `features/journey/` for the reason Water
 * does: a later consumer outside the Journey feature (a Dashboard widget, if
 * one is ever authorized) must read the same source, and features never
 * import each other (CLAUDE.md rule 4).
 */

/**
 * Body-weight units. **Journey owns this preference** (founder ruling,
 * 2026-10-15) — not Settings, not BMI, not Water.
 */
export type WeightUnit = 'lb' | 'kg';

export const WEIGHT_UNITS: readonly WeightUnit[] = ['lb', 'kg'];

/**
 * The default *display* unit before the user has chosen one: pounds.
 *
 * The same US-English V1 default VITA already ships twice — Water displays
 * fluid ounces by default (founder decision, 2026-08-21) and the BMI
 * calculator opens on US units. Never inferred from locale or location.
 */
export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'lb';

/**
 * One recorded weigh-in.
 *
 * `weightKg` is canonical and the only value arithmetic touches. It is
 * **never rounded** — rounding happens at display only, so switching the
 * display unit any number of times cannot drift what is stored.
 *
 * `enteredUnit` is the unit the person typed in, the same honesty Water's
 * `enteredUnit` keeps: history can show an entry the way it was entered even
 * after the display preference changes. The typed number itself is not
 * stored — at display precision it is recovered exactly from `weightKg`, so
 * keeping it would be a second copy that could disagree.
 *
 * There is no `logDate`. Water stores one because its days are its storage
 * keys; weight is one collection, and grouping into a local calendar day is
 * a display concern derived from `loggedAt` later. Storing the absolute
 * instant means a timezone change can never rewrite a historical record.
 */
export type WeightEntry = {
  /** Stable for the life of the entry; edits preserve it. Never an array index. */
  id: string;
  /** ISO-8601 instant, as `Date.toISOString()` writes it. */
  loggedAt: string;
  /** Canonical kilograms. Always finite and > 0. */
  weightKg: number;
  enteredUnit: WeightUnit;
  /**
   * The Journey this weigh-in belongs to (slice 6.5). **Absent on legacy
   * entries** — weigh-ins recorded in 6.4 before Journeys existed. Those are
   * preserved exactly as stored and shown by no Journey: nothing is silently
   * imported into a Journey the user did not record them in. Set once at
   * creation and never changed by an edit.
   */
  journeyId?: string;
};

/** Journey's own preferences — deliberately just the display unit. */
export type WeightPreferences = {
  unit: WeightUnit;
};

export const DEFAULT_WEIGHT_PREFERENCES: WeightPreferences = {
  unit: DEFAULT_WEIGHT_UNIT,
};
