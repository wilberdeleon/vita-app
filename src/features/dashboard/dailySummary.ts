/**
 * The one factual line under the greeting.
 *
 * **Built from facts the domains already know, or omitted.** There is no
 * score here, no "N of 4 goals", no readiness index and no synthetic
 * completion percentage — every one of those would be VITA inventing a
 * judgement out of numbers it holds for other reasons, and the previous
 * Dashboard's `N of 4 goals complete` was exactly that (two real pillars and
 * two fixtures).
 *
 * Returning `null` is a real answer. A user with no goal, no routines and
 * nothing logged has nothing worth summarising, and a filler line saying so
 * at length is worse than the space it would occupy — the modules beneath
 * already state each domain's own empty case.
 */

export type DailySummaryInput = {
  /** Routines scheduled today that have not been answered yet. */
  peptidesUnanswered: number;
  /** Routines scheduled today, answered or not. */
  peptidesScheduled: number;
  hasWaterGoal: boolean;
  isWaterGoalMet: boolean;
  /** Remaining, already formatted in the user's unit — e.g. `28 fl oz`. */
  waterRemainingLabel: string | null;
  mealsLogged: number;
};

/**
 * Two facts at most, joined by a separator.
 *
 * Two because the line sits under a greeting and above the modules that say
 * the same things in more detail; a third clause turns context into a
 * paragraph. Peptides comes first when it has something outstanding, because
 * a scheduled dose is the one thing on this screen with a day attached to it.
 */
export function buildDailySummary(input: DailySummaryInput): string | null {
  const parts: string[] = [];

  if (input.peptidesUnanswered > 0) {
    parts.push(
      input.peptidesUnanswered === 1 ? '1 routine scheduled' : `${input.peptidesUnanswered} routines scheduled`,
    );
  } else if (input.peptidesScheduled > 0) {
    // Everything scheduled today has an answer. Stated plainly, not praised.
    parts.push('All routines answered');
  }

  if (input.hasWaterGoal) {
    if (input.isWaterGoalMet) parts.push('hydration complete');
    else if (input.waterRemainingLabel) parts.push(`${input.waterRemainingLabel} to go`);
  }

  if (parts.length < 2 && input.mealsLogged > 0) {
    parts.push(input.mealsLogged === 1 ? '1 meal logged' : `${input.mealsLogged} meals logged`);
  }

  if (parts.length === 0) return null;
  return parts.slice(0, 2).join(' · ');
}
