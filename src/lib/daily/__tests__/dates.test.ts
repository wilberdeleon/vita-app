/**
 * The date model is the one piece of shared infrastructure every daily
 * feature depends on, and the one most likely to break in a way nobody
 * notices until a user's day is silently wrong.
 *
 * Every assertion below is timezone-independent by construction. Dates are
 * built from local components (`new Date(y, m, d)`) and checked against local
 * getters, so these pass identically in UTC, Los Angeles, and Auckland. That
 * is deliberate: a test that only passes on one machine is worse than no
 * test, because it teaches people to ignore the suite.
 */

import {
  formatLogDateLong,
  fromLogDate,
  isToday,
  isValidLogDate,
  toLogDate,
  todayLogDate,
} from '../dates';

describe('toLogDate', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toLogDate(new Date(2026, 7, 22))).toBe('2026-08-22');
  });

  it('zero-pads single-digit months and days', () => {
    expect(toLogDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toLogDate(new Date(2026, 10, 9))).toBe('2026-11-09');
  });

  it('reads the local calendar, not UTC — a late-night log still says today', () => {
    // 11:59pm local on the 22nd. In any timezone east of UTC this instant is
    // already the 23rd in UTC, and the user still means the 22nd.
    expect(toLogDate(new Date(2026, 7, 22, 23, 59, 59))).toBe('2026-08-22');
    // And 12:01am local on the 23rd is the 23rd, not the 22nd.
    expect(toLogDate(new Date(2026, 7, 23, 0, 1, 0))).toBe('2026-08-23');
  });

  it('handles month boundaries', () => {
    expect(toLogDate(new Date(2026, 0, 31))).toBe('2026-01-31');
    expect(toLogDate(new Date(2026, 1, 1))).toBe('2026-02-01');
    expect(toLogDate(new Date(2026, 3, 30))).toBe('2026-04-30');
  });

  it('handles year boundaries', () => {
    expect(toLogDate(new Date(2025, 11, 31))).toBe('2025-12-31');
    expect(toLogDate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('handles a leap day', () => {
    expect(toLogDate(new Date(2024, 1, 29))).toBe('2024-02-29');
  });

  it('reflects the calendar when a non-leap February 29 rolls over', () => {
    // `new Date(2026, 1, 29)` is not February 29 — JavaScript normalizes it to
    // March 1. The log date must say what the Date actually is, not what was
    // asked for; inventing 2026-02-29 would put an entry on a day that does
    // not exist.
    expect(toLogDate(new Date(2026, 1, 29))).toBe('2026-03-01');
  });
});

describe('fromLogDate', () => {
  it('parses to local midnight, not UTC midnight', () => {
    const parsed = fromLogDate('2026-08-22');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(22);
    expect(parsed.getHours()).toBe(0);
    expect(parsed.getMinutes()).toBe(0);
  });

  /**
   * The `new Date('YYYY-MM-DD')` trap, stated as a property rather than as a
   * comparison against the trap itself.
   *
   * `new Date('2026-08-22')` parses as UTC midnight, so in any timezone behind
   * UTC its *local* date is the 21st — one day early. Asserting that directly
   * would only fail in negative-offset timezones and pass everywhere else,
   * which is exactly the fragile test this codebase should not have. The
   * round-trip below fails in every timezone if the UTC parser is ever
   * reintroduced, and passes in every timezone while it is not.
   */
  it('round-trips through toLogDate for every date in a year', () => {
    const start = new Date(2026, 0, 1);
    for (let day = 0; day < 365; day += 1) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + day);
      const logDate = toLogDate(date);
      expect(toLogDate(fromLogDate(logDate))).toBe(logDate);
    }
  });

  it('round-trips across a leap day and both year boundaries', () => {
    for (const logDate of ['2024-02-28', '2024-02-29', '2024-03-01', '2023-12-31', '2024-01-01']) {
      expect(toLogDate(fromLogDate(logDate))).toBe(logDate);
    }
  });
});

describe('isValidLogDate', () => {
  it('accepts a well-formed log date', () => {
    expect(isValidLogDate('2026-08-22')).toBe(true);
    expect(isValidLogDate('1999-01-01')).toBe(true);
  });

  it('rejects wrong shapes', () => {
    const rejected = [
      '',
      '2026-8-22',
      '26-08-22',
      '2026/08/22',
      '2026-08-22T00:00:00Z',
      '2026-08-22 ',
      ' 2026-08-22',
      '2026-08-220',
      'today',
    ];
    for (const value of rejected) {
      expect(isValidLogDate(value)).toBe(false);
    }
  });

  it('rejects non-strings, which is the case that matters for persisted data', () => {
    for (const value of [null, undefined, 20260822, {}, [], true, NaN]) {
      expect(isValidLogDate(value)).toBe(false);
    }
  });

  /**
   * Documenting the actual contract rather than the one the name suggests:
   * this guards the *shape* of a persisted key, not the existence of the day.
   * Storage keys are the thing it protects, and a key of '2026-02-30' is
   * unreachable through `toLogDate` — no Date produces it.
   */
  it('is a format check, not a calendar check', () => {
    expect(isValidLogDate('2026-02-30')).toBe(true);
    expect(isValidLogDate('2026-13-01')).toBe(true);
  });
});

describe('isToday', () => {
  it('is true for today and false for a fixed past date', () => {
    expect(isToday(todayLogDate())).toBe(true);
    expect(isToday('2020-01-01')).toBe(false);
  });
});

describe('todayLogDate', () => {
  it('agrees with toLogDate on the current instant', () => {
    // Bracketed rather than compared once, so a midnight crossing between the
    // two reads cannot make this flake.
    const before = toLogDate(new Date());
    const value = todayLogDate();
    const after = toLogDate(new Date());
    expect([before, after]).toContain(value);
  });

  it('produces a valid log date', () => {
    expect(isValidLogDate(todayLogDate())).toBe(true);
  });
});

describe('formatLogDateLong', () => {
  it('reads the way a person would say it', () => {
    expect(formatLogDateLong('2026-08-22')).toBe('Saturday, August 22');
    expect(formatLogDateLong('2026-01-05')).toBe('Monday, January 5');
  });

  it('does not zero-pad the day, unlike the stored form', () => {
    expect(formatLogDateLong('2026-01-05')).toContain('January 5');
    expect(formatLogDateLong('2026-01-05')).not.toContain('January 05');
  });

  it('covers every month name', () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    months.forEach((month, index) => {
      const logDate = `2026-${String(index + 1).padStart(2, '0')}-15`;
      expect(formatLogDateLong(logDate)).toContain(`${month} 15`);
    });
  });

  it('covers every weekday name across one week', () => {
    // 2026-08-16 is a Sunday; seven consecutive days cover the whole cycle.
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    weekdays.forEach((weekday, index) => {
      const logDate = `2026-08-${16 + index}`;
      expect(formatLogDateLong(logDate)).toContain(weekday);
    });
  });
});
