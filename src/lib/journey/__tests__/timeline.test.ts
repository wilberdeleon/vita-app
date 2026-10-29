/**
 * The Journey Timeline (slice 6.7) — derived from Journey, weigh-ins and
 * photos; never stored. Pure, with "today" injected.
 */

import { fromLogDate, shiftLogDate } from '../../daily/dates';
import type { Journey } from '../model/journeys';
import { compareTimeline, deriveJourneyTimeline, type JourneyTimelineItem } from '../model/timeline';
import type { WeightEntry } from '../model/types';

const START = '2026-09-01';

function journey(overrides: Partial<Journey> = {}): Journey {
  return {
    id: 'j1',
    name: 'Summer',
    startDate: START,
    plannedEndDate: '2026-11-29',
    status: 'active',
    createdAt: new Date(2026, 8, 1, 9, 30).toISOString(),
    ...overrides,
  };
}

/** Local instant `day` days after the start, at `hour:minute`. */
function on(day: number, hour = 8, minute = 0): string {
  const date = fromLogDate(shiftLogDate(START, day));
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function weight(id: string, at: string, journeyId: string | null = 'j1', kg = 80): WeightEntry {
  return { id, loggedAt: at, weightKg: kg, enteredUnit: 'kg', ...(journeyId ? { journeyId } : {}) };
}

const photo = (id: string, takenAt: string, journeyId = 'j1') => ({ id, takenAt, journeyId });

const keys = (items: JourneyTimelineItem[]) => items.map((item) => item.key);
const kinds = (items: JourneyTimelineItem[]) => items.map((item) => (item.kind === 'milestone' ? item.milestone : item.kind));

function derive(opts: { journey?: Journey; weights?: WeightEntry[]; photos?: ReturnType<typeof photo>[]; today?: string } = {}) {
  return deriveJourneyTimeline({
    journey: opts.journey ?? journey(),
    weights: opts.weights ?? [],
    photos: opts.photos ?? [],
    today: opts.today ?? shiftLogDate(START, 10),
  });
}

describe('sources', () => {
  it('a new Journey: Journey began and its starting weight — no "first weigh-in" duplicate', () => {
    const items = derive({ weights: [weight('w1', on(0, 9, 30))] });
    expect(kinds(items)).toEqual(['weight', 'began']);
    expect(items[1]).toEqual({ kind: 'began', key: 'j1:began', at: fromLogDate(START).toISOString(), precision: 'day', day: START });
    expect(items[0]).toMatchObject({ kind: 'weight', key: 'weight:w1', at: on(0, 9, 30), precision: 'instant', entryId: 'w1', weightKg: 80 });
  });

  it('weigh-ins and photos are newest first; the first photo carries the "first" marker instead of a second item', () => {
    const items = derive({
      weights: [weight('w1', on(0)), weight('w2', on(3))],
      photos: [photo('p2', on(5)), photo('p1', on(2))],
    });
    expect(keys(items)).toEqual(['photo:p2', 'weight:w2', 'photo:p1', 'weight:w1', 'j1:began']);
    expect(items.filter((i) => i.kind === 'photo').map((i) => i.kind === 'photo' && [i.photoId, i.first])).toEqual([
      ['p2', false],
      ['p1', true],
    ]);
  });

  it('a completed Journey heads its timeline with Journey completed', () => {
    const done = journey({ status: 'completed', completedAt: on(20, 18) });
    const items = derive({ journey: done, weights: [weight('w1', on(0))] });
    expect(items[0]).toEqual({ kind: 'completed', key: 'j1:completed', at: on(20, 18), precision: 'instant', day: shiftLogDate(START, 20), elapsedDays: 21 });
    expect(items[items.length - 1].kind).toBe('began');
  });

  it('an active Journey has no completion and never a planned-end event', () => {
    const items = derive({ weights: [weight('w1', on(0))], today: shiftLogDate(START, 200) });
    expect(items.some((i) => i.kind === 'completed')).toBe(false);
    for (const item of items) expect(Date.parse(item.at)).toBeLessThan(fromLogDate('2026-11-29').getTime());
  });

  it('records no extension events — past planned ends are not stored, so none are invented', () => {
    const extended = journey({ plannedEndDate: '2027-06-01' });
    expect(derive({ journey: extended }).map((i) => i.kind)).toEqual(['began']);
  });
});

describe('Journey isolation', () => {
  it('never includes another Journey’s weigh-ins, photos or milestones, nor unowned legacy weigh-ins', () => {
    const others = Array.from({ length: 12 }, (_, i) => weight(`b${i}`, on(i), 'j2'));
    const otherPhotos = Array.from({ length: 6 }, (_, i) => photo(`bp${i}`, on(i), 'j2'));
    const items = derive({
      weights: [...others, weight('legacy', on(1), null), weight('w1', on(0))],
      photos: otherPhotos,
    });
    expect(keys(items)).toEqual(['weight:w1', 'j1:began']);
  });

  it('a completed Journey is isolated too', () => {
    const done = journey({ status: 'completed', completedAt: on(40) });
    const items = derive({ journey: done, weights: [weight('mine', on(1)), weight('theirs', on(2), 'j2')], photos: [photo('x', on(3), 'j2')] });
    expect(keys(items)).toEqual(['j1:completed', 'j1:milestone:day-30', 'weight:mine', 'j1:began']);
  });
});

describe('ordering', () => {
  it('equal instants break by kind — milestone above the photo above the weigh-in — then by key', () => {
    const t = on(2, 7);
    const weights = [0, 1, 2, 3].map((i) => weight(`w${i}`, on(0, 7, i))).concat([weight('wb', t), weight('wa', t)]);
    const items = derive({ weights, photos: [photo('p', t)] });
    expect(keys(items).slice(0, 4)).toEqual(['j1:milestone:weigh-ins-5', 'photo:p', 'weight:wa', 'weight:wb']);
  });

  it('is a total order: shuffled input gives the same result', () => {
    const weights = Array.from({ length: 11 }, (_, i) => weight(`w${i}`, on(i % 4, 8)));
    const photos = Array.from({ length: 5 }, (_, i) => photo(`p${i}`, on(i % 3, 8)));
    const a = derive({ weights, photos, today: shiftLogDate(START, 40) });
    const b = derive({ weights: [...weights].reverse(), photos: [...photos].reverse(), today: shiftLogDate(START, 40) });
    expect(keys(b)).toEqual(keys(a));
    for (let i = 1; i < a.length; i++) expect(compareTimeline(a[i - 1], a[i])).toBeLessThan(0);
  });

  it('a weigh-in back-dated before the start day sits below Journey began — truthfully earlier', () => {
    const items = derive({ weights: [weight('early', on(-1, 20)), weight('w1', on(0, 9))] });
    expect(keys(items)).toEqual(['weight:w1', 'j1:began', 'weight:early']);
  });

  it('same-day records sit above Journey began; Journey began has no invented time', () => {
    const items = derive({ photos: [photo('dawn', on(0, 6))] });
    expect(keys(items)).toEqual(['photo:dawn', 'j1:began']);
  });
});

describe('milestones', () => {
  const five = [0, 1, 2, 3, 4].map((i) => weight(`w${i}`, on(i * 2)));

  it('5 weigh-ins: on the fifth, at its own time — the starting weigh-in counts as #1', () => {
    const items = derive({ weights: five });
    const m = items.find((i) => i.kind === 'milestone');
    expect(m).toEqual({ kind: 'milestone', key: 'j1:milestone:weigh-ins-5', at: on(8), precision: 'instant', milestone: 'weigh-ins-5' });
  });

  it('none before the threshold', () => {
    expect(derive({ weights: five.slice(0, 4), photos: [0, 1, 2, 3].map((i) => photo(`p${i}`, on(i))) }).some((i) => i.kind === 'milestone')).toBe(false);
  });

  it('threshold counts oldest first, regardless of input order or when records were entered', () => {
    const shuffled = [five[3], five[0], five[4], five[1], five[2]];
    expect(derive({ weights: shuffled }).find((i) => i.kind === 'milestone')?.at).toBe(on(8));
  });

  it('10 weigh-ins, on the tenth', () => {
    const ten = Array.from({ length: 12 }, (_, i) => weight(`w${String(i).padStart(2, '0')}`, on(i)));
    const items = derive({ weights: ten, today: shiftLogDate(START, 20) });
    expect(items.find((i) => i.kind === 'milestone' && i.milestone === 'weigh-ins-10')?.at).toBe(on(9));
  });

  it('5 progress photos, on the fifth photo’s takenAt', () => {
    const photos = [6, 1, 4, 2, 9, 3].map((d) => photo(`p${d}`, on(d, 19)));
    expect(derive({ photos }).find((i) => i.kind === 'milestone')).toMatchObject({ milestone: 'photos-5', at: on(6, 19) });
  });

  it('30 days into this Journey: dated Day 30, appears only once reached, date-only', () => {
    const day30 = fromLogDate(shiftLogDate(START, 29)).toISOString();
    expect(derive({ today: shiftLogDate(START, 28) }).some((i) => i.kind === 'milestone')).toBe(false);
    const reached = derive({ today: shiftLogDate(START, 29) }).find((i) => i.kind === 'milestone');
    expect(reached).toEqual({ kind: 'milestone', key: 'j1:milestone:day-30', at: day30, precision: 'day', milestone: 'day-30' });
    // Noticed months later: still dated Day 30, not today.
    expect(derive({ today: shiftLogDate(START, 150) }).find((i) => i.kind === 'milestone')?.at).toBe(day30);
  });

  it('a Journey finished before Day 30 never has it, however late it is viewed', () => {
    const done = journey({ status: 'completed', completedAt: on(20) });
    expect(derive({ journey: done, today: shiftLogDate(START, 400) }).some((i) => i.kind === 'milestone')).toBe(false);
  });

  it('is not a streak: no record on any day is required', () => {
    expect(derive({ today: shiftLogDate(START, 60) }).map((i) => i.kind)).toEqual(['milestone', 'began']);
  });

  it('follows the current records: deleting below the threshold removes the milestone', () => {
    expect(derive({ weights: five }).some((i) => i.kind === 'milestone')).toBe(true);
    expect(derive({ weights: five.slice(2) }).some((i) => i.kind === 'milestone')).toBe(false);
  });

  it('moves when the crossing record is re-dated', () => {
    const moved = [...five.slice(0, 4), { ...five[4], loggedAt: on(9, 21) }];
    expect(derive({ weights: moved }).find((i) => i.kind === 'milestone')?.at).toBe(on(9, 21));
  });

  it('is deterministic — the same inputs give the same keys, every time', () => {
    expect(keys(derive({ weights: five }))).toEqual(keys(derive({ weights: five })));
  });
});
