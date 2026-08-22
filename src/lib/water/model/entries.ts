/**
 * Building a water entry.
 *
 * One function, kept out of the provider so the shape of an entry is decided
 * in the domain rather than at whichever screen happened to create it.
 */

import { todayLogDate, type LogDate } from '../../daily/dates';
import { newId } from '../../daily/ids';
import type { VolumeUnit, WaterEntry } from './types';
import { toMl } from './units';

export type CreateWaterEntryInput = {
  amount: number;
  unit: VolumeUnit;
  /** Defaults to today. Passed explicitly when logging onto another day. */
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
  logDate = todayLogDate(),
  loggedAt = new Date(),
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
