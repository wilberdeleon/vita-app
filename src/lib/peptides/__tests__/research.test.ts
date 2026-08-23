/**
 * Content guardrails for the research library.
 *
 * Slice 3.5A puts real prose in the app, which is useful and also the point
 * where a tracking product can drift into giving medical advice one sentence
 * at a time. These tests are the mechanical floor under that: they fail the
 * build on recommendation phrasing, on dosing amounts, and on sales language.
 *
 * They deliberately do **not** forbid legitimate research vocabulary. A summary
 * may say a compound was studied for obesity, or that it acts at a receptor —
 * that is what the content is for. What it may never do is tell someone what
 * to take.
 */

import { PEPTIDE_CATALOG } from '../data/catalog';
import { EVIDENCE_LABELS } from '../model/labels';

/** Every string of editorial prose the catalog ships. */
const PROSE: { id: string; field: string; text: string }[] = PEPTIDE_CATALOG.flatMap((entry) => {
  const research = entry.research;
  if (!research) return [];
  return [
    ...(research.summary ? [{ id: entry.id, field: 'summary', text: research.summary }] : []),
    ...(research.researchStatus
      ? [{ id: entry.id, field: 'researchStatus', text: research.researchStatus }]
      : []),
    ...(research.studiedFor ?? []).map((text) => ({ id: entry.id, field: 'studiedFor', text })),
    ...(research.targets ?? []).map((text) => ({ id: entry.id, field: 'targets', text })),
  ];
});

const ALL_PROSE = PROSE.map((item) => item.text).join(' \n ').toLowerCase();

describe('no recommendation language', () => {
  /**
   * Phrases that would make VITA the one deciding, rather than the one
   * recording.
   */
  it('never tells the user what to take or how much', () => {
    const forbidden = [
      'recommended dose',
      'recommended dosage',
      'starting dose',
      'typical dose',
      'standard dose',
      'suggested dose',
      'ideal dose',
      'safest dose',
      'optimal dose',
      'you should take',
      'you should inject',
      'you should use',
      'should be taken',
      'should be injected',
      'take this',
      'inject this',
      'best peptide',
      'best for',
      'stack this',
      'stack with',
      'protocol',
      'cycle length',
      'how much to take',
    ];

    for (const phrase of forbidden) {
      expect(ALL_PROSE).not.toContain(phrase);
    }
  });

  it('has no sales or hype language', () => {
    for (const phrase of [
      'miracle',
      'breakthrough',
      'game changer',
      'must-have',
      'fat burner',
      'muscle builder',
      'anti-aging miracle',
      'guaranteed',
      'proven to work',
    ]) {
      expect(ALL_PROSE).not.toContain(phrase);
    }
  });

  /**
   * A concrete amount in editorial copy is indistinguishable from a suggestion,
   * whatever the surrounding sentence says. Amounts belong to the user's own
   * setup, never to VITA's content.
   */
  it('contains no dosing amounts', () => {
    for (const { id, field, text } of PROSE) {
      const amounts = text.match(/\b\d+(\.\d+)?\s?(mg|mcg|µg|ug|iu|ml)\b/gi);
      expect({ id, field, amounts }).toEqual({ id, field, amounts: null });
    }
  });

  /**
   * Amino-acid counts and residue spans are identity facts, not doses — this
   * asserts the rule above did not accidentally ban describing what a molecule
   * *is*.
   */
  it('still allows describing a molecule’s composition', () => {
    const composition = PROSE.filter((item) => /amino[- ]acid|residues/.test(item.text));
    expect(composition.length).toBeGreaterThan(0);
  });
});

describe('"studied for", never "used for"', () => {
  it('uses the research framing in prose', () => {
    // "used for" asserts practice; "studied for" asserts literature. The
    // distinction is the whole posture of the feature.
    expect(ALL_PROSE).not.toContain('used for treating');
    expect(ALL_PROSE).not.toContain('used to treat');
  });

  it('keeps studiedFor entries as short research contexts, not sentences', () => {
    for (const { text } of PROSE.filter((item) => item.field === 'studiedFor')) {
      expect(text.length).toBeLessThanOrEqual(70);
      expect(text).not.toContain('.');
    }
  });
});

