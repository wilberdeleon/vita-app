/**
 * Whether an ordinary person could actually use these pages.
 *
 * Slice 3.5D's founder test was blunt: *if somebody had never heard of this
 * compound, could they explain in one sentence what people research it for
 * after reading the page?* That is a judgement call, and most of it stays a
 * judgement call. What is mechanical — and what kept regressing — is the
 * failure mode underneath it: a page that describes a molecule's chemistry and
 * never says why anyone cares.
 *
 * These checks are deliberately loose. They are floors, not style rules, so
 * ordinary copy editing does not break the build.
 */

import { PEPTIDE_CATALOG } from '../data/catalog';

const WITH_RESEARCH = PEPTIDE_CATALOG.filter((entry) => entry.research);

describe('every compound explains itself', () => {
  it('has an overview', () => {
    // Pentadeca Arginate shipped with none at all until 3.5D.
    for (const entry of PEPTIDE_CATALOG) {
      expect((entry.research?.overview ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('gives the overview enough room to say something useful', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.research!.overview!.length).toBeGreaterThanOrEqual(120);
    }
  });

  it('keeps the overview to roughly two to four sentences', () => {
    // The counterweight: 3.5D was not permission to write essays.
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.research!.overview!.length).toBeLessThanOrEqual(560);
    }
  });

  /**
   * The core rule. An overview may name the chemistry — that is genuinely
   * useful to some readers — but it may not be *only* chemistry. Somewhere it
   * has to say what the compound is tracked, researched or used for.
   */
  it('says why the compound is tracked, not only what it is made of', () => {
    // The verb and its preposition can be separated by an adverb ("researched
    // almost entirely for"), so the gap is tolerated rather than enumerated.
    const PURPOSE = new RegExp(
      [
        '(tracked|researched|research|studied|used|sold|discussed|trialled|prescribed|approved|marketed|given)' +
          '[a-z0-9 ,\u2019-]{0,34}\\b(for|in|to|as|around|alongside|with)\\b',
        'trials? (for|in)',
        'designed to|aimed at|intended to|known for|is the reason|appears? (so )?often in',
      ].join('|'),
    );
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.research!.overview!.toLowerCase()).toMatch(PURPOSE);
    }
  });
});

describe('claims are consumer-readable', () => {
  it('avoids generic titles where something specific exists', () => {
    // "Metabolic Effects" and "General Wellness" tell a reader nothing.
    const GENERIC = ['metabolic effects', 'health effects', 'research', 'general wellness', 'effects', 'outcomes', 'benefits'];
    for (const entry of WITH_RESEARCH) {
      for (const claim of entry.research!.claims ?? []) {
        expect(GENERIC).not.toContain(claim.title.toLowerCase());
      }
    }
  });

  it('never titles a claim after a receptor or enzyme alone', () => {
    /**
     * A claim headed "MC1 Receptor" is the jargon-as-explanation problem in
     * its purest form — the technical name belongs under HOW IT WORKS and in
     * TARGETS, which are the layers built for it.
     */
    for (const entry of WITH_RESEARCH) {
      for (const claim of entry.research!.claims ?? []) {
        expect(claim.title.toLowerCase()).not.toMatch(/\b(receptor|enzyme|transporter|agonis|inhibitor|signalling|pathway)\b/);
      }
    }
  });

  it('keeps each claim to one or two sentences', () => {
    for (const entry of WITH_RESEARCH) {
      for (const claim of entry.research!.claims ?? []) {
        expect((claim.summary ?? '').length).toBeLessThanOrEqual(300);
      }
    }
  });
});

describe('mechanisms explain their own jargon', () => {
  it('gives every mechanism a real explanation, not a restated name', () => {
    for (const entry of WITH_RESEARCH) {
      for (const item of entry.research!.mechanisms ?? []) {
        expect(item.explanation.length).toBeGreaterThanOrEqual(80);
        expect(item.explanation.length).toBeLessThanOrEqual(400);
      }
    }
  });

  /**
   * If a mechanism introduces an acronym, it has to say what that thing does.
   * "Inhibits NNMT" is the sentence the founder rejected by name.
   */
  it('does not drop an acronym without saying what it is', () => {
    for (const entry of WITH_RESEARCH) {
      for (const item of entry.research!.mechanisms ?? []) {
        const acronyms = item.explanation.match(/\b[A-Z]{3,}(?:-\d+)?\b/g) ?? [];
        if (acronyms.length === 0) continue;
        // An explanation naming a technical thing must also define one.
        expect(item.explanation.toLowerCase()).toMatch(
          /\bis (a|an|the)\b|\bare\b|which|that|called|known as|—/,
        );
      }
    }
  });
});

describe('the mechanism section is not the only explanation', () => {
  it('never leaves a compound with mechanisms but no plain claim', () => {
    for (const entry of WITH_RESEARCH) {
      if ((entry.research!.mechanisms ?? []).length === 0) continue;
      expect((entry.research!.claims ?? []).length).toBeGreaterThan(0);
    }
  });
});

describe('evidence qualification is not repeated across the page', () => {
  /**
   * The page can state the same limitation in five places — each claim's
   * evidence line, Research status, Development status, the overview, and the
   * footer disclaimer. One is information; five is the defensive tone 3.5D was
   * opened to remove.
   */
  const DEFENSIVE = [
    'there is no meaningful human evidence',
    'direct human evidence is limited',
    'only animal studies exist',
    'this has not been proven',
    'more research is needed',
  ];

  it('uses none of the retired defensive formulas', () => {
    for (const entry of WITH_RESEARCH) {
      const research = entry.research!;
      const prose = [
        research.overview ?? '',
        ...(research.claims ?? []).map((claim) => `${claim.title} ${claim.summary ?? ''}`),
        ...(research.mechanisms ?? []).map((item) => item.explanation),
      ]
        .join(' ')
        .toLowerCase();
      for (const phrase of DEFENSIVE) {
        expect(prose).not.toContain(phrase);
      }
    }
  });
});

describe('content depth is proportional, not uniform', () => {
  it('leaves genuinely obscure compounds short rather than padded', () => {
    const withoutClaims = PEPTIDE_CATALOG.filter(
      (entry) => (entry.research?.claims ?? []).length === 0,
    );
    expect(withoutClaims.length).toBeGreaterThan(0);
  });

  it('gives every compound the founder named real claims', () => {
    for (const id of [
      'catalog:5-amino-1mq',
      'catalog:glutathione',
      'catalog:retatrutide',
      'catalog:semaglutide',
      'catalog:tirzepatide',
      'catalog:semax',
      'catalog:selank',
      'catalog:ghk-cu',
      'catalog:bpc-157',
      'catalog:mots-c',
      'catalog:melanotan-ii',
      'catalog:bremelanotide',
      'catalog:ss-31',
      'catalog:humanin',
    ]) {
      const entry = PEPTIDE_CATALOG.find((candidate) => candidate.id === id);
      expect(entry).toBeDefined();
      expect((entry!.research?.claims ?? []).length).toBeGreaterThan(0);
    }
  });
});
