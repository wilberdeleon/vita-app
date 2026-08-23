/**
 * The seven-day model.
 *
 * The assertion that matters most is negative: this thing knows about
 * **volume**, and nothing in it judges a day as met or missed. VITA stores one
 * current goal as a preference and never snapshots what it was on a past day,
 * so a "goal met on Tuesday" flag would be an invention. These tests are what
 * keep one from being added later by someone who means well.
 */

import { buildWaterWeek, WEEK_DAYS, type StoredDayTotal } from '../model/week';

const TODAY = '2026-08-22'; // a Saturday
const day = (logDate: string, totalMl: number): StoredDayTotal => ({ logDate, totalMl });

describe('buildWaterWeek', () => {
  it('returns seven consecutive local days ending today, oldest first', () => {
    const week = buildWaterWeek(TODAY, [], 0);
    expect(week).toHaveLength(WEEK_DAYS);
    expect(week.map((d) => d.logDate)).toEqual([
      '2026-08-16',
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
      '2026-08-22',
    ]);
  });

  it('marks only the last day as today', () => {
    const week = buildWaterWeek(TODAY, [], 0);
    expect(week.filter((d) => d.isToday)).toHaveLength(1);
    expect(week[week.length - 1].isToday).toBe(true);
    expect(week[week.length - 1].logDate).toBe(TODAY);
  });

  it('crosses a month boundary correctly', () => {
    const week = buildWaterWeek('2026-03-02', [], 0);
    expect(week.map((d) => d.logDate)).toEqual([
      '2026-02-24',
      '2026-02-25',
      '2026-02-26',
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ]);
  });

  it('crosses a leap day correctly', () => {
    const week = buildWaterWeek('2024-03-01', [], 0);
    expect(week[5].logDate).toBe('2024-02-29');
  });

  it('crosses a year boundary correctly', () => {
    const week = buildWaterWeek('2026-01-02', [], 0);
    expect(week[0].logDate).toBe('2025-12-27');
    expect(week[5].logDate).toBe('2026-01-01');
  });

  it('places each stored day on its own date', () => {
    const week = buildWaterWeek(TODAY, [day('2026-08-20', 500), day('2026-08-18', 250)], 0);
    const byDate = Object.fromEntries(week.map((d) => [d.logDate, d.totalMl]));
    expect(byDate['2026-08-20']).toBe(500);
    expect(byDate['2026-08-18']).toBe(250);
  });

  it('keeps days with nothing logged rather than dropping them', () => {
    // A gap is information — "I drank nothing Wednesday" — and dropping it
    // would silently compress the axis.
    const week = buildWaterWeek(TODAY, [day('2026-08-20', 500)], 0);
    expect(week).toHaveLength(7);
    expect(week.filter((d) => d.totalMl === 0)).toHaveLength(6);
  });

  it("always uses the live total for today, never the stored one", () => {
    // Today's stored copy can be a moment behind the entry array the user is
    // actually looking at; the live value wins so a logged drink shows at once.
    const week = buildWaterWeek(TODAY, [day(TODAY, 100)], 750);
    expect(week[week.length - 1].totalMl).toBe(750);
  });

  it('ignores stored days outside the window', () => {
    const week = buildWaterWeek(TODAY, [day('2026-07-01', 9999), day('2026-08-30', 9999)], 0);
    expect(week.every((d) => d.totalMl === 0)).toBe(true);
  });

  describe('share', () => {
    it('scales every day against the week’s own biggest day', () => {
      const week = buildWaterWeek(TODAY, [day('2026-08-20', 1000), day('2026-08-21', 500)], 250);
      const byDate = Object.fromEntries(week.map((d) => [d.logDate, d.share]));
      expect(byDate['2026-08-20']).toBe(1);
      expect(byDate['2026-08-21']).toBe(0.5);
      expect(byDate[TODAY]).toBe(0.25);
    });

    it('is zero everywhere when the whole week is empty, never NaN', () => {
      const week = buildWaterWeek(TODAY, [], 0);
      for (const d of week) {
        expect(d.share).toBe(0);
        expect(Number.isFinite(d.share)).toBe(true);
      }
    });

    it('stays within 0..1 for every day', () => {
      const week = buildWaterWeek(TODAY, [day('2026-08-19', 3000), day('2026-08-20', 17)], 900);
      for (const d of week) {
        expect(d.share).toBeGreaterThanOrEqual(0);
        expect(d.share).toBeLessThanOrEqual(1);
      }
    });

    it('treats a corrupted negative or non-finite stored total as zero', () => {
      // A negative day must not drag the scale, and a NaN must not poison the
      // peak and blank the whole strip.
      const week = buildWaterWeek(TODAY, [day('2026-08-20', -500), day('2026-08-19', Number.NaN)], 1000);
      const byDate = Object.fromEntries(week.map((d) => [d.logDate, d.totalMl]));
      expect(byDate['2026-08-20']).toBe(0);
      expect(byDate['2026-08-19']).toBe(0);
      expect(week.every((d) => Number.isFinite(d.share))).toBe(true);
    });
  });

  describe('labels', () => {
    it('carries both the ambiguous initial and the full weekday name', () => {
      const week = buildWaterWeek(TODAY, [], 0);
      expect(week[week.length - 1].weekdayName).toBe('Saturday');
      expect(week[week.length - 1].initial).toBe('S');
      // Sunday and Saturday share "S"; Tuesday and Thursday share "T". The
      // full name is what assistive technology reads, which is why it is here.
      expect(week.map((d) => d.initial)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
      expect(week.map((d) => d.weekdayName)).toEqual([
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]);
    });
  });

  it('exposes no goal-attainment judgement of any kind', () => {
    // Deliberate: VITA does not store a historical goal, so it cannot honestly
    // say whether a past day met one.
    const week = buildWaterWeek(TODAY, [day('2026-08-20', 5000)], 0);
    const keys = Object.keys(week[0]).sort();
    expect(keys).toEqual(['initial', 'isToday', 'logDate', 'share', 'totalMl', 'weekdayName']);
    expect(JSON.stringify(week)).not.toContain('goal');
  });

  it('does not mutate the stored totals it was given', () => {
    const stored = [day('2026-08-20', 500)];
    const snapshot = JSON.stringify(stored);
    buildWaterWeek(TODAY, stored, 250);
    expect(JSON.stringify(stored)).toBe(snapshot);
  });

  it('supports a shorter window without breaking the today marker', () => {
    const week = buildWaterWeek(TODAY, [], 0, 3);
    expect(week.map((d) => d.logDate)).toEqual(['2026-08-20', '2026-08-21', '2026-08-22']);
    expect(week[2].isToday).toBe(true);
  });

  it('returns nothing for a non-positive window', () => {
    expect(buildWaterWeek(TODAY, [], 0, 0)).toEqual([]);
    expect(buildWaterWeek(TODAY, [], 0, -1)).toEqual([]);
  });
});
