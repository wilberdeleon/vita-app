/**
 * The Journey lifecycle domain (slice 6.5) — pure, with "today" injected so
 * nothing here races the clock.
 */

import {
  activeJourney,
  addCalendarMonths,
  addJourney,
  calendarDaysBetween,
  canExtendTo,
  completeJourney,
  createJourney,
  earliestExtension,
  elapsedDays,
  extendJourney,
  journeyProgress,
  normalizeJourneyName,
  pastJourneys,
  plannedDays,
  plannedEndFor,
  JOURNEY_NAME_MAX,
  type Journey,
} from '../model/journeys';

const NOW = new Date(2026, 9, 28, 9, 30); // Oct 28 2026, 9:30 local

function make(overrides: Partial<Journey> = {}): Journey {
  return {
    id: 'j1',
    name: 'Summer Transformation',
    startDate: '2026-10-28',
    plannedEndDate: '2026-11-26',
    status: 'active',
    createdAt: NOW.toISOString(),
    ...overrides,
  };
}

describe('names', () => {
  it('are trimmed, inner whitespace collapsed, and required', () => {
    expect(normalizeJourneyName('  Summer   Transformation ')).toBe('Summer Transformation');
    expect(normalizeJourneyName('')).toBeNull();
    expect(normalizeJourneyName('    ')).toBeNull();
  });

  it(`are at most ${JOURNEY_NAME_MAX} characters`, () => {
    expect(normalizeJourneyName('x'.repeat(JOURNEY_NAME_MAX))).toHaveLength(JOURNEY_NAME_MAX);
    expect(normalizeJourneyName('x'.repeat(JOURNEY_NAME_MAX + 1))).toBeNull();
  });
});

describe('creating a Journey', () => {
  it('starts today, is active, has a stable id and stores only facts', () => {
    const journey = createJourney({ name: ' Marathon Prep ', plannedEndDate: '2027-01-25', now: NOW });
    expect(journey).toEqual({
      id: expect.stringMatching(/^journey_/),
      name: 'Marathon Prep',
      startDate: '2026-10-28',
      plannedEndDate: '2027-01-25',
      status: 'active',
      createdAt: NOW.toISOString(),
    });
  });

  it('gives every Journey its own id', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createJourney({ name: 'A', plannedEndDate: '2027-01-01', now: NOW }).id));
    expect(ids.size).toBe(100);
  });

  it('refuses a missing name, and an end that is not after today', () => {
    expect(() => createJourney({ name: '  ', plannedEndDate: '2027-01-01', now: NOW })).toThrow();
    expect(() => createJourney({ name: 'A', plannedEndDate: '2026-10-28', now: NOW })).toThrow();
    expect(() => createJourney({ name: 'A', plannedEndDate: '2026-10-01', now: NOW })).toThrow();
    expect(() => createJourney({ name: 'A', plannedEndDate: 'nonsense', now: NOW })).toThrow();
  });
});

