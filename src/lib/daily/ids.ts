/**
 * Local record ids.
 *
 * Written for the food log in Sprint 2 and promoted here in slice 3.1:
 * water entries, peptide setups, custom peptide definitions, and peptide log
 * entries all need the same thing, and three independent id schemes would
 * make cross-domain debugging needlessly confusing.
 */

/**
 * Collision-resistant enough for a local log: a millisecond timestamp plus
 * random suffix. Deliberately not a uuid dependency — ids never leave the
 * device today, and when Supabase arrives it issues its own.
 *
 * The timestamp comes first so ids sort roughly chronologically, which makes
 * a raw storage dump readable without cross-referencing timestamps.
 */
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
