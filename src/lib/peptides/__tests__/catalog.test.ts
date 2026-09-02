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
const ALLOWED_FIELDS = [
  'id',
  'name',
  'classification',
  'compoundType',
  'category',
  'aliases',
  'components',
  'researchAreas',
  'research',
  'origin',
  'catalogVersion',
];

describe('catalog scope', () => {
  /**
   * Expanded in slice 3.5A. The floor exists so the library cannot quietly
   * shrink back to a token list; there is no ceiling, because the founder
   * direction is coverage — if a compound is commonly encountered and its
   * identity can be verified, VITA should be able to represent it.
   */
  it('is a substantial library, not a token list', () => {
    expect(PEPTIDE_CATALOG.length).toBeGreaterThanOrEqual(60);
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
   * Three compounds were left out of the slice 3.5 catalog because one
   * molecule carried both an approved-product name and a research-chemical
   * name, and there was no field to hold the nuance. Slice 3.5A added
   * `researchStatus`, so they are now included **with the nuance stated in
   * words** rather than flattened into a bucket. This test is what stops the
   * nuance being dropped later.
   */
  it('carries the previously-omitted compounds with their status spelled out', () => {
    const nuanced = [
      { name: 'Sermorelin', mustMention: 'withdrawn' },
      { name: 'Bremelanotide', mustMention: 'Vyleesi' },
      { name: 'Melanotan I', mustMention: 'Scenesse' },
      { name: 'Thymosin Alpha-1', mustMention: 'outside the United States' },
    ];

    for (const { name, mustMention } of nuanced) {
      const entry = PEPTIDE_CATALOG.find((e) => e.name === name);
      expect(entry).toBeDefined();
      expect(entry?.research?.researchStatus).toContain(mustMention);
    }
  });

  /**
   * Raised in founder review. GLOW and KLOW have transparent naming; no
   * comparable established meaning for "CLOW" could be verified, and inventing
   * a component list to fit a name is exactly what the blend rules forbid.
   */
  it('does not invent a CLOW blend', () => {
    const names = PEPTIDE_CATALOG.map((e) => e.name.toLowerCase());
    expect(names).not.toContain('clow');
    expect(JSON.stringify(PEPTIDE_CATALOG).toLowerCase()).not.toContain('"clow"');
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

  /**
   * Categories are biological class labels — "Dual GIP / GLP-1 agonist",
   * "Copper peptide". Sales language would turn browsing into a
   * recommendation, which is exactly what the catalog must not be.
   */
  it('has no sales or goal language in any category', () => {
    const categories = PEPTIDE_CATALOG.map((entry) => entry.category ?? '').join(' ').toLowerCase();
    for (const word of [
      'fat burner',
      'fat loss',
      'weight loss',
      'muscle builder',
      'anti-aging',
      'anti aging',
      'best',
      'popular',
      'safest',
      'beginner',
      'recommended',
      'miracle',
      'stack',
    ]) {
      expect(categories).not.toContain(word);
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
    const upper = searchCatalog('SEMAGLUTIDE').map((e) => e.id);
    const lower = searchCatalog('semaglutide').map((e) => e.id);
    expect(upper).toEqual(lower);
    expect(upper).toContain('catalog:semaglutide');
  });

  it('matches a substring anywhere in the name', () => {
    expect(searchCatalog('glutide').length).toBeGreaterThanOrEqual(4);
    expect(searchCatalog('157').map((e) => e.id)).toContain('catalog:bpc-157');
  });

  it('finds both CJC variants and keeps them distinguishable', () => {
    const results = searchCatalog('cjc');
    // Two variants plus the blend that names one of them.
    const variants = results.filter((entry) => entry.compoundType !== 'blend');
    expect(variants).toHaveLength(2);
    expect(new Set(variants.map((e) => e.name)).size).toBe(2);
  });

  it('returns nothing for a query that matches nothing', () => {
    expect(searchCatalog('zzzzz')).toHaveLength(0);
  });

  it('ignores surrounding whitespace', () => {
    expect(searchCatalog('  bpc  ').map((e) => e.id)).toEqual(searchCatalog('bpc').map((e) => e.id));
    expect(searchCatalog('  bpc  ').map((e) => e.id)).toContain('catalog:bpc-157');
  });
});
