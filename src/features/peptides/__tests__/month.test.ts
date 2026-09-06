/**
 * The monthly calendar's arithmetic and semantics.
 *
 * Two things are being protected here. The first is date correctness at month
 * boundaries — leap years, 28-day Februaries, months that start on a Sunday —
 * where a UTC-parsed date silently lands on the wrong day for half the world.
 *
 * The second matters more: **a day the schedule never covered must never look
 * like a day the user failed to answer.** That distinction is the whole
 * difference between a record and an accusation, and it is why as-needed
 * routines and start dates get their own cases below.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { toMcg, type PeptideSetup, type RoutineDayStatus } from '../../../lib/peptides';
import type { LogDate } from '../../../lib/daily';
import {
  compareMonths,
  countMonth,
  daysInMonth,
  earliestKnownMonth,
  isSameMonth,
  markForDay,
  monthGrid,
  monthLabel,
  monthOf,
  shiftMonth,
  weekAround,
} from '../month';

const CREATED = '2026-06-01T10:00:00.000Z';
/** After every date in the fixtures, so a whole month is counted. */
const ELAPSED = '2026-12-31' as LogDate;

function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    schedule: { kind: 'daily' },
    routineState: 'active',
    active: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  };
}

const status = (logDate: LogDate, state: 'taken' | 'skipped'): RoutineDayStatus => ({
  id: `rds-${logDate}`,
  setupId: 'setup-1',
  logDate,
  state,
  createdAt: CREATED,
  updatedAt: CREATED,
});

/* ── calendar arithmetic ────────────────────────────────────────────────── */

describe('the calendar', () => {
  it('names a month the way someone would say it', () => {
    expect(monthLabel({ year: 2026, month: 6 })).toBe('July 2026');
    expect(monthLabel({ year: 2026, month: 0 })).toBe('January 2026');
  });

  it('counts the days in 31-, 30- and 28-day months', () => {
    expect(daysInMonth({ year: 2026, month: 6 })).toHaveLength(31);
    expect(daysInMonth({ year: 2026, month: 8 })).toHaveLength(30);
    expect(daysInMonth({ year: 2026, month: 1 })).toHaveLength(28);
  });

  it('handles a leap-year February', () => {
    const days = daysInMonth({ year: 2028, month: 1 });
    expect(days).toHaveLength(29);
    expect(days[28]).toBe('2028-02-29');
  });

  it('never lets a date drift across a month boundary', () => {
    // `new Date('2026-07-01')` parses as UTC and lands on 30 June west of
    // London. Every date here is built locally.
    const july = daysInMonth({ year: 2026, month: 6 });
    expect(july[0]).toBe('2026-07-01');
    expect(july[30]).toBe('2026-07-31');
  });

  it('steps months across a year boundary', () => {
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(isSameMonth({ year: 2026, month: 6 }, monthOf('2026-07-15' as LogDate))).toBe(true);
  });

  it('orders months', () => {
    expect(compareMonths({ year: 2026, month: 5 }, { year: 2026, month: 6 })).toBeLessThan(0);
    expect(compareMonths({ year: 2027, month: 0 }, { year: 2026, month: 11 })).toBeGreaterThan(0);
    expect(compareMonths({ year: 2026, month: 6 }, { year: 2026, month: 6 })).toBe(0);
  });
});

