/**
 * The Water domain model.
 *
 * Small on purpose. Hydration is one number logged repeatedly, and the only
 * genuine complexity is that the number arrives in four different units and
 * has to stay comparable across all of them forever.
 *
 * Lives in `src/lib/` rather than `features/water/` because Fuel's Hydration
 * module reads the same state the Water screen does, and features never
 * import each other (CLAUDE.md rule 4) — the same promotion `src/lib/
 * nutrition` and `src/lib/journeyStages.ts` received.
 */

import type { LogDate } from '../../daily/dates';

/**
 * The units a person may think in.
 *
 * `floz` and `cup` are **US customary**, which is a product decision, not an
 * oversight: an imperial fluid ounce is 28.4131 mL and an imperial cup is
 * 284.131 mL, so a future non-US locale needs its own members rather than a
 * silently different meaning for these.
 */
export type VolumeUnit = 'ml' | 'l' | 'floz' | 'cup';

export const VOLUME_UNITS: readonly VolumeUnit[] = ['floz', 'cup', 'ml', 'l'];

/**
 * The default display unit for a US-English V1 (founder decision,
 * 2026-08-21). A default for *display*, never a recommended amount — VITA
 * does not tell anyone how much to drink.
 */
export const DEFAULT_VOLUME_UNIT: VolumeUnit = 'floz';

/**
 * One recorded drink.
 *
 * `amountMl` is the canonical value and the only one arithmetic ever touches.
 * `enteredAmount` and `enteredUnit` are a **snapshot of what the user
 * actually typed**, kept for the same reason `FoodEntry.nutrition` is
 * snapshotted: history must stay truthful. Someone who logs "16 oz" and
 * later switches their preference to millilitres should still see that they
 * logged 16 oz — not a reconstructed "473 mL" they never entered.
 */
export type WaterEntry = {
  id: string;
  /** 'YYYY-MM-DD' in the device's local timezone at the moment of logging. */
  logDate: LogDate;
  /** ISO instant — ordering within a day, and the time shown on an entry. */
  loggedAt: string;
  /** Canonical. Always > 0; an entry of nothing is not an entry. */
  amountMl: number;
  enteredAmount: number;
  enteredUnit: VolumeUnit;
};

/**
 * The user's daily target, stored as the pair they authored.
 *
 * Not stored as millilitres. A goal of "8 cups" converted to 1892.7 mL and
 * read back in cups risks displaying 8.0000001 — the goal is the one number
 * a user set deliberately, so it reads back exactly as set. `goalMl()`
 * derives the arithmetic value on demand.
 *
 * There is no default. A missing goal is `null`, not 64 oz: VITA does not
 * invent a hydration recommendation, and "not set yet" is an honest state
 * with its own UI rather than something to paper over.
 */
export type WaterGoal = {
  amount: number;
  unit: VolumeUnit;
};

/**
 * Water's own preferences.
 *
 * Water owns these in Sprint 3 (founder decision, 2026-08-21), and
 * **Settings reads and writes this same source** as of Sprint 4 slice 4.1 —
 * `Settings → Units` calls `useWater().setUnit` rather than creating a
 * second record that can disagree with this one. Nothing here moved to make
 * that work.
 *
 * Deliberately just the unit. Quick-add presets are fixed for now and are
 * Slice 3.3's concern — storing a configuration nothing can configure would
 * be a migration to do later for no gain today.
 */
export type WaterPreferences = {
  unit: VolumeUnit;
};

export const DEFAULT_WATER_PREFERENCES: WaterPreferences = {
  unit: DEFAULT_VOLUME_UNIT,
};
