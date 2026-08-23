/**
 * Building a water goal.
 *
 * A goal is stored as the pair the user authored — see `WaterGoal` — and this
 * is the one place that pair is constructed, so a rounded display value can
 * never be saved back as if it were the real target.
 *
 * There is no factory default and no suggested amount anywhere in this file.
 * VITA does not have an opinion about how much anyone should drink; it stores
 * the number they chose.
 */

import type { VolumeUnit, WaterGoal } from './types';

/**
 * Throws on an amount that is not a real positive quantity rather than
 * storing it. Callers parse user input with `parseAmount` first, so reaching
 * here with a bad value is a programming error, not something a person did.
 */
export function createWaterGoal(amount: number, unit: VolumeUnit): WaterGoal {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`createWaterGoal: amount must be a positive finite number, got ${amount}`);
  }
  return { amount, unit };
}