describe('the grid', () => {
  it('is seven columns, Monday first, with blanks for the lead-in', () => {
    // 1 July 2026 is a Wednesday, so Monday and Tuesday lead in blank.
    const rows = monthGrid({ year: 2026, month: 6 });
    expect(rows[0]).toHaveLength(7);
    expect(rows[0][0]).toBeNull();
    expect(rows[0][1]).toBeNull();
    expect(rows[0][2]).toBe('2026-07-01');
  });

  it('starts flush when the month starts on a Monday', () => {
    // 1 June 2026 is a Monday.
    const rows = monthGrid({ year: 2026, month: 5 });
    expect(rows[0][0]).toBe('2026-06-01');
  });

  it('puts a Sunday start at the end of the first row, not the beginning', () => {
    // 1 November 2026 is a Sunday — Monday-first means six blanks before it.
    const rows = monthGrid({ year: 2026, month: 10 });
    expect(rows[0].slice(0, 6).every((cell) => cell === null)).toBe(true);
    expect(rows[0][6]).toBe('2026-11-01');
  });

  it('pads the last row and shows no neighbouring month', () => {
    const rows = monthGrid({ year: 2026, month: 6 });
    const flat = rows.flat();
    expect(flat).toHaveLength(rows.length * 7);
    // Only July's own dates, and nulls.
    for (const cell of flat) {
      if (cell !== null) expect(cell.startsWith('2026-07')).toBe(true);
    }
    expect(flat.filter((cell) => cell !== null)).toHaveLength(31);
  });

  it('agrees with the week strip about which days a week holds', () => {
    // Both are Monday-first, and the month view must not invent its own.
    expect(weekAround('2026-07-15' as LogDate)[0]).toBe('2026-07-13');
    expect(weekAround('2026-07-13' as LogDate)[0]).toBe('2026-07-13');
    expect(weekAround('2026-07-19' as LogDate)[6]).toBe('2026-07-19');
  });
});

/* ── what a day says ────────────────────────────────────────────────────── */

describe('a day of a daily routine', () => {
  const setup = setupFixture();

  it('is unanswered until it is answered', () => {
    expect(markForDay(setup, [], '2026-07-15' as LogDate)).toBe('unconfirmed');
  });

  it('reports what was recorded', () => {
    const statuses = [status('2026-07-15' as LogDate, 'taken')];
    expect(markForDay(setup, statuses, '2026-07-15' as LogDate)).toBe('taken');
    expect(markForDay(setup, [status('2026-07-16' as LogDate, 'skipped')], '2026-07-16' as LogDate)).toBe(
      'skipped',
    );
  });
});

describe('a day of a selected-days routine', () => {
  // Monday, Wednesday, Friday.
  const setup = setupFixture({ schedule: { kind: 'daysOfWeek', days: [1, 3, 5] } });

  it('is scheduled only on the chosen days', () => {
    // 13 July 2026 is a Monday, 14th a Tuesday.
    expect(markForDay(setup, [], '2026-07-13' as LogDate)).toBe('unconfirmed');
    expect(markForDay(setup, [], '2026-07-14' as LogDate)).toBe('not-scheduled');
    expect(markForDay(setup, [], '2026-07-15' as LogDate)).toBe('unconfirmed');
  });

  it('still shows an administration recorded on an unscheduled day', () => {
    // An answer always wins over the plan — an extra dose is a real event.
    const statuses = [status('2026-07-14' as LogDate, 'taken')];
    expect(markForDay(setup, statuses, '2026-07-14' as LogDate)).toBe('taken');
  });
});

describe('a day of an every-X-days routine', () => {
  const setup = setupFixture({
    schedule: { kind: 'everyNDays', n: 3 },
    startDate: '2026-07-01' as LogDate,
  });

  it('lands on the third day, and nothing between', () => {
    expect(markForDay(setup, [], '2026-07-01' as LogDate)).toBe('unconfirmed');
    expect(markForDay(setup, [], '2026-07-02' as LogDate)).toBe('not-scheduled');
    expect(markForDay(setup, [], '2026-07-04' as LogDate)).toBe('unconfirmed');
  });
});

describe('an as-needed routine', () => {
  /*
   * The case the founders singled out. An as-needed routine asks nothing of
   * any particular day, so a day with no record is **blank** — never *No
   * response*, never skipped, never missed. There is nothing to have failed.
   */
  const setup = setupFixture({ schedule: { kind: 'asNeeded' } });

  it('leaves every unlogged day blank', () => {
    for (const day of daysInMonth({ year: 2026, month: 6 })) {
      expect(markForDay(setup, [], day)).toBe('not-scheduled');
    }
  });

  it('shows only the days that were actually recorded', () => {
    const statuses = [status('2026-07-09' as LogDate, 'taken')];
    expect(markForDay(setup, statuses, '2026-07-09' as LogDate)).toBe('taken');
    expect(markForDay(setup, statuses, '2026-07-10' as LogDate)).toBe('not-scheduled');
  });

  it('counts nothing it was never asked', () => {
    const statuses = [status('2026-07-09' as LogDate, 'taken')];
    expect(countMonth(setup, statuses, { year: 2026, month: 6 }, ELAPSED)).toEqual({
      taken: 1,
      skipped: 0,
      noResponse: 0,
    });
  });
});

