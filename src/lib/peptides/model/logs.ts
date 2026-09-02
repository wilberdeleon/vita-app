/**
 * Building and validating recorded administrations.
 *
 * The rule this whole module exists to enforce: **a log entry is a snapshot,
 * never a view.** The conversion is computed once, at save time, from the
 * setup as it stands then — and after that the entry is self-contained. A
 * setup edited next month cannot reach back and change what someone drew last
 * week.
 */

import { isValidLogDate, newId, toLogDate, type LogDate } from '../../daily';
import { calculateSyringeUnits } from './dose';
import { parseSiteSnapshot } from './sites';
import type {
  LogCalculationSnapshot,
  MassUnit,
  PeptideLogDraft,
  PeptideLogEntry,
  PeptideSetup,
} from './types';
import { isMassUnit, toMcg } from './units';

/** The vial context a snapshot needs, or nothing if the setup has no vial. */
function snapshotContext(setup: PeptideSetup, amountMcg: number): LogCalculationSnapshot | undefined {
  const vialAmountMcg = setup.vial?.amountMcg;
  const reconstitutionMl = setup.reconstitutionMl;
  if (vialAmountMcg === undefined || reconstitutionMl === undefined) return undefined;

  const result = calculateSyringeUnits(
    { vialAmountMcg, reconstitutionMl, unitsPerMl: setup.syringe?.unitsPerMl },
    amountMcg,
  );
  if (!result.ok) return undefined;

  return {
    vialAmountMcg,
    reconstitutionMl,
    unitsPerMl: result.unitsPerMl,
    calculatedUnits: result.syringeUnits,
    calculatedVolumeMl: result.volumeMl,
  };
}

/**
 * Recomputes a snapshot **within an entry's own original context**.
 *
 * Used when someone edits the amount on a past entry. The vial and water come
 * from the entry, not from today's setup: correcting "I logged 2 mg, it was
 * actually 1 mg" should give the units that 1 mg would have been *that day*.
 * Substituting the current setup would silently rewrite the entry's history
 * as a side effect of fixing a typo.
 */
function recomputeInOriginalContext(
  snapshot: LogCalculationSnapshot,
  amountMcg: number,
): LogCalculationSnapshot | undefined {
  const result = calculateSyringeUnits(
    {
      vialAmountMcg: snapshot.vialAmountMcg,
      reconstitutionMl: snapshot.reconstitutionMl,
      unitsPerMl: snapshot.unitsPerMl,
    },
    amountMcg,
  );
  if (!result.ok) return undefined;

  return {
    ...snapshot,
    calculatedUnits: result.syringeUnits,
    calculatedVolumeMl: result.volumeMl,
  };
}

/**
 * Creates an entry from what the user typed plus the setup as it is now.
 *
 * `logDate` is derived from `loggedAt` rather than defaulted to today — the
 * same defect the water domain shipped and fixed in slice 3.3. Someone
 * correcting last night's log at 00:20 means last night, and taking "today"
 * would file it on the wrong day.
 */
