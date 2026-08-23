/**
 * ⚠️ Temporary compatibility shim — Fuel only. Retire in slice 3.9.
 *
 * Fuel's Hydration/Peptides row reads this, and **slice 3.9 owns wiring that
 * card to real peptide state**. Deleting the Sprint 0 fixture outright in 3.5
 * would have meant either breaking Fuel or doing 3.9's integration early, so
 * the three fixture files were collapsed into this one, its unused exports
 * removed, and its values left byte-identical — Fuel's rendering is unchanged
 * by slice 3.5.
 *
 * **What it claims is not true.** `1 of 3 logged` describes a feature that does
 * not exist: there is no administration logging until slice 3.7, and VITA has
 * no "daily peptide goal" at all. This is known, scheduled debt, recorded the
 * same way Home's water fixture was between slices 3.2 and 3.4.
 *
 * The real domain is `src/lib/peptides`. Nothing but Fuel should import this,
 * and nothing new should be added to it.
 */

export type PeptideToday = {
  logged: number;
  goal: number;
};

const PEPTIDE_TODAY: PeptideToday = { logged: 1, goal: 3 };

export function getPeptideToday(): PeptideToday {
  return PEPTIDE_TODAY;
}
