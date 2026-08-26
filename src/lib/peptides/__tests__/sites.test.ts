/**
 * Injection sites as a record.
 *
 * Three properties matter and all are pinned below: the site travels with the
 * log entry as a snapshot; **slice 3.8's records keep working** now that the
 * taxonomy has changed under them; and **nothing here recommends anything.**
 * There is no next-site function to test because there is no next-site
 * function.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { applyLogChanges, createLogEntry, parseLogEntry } from '../model/logs';
import {
  REGION_DESCRIPTIONS,
  SITE_PICKER_ORDER,
  CUSTOM_SITE_OPTION_LABEL,
  SITE_KEYS,
  createSiteSnapshot,
  entriesAtSite,
  entriesWithSites,
  isSiteKey,
  lastRecordedSite,
  parseSiteSnapshot,
  siteKeyLabel,
  siteLabel,
  sitesForView,
} from '../model/sites';
import type { PeptideLogDraft, PeptideLogEntry, PeptideSetup } from '../model/types';
import { toMcg } from '../model/units';

const NOW = new Date('2026-08-26T20:32:00.000Z');

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
    loggedAt: new Date(2026, 7, 26, 12, 0).toISOString(),
    ...overrides,
  };
}

describe('the canonical taxonomy', () => {
  it('names every site the founder asked for', () => {
    expect(SITE_KEYS.map(siteKeyLabel)).toEqual([
      'Left Abdomen',
      'Center Abdomen',
      'Right Abdomen',
      'Left Thigh',
      'Right Thigh',
      'Left Upper Arm',
      'Right Upper Arm',
      'Left Glute',
      'Right Glute',
      'Other',
    ]);
  });

  it('includes Center Abdomen as a first-class site', () => {
    // The whole reason the region+side model was replaced: it could not say
    // "the middle" without overloading "I didn't record a side".
    expect(SITE_KEYS).toContain('abdomen-center');
    expect(siteKeyLabel('abdomen-center')).toBe('Center Abdomen');
  });

  it('never shows a programmer-ish key in a label', () => {
    for (const key of SITE_KEYS) {
      expect(siteKeyLabel(key)).not.toContain('-');
    }
  });

  it('places every anatomical site on at least one silhouette', () => {
    const shown = new Set([...sitesForView('front'), ...sitesForView('back')]);
    for (const key of SITE_KEYS) {
      if (key === 'custom') continue;
      expect(shown.has(key)).toBe(true);
    }
  });

  it('puts abdomen and thighs on the front, glutes on the back', () => {
    const front = sitesForView('front');
    const back = sitesForView('back');

    expect(front).toEqual(
      expect.arrayContaining(['abdomen-left', 'abdomen-center', 'abdomen-right', 'thigh-left', 'thigh-right']),
    );
    expect(back).toEqual(expect.arrayContaining(['glute-left', 'glute-right']));
    expect(front).not.toContain('glute-left');
  });

  it('shows upper arms from either side, since an arm is visible from both', () => {
    expect(sitesForView('front')).toContain('upper-arm-left');
    expect(sitesForView('back')).toContain('upper-arm-left');
  });

  it('offers every canonical site in the fast picker, custom included', () => {
    // The list is the primary path, so it carries everything — including
    // glutes, which the front silhouette cannot show.
    for (const key of SITE_KEYS) expect(SITE_PICKER_ORDER).toContain(key);
    expect(SITE_PICKER_ORDER).toHaveLength(SITE_KEYS.length);
  });

  it('lists each site exactly once, with custom last', () => {
    expect(new Set(SITE_PICKER_ORDER).size).toBe(SITE_PICKER_ORDER.length);
    expect(SITE_PICKER_ORDER[SITE_PICKER_ORDER.length - 1]).toBe('custom');
  });

  it("keeps each region's sides adjacent, so the list scans without headings", () => {
    const region = (key: string) => key.replace(/-(left|center|right)$/, '');
    const seen: string[] = [];
    for (const key of SITE_PICKER_ORDER) {
      const name = region(key);
      if (seen[seen.length - 1] !== name) {
        // A region must never reappear after another one has interrupted it.
        expect(seen).not.toContain(name);
        seen.push(name);
      }
    }
  });

  it('names the custom option in full, since "Other" alone reads thin', () => {
    expect(CUSTOM_SITE_OPTION_LABEL).toBe('Other / Custom');
  });

  it('guards keys without walking the prototype chain', () => {
    expect(isSiteKey('toString')).toBe(false);
    expect(isSiteKey('abdomen')).toBe(false);
    for (const key of SITE_KEYS) expect(isSiteKey(key)).toBe(true);
  });
});

describe('snapshots', () => {
  it('records a canonical site with its label', () => {
    expect(createSiteSnapshot('abdomen-center')).toEqual({
      key: 'abdomen-center',
      customLabel: undefined,
      label: 'Center Abdomen',
    });
  });

  it('lets a custom label speak for itself', () => {
    const snapshot = createSiteSnapshot('custom', 'Left Hip');
    expect(snapshot.label).toBe('Left Hip');
    expect(snapshot.customLabel).toBe('Left Hip');
  });

  it('falls back to Other when a custom label is blank', () => {
    expect(siteLabel('custom', '   ')).toBe('Other');
    expect(createSiteSnapshot('custom').label).toBe('Other');
  });
});

describe('slice 3.8 records keep working', () => {
  /**
   * The taxonomy changed under data that already exists on the founder's
   * device. Those entries are never rewritten on disk — they are translated
   * on read, so nothing is lost and nothing is migrated destructively.
   */
  const LEGACY: Array<[string, unknown, string]> = [
    ['abdomen + left', { region: 'abdomen', side: 'left' }, 'Left Abdomen'],
    ['abdomen + right', { region: 'abdomen', side: 'right' }, 'Right Abdomen'],
    ['abdomen + center', { region: 'abdomen', side: 'center' }, 'Center Abdomen'],
    ['thigh + right', { region: 'thigh', side: 'right' }, 'Right Thigh'],
    ['thigh + left', { region: 'thigh', side: 'left' }, 'Left Thigh'],
    ['upper-arm + left', { region: 'upper-arm', side: 'left' }, 'Left Upper Arm'],
    ['glute + left', { region: 'glute', side: 'left' }, 'Left Glute'],
    ['glute + right', { region: 'glute', side: 'right' }, 'Right Glute'],
  ];

  for (const [label, stored, expected] of LEGACY) {
    it(`reads ${label} as ${expected}`, () => {
      expect(parseSiteSnapshot(stored)?.label).toBe(expected);
    });
  }

  it('resolves a sideless abdomen to the centre rather than dropping it', () => {
    // The old model's "abdomen + none" meant the middle in practice; keeping
    // the record beats discarding it over an ambiguity we introduced.
    expect(parseSiteSnapshot({ region: 'abdomen', side: 'none' })?.key).toBe('abdomen-center');
  });

  it('restates an old generated label in the current format', () => {
    // 3.8 wrote "Abdomen · Left". Keeping that verbatim would show two
    // spellings of one place in the same list; only *authored* text is sacred.
    const parsed = parseSiteSnapshot({ region: 'abdomen', side: 'left', label: 'Abdomen · Left' });
    expect(parsed?.label).toBe('Left Abdomen');
  });

  it('keeps an old custom label exactly as authored', () => {
    const parsed = parseSiteSnapshot({
      region: 'custom',
      side: 'none',
      customLabel: 'Left Hip',
      label: 'Left Hip',
    });
    expect(parsed?.key).toBe('custom');
    expect(parsed?.label).toBe('Left Hip');
  });

  it('rejects an old region that has no modern equivalent', () => {
    expect(parseSiteSnapshot({ region: 'forehead', side: 'left' })).toBeUndefined();
  });
});

