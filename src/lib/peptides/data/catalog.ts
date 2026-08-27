/**
 * The built-in peptide catalog.
 *
 * ── What this list is ───────────────────────────────────────────────────
 *
 * A structured tracking and reference library. It exists so people stop
 * retyping names and so every setup has a stable identity — **not** to
 * recommend anything. Nothing is ordered by popularity, effectiveness, or
 * suitability, nothing is tagged with a goal ("fat loss", "muscle"), and
 * inclusion is not endorsement.
 *
 * Expanded substantially in slice 3.5A from the initial 18 entries, on founder
 * direction: if a compound is commonly encountered in this ecosystem and its
 * identity can be verified, VITA should be able to represent it. Being
 * investigational is not a reason to leave something out — it is a reason to
 * label it accurately.
 *
 * ── Classification, and what it is not ──────────────────────────────────
 *
 *   `approved-medication`  the active ingredient has an FDA-approved product
 *                          in the United States.
 *   `research-compound`    everything else, including compounds in late-stage
 *                          trials and compounds approved outside the US.
 *   `custom`               never used by a built-in entry.
 *
 * Classification is one broad regulatory bucket. The actual development stage,
 * foreign approvals, withdrawn approvals, and compounding status live in
 * `research.researchStatus`, so nothing has to be flattened into the bucket to
 * be said. Sermorelin (a withdrawn US approval) and Semax (registered in
 * Russia) are both `research-compound` with the nuance stated in words.
 *
 * `compoundType` is separate again and describes **chemistry**: MK-677 and
 * 5-Amino-1MQ are small molecules, NAD+ is a dinucleotide, somatropin and hCG
 * are proteins. VITA lists them because people track them, and says what they
 * actually are rather than calling everything a peptide.
 *
 * ── Content ────────────────────────────────────────────────────────────
 *
 * Research summaries describe what a compound is and what has been studied.
 * They never say what to take, how much, or why; a content test fails the
 * build on recommendation phrasing. Entries where a reviewed summary could not
 * be written honestly carry identity and status only, and the detail screen
 * says so plainly rather than filling the space.
 *
 * ⚠️ Content is engineering-authored and has **not** been through medical or
 * legal review — that is still owed under Open Question #17.
 */

import type { MassUnit, PeptideDefinition, ResearchArea } from '../model/types';
import { ADDITIONAL_DEFINITIONS, BIOREGULATOR_DEFINITIONS } from './definitions/bioregulators';
import { BLEND_DEFINITIONS } from './definitions/blends';
import { ENDOCRINE_DEFINITIONS } from './definitions/endocrine';
import { GROWTH_HORMONE_DEFINITIONS } from './definitions/growthHormone';
import { INCRETIN_DEFINITIONS } from './definitions/incretin';
import { MITOCHONDRIAL_DEFINITIONS, NEURO_DEFINITIONS } from './definitions/neuroMitochondrial';
import { RECOVERY_DEFINITIONS } from './definitions/recovery';
import { RESEARCH_AREA_ASSIGNMENTS } from './definitions/researchAreas';

/** Bumped when a built-in entry's metadata changes. Stored on setups for provenance. */
export const CATALOG_VERSION = 3;

