/**
 * The built-in peptide catalog.
 *
 * ── What this list is ───────────────────────────────────────────────────
 *
 * A way to stop retyping names and to give every setup a structured identity.
 * It is **not** a recommendation list, a formulary, or a suggestion of what
 * anyone should take. Nothing here is ordered by popularity, effectiveness,
 * or suitability, and nothing is tagged as being for a goal — no "fat loss",
 * no "muscle", no "beginner", no "safest". Entries are alphabetical, full
 * stop.
 *
 * ── What an entry may contain ───────────────────────────────────────────
 *
 * A name, a classification, and a broad compound-class label. That is all.
 * No effects, no benefits, no mechanism essays, no protocols, no dosing.
 * `category` is standard nomenclature used to tell similar entries apart
 * (the two CJC-1295 variants, for instance) — it describes what a compound
 * *is*, never what it does for someone.
 *
 * ── How classification was decided ──────────────────────────────────────
 *
 * One rule, applied conservatively:
 *
 *   `approved-medication`  the active ingredient has an FDA-approved product
 *                          in the United States.
 *   `research-compound`    everything else here — including compounds in
 *                          active clinical trials and compounds approved in
 *                          other countries but not the US.
 *   `custom`               never used by a built-in entry; reserved for
 *                          definitions the user creates.
 *
 * **Where US status could not be stated with confidence, the compound was
 * left out rather than guessed at.** Deliberately omitted on those grounds:
 * Sermorelin (a withdrawn approval, now supplied through compounding),
 * Bremelanotide / PT-141 (an approved product and a widely sold research
 * chemical under two names for one molecule), and Thymosin Alpha-1 (approved
 * in some countries, not the US). Omission is not a judgement about a
 * compound — it means this file will not assert a status it cannot support.
 *
 * A user can always add any of them through **Custom**, which carries no
 * regulatory claim at all.
 *
 * Educational descriptions remain out of scope until the founders resolve
 * Open Question #17 (sourcing and medical-content review). The model has a
 * place for them; this file deliberately does not fill it.
 */

import type { PeptideDefinition } from '../model/types';

/** Bumped when a built-in entry's metadata changes. Stored on setups for provenance. */
export const CATALOG_VERSION = 1;

type CatalogSeed = Pick<PeptideDefinition, 'id' | 'name' | 'classification' | 'category'>;

const SEEDS: readonly CatalogSeed[] = [
  { id: 'catalog:aod-9604', name: 'AOD-9604', classification: 'research-compound', category: 'Growth hormone fragment' },
  { id: 'catalog:bpc-157', name: 'BPC-157', classification: 'research-compound', category: 'Research peptide' },
  { id: 'catalog:cjc-1295-dac', name: 'CJC-1295 with DAC', classification: 'research-compound', category: 'Growth hormone secretagogue' },
  { id: 'catalog:cjc-1295-no-dac', name: 'CJC-1295 without DAC', classification: 'research-compound', category: 'Growth hormone secretagogue' },
  { id: 'catalog:dulaglutide', name: 'Dulaglutide', classification: 'approved-medication', category: 'GLP-1 receptor agonist' },
  { id: 'catalog:ghrp-2', name: 'GHRP-2', classification: 'research-compound', category: 'Growth hormone secretagogue' },
  { id: 'catalog:ghrp-6', name: 'GHRP-6', classification: 'research-compound', category: 'Growth hormone secretagogue' },
  { id: 'catalog:ipamorelin', name: 'Ipamorelin', classification: 'research-compound', category: 'Growth hormone secretagogue' },
  { id: 'catalog:liraglutide', name: 'Liraglutide', classification: 'approved-medication', category: 'GLP-1 receptor agonist' },
  { id: 'catalog:melanotan-ii', name: 'Melanotan II', classification: 'research-compound', category: 'Research peptide' },
  { id: 'catalog:retatrutide', name: 'Retatrutide', classification: 'research-compound', category: 'Investigational incretin agonist' },
  { id: 'catalog:selank', name: 'Selank', classification: 'research-compound', category: 'Research peptide' },
  { id: 'catalog:semaglutide', name: 'Semaglutide', classification: 'approved-medication', category: 'GLP-1 receptor agonist' },
  { id: 'catalog:semax', name: 'Semax', classification: 'research-compound', category: 'Research peptide' },
  { id: 'catalog:somatropin', name: 'Somatropin', classification: 'approved-medication', category: 'Growth hormone' },
  { id: 'catalog:tb-500', name: 'TB-500', classification: 'research-compound', category: 'Research peptide' },
  { id: 'catalog:tesamorelin', name: 'Tesamorelin', classification: 'approved-medication', category: 'GHRH analog' },
  { id: 'catalog:tirzepatide', name: 'Tirzepatide', classification: 'approved-medication', category: 'GIP and GLP-1 receptor agonist' },
];

/** Alphabetical by name — the only ordering, and deliberately not a ranking. */
export const PEPTIDE_CATALOG: readonly PeptideDefinition[] = SEEDS.map((seed) => ({
  ...seed,
  origin: 'catalog' as const,
  catalogVersion: CATALOG_VERSION,
})).sort((a, b) => a.name.localeCompare(b.name));

export function findCatalogDefinition(id: string): PeptideDefinition | undefined {
  return PEPTIDE_CATALOG.find((definition) => definition.id === id);
}

/**
 * Case-insensitive name match. Local, synchronous, and substring-based —
 * a list this size does not need ranking, indexing, or a network call.
 */
export function searchCatalog(query: string): readonly PeptideDefinition[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) return PEPTIDE_CATALOG;
  return PEPTIDE_CATALOG.filter((definition) => definition.name.toLowerCase().includes(trimmed));
}
