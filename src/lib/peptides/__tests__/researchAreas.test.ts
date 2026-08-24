/**
 * The discovery taxonomy.
 *
 * A category system fails quietly rather than loudly: nothing throws when half
 * the catalog lands in "Other" or when two near-identical compounds get tagged
 * differently — the filter just stops being useful. These tests are what makes
 * that visible.
 */

import { PEPTIDE_CATALOG, findCatalogDefinition, searchCatalog } from '../data/catalog';
import { RESEARCH_AREA_ASSIGNMENTS } from '../data/definitions/researchAreas';
import { RESEARCH_AREA_LABELS } from '../model/labels';
import { RESEARCH_AREAS } from '../model/types';

describe('assignments', () => {
  it('cover every catalog entry — nothing gets in untagged', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(RESEARCH_AREA_ASSIGNMENTS[entry.id]).toBeDefined();
    }
  });

  it('name only real entries — no assignment for an id that no longer exists', () => {
    for (const id of Object.keys(RESEARCH_AREA_ASSIGNMENTS)) {
      expect(findCatalogDefinition(id)).toBeDefined();
    }
  });

  it('use only valid area values', () => {
    for (const entry of PEPTIDE_CATALOG) {
      for (const area of entry.researchAreas ?? []) {
        expect(RESEARCH_AREAS).toContain(area);
      }
    }
  });

  it('give every entry at least one area', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect((entry.researchAreas ?? []).length).toBeGreaterThan(0);
    }
  });

  it('never repeat an area on one entry', () => {
    for (const entry of PEPTIDE_CATALOG) {
      const areas = entry.researchAreas ?? [];
      expect(new Set(areas).size).toBe(areas.length);
    }
  });

  /**
   * "Other" is a last resort, not a dumping ground. If it ever holds a
   * meaningful share of the catalog, the taxonomy has stopped classifying and
   * started shrugging.
   */
  it('keeps Other essentially empty', () => {
    const other = PEPTIDE_CATALOG.filter((entry) => (entry.researchAreas ?? []).includes('other'));
    expect(other.length).toBeLessThanOrEqual(2);
  });

  it('leaves no area so large it stops discriminating', () => {
    for (const area of RESEARCH_AREAS) {
      const count = PEPTIDE_CATALOG.filter((entry) =>
        (entry.researchAreas ?? []).includes(area),
      ).length;
      expect(count).toBeLessThan(PEPTIDE_CATALOG.length * 0.4);
    }
  });

  it('populates every area it defines, so no filter is a dead end', () => {
    for (const area of RESEARCH_AREAS) {
      if (area === 'other') continue;
      expect(searchCatalog('', 'all', area).length).toBeGreaterThan(0);
    }
  });
});

describe('specific placements', () => {
  it('matches the founder-named mappings', () => {
    const expected: Record<string, string[]> = {
      'catalog:retatrutide': ['weight-metabolic'],
      'catalog:cagrilintide': ['weight-metabolic'],
      'catalog:semax': ['cognitive'],
      'catalog:selank': ['cognitive'],
      'catalog:dsip': ['sleep'],
      'catalog:cjc-1295-dac': ['growth-hormone'],
      'catalog:cjc-1295-no-dac': ['growth-hormone'],
      'catalog:ipamorelin': ['growth-hormone'],
      'catalog:bpc-157': ['recovery'],
      'catalog:melanotan-ii': ['aesthetics'],
      'catalog:bremelanotide': ['sexual-health'],
      'catalog:ss-31': ['mitochondrial'],
    };

    for (const [id, areas] of Object.entries(expected)) {
      expect(findCatalogDefinition(id)?.researchAreas).toEqual(areas);
    }
  });

  it('allows several areas where several are genuinely true', () => {
    // Forcing one would make discovery worse and assert a primary purpose the
    // compound does not have.
    expect(findCatalogDefinition('catalog:ghk-cu')?.researchAreas).toEqual(['recovery', 'aesthetics']);
    expect(findCatalogDefinition('catalog:mots-c')?.researchAreas).toEqual([
      'mitochondrial',
      'weight-metabolic',
    ]);
    expect(findCatalogDefinition('catalog:kisspeptin-10')?.researchAreas).toEqual([
      'sexual-health',
      'endocrine',
    ]);
  });

  it('tags blends by their discovery area, not by their components’ union', () => {
    expect(findCatalogDefinition('catalog:blend-glow')?.researchAreas).toEqual([
      'recovery',
      'aesthetics',
    ]);
    expect(findCatalogDefinition('catalog:blend-klow')?.researchAreas).toContain(
      'immune-inflammation',
    );
    expect(findCatalogDefinition('catalog:blend-semax-selank')?.researchAreas).toEqual(['cognitive']);
    expect(findCatalogDefinition('catalog:blend-cagrisema')?.researchAreas).toEqual([
      'weight-metabolic',
    ]);
    expect(findCatalogDefinition('catalog:blend-cjc-ipamorelin')?.researchAreas).toEqual([
      'growth-hormone',
    ]);
  });
});

describe('labels', () => {
  it('name every area', () => {
    for (const area of RESEARCH_AREAS) {
      expect(RESEARCH_AREA_LABELS[area]).toBeTruthy();
    }
  });

  /**
   * An area names a *field of research*. "Weight Loss" would name a result,
   * which is the app implying it can deliver one.
   */
  it('describe research fields, never outcomes or purposes', () => {
    const labels = Object.values(RESEARCH_AREA_LABELS).join(' ').toLowerCase();
    for (const word of ['loss', 'burn', 'boost', 'enhance', 'gain', 'builder', 'best', 'anti-aging']) {
      expect(labels).not.toContain(word);
    }
  });
});