describe('evidence levels', () => {
  it('are valid wherever present', () => {
    const valid = Object.keys(EVIDENCE_LABELS);
    for (const entry of PEPTIDE_CATALOG) {
      if (!entry.research?.evidenceLevel) continue;
      expect(valid).toContain(entry.research.evidenceLevel);
    }
  });

  it('describe the literature, not the compound’s worth', () => {
    // No label may read as a verdict on whether something is good or safe.
    const labels = Object.values(EVIDENCE_LABELS).join(' ').toLowerCase();
    for (const word of ['good', 'bad', 'safe', 'unsafe', 'effective', 'ineffective', 'recommended', 'risky']) {
      expect(labels).not.toContain(word);
    }
  });

  it('reserve approved-use for approved medications', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (entry.research?.evidenceLevel !== 'approved-use') continue;
      expect(entry.classification).toBe('approved-medication');
    }
  });

  it('never claim clinical evidence for a vendor-named blend', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (entry.compoundType !== 'blend' || !entry.research?.blendCaveat) continue;
      expect(entry.research.evidenceLevel).toBe('limited');
    }
  });
});

describe('research status', () => {
  it('is present on every entry that has any research content', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (!entry.research) continue;
      expect(entry.research.researchStatus).toBeTruthy();
    }
  });

  /**
   * Approval status is the one claim with a legal edge, so a research compound
   * must never be described in terms that read as approved.
   */
  it('never describes a research compound as FDA-approved', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (entry.classification !== 'research-compound') continue;
      const status = entry.research?.researchStatus ?? '';
      expect(status).not.toMatch(/\bis FDA-approved\b/i);
      expect(status).not.toMatch(/^FDA-approved\./i);
    }
  });

  it('says plainly when something is not approved', () => {
    const research = PEPTIDE_CATALOG.filter((entry) => entry.classification === 'research-compound');
    for (const entry of research) {
      const status = (entry.research?.researchStatus ?? '').toLowerCase();
      expect(status).toMatch(/not (fda-)?approved|not approved|no fda-approved/);
    }
  });
});

describe('sources', () => {
  it('accompany every summary', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (!entry.research?.summary) continue;
      expect(entry.research.references?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('carry a valid source type and a label', () => {
    const valid = ['study', 'clinical-trial', 'regulatory', 'manufacturer', 'reference'];
    for (const entry of PEPTIDE_CATALOG) {
      for (const reference of entry.research?.references ?? []) {
        expect(valid).toContain(reference.sourceType);
        expect(reference.label.length).toBeGreaterThan(0);
      }
    }
  });

  /**
   * Pointers into authoritative databases, never a hand-written citation. A
   * fabricated PMID or DOI naming the wrong paper is worse than no citation,
   * and would be undetectable from inside the app.
   */
  it('point only at authoritative databases', () => {
    const allowedHosts = [
      'https://pubmed.ncbi.nlm.nih.gov/',
      'https://clinicaltrials.gov/',
      'https://www.accessdata.fda.gov/',
    ];

    for (const entry of PEPTIDE_CATALOG) {
      for (const reference of entry.research?.references ?? []) {
        if (!reference.url) continue;
        expect(allowedHosts.some((host) => reference.url!.startsWith(host))).toBe(true);
      }
    }
  });

  it('never links to a vendor or storefront', () => {
    const urls = PEPTIDE_CATALOG.flatMap((entry) =>
      (entry.research?.references ?? []).map((reference) => reference.url ?? ''),
    ).join(' ').toLowerCase();

    for (const word of ['shop', 'buy', 'store', 'cart', 'checkout', 'peptidesciences', 'amazon']) {
      expect(urls).not.toContain(word);
    }
  });
});

describe('coverage of the research content itself', () => {
  it('gives most entries a summary', () => {
    const withSummary = PEPTIDE_CATALOG.filter((entry) => entry.research?.summary);
    expect(withSummary.length / PEPTIDE_CATALOG.length).toBeGreaterThan(0.85);
  });

  /**
   * Where a summary could not be written honestly, the entry carries identity
   * and status only — and the detail screen says so rather than filling the
   * space. This asserts those entries are still coherent, not half-built.
   */
  it('keeps entries without a summary honest rather than empty', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (entry.research?.summary) continue;
      expect(entry.category).toBeTruthy();
      if (entry.research) {
        expect(entry.research.researchStatus).toBeTruthy();
      }
    }
  });
});
