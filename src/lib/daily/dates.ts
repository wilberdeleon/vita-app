/**
 * Log dates — VITA's one date model, shared by every daily-tracking domain.
 *
 * A logged thing belongs to a *calendar day as the user experienced it*,
 * not to a UTC instant. Someone logging a late dinner (or a glass of water,
 * or an injection) at 11pm in Los Angeles means "today", even though UTC
 * has already rolled over. So every log date is derived from the device's
 * local calendar, and a separate `loggedAt` instant keeps ordering precise.
 *
 * Written for nutrition in Sprint 2 and promoted here unchanged in Sprint 3
 * slice 3.1, when Water and Peptides needed the same behavior. Nothing about
 * it was nutrition-specific; a second date model would only be a second set
 * of timezone bugs. `src/lib/nutrition` re-exports every name below under
 * its original name, so its public API is unaffected by the move.
 */

/** 'YYYY-MM-DD' in the device's local timezone. */
export type LogDate = string;

export function toLogDate(date: Date): LogDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayLogDate(): LogDate {
  return toLogDate(new Date());
}

/** Parse back to a local-midnight Date. Avoids `new Date('YYYY-MM-DD')`, which parses as UTC. */
export function fromLogDate(logDate: LogDate): Date {
  const [year, month, day] = logDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isToday(logDate: LogDate): boolean {
  return logDate === todayLogDate();
}

const LOG_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Guards persisted keys and stored dates, which are only as trustworthy as
 * the last write.
 *
 * Checks the calendar, not just the shape. The shape test alone accepted
 * `2026-02-29`, `2026-04-31`, and `2026-13-01` — days that do not exist.
 * That was survivable while nothing produced such a value (`toLogDate` only
 * emits real dates), but it made the validator useless as a boundary against
 * a corrupted or hand-edited record, which is the only job it has. Hardened
 * in Sprint 3 slice 3.2, before Water began trusting `LogDate` as a
 * persistence key.
 *
 * The calendar check is a local round-trip: build the date from its own
 * components and see whether it still describes itself. An impossible date
 * normalizes to a different real one — `new Date(2026, 1, 29)` is March 1 —
 * so the comparison fails. Deliberately *not* `new Date('YYYY-MM-DD')`,
 * which parses as UTC and would reject or accept dates depending on the
 * device's offset from it.
 *
 * One consequence worth naming: a year below 100 is rejected, because
 * `new Date(26, ...)` means 1926. No real log date is affected, and the
 * alternative — special-casing two-digit years — would add a branch to
 * protect values VITA can never produce.
 */
export function isValidLogDate(value: unknown): value is LogDate {
  if (typeof value !== 'string' || !LOG_DATE_PATTERN.test(value)) return false;
  return toLogDate(fromLogDate(value)) === value;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const MONTHS = [
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
] as const;

/**
 * A log date as a person reads it — "Friday, August 21".
 *
 * Written out by hand rather than via `toLocaleDateString`. VITA is a
 * US-English product today, and Hermes' Intl support varies by platform and
 * engine build; a header that silently falls back to "2026-08-21" (or
 * throws) on one device and not another is not worth the dependency for one
 * string. Swap this for Intl when localization actually ships.
 */
export function formatLogDateLong(logDate: LogDate): string {
  const date = fromLogDate(logDate);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/**
 * The same calendar day shifted by whole days, staying in local time.
 *
 * Goes through `Date` rather than arithmetic on the string because month
 * lengths, year boundaries, and leap days are exactly the cases a "subtract
 * one from the day number" shortcut gets wrong. `new Date(y, m, d - 1)`
 * normalizes all of them.
 */
export function shiftLogDate(logDate: LogDate, days: number): LogDate {
  const date = fromLogDate(logDate);
  return toLogDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
}

/** The `count` consecutive days ending at `logDate`, oldest first. */
export function logDateRange(logDate: LogDate, count: number): LogDate[] {
  if (count <= 0) return [];
  const dates: LogDate[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    dates.push(shiftLogDate(logDate, -offset));
  }
  return dates;
}

/** Full weekday name, e.g. "Saturday" — the accessible form. */
export function weekdayName(logDate: LogDate): string {
  return WEEKDAYS[fromLogDate(logDate).getDay()];
}

/**
 * Single-letter weekday, e.g. "S".
 *
 * Ambiguous on its own — Tuesday and Thursday both start with T — which is
 * why every caller must also expose `weekdayName` to assistive technology.
 * Visually the position in a fixed seven-day run disambiguates it, and the
 * single letter is what keeps seven columns legible on a phone.
 */
export function weekdayInitial(logDate: LogDate): string {
  return weekdayName(logDate).charAt(0);
}

/**
 * The clock time of an ISO timestamp, e.g. `2:15 PM`.
 *
 * Hand-formatted rather than via `toLocaleTimeString`, for the same reason
 * `formatLogDateLong` is: Hermes' Intl support varies by platform and engine
 * build, and VITA is a US-English product today.
 *
 * Promoted here in slice 3.7 because peptide administrations need it and
 * features cannot import from each other. `src/features/water` still has its
 * own copy — folding it into this one is a tidy-up for a slice that is
 * already touching Water, not for this one.
 */
export function formatClockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

/** `14:05` — what the editable time field shows and parses. */
export function toTimeInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Combines an edited local day and `HH:MM` back into an instant.
 *
 * Built from local parts rather than by parsing a composed string, so it
 * never falls into the `new Date('YYYY-MM-DD')` UTC trap the date model
 * exists to avoid. Returns `null` for anything unparseable, so a caller
 * cannot mistake a failed edit for midnight.
 */
export function fromDateAndTime(logDate: LogDate, time: string): string | null {
  if (!isValidLogDate(logDate)) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const [year, month, day] = logDate.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}