describe('validation', () => {
  it('round-trips a current snapshot', () => {
    const snapshot = createSiteSnapshot('thigh-right');
    expect(parseSiteSnapshot(JSON.parse(JSON.stringify(snapshot)))).toEqual(snapshot);
  });

  it('rebuilds a missing label rather than treating it as corruption', () => {
    expect(parseSiteSnapshot({ key: 'glute-left' })?.label).toBe('Left Glute');
  });

  it('rejects non-objects and unknown keys', () => {
    for (const junk of [null, undefined, 42, 'abdomen-left', [], { key: 'moon' }]) {
      expect(parseSiteSnapshot(junk)).toBeUndefined();
    }
  });
});

describe('sites on log entries', () => {
  it('records a site when one is given', () => {
    const site = createSiteSnapshot('abdomen-center');
    expect(createLogEntry(setupFixture(), draft({ site }), NOW).site).toEqual(site);
  });

  it('records nothing when none is given', () => {
    expect(createLogEntry(setupFixture(), draft(), NOW).site).toBeUndefined();
  });

  it('changes the site on edit without touching the conversion', () => {
    const entry = createLogEntry(
      setupFixture(),
      draft({ site: createSiteSnapshot('abdomen-left') }),
      NOW,
    );
    const before = entry.calculationSnapshot;
    const edited = applyLogChanges(entry, draft({ site: createSiteSnapshot('thigh-right') }), NOW);

    expect(edited.site?.label).toBe('Right Thigh');
    expect(edited.calculationSnapshot).toEqual(before);
  });

  it('clears the site on edit', () => {
    const entry = createLogEntry(
      setupFixture(),
      draft({ site: createSiteSnapshot('abdomen-left') }),
      NOW,
    );
    expect(applyLogChanges(entry, draft({ site: undefined }), NOW).site).toBeUndefined();
  });

  it('loads an entry written before sites existed', () => {
    const value = JSON.parse(JSON.stringify(createLogEntry(setupFixture(), draft(), NOW)));
    delete value.site;
    const parsed = parseLogEntry(value, '2026-08-26');
    expect(parsed).not.toBeNull();
    expect(parsed?.site).toBeUndefined();
  });

  it('drops a malformed site but keeps the entry', () => {
    const value = JSON.parse(
      JSON.stringify(createLogEntry(setupFixture(), draft({ site: createSiteSnapshot('abdomen-left') }), NOW)),
    );
    value.site = { key: 'moon' };
    const parsed = parseLogEntry(value, '2026-08-26');
    expect(parsed).not.toBeNull();
    expect(parsed?.site).toBeUndefined();
    expect(parsed?.amount.amountMcg).toBe(2000);
  });
});

