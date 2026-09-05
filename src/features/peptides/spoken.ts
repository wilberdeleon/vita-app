/**
 * How a routine reads aloud.
 *
 * Presentation only, and deliberately outside `src/lib/peptides/` — the
 * domain is frozen for this slice, and how a screen reader pronounces `mg`
 * is not a domain fact. `formatMass` and friends stay the authority on what a
 * number *is*; this only decides how to say it.
 */

import type { MassUnit } from '../../lib/peptides';

/**
 * `mg` is read as "em gee" by VoiceOver, which is not what the label means.
 * Singular and plural both matter: *1 milligram*, *2.5 milligrams*.
 */
const SPOKEN_UNITS: Record<MassUnit, [singular: string, plural: string]> = {
  mg: ['milligram', 'milligrams'],
  mcg: ['microgram', 'micrograms'],
};

export function spokenAmount(amount: number, unit: MassUnit): string {
  const [singular, plural] = SPOKEN_UNITS[unit] ?? [unit, unit];
  return `${amount} ${amount === 1 ? singular : plural}`;
}
