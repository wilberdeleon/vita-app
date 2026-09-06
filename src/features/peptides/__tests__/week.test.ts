/**
 * Monday-first weeks, and what a week's injection history reduces to.
 *
 * These are the selectors slice 5.5's visual work stands on, kept pure so the
 * arithmetic can be checked without a device — the same reasoning as the
 * Dashboard's drag geometry. If a marker ever lands on the wrong day or a
 * site's history gets attributed to the wrong week, it fails here first.
 */

// The peptides barrel reaches storage; this file needs none of it.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { shiftLogDate, type LogDate } from '../../../lib/daily';
import {
  createSiteSnapshot,
  toMcg,
  type PeptideLogEntry,
} from '../../../lib/peptides';
import { countSiteLogs, siteLogsForWeek, weekLabel, weekOf, weekRangeLabel } from '../week';

/** A Wednesday, so the week around it is unambiguous. */
const WEDNESDAY = '2026-09-02' as LogDate;

function logFixture(overrides: Partial<PeptideLogEntry> & { id: string }): PeptideLogEntry {
  return {
    setupId: 'setup-1',
    definitionId: 'catalog:retatrutide',
    logDate: WEDNESDAY,
    loggedAt: '2026-09-02T09:00:00.000Z',
    amount: { amountMcg: toMcg(1, 'mg'), authoredUnit: 'mg' },
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-09-02T09:00:00.000Z',
    ...overrides,
  } as PeptideLogEntry;
}

const describeEntry = () => ({ name: 'Retatrutide', amount: '1 mg' });

describe('the week', () => {
  it('runs Monday to Sunday around any day in it', () => {
    const days = weekOf(WEDNESDAY);
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('2026-08-31');
    expect(days[6]).toBe('2026-09-06');
    expect(days).toContain(WEDNESDAY);
  });

  it('starts on Monday even when today is Sunday', () => {
    // The rolling window this replaced started on whatever today happened to
    // be, which is chronologically correct and unreadable as a calendar.
    const sunday = '2026-09-06' as LogDate;
    expect(weekOf(sunday)[0]).toBe('2026-08-31');
    expect(weekOf(sunday)[6]).toBe(sunday);
  });

  it('steps whole weeks, never partial ones', () => {
    expect(weekOf(WEDNESDAY, -1)[0]).toBe('2026-08-24');
    expect(weekOf(WEDNESDAY, 1)[0]).toBe('2026-09-07');
    for (const offset of [-3, -1, 0, 2]) {
      const days = weekOf(WEDNESDAY, offset);
      expect(days).toHaveLength(7);
      // Consecutive, with no gap or repeat across a month boundary.
      days.forEach((day, index) => {
        if (index > 0) expect(day).toBe(shiftLogDate(days[index - 1], 1));
      });
    }
  });

  it('names the week the way someone would say it', () => {
    const days = weekOf(WEDNESDAY);
    expect(weekLabel(days, 0)).toBe('This week');
    expect(weekLabel(weekOf(WEDNESDAY, -1), -1)).toBe('Last week');
    expect(weekLabel(weekOf(WEDNESDAY, -3), -3)).toBe(weekRangeLabel(weekOf(WEDNESDAY, -3)));
    expect(weekRangeLabel(days)).toBe('31 Aug – 6 Sep');
  });
});

describe('a week of injection sites', () => {
  const days = weekOf(WEDNESDAY);

  it('groups by site, so one place is one marker', () => {
    /*
     * The overlap rule. Two administrations at the left thigh are one entry
     * holding two, never two entries that would draw as stacked circles.
     */
    const grouped = siteLogsForWeek(
      [
        logFixture({ id: 'a', site: createSiteSnapshot('thigh-left') }),
        logFixture({ id: 'b', logDate: '2026-09-04', site: createSiteSnapshot('thigh-left') }),
        logFixture({ id: 'c', logDate: '2026-09-01', site: createSiteSnapshot('abdomen-left') }),
      ],
      days,
      describeEntry,
    );

    expect(grouped.size).toBe(2);
    expect(grouped.get('thigh-left')).toHaveLength(2);
    expect(grouped.get('abdomen-left')).toHaveLength(1);
    expect(countSiteLogs(grouped)).toBe(3);
  });

  it('places each log on its own day of the week', () => {
    const grouped = siteLogsForWeek(
      [logFixture({ id: 'a', logDate: '2026-08-31', site: createSiteSnapshot('glute-left') })],
      days,
      describeEntry,
    );
    // Monday is index 0.
    expect(grouped.get('glute-left')![0].dayIndex).toBe(0);
  });

  it('ignores logs outside the week entirely', () => {
    const grouped = siteLogsForWeek(
      [
        logFixture({ id: 'a', logDate: '2026-08-30', site: createSiteSnapshot('thigh-left') }),
        logFixture({ id: 'b', logDate: '2026-09-07', site: createSiteSnapshot('thigh-left') }),
      ],
      days,
      describeEntry,
    );
    expect(grouped.size).toBe(0);
  });

  it('ignores logs with no site — it is an optional field, not a gap', () => {
    const grouped = siteLogsForWeek([logFixture({ id: 'a' })], days, describeEntry);
    expect(grouped.size).toBe(0);
  });

  it('reads the stored snapshot, including a custom label', () => {
    // History is what was recorded, never what the routine looks like now.
    const grouped = siteLogsForWeek(
      [logFixture({ id: 'a', site: createSiteSnapshot('custom', 'Left Hip') })],
      days,
      describeEntry,
    );
    expect(grouped.get('custom')![0].label).toBe('Left Hip');
  });

  it('orders a site’s logs chronologically', () => {
    const grouped = siteLogsForWeek(
      [
        logFixture({
          id: 'late',
          logDate: '2026-09-04',
          loggedAt: '2026-09-04T18:00:00.000Z',
          site: createSiteSnapshot('abdomen-center'),
        }),
        logFixture({
          id: 'early',
          logDate: '2026-09-01',
          loggedAt: '2026-09-01T07:00:00.000Z',
          site: createSiteSnapshot('abdomen-center'),
        }),
      ],
      days,
      describeEntry,
    );
    expect(grouped.get('abdomen-center')!.map((log) => log.id)).toEqual(['early', 'late']);
  });

  it('carries the compound and the authored amount for each log', () => {
    const grouped = siteLogsForWeek(
      [logFixture({ id: 'a', site: createSiteSnapshot('upper-arm-right') })],
      days,
      describeEntry,
    );
    const [log] = grouped.get('upper-arm-right')!;
    expect(log.name).toBe('Retatrutide');
    expect(log.amount).toBe('1 mg');
  });
});
