/**
 * A month across every routine at once.
 *
 * **Presentation selectors, outside the frozen domain.** Nothing here decides
 * anything new: each routine's day is still answered by `markForDay`, which
 * is the same function the week strip and the single-routine calendar use.
 * This module only gathers those answers per day and counts them, which is
 * why the Peptides-level month cannot disagree with a routine's own — they
 * ask the identical question and get the identical answer.
 */

import type { LogDate } from '../../lib/daily';
import type {
  PeptideLogEntry,
  ResolvedSetup,
  RoutineDayMark,
  RoutineDayStatus,
} from '../../lib/peptides';
import { daysInMonth, markForDay, type MonthCounts, type MonthKey } from './month';

/** One routine's answer for one day, with whatever was recorded against it. */
export type RoutineEvent = {
  setupId: string;
  name: string;
  mark: Exclude<RoutineDayMark, 'not-scheduled'>;
  logs: PeptideLogEntry[];
};

/** Every routine that had something to say about one day. */
export type DayActivity = {
  logDate: LogDate;
  events: RoutineEvent[];
  taken: number;
  skipped: number;
  noResponse: number;
};

/**
 * What each day of the month held, across all the given routines.
 *
 * ## A day is never flattened into one state
 *
 * Two routines taken and one skipped is three facts, and picking one of them
 * to colour the square would be inventing a summary the data does not
 * support — the founder's §38 warning. So a day carries its events, and the
 * calendar draws one small mark per event. Nothing is blended, averaged, or
 * turned into a proportion.
 *
 * ## Unscheduled is absent, not empty
 *
 * A routine whose schedule does not cover a day contributes **no event** —
 * not a zero, not a placeholder. That is what keeps an as-needed routine
 * blank on days it was not used, and keeps a routine's own start date from
 * generating months of invented *No response* before it existed.
 *
 * ## The month stops at today
 *
 * Days after today produce no events at all. The single-routine calendar does
 * draw them, as one hollow node per day, where it reads as *scheduled ahead*
 * — but multiplied by every routine it stops reading that way. Founder device
 * QA of this screen showed three grey marks on each of twenty-four future
 * days: two thirds of the calendar rendered as unanswered, for days nobody
 * has had the chance to answer.
 *
 * Semantics are unchanged — `markForDay` still decides every day this screen
 * shows, and the counts were always bounded by today. What changed is that
 * the grid no longer draws an absence of an answer as though it were a
 * missing one. This screen asks *what did I log*, in the past tense.
 */
export function monthActivityByDay(
  routines: readonly ResolvedSetup[],
  statuses: readonly RoutineDayStatus[],
  logs: readonly PeptideLogEntry[],
  month: MonthKey,
  today: LogDate,
): Map<LogDate, DayActivity> {
  const byDay = new Map<LogDate, DayActivity>();

  for (const logDate of daysInMonth(month)) {
    // ISO dates compare lexicographically, so this is a real date comparison.
    if (logDate > today) break;

    const events: RoutineEvent[] = [];

    for (const routine of routines) {
      const mark = markForDay(routine.setup, statuses, logDate);
      if (mark === 'not-scheduled') continue;

      events.push({
        setupId: routine.setup.id,
        name: routine.name,
        mark,
        logs: logs.filter(
          (entry) => entry.setupId === routine.setup.id && entry.logDate === logDate,
        ),
      });
    }

    if (events.length === 0) continue;

    byDay.set(logDate, {
      logDate,
      events,
      taken: events.filter((event) => event.mark === 'taken').length,
      skipped: events.filter((event) => event.mark === 'skipped').length,
      noResponse: events.filter((event) => event.mark === 'unconfirmed').length,
    });
  }

  return byDay;
}

/**
 * The month's totals — **routine events**, not days.
 *
 * Two routines taken on one day is two taken, which is the only reading that
 * survives having more than one routine. Still three counts and nothing else:
 * no total, no percentage, no adherence figure, no rate.
 *
 * There is no date bound here because there is nothing left to bound:
 * `monthActivityByDay` already ends the month at today.
 */
export function countAllRoutines(byDay: ReadonlyMap<LogDate, DayActivity>): MonthCounts {
  const counts: MonthCounts = { taken: 0, skipped: 0, noResponse: 0 };

  for (const day of byDay.values()) {
    counts.taken += day.taken;
    counts.skipped += day.skipped;
    counts.noResponse += day.noResponse;
  }

  return counts;
}

/**
 * How a day's marks are spoken — §66.
 *
 * `Friday, September 4. 3 routine events: 2 taken, 1 skipped.` The names
 * themselves are deliberately not read here: a day with four routines would
 * become a paragraph, and selecting the day exposes them as real text.
 */
export function spokenDayActivity(day: DayActivity): string {
  const parts: string[] = [];
  if (day.taken > 0) parts.push(`${day.taken} taken`);
  if (day.skipped > 0) parts.push(`${day.skipped} skipped`);
  if (day.noResponse > 0) parts.push(`${day.noResponse} no response`);

  const count = day.events.length;
  const noun = count === 1 ? 'routine event' : 'routine events';
  return `${count} ${noun}: ${parts.join(', ')}`;
}
