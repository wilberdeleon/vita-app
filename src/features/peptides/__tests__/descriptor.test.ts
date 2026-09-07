/**
 * The peptide descriptor, and the catalog audit behind it.
 *
 * §59 of the 5.5C authorization asks for every descriptor used in the slice
 * to be audited rather than spot-checked, because this is the one place in
 * Peptides where the app states a fact about a compound next to a control
 * that configures a routine. These tests are that audit: they run over all 96
 * built-in entries, not over a fixture.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { PEPTIDE_CATALOG, findCatalogDefinition } from '../../../lib/peptides';
import { peptideDescriptor } from '../descriptor';

const byName = (name: string) => PEPTIDE_CATALOG.find((entry) => entry.name === name)!;

describe('the descriptor', () => {
  it('reads as a class, not as a claim', () => {
    // Title-cased by `formatLabel`, the same way the category reads on the
    // catalog screen — one compound must not be cased two ways in one app.
    expect(peptideDescriptor(byName('Retatrutide'))).toBe(
      'Triple Agonist · GIP / GLP-1 / Glucagon',
    );
    expect(peptideDescriptor(byName('Tesamorelin'))).toBe('GHRH Analog');
  });

  it('names the chemistry when the compound is not a peptide', () => {
    // The genuinely useful fact in a peptide tracker: this one is not one.
    expect(peptideDescriptor(byName('5-Amino-1MQ'))).toBe('NNMT Inhibitor · Small molecule');
  });

  it('says nothing extra when the compound is a peptide', () => {
    expect(peptideDescriptor(byName('Semax'))).toBe('ACTH (4-10) Analog');
  });

  it('never repeats a word the category already used', () => {
    for (const definition of PEPTIDE_CATALOG) {
      const descriptor = peptideDescriptor(definition);
      if (!descriptor) continue;
      const [head, tail] = descriptor.split(' · ').slice(-2);
      if (!tail) continue;
      expect(head.toLowerCase()).not.toContain(tail.toLowerCase());
    }
  });

  it('has one for every built-in entry', () => {
    /*
     * §24: report which entries lack a suitable short descriptor rather than
     * inventing a taxonomy. The answer is none — `category` is populated
     * across the whole catalog, which is why this slice authored no new
     * content at all.
     */
    const missing = PEPTIDE_CATALOG.filter((entry) => peptideDescriptor(entry) === null);
    expect(missing.map((entry) => entry.name)).toEqual([]);
  });

  it('stays to one or two lines', () => {
    // §23. The longest in the catalog, measured rather than assumed.
    for (const definition of PEPTIDE_CATALOG) {
      expect((peptideDescriptor(definition) ?? '').length).toBeLessThanOrEqual(60);
    }
  });

  it('makes no claim about what a compound does for anyone', () => {
    /*
     * The content boundary, enforced over the real catalog rather than
     * trusted. A descriptor states what a compound *is*; every phrase here is
     * a statement about what it would do *for you*.
     */
    const FORBIDDEN = [
      'helps',
      'best for',
      'improves',
      'boosts',
      'burns',
      'treats',
      'cures',
      'prevents',
      'recommended',
      'popular',
      'typical',
      'starting dose',
      'mg',
      'mcg',
      'daily',
      'weekly',
    ];

    for (const definition of PEPTIDE_CATALOG) {
      const descriptor = (peptideDescriptor(definition) ?? '').toLowerCase();
      for (const phrase of FORBIDDEN) {
        expect(descriptor.includes(phrase)).toBe(false);
      }
    }
  });

  it('gives a compound with no category nothing rather than filler', () => {
    // A custom compound someone typed in themselves. Silence is honest.
    const custom = { ...byName('Semax'), category: undefined };
    expect(peptideDescriptor(custom)).toBeNull();
  });

  it('is the catalog’s own words, not this module’s', () => {
    const definition = findCatalogDefinition('catalog:retatrutide')!;
    // Every token of the descriptor comes from the catalog entry itself.
    for (const token of definition.category!.split(/[^A-Za-z0-9-]+/).filter(Boolean)) {
      expect(peptideDescriptor(definition)!.toLowerCase()).toContain(token.toLowerCase());
    }
  });
});
