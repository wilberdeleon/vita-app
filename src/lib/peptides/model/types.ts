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
import type { PeptideRoutineState } from './routine';

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
 * Where a compound actually sits in development.
 *
 * Deliberately separate from both `classification` (a regulatory bucket) and
 * `evidenceLevel` (how mature the literature is). They overlap but are not the
 * same question: a compound can be unapproved *and* in Phase 3 *and* backed by
 * strong human evidence, and flattening those into one badge is what made the
 * old pages say only "Not FDA-approved" — true, and useless to someone asking
 * whether anyone is still working on it.
 *
 * **`not-in-clinical-development` is not a failure state.** Most research
 * peptides were never on an approval path at all, and writing "awaiting
 * approval" for them would invent a process that does not exist.
 */
export type DevelopmentStage =
  | 'approved'
  | 'submitted'
  | 'phase-3'
  | 'phase-2'
  | 'phase-1'
  | 'early-human'
  | 'preclinical'
  | 'not-in-clinical-development'
  | 'discontinued'
  | 'unknown';

/** Stages whose truth expires — these must carry a date and a source. */
export const TIME_SENSITIVE_STAGES: readonly DevelopmentStage[] = [
  'submitted',
  'phase-3',
  'phase-2',
  'phase-1',
  'discontinued',
];

export type DevelopmentStatus = {
  stage: DevelopmentStage;
  /** Short headline, e.g. "Phase 3 · Late Stage". */
  label: string;
  /** One or two plain sentences on what that means for this compound. */
  summary?: string;
  /**
   * When this record was last checked, e.g. "July 2026".
   *
   * Required for time-sensitive stages. Pipeline facts go stale, and a page
   * that states a phase without a date is asserting permanent truth about
   * something that changes — the date is what makes it a point-in-time report.
   */
  lastUpdated?: string;
  /**
   * The next known step, where a sponsor has stated one.
   *
   * **A planned submission is not an approval and must never read like one.**
   * A content test rejects any wording that promises or predicts approval.
   */
  nextMilestone?: string;
  references?: ResearchReference[];
};

/**
 * One plain-English effect a compound is researched or commonly claimed for.
 *
 * The section exists because a technically correct mechanism paragraph can
 * leave an ordinary reader with no idea why anyone tracks the compound. A
 * claim says *what*; `MechanismItem` says *how*.
 *
 * `evidenceLevel` is per claim on purpose: one compound can have strong human
 * evidence for one effect and vendor folklore for another, and a single
 * page-level badge would launder the second into the first.
 */
export type ResearchClaim = {
  /** Short label, e.g. "Weight & Appetite". */
  title: string;
  /**
   * Qualified to the evidence — "Clinical studies have reported…", "Animal and
   * laboratory research has suggested…", "Commonly claimed for…, although
   * direct human evidence is limited."
   */
  summary?: string;
  evidenceLevel?: EvidenceLevel;
};

/** One pathway, explained the way a person would explain it. */
export type MechanismItem = {
  /** The receptor or enzyme, where naming it is useful. */
  target?: string;
  title: string;
  explanation: string;
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
  /**
   * A short plain-English paragraph, written for a non-scientist.
   *
   * Pattern: what the compound broadly is · why it is researched · important
   * context. Deliberately **not** opened with molecular terminology — that
   * belongs in `mechanisms`, further down the page.
   */
  overview?: string;
  /** Plain-English effects, qualified to the evidence behind each. */
  claims?: ResearchClaim[];
  /** Pathway explanations. Omitted where jargon would add nothing. */
  mechanisms?: MechanismItem[];
  /** Where the compound sits in development, when known. */
  developmentStatus?: DevelopmentStatus;
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

  /**
   * Where this routine sits in the user's list (slice 3.9).
   *
   * Authoritative. `active` below is kept in step as a legacy mirror so a
   * build predating 3.9 still reads the store sensibly, but nothing in the
   * app branches on it any more.
   */
  routineState: PeptideRoutineState;

  /**
   * @deprecated Legacy mirror of `routineState === 'active'`.
   *
   * Still written, still parsed, never read for behaviour. It could not
   * express *added but not configured yet*, which is why 3.9 replaced it.
   */
  active: boolean;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};

