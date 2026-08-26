/**
 * Routines — what the user intends — and what actually happened on a day.
 *
 * **Two concepts, deliberately not merged.** A *routine* is a plan: this
 * peptide, on these days. A `PeptideLogEntry` is a fact: this amount went in,
 * at this time. Slice 3.9 adds a third thing between them — a **routine day
 * status**, which records the user's answer to "did you take it?" for a day
 * the plan covered. It is an answer, never an inference.
 *
 * **A schedule never creates an administration.** Nothing here converts a
 * planned day into a taken one, and nothing derives a log from a schedule. A
 * plan is what someone meant to do; a log is what they say they did, and only
 * they can supply that.
 *
 * **`unconfirmed` is the absence of a record, not a value.** This is the whole
 * reason the model is shaped this way. If "no response" were a stored state,
 * something would eventually have to decide when to write it — at midnight,
 * on read, on app open — and every one of those answers quietly converts
 * silence into an assertion. Instead: a day the user answered has a record, a
 * day they did not has nothing. VITA cannot claim to know what it was never
 * told.
 */

import { newId } from '../../daily/ids';
import { isValidLogDate, type LogDate } from '../../daily/dates';
import { isNonEmptyString, isRecord } from '../../daily/guards';
import { isScheduledOn } from './schedule';
import type { PeptideSchedule } from './types';

/* ── routine state ──────────────────────────────────────────────────── */

/**
 * Where a routine sits in the user's own list.
 *
 * **`needs-setup` and `inactive` are different things**, and merging them was
 * explicitly rejected: one is "I added this and haven't configured it yet",
 * the other is "I configured this and deliberately paused it". A list that
 * conflates them tells someone their brand-new peptide is switched off.
 *
 * *Removed* is not a state here — a removed routine is simply no longer in
 * the store. Keeping a tombstone would mean every list, count, and lookup had
 * to remember to exclude it, and one that forgot would resurrect it.
 */
export const ROUTINE_STATES = ['needs-setup', 'active', 'inactive'] as const;
export type PeptideRoutineState = (typeof ROUTINE_STATES)[number];

export function isRoutineState(value: unknown): value is PeptideRoutineState {
  return typeof value === 'string' && (ROUTINE_STATES as readonly string[]).includes(value);
}

const ROUTINE_STATE_LABELS: Record<PeptideRoutineState, string> = {
  'needs-setup': 'Setup needed',
  active: 'Active',
  inactive: 'Inactive',
};

export function routineStateLabel(state: PeptideRoutineState): string {
  return ROUTINE_STATE_LABELS[state];
}

/**
 * The state a pre-3.9 setup loads as.
 *
 * Legacy records are mapped by their `active` flag and **never** to
 * `needs-setup`. Before 3.9 the only way a setup could exist was to have been
 * created through the full form, so every stored setup is configured by
 * definition — and a working routine that suddenly said "setup needed" would
 * be a regression dressed up as a migration. A pre-filled-pen user with no
 * vial is configured too; missing vial data is a legitimate setup, not an
 * incomplete one.
 */
export function routineStateFromLegacyActive(active: boolean): PeptideRoutineState {
  return active ? 'active' : 'inactive';
}

/* ── one day's answer ───────────────────────────────────────────────── */

/**
 * What the user said about a scheduled day.
 *
 * Only the two things they can actually assert. There is no `missed`, no
 * `overdue`, and no `unconfirmed` — see the note at the top of this file for
 * why the last one is an absence rather than a value.
 */
export const ROUTINE_DAY_STATES = ['taken', 'skipped'] as const;
export type RoutineDayState = (typeof ROUTINE_DAY_STATES)[number];

export function isRoutineDayState(value: unknown): value is RoutineDayState {
  return typeof value === 'string' && (ROUTINE_DAY_STATES as readonly string[]).includes(value);
}

export type RoutineDayStatus = {
  id: string;
  setupId: string;
  /** Local calendar day, via the shared date model. */
  logDate: LogDate;
  state: RoutineDayState;
  /**
   * The administration this status created, when it created one.
   *
   * Set only for a `taken` recorded through the daily flow, and it is what
   * makes undo safe: changing that status may remove *this* log and no other.
   * A manual log has no status pointing at it and can never be swept up by
   * one — the distinction that stops "I tapped the wrong button" from
   * deleting a record the user typed by hand.
   */
  linkedLogId?: string;
  createdAt: string;
  updatedAt: string;
};