describe('reading site history', () => {
  function entryWith(id: string, site: PeptideLogEntry['site'], hour: number): PeptideLogEntry {
    return {
      ...createLogEntry(
        setupFixture(),
        draft({ site, loggedAt: new Date(2026, 7, 26, hour, 0).toISOString() }),
        NOW,
      ),
      id,
    };
  }

  const newestFirst: PeptideLogEntry[] = [
    entryWith('c', undefined, 20),
    entryWith('b', createSiteSnapshot('thigh-right'), 14),
    entryWith('a', createSiteSnapshot('abdomen-left'), 8),
  ];

  it('finds the most recent entry that actually recorded a site', () => {
    expect(lastRecordedSite(newestFirst)?.site.label).toBe('Right Thigh');
  });

  it('reports nothing when no site was ever recorded', () => {
    expect(lastRecordedSite([entryWith('x', undefined, 9)])).toBeUndefined();
  });

  it('lists only entries that recorded a site, in order', () => {
    expect(entriesWithSites(newestFirst).map((entry) => entry.id)).toEqual(['b', 'a']);
  });

  it('filters to one exact zone', () => {
    expect(entriesAtSite(newestFirst, 'abdomen-left').map((entry) => entry.id)).toEqual(['a']);
    expect(entriesAtSite(newestFirst, 'abdomen-center')).toEqual([]);
  });

  it('treats two different custom names as two different places', () => {
    const entries = [
      entryWith('a', createSiteSnapshot('custom', 'Left Hip'), 8),
      entryWith('b', createSiteSnapshot('custom', 'Right Hip'), 9),
    ];
    expect(entriesAtSite(entries, 'custom', 'Left Hip').map((entry) => entry.id)).toEqual(['a']);
  });

  it('supports several different sites on one day', () => {
    const morning = entryWith('a', createSiteSnapshot('abdomen-left'), 8);
    const evening = entryWith('b', createSiteSnapshot('thigh-right'), 20);
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
    for (const entry of REGION_DESCRIPTIONS) {
      const text = entry.description.toLowerCase();
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
