/**
 * Injection sites as a record.
 *
 * Two properties matter most and both are pinned below: the site travels with
 * the log entry as a snapshot, so history cannot be rewritten by a later
 * setup change; and **nothing in this domain recommends anything.** There is
 * no next-site function to test because there is no next-site function.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { applyLogChanges, createLogEntry, parseLogEntry } from '../model/logs';
import {
  REGION_DESCRIPTIONS,
  SITE_REGIONS,
  SITE_SIDES,
  createSiteSnapshot,
  entriesWithSites,
  isSiteRegion,
  isSiteSide,
  lastRecordedSite,
  parseSiteSnapshot,
  regionHasSides,
  regionLabel,
  siteLabel,
  siteUsageCounts,
} from '../model/sites';
import type { PeptideLogDraft, PeptideLogEntry, PeptideSetup } from '../model/types';
import { toMcg } from '../model/units';

const NOW = new Date('2026-08-25T20:32:00.000Z');

function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    active: true,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

function draft(overrides: Partial<PeptideLogDraft> = {}): PeptideLogDraft {
  return {
    authoredAmount: 2,
    authoredUnit: 'mg',
    loggedAt: new Date(2026, 7, 25, 12, 0).toISOString(),
    ...overrides,
  };
}

describe('labels', () => {
  it('reads region and side together', () => {
    expect(siteLabel('abdomen', 'left')).toBe('Abdomen · Left');
    expect(siteLabel('thigh', 'right')).toBe('Thigh · Right');
    expect(siteLabel('upper-arm', 'center')).toBe('Upper Arm · Center');
  });

  it('omits a side that was never chosen, rather than leaving a dangling dot', () => {
    expect(siteLabel('glute', 'none')).toBe('Glute');
  });

  it('lets a custom label speak for itself', () => {
    // Not "Other · Left Hip" — the user named it, so the name is the label.
    expect(siteLabel('custom', 'none', 'Left Hip')).toBe('Left Hip');
    expect(siteLabel('custom', 'left', '  Hip  ')).toBe('Hip');
  });

  it('falls back to the region name when a custom label is blank', () => {
    expect(siteLabel('custom', 'none', '   ')).toBe('Other');
    expect(siteLabel('custom', 'none')).toBe('Other');
  });

  it('names every region', () => {
    for (const region of SITE_REGIONS) {
      expect(regionLabel(region).length).toBeGreaterThan(0);
    }
  });
});

describe('snapshots', () => {
  it('records region, side and label together', () => {
    expect(createSiteSnapshot('abdomen', 'left')).toEqual({
      region: 'abdomen',
      side: 'left',
      customLabel: undefined,
      label: 'Abdomen · Left',
    });
  });

  it('forces a custom site to have no side', () => {
    // "Left Hip · Right" would be nonsense; the user's own words carry it.
    const snapshot = createSiteSnapshot('custom', 'left', 'Left Hip');
    expect(snapshot.side).toBe('none');
    expect(snapshot.label).toBe('Left Hip');
  });

  it('keeps sides for anatomical regions', () => {
    for (const region of SITE_REGIONS) {
      expect(regionHasSides(region)).toBe(region !== 'custom');
    }
  });
});

describe('validation', () => {
  it('accepts a well-formed site', () => {
    const snapshot = createSiteSnapshot('thigh', 'right');
    expect(parseSiteSnapshot(JSON.parse(JSON.stringify(snapshot)))).toEqual(snapshot);
  });

  it('rebuilds a missing label rather than treating it as corruption', () => {
    expect(parseSiteSnapshot({ region: 'abdomen', side: 'left' })?.label).toBe('Abdomen · Left');
  });

  it('preserves an authored custom label exactly', () => {
    const parsed = parseSiteSnapshot({
      region: 'custom',
      side: 'none',
      customLabel: 'Left Hip',
      label: 'Left Hip',
    });
    // Never rewritten to "Other".
    expect(parsed?.label).toBe('Left Hip');
    expect(parsed?.customLabel).toBe('Left Hip');
  });

  it('rejects unknown regions and sides', () => {
    expect(parseSiteSnapshot({ region: 'forehead', side: 'left' })).toBeUndefined();
    expect(parseSiteSnapshot({ region: 'abdomen', side: 'sideways' })).toBeUndefined();
  });

  it('rejects non-objects', () => {
    for (const junk of [null, undefined, 42, 'abdomen', []]) {
      expect(parseSiteSnapshot(junk)).toBeUndefined();
    }
  });

  it('guards region and side lookups without walking the prototype chain', () => {
    expect(isSiteRegion('toString')).toBe(false);
    expect(isSiteSide('constructor')).toBe(false);
    for (const region of SITE_REGIONS) expect(isSiteRegion(region)).toBe(true);
    for (const side of SITE_SIDES) expect(isSiteSide(side)).toBe(true);
  });
});

describe('sites on log entries', () => {
  it('records a site when one is given', () => {
    const site = createSiteSnapshot('abdomen', 'left');
    const entry = createLogEntry(setupFixture(), draft({ site }), NOW);
    expect(entry.site).toEqual(site);
  });

  it('records nothing when none is given', () => {
    // Optional means optional: a log without a site is a complete record.
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    expect(entry.site).toBeUndefined();
  });

  it('keeps the site through a setup change — the historical rule', () => {
    const site = createSiteSnapshot('abdomen', 'left');
    const entry = createLogEntry(setupFixture(), draft({ site }), NOW);

    // The setup is later reconstituted differently and deactivated. Neither
    // touches what was recorded.
    setupFixture({ reconstitutionMl: 1, active: false });
    expect(entry.site?.label).toBe('Abdomen · Left');
  });

  it('changes the site on edit without touching the conversion', () => {
    const entry = createLogEntry(
      setupFixture(),
      draft({ site: createSiteSnapshot('abdomen', 'left') }),
      NOW,
    );
    const before = entry.calculationSnapshot;

    const edited = applyLogChanges(
      entry,
      draft({ site: createSiteSnapshot('thigh', 'right') }),
      NOW,
    );

    expect(edited.site?.label).toBe('Thigh · Right');
    // Where it happened and what was drawn are independent facts.
    expect(edited.calculationSnapshot).toEqual(before);
  });

  it('clears the site on edit', () => {
    const entry = createLogEntry(
      setupFixture(),
      draft({ site: createSiteSnapshot('abdomen', 'left') }),
      NOW,
    );
    const edited = applyLogChanges(entry, draft({ site: undefined }), NOW);

    expect(edited.site).toBeUndefined();
    expect(edited.amount.amountMcg).toBe(2000);
  });
});

describe('stored entries', () => {
  const stored = (site?: unknown) => {
    const entry = JSON.parse(
      JSON.stringify(createLogEntry(setupFixture(), draft({ site: createSiteSnapshot('abdomen', 'left') }), NOW)),
    );
    if (site !== undefined) entry.site = site;
    return entry;
  };

  it('round-trips an entry with a site', () => {
    const value = stored();
    expect(parseLogEntry(value, '2026-08-25')?.site?.label).toBe('Abdomen · Left');
  });

  it('loads an entry written before sites existed', () => {
    // Additive, with no migration: pre-3.8 records must keep working.
    const value = stored();
    delete value.site;
    const parsed = parseLogEntry(value, '2026-08-25');
    expect(parsed).not.toBeNull();
    expect(parsed?.site).toBeUndefined();
    expect(parsed?.amount.amountMcg).toBe(2000);
  });

  it('drops a malformed site but keeps the entry', () => {
    // A log whose amount and time survive is still a true record; discarding
    // it because one optional field rotted would destroy more than it saves.
    for (const junk of [{ region: 'moon', side: 'left' }, 'abdomen', 42, []]) {
      const parsed = parseLogEntry(stored(junk), '2026-08-25');
      expect(parsed).not.toBeNull();
      expect(parsed?.site).toBeUndefined();
      expect(parsed?.amount.amountMcg).toBe(2000);
    }
  });
});

describe('reading site history', () => {
  function entryWith(id: string, site: PeptideLogEntry['site'], hour: number): PeptideLogEntry {
    return {
      ...createLogEntry(
        setupFixture(),
        draft({ site, loggedAt: new Date(2026, 7, 25, hour, 0).toISOString() }),
        NOW,
      ),
      id,
    };
  }

  /** Newest first, as every provider read returns them. */
  const newestFirst: PeptideLogEntry[] = [
    entryWith('c', undefined, 20),
    entryWith('b', createSiteSnapshot('thigh', 'right'), 14),
    entryWith('a', createSiteSnapshot('abdomen', 'left'), 8),
  ];

  it('finds the most recent entry that actually recorded a site', () => {
    // Skips the newer entry with no site rather than reporting nothing.
    expect(lastRecordedSite(newestFirst)?.site.label).toBe('Thigh · Right');
    expect(lastRecordedSite(newestFirst)?.entry.id).toBe('b');
  });

  it('reports nothing when no site was ever recorded', () => {
    expect(lastRecordedSite([entryWith('x', undefined, 9)])).toBeUndefined();
    expect(lastRecordedSite([])).toBeUndefined();
  });

  it('lists only entries that recorded a site, in order', () => {
    expect(entriesWithSites(newestFirst).map((entry) => entry.id)).toEqual(['b', 'a']);
  });

  it('counts usage by the recorded label', () => {
    const entries = [
      entryWith('a', createSiteSnapshot('abdomen', 'left'), 8),
      entryWith('b', createSiteSnapshot('abdomen', 'left'), 9),
      entryWith('c', createSiteSnapshot('thigh', 'right'), 10),
      entryWith('d', undefined, 11),
    ];

    expect(siteUsageCounts(entries)).toEqual([
      { label: 'Abdomen · Left', count: 2 },
      { label: 'Thigh · Right', count: 1 },
    ]);
  });

  it('keeps a custom label as its own line rather than collapsing it', () => {
    const entries = [
      entryWith('a', createSiteSnapshot('custom', 'none', 'Left Hip'), 8),
      entryWith('b', createSiteSnapshot('custom', 'none', 'Right Hip'), 9),
    ];
    expect(siteUsageCounts(entries).map((row) => row.label)).toEqual(['Left Hip', 'Right Hip']);
  });

  it('supports several different sites on one day', () => {
    const morning = entryWith('a', createSiteSnapshot('abdomen', 'left'), 8);
    const evening = entryWith('b', createSiteSnapshot('thigh', 'right'), 20);
    expect(morning.logDate).toBe(evening.logDate);
    expect(entriesWithSites([evening, morning])).toHaveLength(2);
  });
});

describe('nothing here recommends anything', () => {
  it('exposes no next-site or rotation function', () => {
    const domain = require('../model/sites');
    for (const name of Object.keys(domain)) {
      expect(name.toLowerCase()).not.toMatch(/recommend|suggest|next|rotate|rotation|avoid|due|safe/);
    }
  });

  it('keeps the site guide anatomical and free of technique', () => {
    for (const region of SITE_REGIONS) {
      const text = REGION_DESCRIPTIONS[region].toLowerCase();
      for (const word of [
        'inject',
        'needle',
        'angle',
        'depth',
        'pinch',
        'best',
        'recommended',
        'preferred',
        'safest',
        'avoid',
        'rotate',
      ]) {
        expect(text).not.toContain(word);
      }
    }
  });
});