export function createRoutineStatus(
  setupId: string,
  logDate: LogDate,
  state: RoutineDayState,
  options: { linkedLogId?: string } = {},
  now: Date = new Date(),
): RoutineDayStatus {
  if (setupId.length === 0) throw new Error('createRoutineStatus: setupId is required');
  if (!isValidLogDate(logDate)) throw new Error(`createRoutineStatus: invalid logDate ${logDate}`);

  const timestamp = now.toISOString();
  return {
    id: newId('rds'),
    setupId,
    logDate,
    state,
    ...(options.linkedLogId ? { linkedLogId: options.linkedLogId } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Validates a stored status against the day it was read from.
 *
 * Defensive in the same way the log parser is: a malformed status is dropped,
 * never repaired. Dropping one loses the answer to a single day — inventing a
 * plausible one would put words in the user's mouth about whether they took a
 * peptide, which is the worst thing this file could do.
 *
 * A record whose own `logDate` contradicts its storage key is rejected rather
 * than trusted, so a hand-edited or half-written file cannot make one day's
 * answer appear on another.
 */
export function parseRoutineStatus(value: unknown, logDate: LogDate): RoutineDayStatus | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.setupId)) return null;
  if (!isRoutineDayState(value.state)) return null;
  if (!isValidLogDate(value.logDate) || value.logDate !== logDate) return null;
  if (!isNonEmptyString(value.createdAt) || !isNonEmptyString(value.updatedAt)) return null;

  return {
    id: value.id,
    setupId: value.setupId,
    logDate: value.logDate,
    state: value.state,
    // A malformed link drops the link, not the answer: the user still said
    // "taken", and that is the part worth keeping.
    ...(isNonEmptyString(value.linkedLogId) ? { linkedLogId: value.linkedLogId } : {}),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

/* ── reading a day ──────────────────────────────────────────────────── */

/**
 * How one routine's day reads, combining the plan with the answer.
 *
 * `not-scheduled` is not a judgement — it means the user's own schedule does
 * not cover this day, so there is nothing to answer.
 */
export type RoutineDayMark = 'taken' | 'skipped' | 'unconfirmed' | 'not-scheduled';

const MARK_LABELS: Record<RoutineDayMark, string> = {
  taken: 'Taken',
  skipped: 'Skipped',
  unconfirmed: 'No response',
  'not-scheduled': 'Not scheduled',
};

export function routineDayMarkLabel(mark: RoutineDayMark): string {
  return MARK_LABELS[mark];
}

/**
 * A shape per state, so meaning never rides on colour alone.
 *
 * Deliberately not a tick-and-cross pair: a cross reads as *wrong*, and
 * skipping a peptide on purpose is not wrong. A dash is neutral, an open ring
 * says "nothing recorded", and a blank says "not part of the plan".
 */
const MARK_SYMBOLS: Record<RoutineDayMark, string> = {
  taken: '✓',
  skipped: '–',
  unconfirmed: '○',
  'not-scheduled': '',
};

export function routineDayMarkSymbol(mark: RoutineDayMark): string {
  return MARK_SYMBOLS[mark];
}

/**
 * What a given day says for a given routine.
 *
 * An answer always wins over the plan. Someone can record *taken* on a day
 * their schedule does not cover — an extra administration is a real event,
 * and refusing to show it because the calendar disagreed would hide the truth
 * in favour of the plan.
 */
export function routineDayMark(input: {
  schedule?: PeptideSchedule;
  startDate?: LogDate;
  logDate: LogDate;
  status?: RoutineDayStatus;
}): RoutineDayMark {
  if (input.status) return input.status.state;
  return isScheduledOn(input.schedule, input.logDate, input.startDate)
    ? 'unconfirmed'
    : 'not-scheduled';
}

/** Every status recorded for one routine, whatever the day. */
export function statusesForSetup(
  statuses: readonly RoutineDayStatus[],
  setupId: string,
): RoutineDayStatus[] {
  return statuses.filter((status) => status.setupId === setupId);
}

/** One routine's answer for one day, if it gave one. */
export function statusFor(
  statuses: readonly RoutineDayStatus[],
  setupId: string,
  logDate: LogDate,
): RoutineDayStatus | undefined {
  return statuses.find((status) => status.setupId === setupId && status.logDate === logDate);
}
