/**
 * Journey's display arithmetic — factual, never evaluative.
 *
 * A change is a signed number with a unit. It has no colour, no adjective and
 * no opinion about which direction is better: some people are deliberately
 * gaining. Everything here rounds at display only; stored values are untouched.
 */

import {
  formatClockTime,
  formatLogDateLong,
  formatLogDateShort,
  formatLogDateWithYear,
  shiftLogDate,
  toLogDate,
  todayLogDate,
} from '../../lib/daily';
import { fromKg, roundForDisplay, type WeightEntry, type WeightUnit } from '../../lib/journey';

const DAY_MS = 86_400_000;

/** "Sat, Oct 12" — local calendar day of an absolute instant. */
export function shortDate(iso: string): string {
  return formatLogDateShort(toLogDate(new Date(iso)));
}

/** "12 October 2026". */
export function longDate(iso: string): string {
  return formatLogDateWithYear(toLogDate(new Date(iso)));
}

/** "Sat, Oct 12 · 7:05 AM". */
export function dateAndTime(iso: string): string {
  return `${shortDate(iso)} · ${formatClockTime(iso)}`;
}

/** "176.0" — the number alone, for when the unit is set beside it. */
export function weightNumber(kg: number, unit: WeightUnit): string {
  return roundForDisplay(fromKg(kg, unit)).toFixed(1);
}

/**
 * "−8.4 lb", "+2.0 lb", "0.0 lb". A true minus sign, so a screen reader and
 * the eye both read the sign; never a colour.
 */
export function signedChange(fromKgValue: number, toKgValue: number, unit: WeightUnit): string {
  const delta = roundForDisplay(fromKg(toKgValue, unit) - fromKg(fromKgValue, unit));
  if (delta === 0) return `0.0 ${unit}`;
  return `${delta < 0 ? '−' : '+'}${Math.abs(delta).toFixed(1)} ${unit}`;
}

/** Spoken form: "down 8.4 pounds" — direction as fact, not verdict. */
export function spokenChange(fromKgValue: number, toKgValue: number, unit: WeightUnit): string {
  const delta = roundForDisplay(fromKg(toKgValue, unit) - fromKg(fromKgValue, unit));
  const unitWord = unit === 'lb' ? 'pounds' : 'kilograms';
  if (delta === 0) return 'no change';
  return `${delta < 0 ? 'down' : 'up'} ${Math.abs(delta).toFixed(1)} ${unitWord}`;
}

/** "3 days", "10 weeks", "4 months", "2 years" between two instants. */
export function elapsed(fromIso: string, toIso: string): string {
  const days = Math.max(0, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / DAY_MS));
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  if (days < 14) return plural(days, 'day');
  if (days < 91) return plural(Math.round(days / 7), 'week');
  if (days < 730) return plural(Math.round(days / 30.44), 'month');
  return plural(Math.round(days / 365.25), 'year');
}

/** Earliest entry — the start of the recorded weight history. */
export function firstEntry(weights: readonly WeightEntry[]): WeightEntry | null {
  return weights.length ? weights[weights.length - 1] : null;
}

/** A weigh-in from the same local calendar day as `iso`, if one was recorded. */
export function weightOnDay(weights: readonly WeightEntry[], iso: string): WeightEntry | null {
  const day = toLogDate(new Date(iso));
  return weights.find((entry) => toLogDate(new Date(entry.loggedAt)) === day) ?? null;
}

/**
 * The local calendar day a weigh-in belongs to, as a history heading:
 * "Today", "Yesterday", "Sat, Oct 24", or "24 October 2025" in another year.
 *
 * Presentation only. The stored instant is never rewritten; a person who
 * travels sees their history grouped by the phone's current calendar.
 */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const day = toLogDate(new Date(iso));
  const today = toLogDate(now);
  if (day === today) return 'Today';
  if (day === shiftLogDate(today, -1)) return 'Yesterday';
  if (day.slice(0, 4) !== today.slice(0, 4)) return formatLogDateWithYear(day);
  return formatLogDateShort(day);
}

/** The local day key used to group history. */
export function dayKeyOf(iso: string): string {
  return toLogDate(new Date(iso));
}

/** "8:14 PM". */
export function clockTime(iso: string): string {
  return formatClockTime(iso);
}

/** "Today, 8:14 PM" / "Sat, Oct 24, 8:14 PM". */
export function whenLabel(iso: string, now: Date = new Date()): string {
  return `${dayLabel(iso, now)}, ${formatClockTime(iso)}`;
}

/** Spoken: "Tuesday, October 27 at 8:14 PM". */
export function spokenWhen(iso: string): string {
  return `${formatLogDateLong(toLogDate(new Date(iso)))} at ${formatClockTime(iso)}`;
}

/** Spoken weight: "178.0 pounds". */
export function spokenWeight(kg: number, unit: WeightUnit): string {
  return `${weightNumber(kg, unit)} ${unit === 'lb' ? 'pounds' : 'kilograms'}`;
}

/** Today's local day key — for the When row's "Today" chip. */
export function todayKey(): string {
  return todayLogDate();
}

/* ── Journey (6.5) ───────────────────────────────────────────────────── */

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A calendar day as a person reads it: "Oct 28", or "Oct 28, 2026" with the year. */
export function calendarDay(logDate: string, withYear = false): string {
  const [year, month, day] = logDate.split('-').map(Number);
  return `${SHORT_MONTHS[month - 1]} ${day}${withYear ? `, ${year}` : ''}`;
}

/**
 * A Journey's date range: "Oct 28 – Jan 25, 2027" when it crosses a year,
 * "Jun 1 – Aug 29, 2026" when it does not. The year is said once, at the end,
 * unless the two ends differ.
 */
export function dateRange(start: string, end: string): string {
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${calendarDay(start, !sameYear)} \u2013 ${calendarDay(end, true)}`;
}

/** Spoken: "October 28, 2026". */
export function spokenCalendarDay(logDate: string): string {
  const [year, month, day] = logDate.split('-').map(Number);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

/** "1 day", "90 days". */
export function dayCount(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export type JourneyWeightStats = {
  /** The Journey's earliest weigh-in — its starting weight. */
  starting: WeightEntry;
  /** Its latest weigh-in. Equal to `starting` with one entry. */
  current: WeightEntry;
  /** Weigh-ins recorded in this Journey. */
  count: number;
};

/**
 * Starting / current / count from **one Journey's** weigh-ins (newest first).
 * `null` with none. Change is shown only when `count > 1` — with one weigh-in
 * there is nothing to compare.
 */
export function journeyWeightStats(weights: readonly WeightEntry[]): JourneyWeightStats | null {
  if (weights.length === 0) return null;
  return { starting: weights[weights.length - 1], current: weights[0], count: weights.length };
}

