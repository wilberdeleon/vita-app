/**
 * Schedules the user chose for themselves.
 *
 * The assertion that matters most is linguistic: **nothing here produces the
 * word "due"**, and nothing describes a day as missed. That is a founder-set
 * rule for this sprint, and a label is exactly the place it would erode first.
 */

import {
  isPeptideSchedule,
  isScheduledOn,
  scheduleLabel,
  sortedDays,
  weekdayLong,
  weekdayShort,
} from '../model/schedule';
import type { PeptideSchedule } from '../model/types';

describe('isPeptideSchedule', () => {
  it('accepts the four supported shapes', () => {
    const valid: PeptideSchedule[] = [
      { kind: 'daily' },
      { kind: 'asNeeded' },
      { kind: 'daysOfWeek', days: [1, 3, 5] },
      { kind: 'everyNDays', n: 3 },
    ];
    for (const schedule of valid) {
      expect(isPeptideSchedule(schedule)).toBe(true);
    }
  });

  it('rejects an unknown kind', () => {
    expect(isPeptideSchedule({ kind: 'weekly' })).toBe(false);
    expect(isPeptideSchedule({})).toBe(false);
    expect(isPeptideSchedule(null)).toBe(false);
    expect(isPeptideSchedule('daily')).toBe(false);
  });

  it('rejects invalid weekday sets', () => {
    // Empty is not a schedule; out-of-range and duplicates are corruption.
    expect(isPeptideSchedule({ kind: 'daysOfWeek', days: [] })).toBe(false);
    expect(isPeptideSchedule({ kind: 'daysOfWeek', days: [7] })).toBe(false);
    expect(isPeptideSchedule({ kind: 'daysOfWeek', days: [-1] })).toBe(false);
    expect(isPeptideSchedule({ kind: 'daysOfWeek', days: [1, 1] })).toBe(false);
    expect(isPeptideSchedule({ kind: 'daysOfWeek', days: [1.5] })).toBe(false);
    expect(isPeptideSchedule({ kind: 'daysOfWeek', days: 'Monday' })).toBe(false);
  });

  it('rejects an every-N-days interval below two', () => {
    // "Every 1 day" is Daily, and "every 0 days" is nothing at all.
    expect(isPeptideSchedule({ kind: 'everyNDays', n: 1 })).toBe(false);
    expect(isPeptideSchedule({ kind: 'everyNDays', n: 0 })).toBe(false);
    expect(isPeptideSchedule({ kind: 'everyNDays', n: -3 })).toBe(false);
    expect(isPeptideSchedule({ kind: 'everyNDays', n: 2.5 })).toBe(false);
    expect(isPeptideSchedule({ kind: 'everyNDays', n: Number.NaN })).toBe(false);
    expect(isPeptideSchedule({ kind: 'everyNDays' })).toBe(false);
  });
});

describe('scheduleLabel', () => {
  it('describes each kind plainly', () => {
    expect(scheduleLabel({ kind: 'daily' })).toBe('Daily');
    expect(scheduleLabel({ kind: 'asNeeded' })).toBe('As needed');
    expect(scheduleLabel({ kind: 'everyNDays', n: 3 })).toBe('Every 3 days');
    expect(scheduleLabel({ kind: 'daysOfWeek', days: [1, 3, 5] })).toBe('Mon, Wed, Fri');
  });

  it('orders weekdays by the week, not by the order they were tapped', () => {
    expect(scheduleLabel({ kind: 'daysOfWeek', days: [5, 1, 3] })).toBe('Mon, Wed, Fri');
  });

  it('is null when no schedule is set — a valid state', () => {
    expect(scheduleLabel(undefined)).toBeNull();
  });

  /**
   * The founder-set language rule. "Due" asserts an obligation VITA has no
   * standing to assert; the user entered a schedule, and the app reflects it.
   */
  it('never produces adherence or obligation language', () => {
    const labels = [
      scheduleLabel({ kind: 'daily' }),
      scheduleLabel({ kind: 'asNeeded' }),
      scheduleLabel({ kind: 'everyNDays', n: 3 }),
      scheduleLabel({ kind: 'daysOfWeek', days: [0, 6] }),
    ].join(' ').toLowerCase();

    for (const word of ['due', 'missed', 'overdue', 'required', 'must', 'adherence', 'streak', 'skipped']) {
      expect(labels).not.toContain(word);
    }
  });
});

