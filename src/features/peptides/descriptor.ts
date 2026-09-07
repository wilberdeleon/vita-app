/**
 * One short, factual line about what a compound *is*.
 *
 * ## Why this exists
 *
 * Routine Setup showed the peptide as three stacked facts — the name, a
 * regulatory chip, and the catalog category on its own line — which the
 * founder read as technical rather than descriptive: *Semax / Research /
 * ACTH (4-10) Analog*. The information was right; the presentation made the
 * reader assemble it.
 *
 * ## Where the words come from
 *
 * **Entirely from the existing catalog.** `category` is already a reviewed,
 * one-line biological class — "Triple agonist · GIP / GLP-1 / glucagon",
 * "GHRH analog", "NNMT inhibitor" — written under a rule this module does not
 * relax: factual and descriptive, never sales language. All 96 built-in
 * entries have one, so nothing here invents a taxonomy, authors a new claim,
 * or reaches for the network. A custom compound someone added themselves has
 * no category and gets no descriptor, which is honest.
 *
 * ## What it will never say
 *
 * No indication, no benefit, no outcome, no dose, no protocol, no "helps
 * with" and no "best for". A class is what a compound *is*; everything in
 * that list is a claim about what it *does for you*, which is the line VITA
 * does not cross. The research summaries elsewhere in the app are written and
 * reviewed for that purpose and stay where they are.
 */

import { formatLabel, type CompoundType, type PeptideDefinition } from '../../lib/peptides';

/**
 * Said out loud only when it adds something.
 *
 * This is a peptide tracker, so `peptide` is the assumption and repeating it
 * is noise. The others are the genuinely surprising cases — 5-Amino-1MQ and
 * MK-677 are not peptides, and someone scanning their routines deserves to
 * know that without opening the reference page. `other` is a bucket, not a
 * fact, so it says nothing.
 */
const COMPOUND_TYPE_LABELS: Partial<Record<CompoundType, string>> = {
  protein: 'Protein',
  'small-molecule': 'Small molecule',
  blend: 'Blend',
};

/**
 * The descriptor for one compound, or `null` when the catalog has nothing to
 * say — in which case the screen shows the name alone rather than a filler
 * line.
 */
export function peptideDescriptor(definition: PeptideDefinition): string | null {
  const category = definition.category?.trim();
  if (!category) return null;

  const base = formatLabel(category);
  const type = definition.compoundType ? COMPOUND_TYPE_LABELS[definition.compoundType] : undefined;

  // A category that already names the chemistry — "Peptide blend", "Copper
  // peptide" — must not be made to say it twice.
  if (!type || base.toLowerCase().includes(type.toLowerCase())) return base;

  return `${base} · ${type}`;
}
