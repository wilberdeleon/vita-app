/**
 * Schedules the user has chosen for themselves.
 *
 * **Language rule, founder-set for this sprint:** a schedule reads as
 * *Scheduled today*, never *Due today*. VITA reflects what the user entered;
 * it does not assert an obligation, describe a day as missed, score adherence,
 * or count a streak. Nothing in this file produces the word "due", and a test
 * asserts that.
 */

import { fromLogDate, weekdayName, type LogDate } from '../../daily/dates';
import type { PeptideSchedule } from './types';

/** Sunday = 0, matching `Date.prototype.getDay()`. */
export const WEEKDAY_INDEXES: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function weekdayShort(day: number): string {
  return WEEKDAY_SHORT[day] ?? '';
}

export function weekdayLong(day: number): string {
  // Any Sunday works as an anchor; only the weekday index matters.
  const anchor = '2026-08-16'; // a Sunday
  const date = fromLogDate(anchor);
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate() + day);
  return weekdayName(
    `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}-${String(
      shifted.getDate(),
    ).padStart(2, '0')}`,
  );
}

export function isPeptideSchedule(value: unknown): value is PeptideSchedule {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as { kind?: unknown; days?: unknown; n?: unknown };

  switch (candidate.kind) {
    case 'daily':
    case 'asNeeded':
      return true;
    case 'daysOfWeek':
      return (
        Array.isArray(candidate.days) &&
        candidate.days.length > 0 &&
        candidate.days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) &&
        new Set(candidate.days as number[]).size === candidate.days.length
      );
    case 'everyNDays':
      return Number.isInteger(candidate.n) && (candidate.n as number) >= 2;
    default:
      return false;
  }
}

/** Days in week order regardless of the order they were tapped. */
export function sortedDays(days: readonly number[]): number[] {
  return [...days].sort((a, b) => a - b);
}

/**
 * How a schedule reads in a list — "Daily", "Mon, Wed, Fri", "Every 3 days",
 * "As needed". Descriptive only.
 */
export function scheduleLabel(schedule: PeptideSchedule | undefined): string | null {
  if (!schedule) return null;
  switch (schedule.kind) {
    case 'daily':
      return 'Daily';
    case 'asNeeded':
      return 'As needed';
    case 'everyNDays':
      // "Every 3 days" reads naturally; the model's `everyNDays` name does not
      // need to match the copy.
      return `Every ${schedule.n} days`;
    case 'daysOfWeek':
      return sortedDays(schedule.days).map(weekdayShort).join(', ');
  }
}

/**
 * Whether the user's own schedule includes this calendar day.
 *
 * A fact about what they entered, phrased for a neutral "Scheduled today"
 * label. `everyNDays` needs a start date to have any meaning — without one it
 * returns `false` rather than guessing an anchor, because inventing one would
 * make the app assert something the user never said.
 */
export function isScheduledOn(
  schedule: PeptideSchedule | undefined,
  logDate: LogDate,
  startDate?: LogDate,
): boolean {
  if (!schedule) return false;

  switch (schedule.kind) {
    case 'daily':
      return true;
    case 'asNeeded':
      return false;
    case 'daysOfWeek':
      return schedule.days.includes(fromLogDate(logDate).getDay());
    case 'everyNDays': {
      if (!startDate) return false;
      const start = fromLogDate(startDate);
      const day = fromLogDate(logDate);
      const elapsedMs = day.getTime() - start.getTime();
      if (elapsedMs < 0) return false;
      // Rounded because a DST transition makes a "day" 23 or 25 hours long,
      // and a truncating division would drift by one across the boundary.
      const elapsedDays = Math.round(elapsedMs / 86_400_000);
      return elapsedDays % schedule.n === 0;
    }
  }
}