describe('durations are inclusive calendar days', () => {
  it.each([
    ['30d', '2026-11-26', 30],
    ['60d', '2026-12-26', 60],
    ['90d', '2027-01-25', 90],
    ['6m', '2027-04-27', 182],
  ] as const)('%s from Oct 28 ends %s (%i days)', (preset, end, days) => {
    expect(plannedEndFor(preset, '2026-10-28')).toBe(end);
    expect(plannedDays({ startDate: '2026-10-28', plannedEndDate: end })).toBe(days);
  });

  it('six months from the 31st clamps to the month’s last day', () => {
    expect(addCalendarMonths('2026-08-31', 6)).toBe('2027-02-28');
    expect(addCalendarMonths('2027-08-31', 6)).toBe('2028-02-29'); // leap year
  });

  it('counts whole days across a daylight-saving change and a leap day', () => {
    expect(calendarDaysBetween('2026-10-28', '2026-11-05')).toBe(8); // US DST ends Nov 1
    expect(calendarDaysBetween('2028-02-28', '2028-03-01')).toBe(2);
    expect(calendarDaysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });
});

describe('Day X of Y', () => {
  const journey = make(); // Oct 28 → Nov 26, 30 days

  it('the start date is Day 1', () => {
    expect(journeyProgress(journey, '2026-10-28')).toEqual({ day: 1, totalDays: 30, remainingDays: 29, fraction: 1 / 30, endReached: false });
  });

  it('a middle day', () => {
    expect(journeyProgress(journey, '2026-11-11')).toMatchObject({ day: 15, remainingDays: 15, endReached: false });
  });

  it('the planned end date is Day 30, with the end reached', () => {
    expect(journeyProgress(journey, '2026-11-26')).toEqual({ day: 30, totalDays: 30, remainingDays: 0, fraction: 1, endReached: true });
  });

  it('after the planned end the day keeps counting and the rail stays full', () => {
    expect(journeyProgress(journey, '2026-12-01')).toMatchObject({ day: 35, totalDays: 30, remainingDays: 0, fraction: 1, endReached: true });
  });

  it('uses calendar days, not instants — a timezone cannot move the day', () => {
    // Same LogDates regardless of the device offset: the inputs are strings.
    expect(journeyProgress(journey, '2026-11-01').day).toBe(5);
  });
});

describe('one active Journey at a time', () => {
  it('a second active Journey is refused', () => {
    const first = make();
    expect(() => addJourney([first], make({ id: 'j2' }))).toThrow();
  });

  it('a new Journey may start once the active one is finished', () => {
    const finished = completeJourney(make(), NOW);
    expect(addJourney([finished], make({ id: 'j2' }))).toHaveLength(2);
  });

  it('active and past are derived, never stored', () => {
    const a = completeJourney(make({ id: 'a' }), new Date(2026, 9, 1));
    const b = completeJourney(make({ id: 'b' }), new Date(2026, 9, 20));
    const c = make({ id: 'c' });
    expect(activeJourney([a, b, c])?.id).toBe('c');
    expect(pastJourneys([a, b, c]).map((j) => j.id)).toEqual(['b', 'a']);
    expect(activeJourney([a, b])).toBeNull();
  });
});

describe('extending', () => {
  it('moves the planned end and records that it moved — same id, start and status', () => {
    const journey = make();
    const at = new Date(2026, 10, 10, 18, 5);
    const extended = extendJourney(journey, '2026-12-26', '2026-11-10', at);
    expect(extended).toEqual({
      ...journey,
      plannedEndDate: '2026-12-26',
      extensions: [{ id: expect.stringMatching(/^extension_/), extendedAt: at.toISOString(), previousPlannedEndDate: '2026-11-26', newPlannedEndDate: '2026-12-26' }],
    });
    expect(journeyProgress(extended, '2026-11-10')).toMatchObject({ day: 14, totalDays: 60 });
  });

  it('must end after the current end, and after today once the end has passed', () => {
    const journey = make();
    expect(earliestExtension(journey, '2026-11-10')).toBe('2026-11-27');
    expect(canExtendTo(journey, '2026-11-26', '2026-11-10')).toBe(false);
    expect(earliestExtension(journey, '2026-12-05')).toBe('2026-12-06');
    expect(canExtendTo(journey, '2026-12-01', '2026-12-05')).toBe(false);
    expect(canExtendTo(journey, '2026-12-06', '2026-12-05')).toBe(true);
  });

  it('a completed Journey cannot be extended', () => {
    const done = completeJourney(make(), NOW);
    expect(canExtendTo(done, '2027-06-01', '2026-11-01')).toBe(false);
    expect(() => extendJourney(done, '2027-06-01', '2026-11-01')).toThrow();
  });
});

describe('finishing', () => {
  it('stores completion as an event and keeps everything else', () => {
    const done = completeJourney(make(), new Date(2026, 10, 3, 18));
    expect(done.status).toBe('completed');
    expect(done.completedAt).toBe(new Date(2026, 10, 3, 18).toISOString());
    expect(done.plannedEndDate).toBe('2026-11-26');
    expect(elapsedDays(done, '2027-01-01')).toBe(7); // Oct 28 → Nov 3, inclusive
  });

  it('finishing twice is refused', () => {
    expect(() => completeJourney(completeJourney(make(), NOW), NOW)).toThrow();
  });

  it('nothing completes on its own — the domain has no notion of auto-finish', () => {
    // Past the planned end, the Journey is still active until the user finishes it.
    const journey = make();
    expect(journeyProgress(journey, '2027-03-01').endReached).toBe(true);
    expect(journey.status).toBe('active');
    expect(activeJourney([journey])?.id).toBe('j1');
  });
});