/** Alphabetical by name — the only ordering, and deliberately not a ranking. */
export const PEPTIDE_CATALOG: readonly PeptideDefinition[] = [
  ...INCRETIN_DEFINITIONS,
  ...GROWTH_HORMONE_DEFINITIONS,
  ...RECOVERY_DEFINITIONS,
  ...MITOCHONDRIAL_DEFINITIONS,
  ...NEURO_DEFINITIONS,
  ...ENDOCRINE_DEFINITIONS,
  ...BIOREGULATOR_DEFINITIONS,
  ...ADDITIONAL_DEFINITIONS,
  ...BLEND_DEFINITIONS,
]
  .map((seed) => ({
    compoundType: 'peptide' as const,
    ...seed,
    // Research areas are assigned in one auditable table rather than inline,
    // so the whole taxonomy can be reviewed at once — see `researchAreas.ts`.
    researchAreas: RESEARCH_AREA_ASSIGNMENTS[seed.id] ?? ['other'],
    origin: 'catalog' as const,
    catalogVersion: CATALOG_VERSION,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function findCatalogDefinition(id: string): PeptideDefinition | undefined {
  return PEPTIDE_CATALOG.find((definition) => definition.id === id);
}

/** The first-level filter: regulatory and chemical, never goal-based. */
export type CatalogFilter = 'all' | 'approved' | 'research' | 'blend';

/** The second-level filter — a research area, or everything. */
export type AreaFilter = ResearchArea | 'all';

function matchesFilter(definition: PeptideDefinition, filter: CatalogFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'approved':
      return definition.classification === 'approved-medication';
    case 'research':
      return definition.classification === 'research-compound';
    case 'blend':
      return definition.compoundType === 'blend';
  }
}

/**
 * Punctuation and spacing, removed before comparing.
 *
 * Compound names in this field are full of hyphens people do not type.
 * "PT141", "PT 141" and "pt-141" are one query as far as a user is concerned,
 * and a store that answers only the third is a store that appears not to
 * stock the compound — which is exactly how slice 3.9A's catalog gap was
 * reported. Digits and letters survive; everything else goes.
 */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Local, synchronous search across name, aliases, and category.
 *
 * Aliases matter more than they look: someone who knows a compound as "PT-141",
 * "Mod GRF 1-29", "Elamipretide", or "Ozempic" will type that, and a
 * name-only search would tell them VITA does not have it when it does.
 *
 * Substring matching with no ranking — a list of this size does not need an
 * index, and a relevance score would be one more thing to get subtly wrong.
 */
export function searchCatalog(
  query: string,
  filter: CatalogFilter = 'all',
  area: AreaFilter = 'all',
): readonly PeptideDefinition[] {
  const trimmed = normalize(query);

  // The three narrow together: classification AND research area AND query.
  const filtered = PEPTIDE_CATALOG.filter(
    (definition) =>
      matchesFilter(definition, filter) &&
      (area === 'all' || (definition.researchAreas ?? []).includes(area)),
  );
  if (trimmed.length === 0) return filtered;

  return filtered.filter((definition) => {
    if (normalize(definition.name).includes(trimmed)) return true;
    if (definition.category && normalize(definition.category).includes(trimmed)) return true;
    return (definition.aliases ?? []).some((alias) => normalize(alias).includes(trimmed));
  });
}

/**
 * The alias a query matched, if it matched one rather than the name.
 *
 * Exists because search working is not the same as search *appearing* to
 * work. Someone types "PT-141", the catalog correctly returns Bremelanotide,
 * and the row says only "Bremelanotide" — so the person who typed the name
 * they know sees a compound they don't recognise and concludes it is missing.
 * That is precisely what happened in founder QA, twice, with a search
 * function that was behaving perfectly.
 *
 * Returning the matched alias lets a result show the user the words they
 * typed, which is the difference between finding something and being told it
 * is somewhere.
 */
export function matchedAlias(
  definition: PeptideDefinition,
  query: string,
): string | undefined {
  const trimmed = normalize(query);
  if (trimmed.length === 0) return undefined;
  // A name match needs no explaining — the row already says it.
  if (normalize(definition.name).includes(trimmed)) return undefined;
  return (definition.aliases ?? []).find((alias) => normalize(alias).includes(trimmed));
}

/**
 * The one alias worth showing on a compact row.
 *
 * Prefers whatever the user just searched for; falls back to the first alias
 * so browsing works too — someone scanning for Ozempic should not have to
 * know it is Semaglutide. Deliberately **one**: an earlier version listed
 * every alias beside the category and produced three facts competing for a
 * space that fits one, truncating mid-word.
 */
export function rowAlias(definition: PeptideDefinition, query: string): string | undefined {
  return matchedAlias(definition, query) ?? definition.aliases?.[0];
}

/** A blend component, resolved to the definition it names. */
export type ResolvedComponent = {
  definition: PeptideDefinition;
  amount?: number;
  unit?: MassUnit;
};

/**
 * Resolves a blend's components, skipping any that no longer exist.
 *
 * Skipping rather than rendering a blank row: a component that cannot be
 * resolved is a data problem, and showing an empty line would look like the
 * blend contains something unnamed.
 */
export function resolveBlendComponents(
  definition: PeptideDefinition,
  findDefinition: (id: string) => PeptideDefinition | undefined = findCatalogDefinition,
): ResolvedComponent[] {
  const resolved: ResolvedComponent[] = [];

  for (const component of definition.components ?? []) {
    const found = findDefinition(component.definitionId);
    if (!found) continue;
    resolved.push({
      definition: found,
      ...(component.amount !== undefined ? { amount: component.amount } : {}),
      ...(component.unit !== undefined ? { unit: component.unit } : {}),
    });
  }

  return resolved;
}
