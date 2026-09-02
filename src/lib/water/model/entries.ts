/**
 * Building and amending a water entry.
 *
 * Kept out of the provider and out of the screens so the shape of an entry is
 * decided in one place. Add and Edit both go through here, which is what stops
 * them drifting apart on how an amount becomes an entry — the same reasoning
 * behind Fuel's single shared `PortionEditor`.
 */

import { toLogDate, type LogDate } from '../../daily/dates';
import { newId } from '../../daily/ids';
import type { VolumeUnit, WaterEntry } from './types';
import { toMl } from './units';

export type CreateWaterEntryInput = {
  amount: number;
  unit: VolumeUnit;
  /**
   * Defaults to the local calendar day of `loggedAt` — **not** to "today".
   *
   * Those are the same thing for a drink logged now, which is every drink the
   * app currently logs. They are not the same thing for any other call, and
   * defaulting to today produced an entry whose `logDate` could contradict its
   * own `loggedAt`: a timestamp from yesterday filed under today. The
   * repository rejects exactly that shape on read, so the incoherent entry
   * would have been silently dropped later rather than rejected at creation.
   *
   * Pass it explicitly only to file a drink onto a different day than its
   * timestamp implies.
   */
  logDate?: LogDate;
  /** Injectable so tests are deterministic; defaults to now. */
  loggedAt?: Date;
};

/**
 * Both representations are written at creation time: the canonical
 * millilitres arithmetic uses, and the authored pair the user typed. Deriving
 * either one later would mean guessing what the other meant.
 *
 * Throws on a non-positive or non-finite amount rather than storing it.
 * Callers parse user input with `parseAmount` first; reaching here with a bad
 * value is a programming error, not something a person did.
 */
export function createWaterEntry({
  amount,
  unit,
  loggedAt = new Date(),
  logDate = toLogDate(loggedAt),
}: CreateWaterEntryInput): WaterEntry {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`createWaterEntry: amount must be a positive finite number, got ${amount}`);
  }

  return {
    id: newId('water'),
    logDate,
    loggedAt: loggedAt.toISOString(),
    amountMl: toMl(amount, unit),
    enteredAmount: amount,
    enteredUnit: unit,
  };
}

/**
 * The fields an edit may change, recomputed together.
 *
 * Amount and unit are inseparable: changing `enteredUnit` without recomputing
 * `amountMl` would leave an entry whose canonical value contradicts its own
 * label, and every total built on it would be wrong while looking right.
 * Returning them as one object makes that mistake unavailable.
 *
 * Deliberately excludes `id`, `logDate`, and `loggedAt`. Editing how much you
 * drank does not make it a different drink at a different time, and preserving
 * the id is what keeps an edit an update rather than a delete-and-insert.
 */
export function waterAmountChanges(
  amount: number,
  unit: VolumeUnit,
): Pick<WaterEntry, 'amountMl' | 'enteredAmount' | 'enteredUnit'> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`waterAmountChanges: amount must be a positive finite number, got ${amount}`);
  }

  return {
    amountMl: toMl(amount, unit),
    enteredAmount: amount,
    enteredUnit: unit,
  };
}
