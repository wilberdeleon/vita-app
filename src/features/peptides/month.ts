/**
 * A calendar month of one routine, and what each of its days says.
 *
 * **Presentation selectors, outside the frozen domain.** Nothing here decides
 * anything new: the schedule question is answered by `isScheduledOn` and the
 * day question by `routineDayMark`, both of which the week strip already
 * uses. This module only arranges those answers into a grid and counts them,
 * which is why the weekly and monthly views cannot disagree — they call the
 * same function.
 *
 * The calendar arithmetic uses `shiftLogDate` and `fromLogDate`. A month
 * boundary is exactly where `new Date('2026-07-01')` bites: it parses as UTC
 * and lands on 30 June for anyone west of London.
 */

import { fromLogDate, shiftLogDate, toLogDate, type LogDate } from '../../lib/daily';
import {
  routineDayMark,
  statusFor,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayMark,
  type RoutineDayStatus,
} from '../../lib/peptides';

/** A year and a zero-based month, the shape `Date` speaks. */
export type MonthKey = { year: number; month: number };

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** `July 2026` — never `2026-07`. */
export function monthLabel({ year, month }: MonthKey): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export function monthOf(logDate: LogDate): MonthKey {
  const date = fromLogDate(logDate);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftMonth({ year, month }: MonthKey, by: number): MonthKey {
  const shifted = new Date(year, month + by, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
}

export function isSameMonth(a: MonthKey, b: MonthKey): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Negative when `a` is earlier. */
export function compareMonths(a: MonthKey, b: MonthKey): number {
  return a.year !== b.year ? a.year - b.year : a.month - b.month;
}

/** Every day in the month, in order. Local dates, never UTC-parsed. */
export function daysInMonth({ year, month }: MonthKey): LogDate[] {
  const days: LogDate[] = [];
  // Day 0 of the next month is the last day of this one — the standard trick,
  // and it handles February and leap years without a table.
  const count = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= count; day += 1) days.push(toLogDate(new Date(year, month, day)));
  return days;
}

/**
 * The month as six-or-fewer rows of seven, **Monday first**.
 *
 * Leading and trailing cells are `null` rather than the neighbouring month's
 * dates. Showing 30 June in a July grid invites a tap on a day this screen is
 * not about; a blank says *this row starts on Wednesday* just as clearly.
 */
export function monthGrid(key: MonthKey): Array<Array<LogDate | null>> {
  const days = daysInMonth(key);
  // `getDay()` is Sunday-first; converted so Monday is 0, matching
  // `weekOf` and the routine strip.
  const lead = (fromLogDate(days[0]).getDay() + 6) % 7;

  const cells: Array<LogDate | null> = [...Array<null>(lead).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: Array<Array<LogDate | null>> = [];
  for (let index = 0; index < cells.length; index += 7) rows.push(cells.slice(index, index + 7));
  return rows;
}

/**
 * What one day of one routine says.
 *
 * **The single source of truth for both the week strip and the month grid.**
 * It defers to `routineDayMark`, so *an answer always wins over the plan* —
 * someone can record a dose on a day their schedule does not cover, and that
 * is a real event rather than something to hide.
 *
 * The one thing added on top is the **start date**, and only when the routine
 * has one. `isScheduledOn` honours `startDate` for `everyNDays` but not for
 * `daily` or `daysOfWeek`, so a daily routine started in August would
 * otherwise report every day of July as unanswered — asserting the user
 * failed to answer for a routine that did not exist yet. A day before the
 * routine began is *not scheduled*, which is the truth.
 *
 * **As-needed is the case to be careful with.** `isScheduledOn` returns false
 * for it by design, so a day with no record is `not-scheduled` — blank — and
 * never *No response*. An as-needed routine has nothing to answer for.
 */
export function markForDay(
  setup: PeptideSetup,
  statuses: readonly RoutineDayStatus[],
  logDate: LogDate,
): RoutineDayMark {
  const status = statusFor(statuses, setup.id, logDate);
  if (!status && setup.startDate && logDate < setup.startDate) return 'not-scheduled';

  return routineDayMark({
    schedule: setup.schedule,
    startDate: setup.startDate,
    logDate,
    status,
  });
}

export type MonthCounts = {
  taken: number;
  skipped: number;
  noResponse: number;
};

/**
 * What the month held, counted.
 *
 * **Only states that semantically apply.** Unscheduled days are not counted
 * as anything — they are not a denominator, not a miss, and not a gap. There
 * is deliberately no total, no percentage, no streak and no score: the
 * counts are three facts, and what they mean is the user's to decide.
 *
 * **The count stops at today.** A scheduled day still to come is drawn on the
 * calendar, because the plan ahead is real and worth seeing — but nobody has
 * failed to answer a day that has not arrived, and counting the rest of the
 * month as *No response* would turn a plan into an accusation. The current
 * month therefore reports what has happened so far.
 */
export function countMonth(
  setup: PeptideSetup,
  statuses: readonly RoutineDayStatus[],
  key: MonthKey,
  today: LogDate,
): MonthCounts {
  const counts: MonthCounts = { taken: 0, skipped: 0, noResponse: 0 };

  for (const day of daysInMonth(key)) {
    if (day > today) break;

    switch (markForDay(setup, statuses, day)) {
      case 'taken':
        counts.taken += 1;
        break;
      case 'skipped':
        counts.skipped += 1;
        break;
      case 'unconfirmed':
        counts.noResponse += 1;
        break;
      default:
        break;
    }
  }

  return counts;
}

/**
 * The earliest month this screen can speak about honestly.
 *
 * The provider keeps a bounded window of recent history warm — the most
 * recent day-keys that actually hold records. Everything from the oldest
 * loaded record forward is complete: a day with no record in that range
 * genuinely has no record. **Before it, nothing is known**, and a calendar
 * that rendered those days as *No response* would be inventing an answer the
 * user never failed to give.
 *
 * So navigation stops there. A routine with nothing recorded can only show
 * the current month, which is the whole truth about it.
 */
export function earliestKnownMonth(
  statuses: readonly RoutineDayStatus[],
  logs: readonly PeptideLogEntry[],
  setupId: string,
  today: LogDate,
): MonthKey {
  const days = [
    ...statuses.filter((status) => status.setupId === setupId).map((status) => status.logDate),
    ...logs.filter((entry) => entry.setupId === setupId).map((entry) => entry.logDate),
  ];
  if (days.length === 0) return monthOf(today);

  // ISO dates sort lexicographically, so this is a real date comparison.
  return monthOf(days.reduce((oldest, day) => (day < oldest ? day : oldest)));
}

/** The seven days of the week containing `logDate`, Monday first. */
export function weekAround(logDate: LogDate): LogDate[] {
  const mondayIndex = (fromLogDate(logDate).getDay() + 6) % 7;
  const monday = shiftLogDate(logDate, -mondayIndex);
  return Array.from({ length: 7 }, (_, day) => shiftLogDate(monday, day));
}
