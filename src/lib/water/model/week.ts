/**
 * The recent-days view model — seven daily volumes, nothing more.
 *
 * **Deliberately volume, not goal attainment.** VITA stores one current goal
 * as a preference; it does not snapshot what the goal was on any past day. So
 * rendering "you hit your goal on Tuesday" would be an invention — the app
 * genuinely does not know what Tuesday's goal was, only what today's is. This
 * model therefore carries litres-in-the-glass and each day's share of the
 * week's biggest day, and the UI compares days to each other rather than to a
 * target that may never have existed.
 *
 * That is also why there is no streak, no average, and no "goal met" flag
 * here. Seven bars are context, not analytics.
 */

import { logDateRange, weekdayInitial, weekdayName, type LogDate } from '../../daily/dates';

/** How many days the strip shows: today plus the previous six. */
export const WEEK_DAYS = 7;

export type WaterDay = {
  logDate: LogDate;
  totalMl: number;
  /** 0..1 — this day against the biggest day in the window. `0` when every day is empty. */
  share: number;
  isToday: boolean;
  /** Ambiguous alone (Tue/Thu both "T"); always pair with `weekdayName` for assistive tech. */
  initial: string;
  weekdayName: string;
};

export type StoredDayTotal = {
  logDate: LogDate;
  totalMl: number;
};

/**
 * Builds the window ending at `logDate`, oldest first.
 *
 * Every day in the range is present even when nothing was logged — a gap is
 * information ("I drank nothing Wednesday"), and dropping empty days would
 * silently compress the axis and make the week read as denser than it was.
 *
 * `todayTotalMl` is passed separately and always wins for the last day, so the
 * strip reflects a drink the moment it is logged rather than whatever was last
 * read from storage.
 */
export function buildWaterWeek(
  logDate: LogDate,
  storedTotals: readonly StoredDayTotal[],
  todayTotalMl: number,
  days: number = WEEK_DAYS,
): WaterDay[] {
  const range = logDateRange(logDate, days);
  if (range.length === 0) return [];

  const stored = new Map(storedTotals.map((day) => [day.logDate, day.totalMl]));

  const totals = range.map((date, index) => {
    const isLast = index === range.length - 1;
    const total = isLast ? todayTotalMl : (stored.get(date) ?? 0);
    // A corrupted or negative stored total must not drag the scale negative.
    return Number.isFinite(total) && total > 0 ? total : 0;
  });

  const peak = Math.max(...totals);

  return range.map((date, index) => ({
    logDate: date,
    totalMl: totals[index],
    // Relative to the week's own peak, so a light week still reads clearly
    // instead of collapsing to nothing against some absolute scale.
    share: peak > 0 ? totals[index] / peak : 0,
    isToday: index === range.length - 1,
    initial: weekdayInitial(date),
    weekdayName: weekdayName(date),
  }));
}
