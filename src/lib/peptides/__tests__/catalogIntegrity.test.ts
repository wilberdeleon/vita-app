/**
 * Structural integrity of the expanded catalog.
 *
 * With 70-odd entries assembled from six files, the failure modes stop being
 * "someone wrote bad prose" and start being "someone duplicated an id",
 * "a blend points at a compound that was renamed", or "an alias collides with
 * a real entry's name so search returns the wrong thing". None of those throw
 * at runtime — they just quietly make the library wrong.
 */

import {
  PEPTIDE_CATALOG,
  findCatalogDefinition,
  resolveBlendComponents,
  searchCatalog,
} from '../data/catalog';

const BLENDS = PEPTIDE_CATALOG.filter((entry) => entry.compoundType === 'blend');
const NON_BLENDS = PEPTIDE_CATALOG.filter((entry) => entry.compoundType !== 'blend');

describe('compound type', () => {
  it('is one of the supported values on every entry', () => {
    const valid = ['peptide', 'protein', 'small-molecule', 'blend', 'other'];
    for (const entry of PEPTIDE_CATALOG) {
      expect(valid).toContain(entry.compoundType);
    }
  });

  /**
   * The point of having a compound type at all: the ecosystem sells these
   * beside peptides, and VITA lists them — but does not call them peptides.
   */
  it('does not describe known non-peptides as peptides', () => {
    const notPeptides: Record<string, string> = {
      'catalog:mk-677': 'small-molecule',
      'catalog:5-amino-1mq': 'small-molecule',
      'catalog:tesofensine': 'small-molecule',
      'catalog:nad-plus': 'other',
      'catalog:somatropin': 'protein',
      'catalog:hcg': 'protein',
      'catalog:dihexa': 'other',
      'catalog:cerebrolysin': 'other',
    };

    for (const [id, expected] of Object.entries(notPeptides)) {
      expect(findCatalogDefinition(id)?.compoundType).toBe(expected);
    }
  });

  it('marks every blend as a blend and nothing else', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.compoundType === 'blend').toBe((entry.components ?? []).length > 0);
    }
  });
});

describe('aliases', () => {
  it('never collide with another entry’s primary name', () => {
    // An alias shadowing a real name would make search return the wrong
    // compound for an exact query.
    const names = new Set(PEPTIDE_CATALOG.map((entry) => entry.name.toLowerCase()));
    for (const entry of PEPTIDE_CATALOG) {
      for (const alias of entry.aliases ?? []) {
        expect(names.has(alias.toLowerCase())).toBe(false);
      }
    }
  });

  it('are never shared between two entries', () => {
    const seen = new Map<string, string>();
    for (const entry of PEPTIDE_CATALOG) {
      for (const alias of entry.aliases ?? []) {
        const key = alias.toLowerCase();
        expect(seen.has(key)).toBe(false);
        seen.set(key, entry.id);
      }
    }
  });

  it('never repeat the entry’s own name', () => {
    for (const entry of PEPTIDE_CATALOG) {
      for (const alias of entry.aliases ?? []) {
        expect(alias.toLowerCase()).not.toBe(entry.name.toLowerCase());
      }
    }
  });

  it('are searchable', () => {
    // The whole reason aliases exist: people type the name they know.
    const cases: [string, string][] = [
      ['PT-141', 'catalog:bremelanotide'],
      ['Ozempic', 'catalog:semaglutide'],
      ['Mounjaro', 'catalog:tirzepatide'],
      ['Mod GRF 1-29', 'catalog:cjc-1295-no-dac'],
      ['Elamipretide', 'catalog:ss-31'],
      ['Ibutamoren', 'catalog:mk-677'],
      ['Epithalon', 'catalog:epitalon'],
      ['Afamelanotide', 'catalog:melanotan-i'],
      ['Thymalfasin', 'catalog:thymosin-alpha-1'],
    ];

    for (const [query, expectedId] of cases) {
      expect(searchCatalog(query).map((entry) => entry.id)).toContain(expectedId);
    }
  });

  it('lets a class query find the whole class', () => {
    expect(searchCatalog('GLP-1').length).toBeGreaterThanOrEqual(5);
    expect(searchCatalog('secretagogue').length).toBeGreaterThanOrEqual(4);
    expect(searchCatalog('mitochondrial').length).toBeGreaterThanOrEqual(3);
  });
});

describe('compounds that are commonly conflated stay separate', () => {
  /**
   * Aliasing these together would erase a real chemical difference, which is
   * the opposite of what a reference library is for.
   */
  it('keeps TB-500 and Thymosin Beta-4 as distinct entries', () => {
    const tb500 = findCatalogDefinition('catalog:tb-500');
    const tb4 = findCatalogDefinition('catalog:thymosin-beta-4');
    expect(tb500).toBeDefined();
    expect(tb4).toBeDefined();
    expect(tb500?.id).not.toBe(tb4?.id);
    expect(tb500?.research?.summary).toContain('not the same molecule');
  });

  it('keeps AOD-9604 and HGH Fragment 176-191 as distinct entries', () => {
    const aod = findCatalogDefinition('catalog:aod-9604');
    const fragment = findCatalogDefinition('catalog:hgh-fragment-176-191');
    expect(aod).toBeDefined();
    expect(fragment).toBeDefined();
    expect(fragment?.research?.summary).toContain('not the same molecule');
  });
});

