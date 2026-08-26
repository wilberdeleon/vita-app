/**
 * Building and amending a peptide setup.
 *
 * Kept out of the provider and the screens so the shape of a setup is decided
 * in one place — the same reasoning behind `createWaterEntry`.
 */

import { newId } from '../../daily/ids';
import type { PeptideRoutineState } from './routine';
import type { MassUnit, PeptideSetup } from './types';
import { DEFAULT_DOSE_UNIT } from './types';
import { toMcg } from './units';

export type VialInput = { amount: number; unit: MassUnit };

/**
 * Both representations of the vial's contents, written together.
 *
 * Canonical micrograms and the authored pair are inseparable: storing one
 * without the other leaves a setup whose number contradicts its own label.
 */
export function vialFrom({ amount, unit }: VialInput): NonNullable<PeptideSetup['vial']> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`vialFrom: amount must be a positive finite number, got ${amount}`);
  }
  return { amountMcg: toMcg(amount, unit), authored: { amount, unit } };
}

/** Everything a setup may carry beyond its identity. All optional. */
export type PeptideSetupDraft = Omit<
  PeptideSetup,
  | 'id'
  | 'definitionId'
  | 'active'
  | 'routineState'
  | 'createdAt'
  | 'updatedAt'
  | 'preferredDoseUnit'
  | 'preferredEntryMode'
> & {
  preferredDoseUnit?: MassUnit;
  preferredEntryMode?: PeptideSetup['preferredEntryMode'];
};

/**
 * A new setup for a definition.
 *
 * Only `definitionId` is required. A GLP-1 pen user reconstitutes nothing and
 * must not have to answer vial questions to record that they are tracking
 * something; every other field stays absent until they choose to fill it.
 *
 * `preferredEntryMode` defaults to `'mass'` because its control is deferred to
 * slice 3.6 — the choice is meaningless before a calculator exists to act on
 * it, and defaulting to syringe units would leave a setup with no vial data
 * pointing at a mode it cannot express.
 */
export function createPeptideSetup(
  definitionId: string,
  draft: PeptideSetupDraft = {},
  now: Date = new Date(),
  routineState: PeptideRoutineState = 'active',
): PeptideSetup {
  if (definitionId.length === 0) {
    throw new Error('createPeptideSetup: definitionId is required');
  }

  const timestamp = now.toISOString();

  return {
    id: newId('pep'),
    definitionId,
    routineState,
    // Legacy mirror, written so a pre-3.9 build still reads the store.
    active: routineState === 'active',
    preferredDoseUnit: draft.preferredDoseUnit ?? DEFAULT_DOSE_UNIT,
    preferredEntryMode: draft.preferredEntryMode ?? 'mass',
    ...(draft.displayName ? { displayName: draft.displayName } : {}),
    ...(draft.vial ? { vial: draft.vial } : {}),
    ...(draft.reconstitutionMl !== undefined ? { reconstitutionMl: draft.reconstitutionMl } : {}),
    ...(draft.syringe ? { syringe: draft.syringe } : {}),
    ...(draft.schedule ? { schedule: draft.schedule } : {}),
    ...(draft.startDate ? { startDate: draft.startDate } : {}),
    ...(draft.notes ? { notes: draft.notes } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Fields an edit may change. Identity and creation time are not among them. */
export type PeptideSetupChanges = Partial<
  Omit<PeptideSetup, 'id' | 'definitionId' | 'createdAt' | 'updatedAt'>
>;

/**
 * Applies an edit, refreshing `updatedAt`.
 *
 * `id`, `definitionId`, and `createdAt` are excluded by the type rather than
 * by convention. Re-pointing a setup at a different compound would silently
 * rewrite what past history refers to; a user who wants another compound
 * creates another setup.
 *
 * Optional fields are cleared by passing `undefined` explicitly, which is why
 * this walks the keys the caller actually supplied instead of spreading.
 */
export function applySetupChanges(
  setup: PeptideSetup,
  changes: PeptideSetupChanges,
  now: Date = new Date(),
): PeptideSetup {
  const next: PeptideSetup = { ...setup, updatedAt: now.toISOString() };

  for (const key of Object.keys(changes) as (keyof PeptideSetupChanges)[]) {
    const value = changes[key];
    if (value === undefined) {
      delete (next as Record<string, unknown>)[key];
    } else {
      (next as Record<string, unknown>)[key] = value;
    }
  }

  // Guard the two fields that must always be present, in case a caller
  // cleared them through the generic path above.
  next.preferredDoseUnit = next.preferredDoseUnit ?? setup.preferredDoseUnit;
  next.preferredEntryMode = next.preferredEntryMode ?? setup.preferredEntryMode;
  next.routineState = changes.routineState ?? setup.routineState;
  // The mirror is derived, never authored — an edit that set them apart would
  // leave two answers to the same question on disk.
  next.active = next.routineState === 'active';

  return next;
}
