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
   * Broad compound class, e.g. "GLP-1 receptor agonist". A standard
   * nomenclature label for disambiguation — not a benefit, an effect, or a
   * reason to take something.
   */
  category?: string;
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