describe('blends', () => {
  it('exist', () => {
    expect(BLENDS.length).toBeGreaterThanOrEqual(4);
  });

  it('have at least two components each', () => {
    for (const blend of BLENDS) {
      expect((blend.components ?? []).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('reference only components that resolve', () => {
    for (const blend of BLENDS) {
      for (const component of blend.components ?? []) {
        expect(findCatalogDefinition(component.definitionId)).toBeDefined();
      }
      // And the resolver agrees — nothing silently dropped.
      expect(resolveBlendComponents(blend)).toHaveLength((blend.components ?? []).length);
    }
  });

  it('never reference themselves or another blend', () => {
    for (const blend of BLENDS) {
      for (const component of blend.components ?? []) {
        expect(component.definitionId).not.toBe(blend.id);
        expect(findCatalogDefinition(component.definitionId)?.compoundType).not.toBe('blend');
      }
    }
  });

  it('have no duplicate components within one blend', () => {
    for (const blend of BLENDS) {
      const ids = (blend.components ?? []).map((component) => component.definitionId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  /**
   * The rule the blend file exists to enforce. Vendor-named blends have no
   * standardized composition, and stating one supplier's ratio as if it were
   * the definition would invent a standard that does not exist.
   */
  it('do not assert component amounts for vendor-named blends', () => {
    for (const id of ['catalog:blend-glow', 'catalog:blend-klow', 'catalog:blend-bpc157-tb500']) {
      const blend = findCatalogDefinition(id);
      expect(blend).toBeDefined();
      for (const component of blend?.components ?? []) {
        expect(component.amount).toBeUndefined();
        expect(component.unit).toBeUndefined();
      }
    }
  });

  it('carry the component-evidence caveat where the combination is unstudied', () => {
    for (const id of ['catalog:blend-glow', 'catalog:blend-klow', 'catalog:blend-semax-selank']) {
      expect(findCatalogDefinition(id)?.research?.blendCaveat).toBe(true);
    }
  });

  /**
   * CagriSema is the exception that proves the caveat means something: it is a
   * manufacturer combination evaluated as one formulation, so claiming its
   * evidence comes only from its parts would be wrong in the other direction.
   */
  it('omits the caveat where the combination itself was studied', () => {
    expect(findCatalogDefinition('catalog:blend-cagrisema')?.research?.blendCaveat).toBeUndefined();
  });

  it('are contained by the blend filter, and excluded from the others', () => {
    const blendResults = searchCatalog('', 'blend');
    expect(blendResults).toHaveLength(BLENDS.length);
    for (const entry of blendResults) {
      expect(entry.compoundType).toBe('blend');
    }
  });
});

describe('filters', () => {
  it('separate approved from research without losing anything', () => {
    const approved = searchCatalog('', 'approved');
    const research = searchCatalog('', 'research');
    expect(approved.length + research.length).toBe(PEPTIDE_CATALOG.length);
    for (const entry of approved) expect(entry.classification).toBe('approved-medication');
    for (const entry of research) expect(entry.classification).toBe('research-compound');
  });

  it('combine with a query', () => {
    const results = searchCatalog('glutide', 'approved');
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      expect(entry.classification).toBe('approved-medication');
    }
  });

  it('return everything under "all"', () => {
    expect(searchCatalog('', 'all')).toHaveLength(PEPTIDE_CATALOG.length);
  });
});

describe('coverage', () => {
  /**
   * Not a quota — a check that each major group the founders named is actually
   * represented, so an accidental deletion of a whole definitions file is
   * caught rather than quietly shrinking the library.
   */
  it('covers every major group', () => {
    const groups: [string, string[]][] = [
      ['incretin', ['catalog:semaglutide', 'catalog:tirzepatide', 'catalog:retatrutide']],
      ['growth hormone', ['catalog:cjc-1295-dac', 'catalog:ipamorelin', 'catalog:sermorelin']],
      ['recovery', ['catalog:bpc-157', 'catalog:tb-500', 'catalog:ghk-cu', 'catalog:kpv']],
      ['mitochondrial', ['catalog:mots-c', 'catalog:ss-31', 'catalog:humanin']],
      ['neuro', ['catalog:semax', 'catalog:selank', 'catalog:epitalon', 'catalog:dsip']],
      ['endocrine', ['catalog:melanotan-ii', 'catalog:bremelanotide', 'catalog:kisspeptin-10']],
      ['blends', ['catalog:blend-glow', 'catalog:blend-klow']],
    ];

    for (const [, ids] of groups) {
      for (const id of ids) {
        expect(findCatalogDefinition(id)).toBeDefined();
      }
    }
  });

  it('corrects the CJC variants to GHRH analogs, not secretagogues', () => {
    // They act at the GHRH receptor, not the ghrelin receptor — miscategorised
    // in the slice 3.5 catalog.
    for (const id of ['catalog:cjc-1295-dac', 'catalog:cjc-1295-no-dac']) {
      expect(findCatalogDefinition(id)?.category).toBe('GHRH analog');
    }
    // And the genuine secretagogues still say so.
    expect(findCatalogDefinition('catalog:ipamorelin')?.category).toBe('Growth hormone secretagogue');
  });

  it('gives every non-blend entry a category', () => {
    for (const entry of NON_BLENDS) {
      expect(entry.category).toBeTruthy();
    }
  });
});
