/**
 * Research claims, and the identity of the compounds they describe.
 *
 * Two risks live here. The first is drift: a "claims" section is the easiest
 * place for a tracking app to start sounding like a storefront. The second is
 * cross-contamination — the founder flagged an example where Semaglutide and a
 * cognitive description were conflated, and that class of error is invisible to
 * a reader who does not already know the compound. Both are pinned below
 * rather than left to human review.
 */

import { PEPTIDE_CATALOG, findCatalogDefinition } from '../data/catalog';
import { EVIDENCE_LABELS } from '../model/labels';

const WITH_CLAIMS = PEPTIDE_CATALOG.filter((entry) => (entry.research?.claims ?? []).length > 0);
const ALL_CLAIMS = WITH_CLAIMS.flatMap((entry) => entry.research!.claims!);
const CLAIM_TEXT = ALL_CLAIMS.map((claim) => `${claim.title} ${claim.summary ?? ''}`)
  .join(' \n ')
  .toLowerCase();

describe('shape', () => {
  it('gives every claim a non-empty title', () => {
    for (const claim of ALL_CLAIMS) {
      expect(claim.title.trim().length).toBeGreaterThan(0);
    }
  });

  it('gives every claim an evidence level', () => {
    // A claim without one launders folklore and clinical evidence together.
    for (const claim of ALL_CLAIMS) {
      expect(Object.keys(EVIDENCE_LABELS)).toContain(claim.evidenceLevel);
    }
  });

  it('keeps claim titles short enough to scan', () => {
    for (const claim of ALL_CLAIMS) {
      expect(claim.title.length).toBeLessThanOrEqual(32);
    }
  });

  it('never duplicates a title within one compound', () => {
    for (const entry of WITH_CLAIMS) {
      const titles = entry.research!.claims!.map((claim) => claim.title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it('keeps each compound to a readable number of claims', () => {
    for (const entry of WITH_CLAIMS) {
      expect(entry.research!.claims!.length).toBeLessThanOrEqual(5);
    }
  });
});

describe('evidence qualification', () => {
  /**
   * A weakly supported claim must say so in words, not only in a badge someone
   * may not read. "Commonly claimed… although direct human evidence is
   * limited" is more useful than either silence or false confidence.
   */
  it('qualifies every limited-evidence claim in its own text', () => {
    for (const claim of ALL_CLAIMS) {
      if (claim.evidenceLevel !== 'limited') continue;
      const text = (claim.summary ?? '').toLowerCase();
      expect(text).toMatch(/limited|commonly claimed|commonly discussed|inconsistent|thin/);
    }
  });

  it('attributes preclinical claims to animal or laboratory work', () => {
    for (const claim of ALL_CLAIMS) {
      if (claim.evidenceLevel !== 'preclinical') continue;
      const text = (claim.summary ?? '').toLowerCase();
      expect(text).toMatch(/animal|laboratory|preclinical|cell|model/);
    }
  });

  it('reserves approved-use claims for approved medications', () => {
    for (const entry of WITH_CLAIMS) {
      for (const claim of entry.research!.claims!) {
        if (claim.evidenceLevel !== 'approved-use') continue;
        expect(entry.classification).toBe('approved-medication');
      }
    }
  });
});

describe('language', () => {
  it('still forbids recommendation phrasing', () => {
    for (const phrase of [
      'recommended dose',
      'starting dose',
      'you should take',
      'you should inject',
      'ideal amount',
      'best peptide for',
      'stack with',
      'protocol',
      'use this to treat',
      'how much to take',
    ]) {
      expect(CLAIM_TEXT).not.toContain(phrase);
    }
  });

  /**
   * The counterpart to the rule above: banning effect language outright would
   * have made this whole section useless. Qualified effect vocabulary is the
   * point.
   */
  it('does allow qualified effect language', () => {
    for (const word of ['appetite', 'weight reduction', 'glucose', 'pigmentation', 'repair']) {
      expect(CLAIM_TEXT).toContain(word);
    }
  });

  it('contains no dosing amounts', () => {
    for (const claim of ALL_CLAIMS) {
      expect(`${claim.title} ${claim.summary ?? ''}`).not.toMatch(
        /\b\d+(\.\d+)?\s?(mg|mcg|µg|ug|iu|ml)\b/i,
      );
    }
  });
});

describe('blends do not inherit their components’ claims', () => {
  /**
   * Summing component effects would manufacture a claim about the *blend* out
   * of evidence that only exists for its parts. GLOW is not clinically studied
   * because GHK-Cu, BPC-157 and TB-500 each have separate literature.
   */
  it('gives vendor-named blends no claims at all', () => {
    for (const id of [
      'catalog:blend-glow',
      'catalog:blend-klow',
      'catalog:blend-bpc157-tb500',
      'catalog:blend-semax-selank',
      'catalog:blend-cjc-ipamorelin',
    ]) {
      expect(findCatalogDefinition(id)?.research?.claims).toBeUndefined();
    }
  });

  it('allows a claim where the combination itself was studied', () => {
    // CagriSema is a manufacturer combination evaluated as one formulation.
    const cagrisema = findCatalogDefinition('catalog:blend-cagrisema');
    expect((cagrisema?.research?.claims ?? []).length).toBeGreaterThan(0);
    expect(cagrisema?.research?.blendCaveat).toBeUndefined();
  });
});

describe('content identity — no cross-contamination', () => {
  /** Everything one entry says about itself, lowercased. */
  function textOf(id: string): string {
    const entry = findCatalogDefinition(id);
    const research = entry?.research;
    return [
      entry?.category ?? '',
      research?.overview ?? '',
      ...(research?.claims ?? []).map((claim) => `${claim.title} ${claim.summary ?? ''}`),
      ...(research?.mechanisms ?? []).map((item) => `${item.title} ${item.explanation}`),
      ...(research?.studiedFor ?? []),
      ...(research?.targets ?? []),
    ]
      .join(' ')
      .toLowerCase();
  }

  it('Semaglutide is metabolic, and carries no cognitive content', () => {
    const text = textOf('catalog:semaglutide');
    expect(text).toContain('glp-1');
    expect(text).toMatch(/weight|blood sugar|diabetes/);
    for (const wrong of ['bdnf', 'cognitive', 'semax', 'nootropic', 'anxiety', 'neuroprotect']) {
      expect(text).not.toContain(wrong);
    }
  });

  it('Semax is cognitive, and carries no metabolic-drug content', () => {
    const text = textOf('catalog:semax');
    expect(text).toMatch(/cognit|brain|memory|stroke/);
    for (const wrong of ['glp-1', 'gip', 'incretin', 'semaglutide', 'obesity', 'type 2 diabetes']) {
      expect(text).not.toContain(wrong);
    }
  });

  it('Retatrutide describes triple agonism at all three receptors', () => {
    const text = textOf('catalog:retatrutide');
    expect(text).toContain('triple agonist');
    for (const target of ['glp-1', 'gip', 'glucagon']) {
      expect(text).toContain(target);
    }
  });

  it('Cagrilintide is an amylin analog, not described as Retatrutide', () => {
    const text = textOf('catalog:cagrilintide');
    expect(text).toContain('amylin');
    expect(text).not.toContain('retatrutide');
    expect(text).not.toContain('triple agonist');
  });

  it('GLOW remains a blend of its three named components', () => {
    const glow = findCatalogDefinition('catalog:blend-glow');
    expect(glow?.compoundType).toBe('blend');
    expect((glow?.components ?? []).map((component) => component.definitionId)).toEqual([
      'catalog:ghk-cu',
      'catalog:bpc-157',
      'catalog:tb-500',
    ]);
  });

  it('no entry describes itself using an unrelated compound’s name', () => {
    /**
     * A blunt sweep for the class of error the founder flagged: an overview
     * that names some other catalog entry it has nothing to do with.
     *
     * Three relationships are legitimate and skipped — the entry itself, a
     * blend naming its own components, and a derivative whose *name* already
     * contains the parent's (N-Acetyl Selank Amidate is a modified Selank, so
     * saying so is the description, not contamination). Anything left has to
     * be an overview that explicitly distinguishes the two compounds.
     */
    const names = PEPTIDE_CATALOG.map((entry) => ({ id: entry.id, name: entry.name.toLowerCase() }));
    const DISTINGUISHING = /unlike|distinct from|not the same|separately|different compound|rather than|frequently sold|combination|combined|listed here/;

    for (const entry of PEPTIDE_CATALOG) {
      const overview = (entry.research?.overview ?? '').toLowerCase();
      if (!overview) continue;
      const relatedIds = new Set([
        entry.id,
        ...(entry.components ?? []).map((component) => component.definitionId),
      ]);
      const ownName = entry.name.toLowerCase();

      for (const other of names) {
        if (relatedIds.has(other.id)) continue;
        if (other.name.length < 6) continue; // short names appear inside words
        if (ownName.includes(other.name)) continue; // a named derivative of it
        if (overview.includes(other.name) && !DISTINGUISHING.test(overview)) {
          throw new Error(`${entry.id} overview mentions unrelated compound "${other.name}"`);
        }
      }
    }
  });
});

describe('content depth is proportional', () => {
  it('gives the priority compounds real claims', () => {
    for (const id of [
      'catalog:retatrutide',
      'catalog:semaglutide',
      'catalog:tirzepatide',
      'catalog:cagrilintide',
      'catalog:bpc-157',
      'catalog:mots-c',
      'catalog:semax',
      'catalog:selank',
      'catalog:ghk-cu',
      'catalog:5-amino-1mq',
    ]) {
      expect((findCatalogDefinition(id)?.research?.claims ?? []).length).toBeGreaterThan(0);
    }
  });

  /**
   * Obscure compounds are deliberately left short. A page with an honest gap
   * is better than one padded with confident filler.
   */
  it('does not require claims on every entry', () => {
    expect(WITH_CLAIMS.length).toBeLessThan(PEPTIDE_CATALOG.length);
  });
});