export function createLogEntry(
  setup: PeptideSetup,
  draft: PeptideLogDraft,
  now: Date = new Date(),
): PeptideLogEntry {
  const amountMcg = toMcg(draft.authoredAmount, draft.authoredUnit);
  const timestamp = now.toISOString();

  return {
    id: newId('plog'),
    setupId: setup.id,
    definitionId: setup.definitionId,
    logDate: toLogDate(new Date(draft.loggedAt)),
    loggedAt: draft.loggedAt,
    amount: {
      authoredAmount: draft.authoredAmount,
      authoredUnit: draft.authoredUnit,
      amountMcg,
    },
    calculationSnapshot: snapshotContext(setup, amountMcg),
    site: draft.site,
    notes: draft.notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Applies an edit, keeping the entry's original conversion context.
 *
 * An entry that never had a snapshot does not acquire one by being edited —
 * gaining a conversion months later, from a vial that may not be the one it
 * came from, would be an invention rather than a correction.
 */
export function applyLogChanges(
  entry: PeptideLogEntry,
  draft: PeptideLogDraft,
  now: Date = new Date(),
): PeptideLogEntry {
  const amountMcg = toMcg(draft.authoredAmount, draft.authoredUnit);

  return {
    ...entry,
    logDate: toLogDate(new Date(draft.loggedAt)),
    loggedAt: draft.loggedAt,
    amount: {
      authoredAmount: draft.authoredAmount,
      authoredUnit: draft.authoredUnit,
      amountMcg,
    },
    calculationSnapshot: entry.calculationSnapshot
      ? recomputeInOriginalContext(entry.calculationSnapshot, amountMcg)
      : undefined,
    // Changing where it happened cannot change what was drawn — the site and
    // the conversion are independent facts about the same event.
    site: draft.site,
    notes: draft.notes?.trim() || undefined,
    updatedAt: now.toISOString(),
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositive(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseSnapshot(value: unknown): LogCalculationSnapshot | undefined {
  if (!isRecord(value)) return undefined;
  const { vialAmountMcg, reconstitutionMl, unitsPerMl, calculatedUnits, calculatedVolumeMl } = value;

  // A partial snapshot is dropped rather than repaired: a half-remembered
  // conversion is worse than an entry that honestly has none.
  if (
    !isPositive(vialAmountMcg) ||
    !isPositive(reconstitutionMl) ||
    !isPositive(unitsPerMl) ||
    !isPositive(calculatedUnits) ||
    !isPositive(calculatedVolumeMl)
  ) {
    return undefined;
  }

  return { vialAmountMcg, reconstitutionMl, unitsPerMl, calculatedUnits, calculatedVolumeMl };
}

/**
 * Validates one stored entry, dropping anything malformed.
 *
 * Read-time validation rather than repair, for the same reason as every other
 * VITA log: a guessed value in a health record is worse than a missing one.
 * An entry whose own `logDate` contradicts the key it was read from is
 * dropped, because keeping it would double-count it the moment its real day
 * is opened.
 */
export function parseLogEntry(value: unknown, logDate: LogDate): PeptideLogEntry | null {
  if (!isRecord(value)) return null;

  const { id, setupId, definitionId, loggedAt, amount, notes, createdAt, updatedAt } = value;

  if (typeof id !== 'string' || id.length === 0) return null;
  if (typeof setupId !== 'string' || setupId.length === 0) return null;
  if (typeof definitionId !== 'string' || definitionId.length === 0) return null;
  if (typeof loggedAt !== 'string' || Number.isNaN(Date.parse(loggedAt))) return null;
  if (typeof createdAt !== 'string' || typeof updatedAt !== 'string') return null;

  const storedDate = value.logDate;
  if (typeof storedDate !== 'string' || !isValidLogDate(storedDate)) return null;
  if (storedDate !== logDate) return null;

  if (!isRecord(amount)) return null;
  const { authoredAmount, authoredUnit, amountMcg } = amount;
  if (!isPositive(authoredAmount) || !isPositive(amountMcg)) return null;
  if (!isMassUnit(authoredUnit)) return null;

  return {
    id,
    setupId,
    definitionId,
    logDate: storedDate,
    loggedAt,
    amount: {
      authoredAmount,
      authoredUnit: authoredUnit as MassUnit,
      amountMcg,
    },
    calculationSnapshot: parseSnapshot(value.calculationSnapshot),
    // A malformed site drops the site, never the entry: a log whose amount
    // and time are intact is still a true record of an administration.
    site: parseSiteSnapshot(value.site),
    notes: typeof notes === 'string' && notes.trim().length > 0 ? notes : undefined,
    createdAt,
    updatedAt,
  };
}

/** Newest first — how every history view wants them. */
export function sortLogsNewestFirst(entries: readonly PeptideLogEntry[]): PeptideLogEntry[] {
  return [...entries].sort((a, b) => {
    const byTime = Date.parse(b.loggedAt) - Date.parse(a.loggedAt);
    // Stable within the same instant, so a re-render never reshuffles rows.
    return byTime !== 0 ? byTime : b.id.localeCompare(a.id);
  });
}
