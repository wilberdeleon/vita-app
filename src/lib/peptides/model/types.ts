/**
 * The Peptides domain model.
 *
 * Three concerns, kept separate — the architecture the founders locked before
 * implementation began, mirroring the Food Definition ≠ Food Entry split that
 * Sprint 2 established:
 *
 *   Peptide Definition   what the compound is
 *   Peptide Setup        how this user tracks it
 *   Peptide Log Entry    one recorded administration        (slice 3.7)
 *
 * Collapsing them would repeat exactly the mistake the nutrition model avoids:
 * a record that mutates when a definition changes, and a definition that
 * cannot be reused across records.
 *
 * **Nothing in this file describes what a compound does, or how much of it
 * anyone should take.** There is no `typicalDose`, no recommended amount, and
 * no effect summary — VITA tracks what the user tells it and does not
 * prescribe. See `data/catalog.ts` for the classification rules.
 */

import type { LogDate } from '../../daily/dates';

/* ── Peptide Definition ─────────────────────────────────────────────── */

/**
 * Regulatory standing, as a typed field rather than as prose.
 *
 * Keeping it structured is what lets the UI distinguish an approved
 * medication from a research compound consistently, without anyone having to
 * write — or review — a sentence per entry.
 */
export type PeptideClassification = 'approved-medication' | 'research-compound' | 'custom';

/**
 * What a compound *is*, chemically — kept separate from `classification`,
 * which is what a regulator says about it.
 *
 * The peptide ecosystem routinely groups non-peptides alongside peptides:
 * MK-677 is an orally active small molecule, NAD+ is a dinucleotide, and
 * somatropin is a full protein. VITA lists them because people track them —
 * and states what they actually are rather than calling everything a peptide
 * because the tab is named Peptides.
 *
 * There is deliberately no `peptide-drug` member. That would mix chemistry
 * with regulatory standing, which `classification` already carries; a compound
 * can be a peptide *and* an approved medication without the type saying so.
 */
export type CompoundType = 'peptide' | 'protein' | 'small-molecule' | 'blend' | 'other';

/**
 * How mature the evidence is — **not a quality score**.
 *
 * A Phase 3 investigational drug, a compound with a handful of small human
 * studies, and a vendor-named blend with no blend-level research are not
 * evidentially the same thing, and a UI that renders them identically is
 * quietly misleading. Nothing here ranks compounds as better or worse, and
 * nothing here implies anything about whether a compound is a good idea.
 */
export type EvidenceLevel =
  | 'approved-use'
  | 'human-clinical'
  | 'early-human'
  | 'preclinical'
  | 'limited';

/**
 * Broad research areas, for discovery only.
 *
 * A second dimension alongside classification: someone browsing 71 compounds
 * needs a way in that is not alphabetical. **These are not recommendations and
 * not indications** — tagging Semax as Cognitive says where its research
 * literature sits, not that anyone should take it for anything.
 *
 * A compound may carry several. Forcing one exclusive area would make
 * discovery worse — GHK-Cu genuinely sits in both Recovery and Aesthetics —
 * and would quietly assert a primary purpose the compound does not have.
 */
export type ResearchArea =
  | 'weight-metabolic'
  | 'cognitive'
  | 'sleep'
  | 'growth-hormone'
  | 'recovery'
  | 'sexual-health'
  | 'aesthetics'
  | 'mitochondrial'
  | 'longevity-aging'
  | 'immune-inflammation'
  | 'endocrine'
  | 'other';

export const RESEARCH_AREAS: readonly ResearchArea[] = [
  'weight-metabolic',
  'cognitive',
  'sleep',
  'growth-hormone',
  'recovery',
  'sexual-health',
  'aesthetics',
  'mitochondrial',
  'longevity-aging',
  'immune-inflammation',
  'endocrine',
  'other',
];

/** One component of a blend, referring to another definition by id. */
export type BlendComponent = {
  definitionId: string;
  /**
   * Present only where a formulation genuinely has a standardized amount.
   * Vendor-named blends usually do not — see the note in `data/definitions`.
   */
  amount?: number;
  unit?: MassUnit;
};

/** Where a piece of research content came from. */
export type ResearchReference = {
  label: string;
  /**
   * A pointer into an authoritative database, not a specific citation.
   *
   * These are deliberately search URLs — `clinicaltrials.gov/search?…`,
   * `pubmed.ncbi.nlm.nih.gov/?term=…` — rather than DOIs or PMIDs. A
   * hand-written PMID that turns out to be the wrong paper is worse than no
   * citation at all, and a search pointer is verifiable by anyone who taps it.
   */
  url?: string;
  sourceType: 'study' | 'clinical-trial' | 'regulatory' | 'manufacturer' | 'reference';
};

/**
 * Factual reference material about a compound.
 *
 * Kept out of `PeptideDefinition`'s identity fields and entirely out of
 * `PeptideSetup`: identity, research content, and the user's own configuration
 * are three different things with three different lifetimes.
 *
 * **Everything here is informational.** It describes what a compound is and
 * what has been studied — never what anyone should take, how much, or why.
 * A content test forbids recommendation phrasing outright.
 *
 * Optional in full: a definition with no reviewed summary shows its identity
 * and status and says plainly that no summary exists, which is more honest
 * than filling the space.
 */
