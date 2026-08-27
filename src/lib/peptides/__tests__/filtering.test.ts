/**
 * Combined filtering: classification AND research area AND query.
 *
 * Three independent narrowing dimensions is exactly the shape where an
 * off-by-one in the predicate produces a plausible-looking but wrong list —
 * results that are *almost* right are the hardest kind to notice by eye.
 */

import { PEPTIDE_CATALOG, searchCatalog } from '../data/catalog';

describe('no filters', () => {
  it('returns the whole catalog', () => {
    expect(searchCatalog('', 'all', 'all')).toHaveLength(PEPTIDE_CATALOG.length);
  });
});

describe('classification and area combine', () => {
  it('Research + Cognitive returns only research-classified cognitive entries', () => {
    const results = searchCatalog('', 'research', 'cognitive');
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      expect(entry.classification).toBe('research-compound');
      expect(entry.researchAreas).toContain('cognitive');
    }
    expect(results.map((e) => e.id)).toContain('catalog:semax');
  });

  it('Approved + Weight & Metabolic returns only approved metabolic medicines', () => {
    const results = searchCatalog('', 'approved', 'weight-metabolic');
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      expect(entry.classification).toBe('approved-medication');
      expect(entry.researchAreas).toContain('weight-metabolic');
    }
    expect(results.map((e) => e.id)).toContain('catalog:semaglutide');
    // Retatrutide is investigational — it must not appear under Approved.
    expect(results.map((e) => e.id)).not.toContain('catalog:retatrutide');
  });

  it('Blends + Growth Hormone finds the growth-hormone pairings only', () => {
    const results = searchCatalog('', 'blend', 'growth-hormone');
    // Slice 3.9A added a second GH-oriented blend; both belong here, and
    // nothing outside that area does.
    expect(results.map((e) => e.id).sort()).toEqual([
      'catalog:blend-cjc-ipamorelin',
      'catalog:blend-tesamorelin-ipamorelin',
    ]);
  });

  it('All + Aesthetics spans classifications', () => {
    const results = searchCatalog('', 'all', 'aesthetics');
    const ids = results.map((e) => e.id);
    expect(ids).toContain('catalog:melanotan-i'); // approved
    expect(ids).toContain('catalog:melanotan-ii'); // research
    expect(ids).toContain('catalog:blend-glow'); // blend
  });

  it('never returns an entry that fails either filter', () => {
    for (const filter of ['all', 'approved', 'research', 'blend'] as const) {
      for (const area of ['cognitive', 'recovery', 'growth-hormone'] as const) {
        for (const entry of searchCatalog('', filter, area)) {
          expect(entry.researchAreas).toContain(area);
          if (filter === 'approved') expect(entry.classification).toBe('approved-medication');
          if (filter === 'research') expect(entry.classification).toBe('research-compound');
          if (filter === 'blend') expect(entry.compoundType).toBe('blend');
        }
      }
    }
  });
});

describe('search narrows within the filters', () => {
  it('applies query, classification, and area together', () => {
    const results = searchCatalog('cjc', 'research', 'growth-hormone');
    for (const entry of results) {
      expect(entry.name.toLowerCase()).toContain('cjc');
      expect(entry.classification).toBe('research-compound');
      expect(entry.researchAreas).toContain('growth-hormone');
    }
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('finds an entry by alias inside a category', () => {
    // Someone who knows it as Ozempic, browsing metabolic compounds.
    const results = searchCatalog('ozempic', 'all', 'weight-metabolic');
    expect(results.map((e) => e.id)).toEqual(['catalog:semaglutide']);
  });

  it('returns nothing when the alias is real but the category excludes it', () => {
    expect(searchCatalog('ozempic', 'all', 'cognitive')).toHaveLength(0);
  });

  it('returns nothing for a query with no match in the category', () => {
    expect(searchCatalog('zzzz', 'all', 'recovery')).toHaveLength(0);
  });
});

describe('clearing a filter', () => {
  it('restores everything the classification allows', () => {
    const narrowed = searchCatalog('', 'research', 'sleep');
    const cleared = searchCatalog('', 'research', 'all');
    expect(cleared.length).toBeGreaterThan(narrowed.length);
    for (const entry of narrowed) {
      expect(cleared.map((e) => e.id)).toContain(entry.id);
    }
  });

  it('is idempotent — clearing twice is the same as clearing once', () => {
    expect(searchCatalog('', 'all', 'all')).toEqual(searchCatalog('', 'all', 'all'));
  });
});