describe('a routine that started mid-month', () => {
  const setup = setupFixture({ startDate: '2026-07-10' as LogDate });

  it('claims nothing about the days before it existed', () => {
    // A daily routine begun on the 10th did not fail to answer the 9th.
    expect(markForDay(setup, [], '2026-07-09' as LogDate)).toBe('not-scheduled');
    expect(markForDay(setup, [], '2026-07-10' as LogDate)).toBe('unconfirmed');
  });

  it('still honours a record from before the start date', () => {
    // History is what happened, whatever the configuration says now.
    const statuses = [status('2026-07-05' as LogDate, 'taken')];
    expect(markForDay(setup, statuses, '2026-07-05' as LogDate)).toBe('taken');
  });

  it('counts only from the start', () => {
    const counts = countMonth(setup, [], { year: 2026, month: 6 }, ELAPSED);
    // 10–31 July inclusive is 22 days.
    expect(counts.noResponse).toBe(22);
    expect(counts.taken).toBe(0);
    expect(counts.skipped).toBe(0);
  });
});

/* ── the summary ────────────────────────────────────────────────────────── */

describe('the month summary', () => {
  it('counts three states and nothing else', () => {
    const setup = setupFixture({ schedule: { kind: 'daysOfWeek', days: [1, 3, 5] } });
    const statuses = [
      status('2026-07-01' as LogDate, 'taken'),
      status('2026-07-03' as LogDate, 'skipped'),
      status('2026-07-06' as LogDate, 'taken'),
    ];
    const counts = countMonth(setup, statuses, { year: 2026, month: 6 }, ELAPSED);

    expect(counts.taken).toBe(2);
    expect(counts.skipped).toBe(1);
    // July 2026 has 14 Mon/Wed/Fri days; three were answered.
    expect(counts.noResponse).toBe(11);
  });

  it('never counts an unscheduled day as anything', () => {
    const setup = setupFixture({ schedule: { kind: 'daysOfWeek', days: [1] } });
    const counts = countMonth(setup, [], { year: 2026, month: 6 }, ELAPSED);
    // Only the Mondays are counted; the other 27 days are not a denominator.
    expect(counts.taken + counts.skipped + counts.noResponse).toBe(4);
  });

  it('counts nothing that has not happened yet', () => {
    /*
     * A scheduled day still to come is drawn on the calendar — the plan
     * ahead is real — but nobody has failed to answer a day that has not
     * arrived. Counting the rest of the month would turn a plan into an
     * accusation.
     */
    const setup = setupFixture();
    const partway = countMonth(setup, [], { year: 2026, month: 6 }, '2026-07-10' as LogDate);
    expect(partway.noResponse).toBe(10);

    const whole = countMonth(setup, [], { year: 2026, month: 6 }, ELAPSED);
    expect(whole.noResponse).toBe(31);
  });

  it('reports an empty month as three zeroes, not as a failure', () => {
    const setup = setupFixture({ schedule: { kind: 'asNeeded' } });
    expect(countMonth(setup, [], { year: 2026, month: 6 }, ELAPSED)).toEqual({
      taken: 0,
      skipped: 0,
      noResponse: 0,
    });
  });
});

/* ── how far back it can honestly go ────────────────────────────────────── */

describe('the earliest month it can speak about', () => {
  const today = '2026-09-05' as LogDate;

  it('is the current month when nothing has been recorded', () => {
    // A calendar that scrolled back through months it knows nothing about
    // would render invented unanswered days.
    expect(earliestKnownMonth([], [], 'setup-1', today)).toEqual({ year: 2026, month: 8 });
  });

  it('reaches back to the oldest record the provider holds', () => {
    const statuses = [status('2026-07-12' as LogDate, 'taken'), status('2026-08-02' as LogDate, 'taken')];
    expect(earliestKnownMonth(statuses, [], 'setup-1', today)).toEqual({ year: 2026, month: 6 });
  });

  it('ignores another routine history', () => {
    const other: RoutineDayStatus = { ...status('2026-05-01' as LogDate, 'taken'), setupId: 'other' };
    expect(earliestKnownMonth([other], [], 'setup-1', today)).toEqual({ year: 2026, month: 8 });
  });
});
