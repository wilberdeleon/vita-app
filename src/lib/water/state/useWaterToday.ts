/**
 * The read side of the water engine — what screens actually consume.
 *
 * Everything is derived on each render from the entry array. Nothing is
 * stored, so there is no second copy of a total that can drift from the
 * entries it came from.
 *
 * The `null`s are load-bearing. A user who has not set a goal has no
 * progress, no remaining, and no percentage — and saying so is the point.
 * Substituting 64 oz to make the numbers non-null would be VITA inventing a
 * hydration recommendation, which it does not do.
 */

import { useMemo } from 'react';
import type { LogDate } from '../../daily/dates';
import {
  goalMl as toGoalMl,
  isGoalMet,
  overMl,
  percent,
  progress,
  remainingMl,
  sortByLoggedAt,
  totalMl,
} from '../model/totals';
import type { VolumeUnit, WaterEntry, WaterGoal } from '../model/types';
import { formatVolume } from '../model/units';
import { useWater } from './WaterProvider';

export type WaterToday = {
  logDate: LogDate;
  /** True until the day's entries have been read from storage. */
  isLoading: boolean;
  /** Persistence failure message, or null. */
  error: string | null;

  /** In log order, as stored. */
  entries: WaterEntry[];
  /** Newest first — what a list renders. */
  recentFirst: WaterEntry[];
  /** Nothing logged yet. Drives the empty state. */
  isEmpty: boolean;

  totalMl: number;
  /** The user's display unit. Never changes what was stored. */
  unit: VolumeUnit;
  /** Today's total in the user's unit, e.g. `24 fl oz`. */
  totalLabel: string;

  goal: WaterGoal | null;
  hasGoal: boolean;
  /** The goal in canonical millilitres, or `null` when none is set. */
  goalMl: number | null;
  /** The goal in the user's unit, or `null`. */
  goalLabel: string | null;

  /** 0..1, clamped. `0` without a goal — an empty track is the honest reading. */
  progress: number;
  /** Unclamped whole percent, or `null` without a goal. Can exceed 100. */
  percent: number | null;
  remainingMl: number | null;
  remainingLabel: string | null;
  overMl: number | null;
  overLabel: string | null;
  isGoalMet: boolean;
};

export function useWaterToday(): WaterToday {
  const { status, logDate, entries, goal, preferences, error } = useWater();

  return useMemo(() => {
    const unit = preferences.unit;
    const total = totalMl(entries);
    const goalInMl = toGoalMl(goal);
    const left = remainingMl(total, goalInMl);
    const past = overMl(total, goalInMl);

    return {
      logDate,
      isLoading: status === 'loading',
      error,

      entries,
      recentFirst: sortByLoggedAt(entries),
      isEmpty: entries.length === 0,

      totalMl: total,
      unit,
      totalLabel: formatVolume(total, unit),

      goal,
      hasGoal: goalInMl !== null,
      goalMl: goalInMl,
      goalLabel: goalInMl === null ? null : formatVolume(goalInMl, unit),

      progress: progress(total, goalInMl),
      percent: percent(total, goalInMl),
      remainingMl: left,
      remainingLabel: left === null ? null : formatVolume(left, unit),
      overMl: past,
      overLabel: past === null ? null : formatVolume(past, unit),
      isGoalMet: isGoalMet(total, goalInMl),
    };
  }, [status, logDate, entries, goal, preferences, error]);
}
