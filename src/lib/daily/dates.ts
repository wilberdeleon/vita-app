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

/** Guards persisted keys, which are only as trustworthy as the last write. */
export function isValidLogDate(value: unknown): value is LogDate {
  return typeof value === 'string' && LOG_DATE_PATTERN.test(value);
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
