/**
 * The built-in catalog.
 *
 * Most of what this file asserts is what the catalog must **not** contain. A
 * peptide list is one careless field away from reading as medical advice, and
 * these tests are what stop a well-meaning "helps with recovery" description,
 * a "popular" flag, or an optimistic `approved` classification from being
 * added later without a founder decision.
 */

import { CATALOG_VERSION, PEPTIDE_CATALOG, findCatalogDefinition, searchCatalog } from '../data/catalog';

/** Everything a catalog entry is allowed to carry. Nothing else may appear. */
const ALLOWED_FIELDS = ['id', 'name', 'classification', 'category', 'origin', 'catalogVersion'];

/** Words that would turn an identity list into a recommendation list. */
const FORBIDDEN_SUBSTRINGS = [
  'dose',
  'dosage',
  'mg',
  'mcg',
  'recommend',
  'typical',
  'standard',
  'protocol',
  'cycle',
  'popular',
  'best',
  'safest',
  'beginner',
  'fat loss',
  'weight loss',
  'muscle',
  'anti-aging',
  'cognitive',
  'benefit',
  'effect',
  'helps',
  'improves',
  'increases',
  'boosts',
];

describe('catalog scope', () => {
  it('is small and deliberately modest — 12 to 20 entries', () => {
    expect(PEPTIDE_CATALOG.length).toBeGreaterThanOrEqual(12);
    expect(PEPTIDE_CATALOG.length).toBeLessThanOrEqual(20);
  });

  it('has a version stamped on every entry', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.catalogVersion).toBe(CATALOG_VERSION);
    }
  });
});

describe('identity', () => {
  it('gives every entry a stable semantic id, never an array index', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.id.startsWith('catalog:')).toBe(true);
      // An index-derived id would silently re-point setups if the list order
      // ever changed.
      expect(entry.id).not.toMatch(/^catalog:\d+$/);
    }
  });

  it('has no duplicate ids', () => {
    const ids = PEPTIDE_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate names', () => {
    const names = PEPTIDE_CATALOG.map((entry) => entry.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('marks every entry as catalog-origin', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.origin).toBe('catalog');
    }
  });
});

describe('classification', () => {
  it('classifies every entry explicitly', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(['approved-medication', 'research-compound']).toContain(entry.classification);
    }
  });

  /**
   * `custom` means "the user typed this and VITA makes no regulatory claim".
   * A built-in entry using it would be the app declining to state a status it
   * has actually decided.
   */
  it('never uses the custom classification for a built-in entry', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.classification).not.toBe('custom');
    }
  });

  it('contains both approved medications and research compounds', () => {
    const approved = PEPTIDE_CATALOG.filter((e) => e.classification === 'approved-medication');
    const research = PEPTIDE_CATALOG.filter((e) => e.classification === 'research-compound');
    expect(approved.length).toBeGreaterThan(0);
    expect(research.length).toBeGreaterThan(0);
  });

  /**
   * The compounds deliberately omitted because their US status could not be
   * stated with confidence — a withdrawn approval, one molecule sold under
   * both an approved name and as a research chemical, and a compound approved
   * elsewhere but not in the US. Each can still be added via Custom.
   */
  it('omits the compounds whose status was uncertain', () => {
    const names = PEPTIDE_CATALOG.map((e) => e.name.toLowerCase());
    for (const omitted of ['sermorelin', 'bremelanotide', 'pt-141', 'thymosin alpha-1']) {
      expect(names).not.toContain(omitted);
    }
  });
});

describe('content restrictions', () => {
  it('carries only the permitted fields', () => {
    for (const entry of PEPTIDE_CATALOG) {
      for (const key of Object.keys(entry)) {
        expect(ALLOWED_FIELDS).toContain(key);
      }
    }
  });

  it('has no dosing, effect, or recommendation language anywhere', () => {
    const serialized = JSON.stringify(PEPTIDE_CATALOG).toLowerCase();
    for (const word of FORBIDDEN_SUBSTRINGS) {
      expect(serialized).not.toContain(word);
    }
  });

  it('keeps categories to short compound-class labels, not descriptions', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (!entry.category) continue;
      expect(entry.category.length).toBeLessThanOrEqual(40);
      // A sentence is a description; a class label is not.
      expect(entry.category).not.toContain('.');
    }
  });
});

describe('ordering', () => {
  it('is alphabetical, which is the only ordering and not a ranking', () => {
    const names = PEPTIDE_CATALOG.map((entry) => entry.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe('lookup', () => {
  it('finds an entry by id', () => {
    expect(findCatalogDefinition('catalog:semaglutide')?.name).toBe('Semaglutide');
  });

  it('returns undefined for an unknown id rather than guessing', () => {
    expect(findCatalogDefinition('catalog:not-a-thing')).toBeUndefined();
    expect(findCatalogDefinition('')).toBeUndefined();
  });
});

describe('search', () => {
  it('returns everything for an empty query', () => {
    expect(searchCatalog('')).toHaveLength(PEPTIDE_CATALOG.length);
    expect(searchCatalog('   ')).toHaveLength(PEPTIDE_CATALOG.length);
  });

  it('is case-insensitive', () => {
    expect(searchCatalog('SEMAGLUTIDE').map((e) => e.id)).toEqual(['catalog:semaglutide']);
    expect(searchCatalog('semaglutide').map((e) => e.id)).toEqual(['catalog:semaglutide']);
  });

  it('matches a substring anywhere in the name', () => {
    expect(searchCatalog('glutide').length).toBeGreaterThanOrEqual(3);
    expect(searchCatalog('157').map((e) => e.id)).toEqual(['catalog:bpc-157']);
  });

  it('finds both CJC variants and keeps them distinguishable', () => {
    const results = searchCatalog('cjc');
    expect(results).toHaveLength(2);
    expect(new Set(results.map((e) => e.name)).size).toBe(2);
  });

  it('returns nothing for a query that matches nothing', () => {
    expect(searchCatalog('zzzzz')).toHaveLength(0);
  });

  it('ignores surrounding whitespace', () => {
    expect(searchCatalog('  bpc  ').map((e) => e.id)).toEqual(['catalog:bpc-157']);
  });
});
