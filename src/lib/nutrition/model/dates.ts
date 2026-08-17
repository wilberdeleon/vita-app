/**
 * Log dates.
 *
 * A food entry belongs to a *calendar day as the user experienced it*, not
 * to a UTC instant. Someone logging a late dinner at 11pm in Los Angeles
 * means "today", even though UTC has already rolled over. So every log date
 * is derived from the device's local calendar, and `loggedAt` keeps the
 * precise instant separately for ordering.
 *
 * Sprint 2 is about today, but nothing here is today-only — the same key
 * format supports history whenever a history screen ships.
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
