/**
 * The routine-day model.
 *
 * Two rules carry the weight here, and both are about what VITA is not
 * allowed to claim: a schedule never becomes an administration, and silence
 * never becomes an answer.
 */

import {
  ROUTINE_DAY_STATES,
  createRoutineStatus,
  isRoutineDayState,
  isRoutineState,
  parseRoutineStatus,
  routineDayMark,
  routineDayMarkLabel,
  routineDayMarkSymbol,
  routineStateFromLegacyActive,
  statusFor,
  statusesForSetup,
  type RoutineDayStatus,
} from '../model/routine';

const AT = new Date('2026-08-26T10:00:00.000Z');

const status = (overrides: Partial<RoutineDayStatus> = {}): RoutineDayStatus => ({
  ...createRoutineStatus('setup-1', '2026-08-26', 'taken', {}, AT),
  ...overrides,
});

describe('a schedule is a plan, never an administration', () => {
  it('reports an unanswered scheduled day as unconfirmed, not as taken', () => {
    expect(
      routineDayMark({ schedule: { kind: 'daily' }, logDate: '2026-08-26' }),
    ).toBe('unconfirmed');
  });

  it('offers no way to write an unconfirmed status at all', () => {
    // The absence *is* the model. If "unconfirmed" were storable, something
    // would eventually decide when to write it, and every such moment turns
    // silence into an assertion.
    expect(ROUTINE_DAY_STATES).toEqual(['taken', 'skipped']);
    expect(isRoutineDayState('unconfirmed')).toBe(false);
    expect(isRoutineDayState('missed')).toBe(false);
  });

  it('reports a day the schedule does not cover as not scheduled', () => {
    expect(
      routineDayMark({ schedule: { kind: 'daysOfWeek', days: [1] }, logDate: '2026-08-26' }),
    ).toBe('not-scheduled');
  });

  it('never treats an As Needed routine as planned', () => {
    expect(routineDayMark({ schedule: { kind: 'asNeeded' }, logDate: '2026-08-26' })).toBe(
      'not-scheduled',
    );
  });

  it('never treats a routine with no schedule as planned', () => {
    expect(routineDayMark({ logDate: '2026-08-26' })).toBe('not-scheduled');
  });
});

describe('an answer outranks the plan', () => {
  it('shows taken on a day the schedule did not cover', () => {
    // An extra administration is a real event. Hiding it because the calendar
    // disagreed would prefer the plan over the truth.
    expect(
      routineDayMark({
        schedule: { kind: 'daysOfWeek', days: [1] },
        logDate: '2026-08-26',
        status: status({ state: 'taken' }),
      }),
    ).toBe('taken');
  });

  it('shows skipped where the plan said scheduled', () => {
    expect(
      routineDayMark({
        schedule: { kind: 'daily' },
        logDate: '2026-08-26',
        status: status({ state: 'skipped' }),
      }),
    ).toBe('skipped');
  });
});

describe('nothing is scored, and nothing means only a colour', () => {
  it('calls an unanswered day "No response", never missed or overdue', () => {
    expect(routineDayMarkLabel('unconfirmed')).toBe('No response');
    for (const mark of ['taken', 'skipped', 'unconfirmed', 'not-scheduled'] as const) {
      expect(routineDayMarkLabel(mark).toLowerCase()).not.toMatch(
        /missed|overdue|due|late|bad|fail/,
      );
    }
  });

  it('gives every state a distinct glyph so meaning survives without colour', () => {
    const symbols = (['taken', 'skipped', 'unconfirmed'] as const).map(routineDayMarkSymbol);
    expect(new Set(symbols).size).toBe(3);
    // Not a cross: skipping on purpose is not an error.
    expect(symbols).not.toContain('✗');
  });

  it('exposes no scoring or rotation helper', () => {
    const domain = require('../model/routine');
    for (const name of Object.keys(domain)) {
      expect(name.toLowerCase()).not.toMatch(
        /adherence|compliance|streak|score|missed|overdue|recommend|suggest/,
      );
    }
  });
});

describe('reading stored statuses', () => {
  it('keeps a well-formed record', () => {
    const stored = status({ state: 'skipped' });
    expect(parseRoutineStatus(stored, '2026-08-26')).toEqual(stored);
  });

  it('drops a record whose own date contradicts the day it was read from', () => {
    // Otherwise a half-written or hand-edited file could make one day's
    // answer appear on another.
    expect(parseRoutineStatus(status(), '2026-08-25')).toBeNull();
  });

  it('drops a record with an unknown state rather than guessing one', () => {
    expect(parseRoutineStatus({ ...status(), state: 'missed' }, '2026-08-26')).toBeNull();
  });

  it('drops the link but keeps the answer when linkedLogId is malformed', () => {
    const parsed = parseRoutineStatus({ ...status(), linkedLogId: 42 }, '2026-08-26');
    expect(parsed?.state).toBe('taken');
    expect(parsed?.linkedLogId).toBeUndefined();
  });

  it('rejects anything that is not a record', () => {
    for (const value of [null, undefined, 'taken', 7, []]) {
      expect(parseRoutineStatus(value, '2026-08-26')).toBeNull();
    }
  });
});

describe('routine state', () => {
  it('maps a legacy setup by its active flag, never to needs-setup', () => {
    expect(routineStateFromLegacyActive(true)).toBe('active');
    expect(routineStateFromLegacyActive(false)).toBe('inactive');
  });

  it('guards states without walking the prototype chain', () => {
    expect(isRoutineState('toString')).toBe(false);
    expect(isRoutineState('removed')).toBe(false);
    for (const state of ['needs-setup', 'active', 'inactive']) {
      expect(isRoutineState(state)).toBe(true);
    }
  });
});

describe('finding statuses', () => {
  const all = [
    status({ id: 'a', setupId: 'setup-1', logDate: '2026-08-25' }),
    status({ id: 'b', setupId: 'setup-1', logDate: '2026-08-26' }),
    status({ id: 'c', setupId: 'setup-2', logDate: '2026-08-26' }),
  ];

  it("finds one routine's answer for one day", () => {
    expect(statusFor(all, 'setup-1', '2026-08-26')?.id).toBe('b');
    expect(statusFor(all, 'setup-1', '2026-08-24')).toBeUndefined();
  });

  it('lists every answer for one routine', () => {
    expect(statusesForSetup(all, 'setup-1').map((s) => s.id)).toEqual(['a', 'b']);
  });
});
