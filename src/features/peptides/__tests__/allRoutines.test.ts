/**
 * The all-routines month, as arithmetic.
 *
 * `PeptideActivity.test.tsx` drives the screen; this pins the selectors
 * underneath it, where the states that are awkward to reach through a
 * calendar — a routine that starts mid-month, a day already past, a day still
 * to come — are one function call away.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { shiftLogDate, todayLogDate, toLogDate, type LogDate } from '../../../lib/daily';
import {
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type ResolvedSetup,
  type RoutineDayStatus,
} from '../../../lib/peptides';
import { countAllRoutines, monthActivityByDay, spokenDayActivity } from '../allRoutines';
import { daysInMonth, monthOf } from '../month';

const TODAY = todayLogDate();
const MONTH = monthOf(TODAY);
const CREATED = '2026-08-25T10:00:00.000Z';

/** A day in this month that has definitely already happened. */
const PAST = daysInMonth(MONTH)[0] < TODAY ? daysInMonth(MONTH)[0] : TODAY;

function routine(id: string, overrides: Partial<PeptideSetup> = {}): ResolvedSetup {
  const setup = {
    id,
    definitionId: 'catalog:retatrutide',
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    schedule: { kind: 'daily' },
    routineState: 'active',
    active: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  } as PeptideSetup;

  return {
    setup,
    definition: { id: setup.definitionId, name: `Compound ${id}` } as never,
    name: `Compound ${id}`,
    scheduleLabel: 'Daily',
    routineState: setup.routineState,
  };
}

const status = (
  setupId: string,
  state: 'taken' | 'skipped',
  logDate: LogDate,
): RoutineDayStatus => ({
  id: `rds-${setupId}-${logDate}-${state}`,
  setupId,
  logDate,
  state,
  createdAt: CREATED,
  updatedAt: CREATED,
});

const logEntry = (id: string, setupId: string, logDate: LogDate): PeptideLogEntry =>
  ({
    id,
    setupId,
    definitionId: 'catalog:retatrutide',
    logDate,
    loggedAt: `${logDate}T09:00:00.000Z`,
    amount: { amountMcg: toMcg(1, 'mg'), authoredUnit: 'mg' },
    createdAt: CREATED,
    updatedAt: CREATED,
  }) as PeptideLogEntry;

describe('gathering a day', () => {
  it('keeps every routine’s answer separate', async () => {
    const byDay = monthActivityByDay(
      [routine('a'), routine('b'), routine('c')],
      [status('a', 'taken', PAST), status('b', 'skipped', PAST)],
      [],
      MONTH,
      TODAY,
    );

    const day = byDay.get(PAST)!;
    expect(day.events).toHaveLength(3);
    expect(day.taken).toBe(1);
    expect(day.skipped).toBe(1);
    // The third routine is scheduled and unanswered — a real third state.
    expect(day.noResponse).toBe(1);
  });

  it('attaches each routine’s own logs, and only its own', () => {
    const byDay = monthActivityByDay(
      [routine('a'), routine('b')],
      [status('a', 'taken', PAST), status('b', 'taken', PAST)],
      [logEntry('l1', 'a', PAST), logEntry('l2', 'b', PAST), logEntry('l3', 'a', PAST)],
      MONTH,
      TODAY,
    );

    const events = byDay.get(PAST)!.events;
    expect(events.find((event) => event.setupId === 'a')!.logs).toHaveLength(2);
    expect(events.find((event) => event.setupId === 'b')!.logs).toHaveLength(1);
  });

  it('omits a day no routine has anything to say about', () => {
    // As-needed with no log: nothing was asked, so nothing is missing.
    const byDay = monthActivityByDay(
      [routine('a', { schedule: { kind: 'asNeeded' } })],
      [],
      [],
      MONTH,
      TODAY,
    );
    expect(byDay.size).toBe(0);
  });

  it('records an as-needed day that was actually used', () => {
    const byDay = monthActivityByDay(
      [routine('a', { schedule: { kind: 'asNeeded' } })],
      [status('a', 'taken', PAST)],
      [logEntry('l1', 'a', PAST)],
      MONTH,
      TODAY,
    );
    expect(byDay.get(PAST)!.taken).toBe(1);
    expect(byDay.size).toBe(1);
  });

  it('says nothing about days before a routine started', () => {
    const days = daysInMonth(MONTH);
    const start = days[days.length - 1];
    // `start` stands in for today, so the month runs right up to it.
    const byDay = monthActivityByDay([routine('a', { startDate: start })], [], [], MONTH, start);

    for (const day of days.slice(0, -1)) expect(byDay.has(day)).toBe(false);
    expect(byDay.has(start)).toBe(true);
  });

  it('stops at today rather than drawing the rest of the month unanswered', () => {
    /*
     * Founder device QA of the all-routines calendar, 5.5C: three routines
     * put three grey marks on each of twenty-four days still to come, so two
     * thirds of September rendered as unanswered. Nobody has failed to answer
     * a day that has not arrived — and multiplied across routines it read as
     * a wall of failure rather than as a plan.
     */
    const days = daysInMonth(MONTH);
    const midMonth = days[9];
    const byDay = monthActivityByDay([routine('a'), routine('b')], [], [], MONTH, midMonth);

    for (const day of days.slice(10)) expect(byDay.has(day)).toBe(false);
    expect(byDay.has(midMonth)).toBe(true);
    // The elapsed days are untouched — this bounds the month, not the marks.
    expect(byDay.get(midMonth)!.noResponse).toBe(2);
  });

  it('honours a routine’s own answer over its schedule', () => {
    /*
     * Someone can record a dose on a day their schedule does not cover. That
     * is a real event, not something to hide.
     */
    const byDay = monthActivityByDay(
      [routine('a', { schedule: { kind: 'daysOfWeek', days: [] } })],
      [status('a', 'taken', PAST)],
      [],
      MONTH,
      TODAY,
    );
    expect(byDay.get(PAST)!.taken).toBe(1);
  });
});