export type PeptideResearchInfo = {
  /** A short plain-English paragraph. What it is, what it targets, what was studied. */
  summary?: string;
  /** Research contexts — "obesity", "type 2 diabetes". Deliberately *studied for*, not *used for*. */
  studiedFor?: string[];
  /** Receptors, pathways, or targets where established. */
  targets?: string[];
  /** Plain-language regulatory and development status. */
  researchStatus?: string;
  evidenceLevel?: EvidenceLevel;
  references?: ResearchReference[];
  /**
   * For blends: states that research context comes from the components rather
   * than from the combination, which is usually unstudied as a formulation.
   */
  blendCaveat?: boolean;
};

/**
 * What the compound is. Never how much of it to take, when, or why.
 *
 * A definition is shared and immutable from the user's side for catalog
 * entries; a custom one is created by the user and reusable across setups.
 */
export type PeptideDefinition = {
  /** Stable and semantic — `catalog:semaglutide`, or `custom_…` for user-made. */
  id: string;
  name: string;
  classification: PeptideClassification;
  /**
   * What it is chemically. Defaults to `'peptide'` for anything that omits it,
   * which is every custom entry the user creates.
   */
  compoundType?: CompoundType;
  /**
   * Short, human-readable biological class — "Dual GIP / GLP-1 agonist",
   * "Copper peptide", "Mitochondrial peptide". Factual and descriptive, never
   * sales language: no "fat burner", no "muscle builder", no "best for".
   */
  category?: string;
  /**
   * Other names the same compound is genuinely known by, including brand names
   * and development codes. Searchable.
   *
   * Only ever for **one** molecule. Where two commonly conflated names are
   * actually different compounds — TB-500 and Thymosin Beta-4, AOD-9604 and
   * HGH Fragment 176-191 — they stay separate definitions and the difference
   * is explained rather than aliased away.
   */
  aliases?: string[];
  /** Present when `compoundType` is `'blend'`. At least two components. */
  components?: BlendComponent[];
  /** Discovery tags. Assigned in `data/definitions/researchAreas.ts`. */
  researchAreas?: ResearchArea[];
  research?: PeptideResearchInfo;
  origin: 'catalog' | 'user';
  /** Bumped if a built-in entry's metadata changes; absent on custom ones. */
  catalogVersion?: number;
};

/* ── User Peptide Setup ─────────────────────────────────────────────── */

export type MassUnit = 'mg' | 'mcg';

export const MASS_UNITS: readonly MassUnit[] = ['mg', 'mcg'];

/**
 * How often the user has decided to administer something.
 *
 * Their data, for their own organization. VITA does not suggest a schedule,
 * score adherence, or describe anything as missed or due.
 */
export type PeptideSchedule =
  | { kind: 'daily' }
  | { kind: 'daysOfWeek'; days: number[] }
  | { kind: 'everyNDays'; n: number }
  | { kind: 'asNeeded' };

/**
 * This user's configuration for one compound.
 *
 * Almost everything is optional, deliberately. A GLP-1 pen user does not
 * reconstitute anything and must not be made to answer vial questions to
 * record that they are tracking it; the only genuinely required field is
 * which compound this is.
 */
export type PeptideSetup = {
  id: string;
  /** Resolves against the built-in catalog or the user's custom definitions. */
  definitionId: string;

  /** Overrides the definition's name in lists. Useful when tracking two vials of one compound. */
  displayName?: string;

  /**
   * Vial contents. `amountMcg` is canonical; `authored` is what the user
   * typed, kept for the same reason water entries keep theirs — so switching
   * a display unit never rewrites what someone recorded.
   */
  vial?: {
    amountMcg: number;
    authored: { amount: number; unit: MassUnit };
  };

  /** Bacteriostatic water added, in millilitres. Positive and finite when present. */
  reconstitutionMl?: number;

  /**
   * Syringe graduation density, **not** capacity.
   *
   * A "0.5 mL / 50 unit" insulin syringe is still 100 units per mL; modeling
   * capacity instead is the classic way to get syringe arithmetic wrong. The
   * calculator in slice 3.6 reads this and nothing else about the syringe.
   */
  syringe?: { unitsPerMl: number };

  /** Display preference for masses. A preference, never a recommendation. */
  preferredDoseUnit: MassUnit;

  /**
   * How the user prefers to enter an administration once logging exists.
   * Stored now so slice 3.6 has real data; its control is deferred to that
   * slice, because the choice is meaningless before a calculator exists.
   */
  preferredEntryMode: 'mass' | 'syringe-units';

  schedule?: PeptideSchedule;

  /** Local calendar day, via the shared date model. */
  startDate?: LogDate;

  /** Inactive setups leave the primary list. Deactivation never deletes anything. */
  active: boolean;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};

/** U-100 is the ordinary insulin syringe: 100 graduation units per millilitre. */
export const DEFAULT_UNITS_PER_ML = 100;

export const DEFAULT_DOSE_UNIT: MassUnit = 'mg';