/** U-100 is the ordinary insulin syringe: 100 graduation units per millilitre. */
export const DEFAULT_UNITS_PER_ML = 100;

export const DEFAULT_DOSE_UNIT: MassUnit = 'mg';

/**
 * ── Peptide log entries (slice 3.7) ────────────────────────────────────
 */

import type { InjectionSiteSnapshot } from './sites';

/**
 * The conversion context as it stood **when the entry was saved**.
 *
 * This is the whole reason the entry is a snapshot rather than a reference.
 * A user who logged 2 mg from a 20 mg / 2 mL vial drew 20 units that day. If
 * they later reconstitute the next vial with 1 mL, the setup changes and the
 * *same* 2 mg would come to 10 units — but the syringe they actually pushed
 * last month still held 20. Recomputing history from the current setup would
 * quietly rewrite what happened.
 *
 * Absent when the setup had no vial or no reconstitution volume at the time.
 * That is a normal state, not a failure: someone using a pre-filled pen has
 * nothing to reconstitute, and logging must not be blocked on it.
 */
export type LogCalculationSnapshot = {
  vialAmountMcg: number;
  reconstitutionMl: number;
  unitsPerMl: number;
  calculatedUnits: number;
  calculatedVolumeMl: number;
};

/**
 * One recorded administration.
 *
 * **A historical fact, not a derived view.** Everything needed to render it
 * years from now is copied in at save time — the amount as authored, its
 * canonical micrograms, and the conversion context. Nothing here is looked up
 * from the setup on read.
 *
 * `definitionId` is denormalised alongside `setupId` so an entry can still
 * name its compound if the setup is ever gone. Deactivating a setup never
 * deletes it, so that is defensive rather than expected — but history that
 * cannot say what it was about is not history.
 *
 * VITA records what the user chose. There is no field here for a scheduled,
 * recommended, or expected amount, because the app has no basis for one.
 */
export type PeptideLogEntry = {
  id: string;
  setupId: string;
  /** Denormalised so an entry can name its compound independently. */
  definitionId: string;

  /** Local calendar day, via the shared date model. Never a UTC date string. */
  logDate: LogDate;
  /** Exact moment, ISO-8601. Editable — people log after the fact. */
  loggedAt: string;

  /**
   * The amount, kept twice: canonical micrograms for arithmetic, and what the
   * user actually typed. Someone who logged `500 mcg` should keep seeing
   * 500 mcg, not `0.5 mg`. Same principle as `FoodEntry` and `WaterEntry`.
   */
  amount: {
    authoredAmount: number;
    authoredUnit: MassUnit;
    amountMcg: number;
  };

  /** The conversion as it stood at save time. Absent when none was possible. */
  calculationSnapshot?: LogCalculationSnapshot;

  /**
   * Where it was administered (slice 3.8). Optional, and additive: entries
   * written before sites existed have none and remain perfectly valid.
   *
   * A snapshot for the same reason the conversion is — a custom label typed
   * as "Left Hip" must still read "Left Hip" years later rather than being
   * re-derived from a taxonomy that may have moved on.
   */
  site?: InjectionSiteSnapshot;

  /**
   * About *this administration* — how it felt, where it happened, anything
   * worth remembering. Deliberately separate from `PeptideSetup.notes`, which
   * describes the tracking configuration and outlives any single event.
   */
  notes?: string;

  createdAt: string;
  updatedAt: string;
};

/**
 * What a caller supplies to create or edit an entry.
 *
 * Site is optional throughout: a user may not track it, may not remember it,
 * or may be logging something historical. Saving is never blocked on it.
 */
export type PeptideLogDraft = {
  authoredAmount: number;
  authoredUnit: MassUnit;
  loggedAt: string;
  notes?: string;
  /** Optional. Recording a site is never required to save a log. */
  site?: InjectionSiteSnapshot;
};
