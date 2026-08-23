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
  logDateRange,
  shiftLogDate,
  toLogDate,
  todayLogDate,
  weekdayInitial,
  weekdayName,
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
   * Hardened in slice 3.2, before Water began trusting `LogDate` as a
   * persistence key. The shape test alone accepted days that do not exist,
   * which made the validator useless as a boundary against a corrupted or
   * hand-edited record — the only job it has.
   */
  it('rejects days that do not exist on the calendar', () => {
    const impossible = [
      '2026-02-29', // 2026 is not a leap year
      '2026-02-30',
      '2026-04-31', // April has 30 days
      '2026-06-31',
      '2026-09-31',
      '2026-11-31',
      '2026-13-01', // no thirteenth month
      '2026-00-10', // no zeroth month
      '2026-01-00', // no zeroth day
      '2026-01-32',
      '2026-12-32',
    ];
    for (const value of impossible) {
      expect(isValidLogDate(value)).toBe(false);
    }
  });

  it('accepts real dates, including a genuine leap day', () => {
    const real = [
      '2024-02-29', // 2024 is a leap year
      '2000-02-29', // century leap year
      '2026-02-28',
      '2026-12-31',
      '2026-01-01',
      '2026-04-30',
      '2026-06-30',
    ];
    for (const value of real) {
      expect(isValidLogDate(value)).toBe(true);
    }
  });

  it('rejects the non-leap centuries the naive rule gets wrong', () => {
    // 1900 is divisible by 4 but is not a leap year; 2000 is.
    expect(isValidLogDate('1900-02-29')).toBe(false);
    expect(isValidLogDate('2000-02-29')).toBe(true);
  });

  /**
   * The compatibility guarantee. `isValidLogDate` guards data already on
   * users' devices, so hardening it must not reject anything the app could
   * legitimately have written. Every log date VITA can produce comes from
   * `toLogDate`, so proving the validator accepts everything `toLogDate`
   * emits proves no existing food log entry or storage key was invalidated.
   */
  it('accepts every date toLogDate can produce, across four years and two leap days', () => {
    const start = new Date(2023, 0, 1);
    for (let day = 0; day < 366 * 4; day += 1) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + day);
      expect(isValidLogDate(toLogDate(date))).toBe(true);
    }
  });

  it('does not fall into the UTC parsing trap while checking the calendar', () => {
    // If the calendar check used `new Date('YYYY-MM-DD')`, the parsed value
    // would be UTC midnight and its local date would differ at negative
    // offsets — making these results timezone-dependent. They are not.
    expect(isValidLogDate('2026-01-01')).toBe(true);
    expect(isValidLogDate('2026-12-31')).toBe(true);
    expect(isValidLogDate('2026-07-01')).toBe(true);
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

describe('shiftLogDate', () => {
  it('moves forward and back by whole days', () => {
    expect(shiftLogDate('2026-08-22', 1)).toBe('2026-08-23');
    expect(shiftLogDate('2026-08-22', -1)).toBe('2026-08-21');
    expect(shiftLogDate('2026-08-22', 0)).toBe('2026-08-22');
  });

  /**
   * The cases a "subtract one from the day number" shortcut gets wrong. Going
   * through `Date` normalizes all of them.
   */
  it('crosses month, year, and leap boundaries', () => {
    expect(shiftLogDate('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftLogDate('2024-03-01', -1)).toBe('2024-02-29');
    expect(shiftLogDate('2026-01-01', -1)).toBe('2025-12-31');
    expect(shiftLogDate('2025-12-31', 1)).toBe('2026-01-01');
    expect(shiftLogDate('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('always produces a valid log date, over a long span in both directions', () => {
    for (let offset = -400; offset <= 400; offset += 37) {
      expect(isValidLogDate(shiftLogDate('2026-08-22', offset))).toBe(true);
    }
  });

  it('is reversible', () => {
    for (const days of [1, 7, 30, 365]) {
      expect(shiftLogDate(shiftLogDate('2026-08-22', days), -days)).toBe('2026-08-22');
    }
  });
});

describe('logDateRange', () => {
  it('returns consecutive days ending at the given date, oldest first', () => {
    expect(logDateRange('2026-08-22', 3)).toEqual(['2026-08-20', '2026-08-21', '2026-08-22']);
  });

  it('returns just the date itself for a window of one', () => {
    expect(logDateRange('2026-08-22', 1)).toEqual(['2026-08-22']);
  });

  it('returns nothing for a non-positive window', () => {
    expect(logDateRange('2026-08-22', 0)).toEqual([]);
    expect(logDateRange('2026-08-22', -3)).toEqual([]);
  });

  it('never repeats or skips a day', () => {
    const range = logDateRange('2026-03-03', 14);
    expect(new Set(range).size).toBe(14);
    for (let i = 1; i < range.length; i += 1) {
      expect(shiftLogDate(range[i - 1], 1)).toBe(range[i]);
    }
  });
});

describe('weekday helpers', () => {
  it('names the weekday', () => {
    expect(weekdayName('2026-08-22')).toBe('Saturday');
    expect(weekdayName('2026-08-17')).toBe('Monday');
  });

  it('gives the initial, which is deliberately ambiguous', () => {
    expect(weekdayInitial('2026-08-22')).toBe('S'); // Saturday
    expect(weekdayInitial('2026-08-16')).toBe('S'); // Sunday — same letter
    expect(weekdayInitial('2026-08-18')).toBe('T'); // Tuesday
    expect(weekdayInitial('2026-08-20')).toBe('T'); // Thursday — same letter
  });

  it('agrees with the long format for the same date', () => {
    expect(formatLogDateLong('2026-08-22').startsWith(weekdayName('2026-08-22'))).toBe(true);
  });
});