describe('counting the month', () => {
  it('counts events, not days', () => {
    const byDay = monthActivityByDay(
      [
        routine('a', { schedule: { kind: 'asNeeded' } }),
        routine('b', { schedule: { kind: 'asNeeded' } }),
      ],
      [status('a', 'taken', PAST), status('b', 'taken', PAST)],
      [],
      MONTH,
      TODAY,
    );

    expect(countAllRoutines(byDay)).toEqual({ taken: 2, skipped: 0, noResponse: 0 });
  });

  it('stops at today, so a plan is never counted as a failure', () => {
    const days = daysInMonth(MONTH);
    const byDay = monthActivityByDay([routine('a')], [], [], MONTH, TODAY);

    const counts = countAllRoutines(byDay);
    const elapsed = days.filter((day) => day <= TODAY).length;

    // Every elapsed day is unanswered; nothing after today is counted at all.
    expect(counts.noResponse).toBe(elapsed);
    expect(counts.taken).toBe(0);
    expect(counts.skipped).toBe(0);
  });

  it('produces no total, rate or proportion', () => {
    const counts = countAllRoutines(
      monthActivityByDay([routine('a')], [status('a', 'taken', PAST)], [], MONTH, TODAY),
    );
    expect(Object.keys(counts).sort()).toEqual(['noResponse', 'skipped', 'taken']);
  });

  it('is empty when there are no routines at all', () => {
    const byDay = monthActivityByDay([], [], [], MONTH, TODAY);
    expect(byDay.size).toBe(0);
    expect(countAllRoutines(byDay)).toEqual({ taken: 0, skipped: 0, noResponse: 0 });
  });
});

describe('what a day is spoken as', () => {
  it('names the count and the states, not the routines', () => {
    const byDay = monthActivityByDay(
      [routine('a'), routine('b'), routine('c')],
      [status('a', 'taken', PAST), status('b', 'taken', PAST), status('c', 'skipped', PAST)],
      [],
      MONTH,
      TODAY,
    );

    expect(spokenDayActivity(byDay.get(PAST)!)).toBe('3 routine events: 2 taken, 1 skipped');
  });

  it('uses the singular for one', () => {
    const byDay = monthActivityByDay(
      [routine('a', { schedule: { kind: 'asNeeded' } })],
      [status('a', 'skipped', PAST)],
      [],
      MONTH,
      TODAY,
    );
    expect(spokenDayActivity(byDay.get(PAST)!)).toBe('1 routine event: 1 skipped');
  });

  it('mentions only the states that occurred', () => {
    const byDay = monthActivityByDay(
      [routine('a', { schedule: { kind: 'asNeeded' } })],
      [status('a', 'taken', PAST)],
      [],
      MONTH,
      TODAY,
    );
    const spoken = spokenDayActivity(byDay.get(PAST)!);
    expect(spoken).not.toContain('0 skipped');
    expect(spoken).not.toContain('no response');
  });
});

describe('the month boundary', () => {
  it('never reaches into the month either side of it', () => {
    const days = daysInMonth(MONTH);
    const before = shiftLogDate(days[0], -1);
    const after = shiftLogDate(days[days.length - 1], 1);

    const byDay = monthActivityByDay(
      [routine('a', { schedule: { kind: 'asNeeded' } })],
      [status('a', 'taken', before), status('a', 'taken', after)],
      [],
      MONTH,
      TODAY,
    );
    expect(byDay.size).toBe(0);
  });

  it('handles a month that starts on any weekday', () => {
    // The UTC-parsing trap: `new Date('2026-07-01')` lands on 30 June for
    // anyone west of London, which would shift a whole month by a day.
    const july = { year: 2026, month: 6 };
    const days = daysInMonth(july);
    expect(days).toHaveLength(31);
    expect(days[0]).toBe(toLogDate(new Date(2026, 6, 1)));
  });
});
