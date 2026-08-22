/**
 * Daily hydration arithmetic. Pure, and derived on demand rather than stored.
 *
 * Summing a day of drinks is a handful of additions; caching it would cost
 * more in staleness risk than it saves in work — the same reasoning behind
 * `useDailyNutrition`. There is exactly one copy of today's total and it is
 * computed from the entries it describes.
 *
 * Every function here tolerates a goal of `null`, because "no goal set yet"
 * is a real and expected state, not an error to guard against at each call
 * site. Nothing here can return `NaN` or `Infinity`.
 */

import type { WaterEntry, WaterGoal } from './types';
import { toMl } from './units';

/** The day's total in canonical millilitres. `0` for an empty day. */
export function totalMl(entries: readonly WaterEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.amountMl, 0);
}

/** A goal in canonical millilitres, or `null` when none is set. */
export function goalMl(goal: WaterGoal | null): number | null {
  if (goal === null) return null;
  const ml = toMl(goal.amount, goal.unit);
  // A goal that is not a real positive quantity is treated as no goal at
  // all. Showing progress toward zero is worse than showing none.
  return Number.isFinite(ml) && ml > 0 ? ml : null;
}

/**
 * Unclamped ratio of total to goal. `null` without a goal.
 *
 * Separate from `progress` for the same reason nutrition separates `ratio`:
 * a bar must not overflow its track, but a label that reads 118% is telling
 * the truth and should be allowed to.
 */
export function ratio(total: number, goal: number | null): number | null {
  if (goal === null || goal <= 0) return null;
  return total / goal;
}

/**
 * 0..1 for bars and rings, clamped. `0` without a goal — a bar has to render
 * something, and an empty track is the honest reading of "no target set".
 */
export function progress(total: number, goal: number | null): number {
  const value = ratio(total, goal);
  if (value === null) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Whole-number percentage, unclamped. `null` without a goal. */
export function percent(total: number, goal: number | null): number | null {
  const value = ratio(total, goal);
  return value === null ? null : Math.round(value * 100);
}

/** How much is left, never negative. `null` without a goal. */
export function remainingMl(total: number, goal: number | null): number | null {
  if (goal === null) return null;
  return Math.max(0, goal - total);
}

/** How far past the goal, `0` while still under it. `null` without a goal. */
export function overMl(total: number, goal: number | null): number | null {
  if (goal === null) return null;
  return Math.max(0, total - goal);
}

/** Whether the day's goal is met. `false` without a goal — nothing to meet. */
export function isGoalMet(total: number, goal: number | null): boolean {
  return goal !== null && goal > 0 && total >= goal;
}

/** Newest first. Ties broken by id so the order is total and stable. */
export function sortByLoggedAt(entries: readonly WaterEntry[]): WaterEntry[] {
  return [...entries].sort((a, b) => {
    const byTime = b.loggedAt.localeCompare(a.loggedAt);
    return byTime !== 0 ? byTime : b.id.localeCompare(a.id);
  });
}
