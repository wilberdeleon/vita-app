/**
 * Monday-to-Sunday weeks, and what was logged in one.
 *
 * **Presentation selectors, deliberately outside the frozen domain.** Slice
 * 5.5 changes nothing under `src/lib/peptides/`; what it needs is a way to
 * ask *which seven days is this week* and *where did injections land in it*,
 * and neither is a new fact — both are derived from logs the domain already
 * stores.
 *
 * The calendar arithmetic is built from `shiftLogDate` and `fromLogDate`
 * rather than from `new Date()` maths of its own. Those two are already
 * timezone- and DST-safe, and a second hand-rolled implementation of "seven
 * days back" is exactly how a week silently shifts for anyone west of London.
 *
 * Monday-first, matching `useRoutineWeek` — the routine strip and the site
 * map must never disagree about which days are "this week".
 */

import { fromLogDate, shiftLogDate, type LogDate } from '../../lib/daily';
import type { InjectionSiteKey, PeptideLogEntry } from '../../lib/peptides';

/** The seven days of the week containing `today`, offset by whole weeks. */
export function weekOf(today: LogDate, offset = 0): LogDate[] {
  const anchor = shiftLogDate(today, offset * 7);
  // `getDay()` is Sunday-first; this converts to a Monday-first index, so
  // subtracting it lands on Monday rather than on the previous Sunday.
  const mondayIndex = (fromLogDate(anchor).getDay() + 6) % 7;
  const monday = shiftLogDate(anchor, -mondayIndex);
  return Array.from({ length: 7 }, (_, day) => shiftLogDate(monday, day));
}

/** `12 – 18 May`, for a week that is neither this one nor last. */
export function weekRangeLabel(days: readonly LogDate[]): string {
  if (days.length === 0) return '';
  const short = (value: LogDate) => {
    const date = fromLogDate(value);
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
  };
  return `${short(days[0])} – ${short(days[days.length - 1])}`;
}

/** `This week` · `Last week` · a date range. */
export function weekLabel(days: readonly LogDate[], offset: number): string {
  if (offset === 0) return 'This week';
  if (offset === -1) return 'Last week';
  if (offset === 1) return 'Next week';
  return weekRangeLabel(days);
}

/** One administration, reduced to what a marker needs to say. */
export type SiteLogSummary = {
  id: string;
  logDate: LogDate;
  /** Monday-first index within the week, 0–6. */
  dayIndex: number;
  loggedAt: string;
  /** The compound's name, resolved by the caller from the catalog. */
  name: string;
  /** What the user authored, read back — never a recommendation. */
  amount: string | null;
  label: string;
};

/**
 * Every site that was used in this week, with the logs that landed on it.
 *
 * **Grouped by site, because that is what a body map draws** — one marker per
 * place, however many injections it holds. Two administrations at the left
 * thigh are one marker saying two, never two circles stacked on top of each
 * other where neither can be read or tapped.
 *
 * **Reads the stored snapshot on each log**, never the routine's current
 * configuration. A site recorded in March stays where it was recorded even if
 * the routine changed afterwards; inferring it from today's setup would
 * rewrite history to match the present.
 *
 * `custom` sites are returned like any other and the caller decides what to
 * do with them — they have no place on the figure, but they are real history
 * and must still be listed.
 */
export function siteLogsForWeek(
  logs: readonly PeptideLogEntry[],
  days: readonly LogDate[],
  describe: (entry: PeptideLogEntry) => { name: string; amount: string | null },
): Map<InjectionSiteKey, SiteLogSummary[]> {
  const index = new Map<LogDate, number>();
  days.forEach((day, position) => index.set(day, position));

  const grouped = new Map<InjectionSiteKey, SiteLogSummary[]>();

  for (const entry of logs) {
    const site = entry.site;
    if (!site) continue;
    const dayIndex = index.get(entry.logDate);
    if (dayIndex === undefined) continue;

    const { name, amount } = describe(entry);
    const bucket = grouped.get(site.key) ?? [];
    bucket.push({
      id: entry.id,
      logDate: entry.logDate,
      dayIndex,
      loggedAt: entry.loggedAt,
      name,
      amount,
      label: site.label,
    });
    grouped.set(site.key, bucket);
  }

  // Chronological within a site, so "M · 2" opens a list that reads forwards.
  for (const bucket of grouped.values()) {
    bucket.sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
  }

  return grouped;
}

/** How many administrations the week holds, across every site. */
export function countSiteLogs(grouped: Map<InjectionSiteKey, SiteLogSummary[]>): number {
  let total = 0;
  for (const bucket of grouped.values()) total += bucket.length;
  return total;
}