describe('weekday helpers', () => {
  it('maps Sunday-zero indexes to names', () => {
    expect(weekdayShort(0)).toBe('Sun');
    expect(weekdayShort(6)).toBe('Sat');
    expect(weekdayLong(0)).toBe('Sunday');
    expect(weekdayLong(1)).toBe('Monday');
    expect(weekdayLong(6)).toBe('Saturday');
  });

  it('agrees between the short and long forms', () => {
    for (let day = 0; day <= 6; day += 1) {
      expect(weekdayLong(day).startsWith(weekdayShort(day))).toBe(true);
    }
  });

  it('sorts days without mutating the input', () => {
    const days = [5, 1, 3];
    expect(sortedDays(days)).toEqual([1, 3, 5]);
    expect(days).toEqual([5, 1, 3]);
  });
});

describe('isScheduledOn', () => {
  const SATURDAY = '2026-08-22';
  const SUNDAY = '2026-08-23';

  it('is false with no schedule', () => {
    expect(isScheduledOn(undefined, SATURDAY)).toBe(false);
  });

  it('is true every day for daily', () => {
    expect(isScheduledOn({ kind: 'daily' }, SATURDAY)).toBe(true);
    expect(isScheduledOn({ kind: 'daily' }, SUNDAY)).toBe(true);
  });

  it('is false for as-needed — the user decides, not a rule', () => {
    expect(isScheduledOn({ kind: 'asNeeded' }, SATURDAY)).toBe(false);
  });

  it('matches the chosen weekdays using local calendar semantics', () => {
    expect(isScheduledOn({ kind: 'daysOfWeek', days: [6] }, SATURDAY)).toBe(true);
    expect(isScheduledOn({ kind: 'daysOfWeek', days: [6] }, SUNDAY)).toBe(false);
    expect(isScheduledOn({ kind: 'daysOfWeek', days: [0] }, SUNDAY)).toBe(true);
  });

  describe('everyNDays', () => {
    it('counts from the start date', () => {
      const every3: PeptideSchedule = { kind: 'everyNDays', n: 3 };
      expect(isScheduledOn(every3, '2026-08-01', '2026-08-01')).toBe(true);
      expect(isScheduledOn(every3, '2026-08-02', '2026-08-01')).toBe(false);
      expect(isScheduledOn(every3, '2026-08-04', '2026-08-01')).toBe(true);
      expect(isScheduledOn(every3, '2026-08-07', '2026-08-01')).toBe(true);
    });

    /**
     * Without a start date there is no anchor. Inventing one — today, or the
     * setup's creation date — would make the app assert a schedule the user
     * never described.
     */
    it('is false without a start date rather than guessing an anchor', () => {
      expect(isScheduledOn({ kind: 'everyNDays', n: 3 }, '2026-08-04')).toBe(false);
    });

    it('is false before the start date', () => {
      expect(isScheduledOn({ kind: 'everyNDays', n: 3 }, '2026-07-31', '2026-08-01')).toBe(false);
    });

    it('stays correct across a month boundary and a long span', () => {
      const every2: PeptideSchedule = { kind: 'everyNDays', n: 2 };
      expect(isScheduledOn(every2, '2026-09-01', '2026-08-30')).toBe(true);
      expect(isScheduledOn(every2, '2026-09-02', '2026-08-30')).toBe(false);
      // 60 days on from an even-interval start is still on-cycle.
      expect(isScheduledOn(every2, '2026-10-29', '2026-08-30')).toBe(true);
    });
  });
});
