/**
 * Shared helpers for the catalog definition files.
 *
 * ── About the research content in these files ──────────────────────────
 *
 * Every summary describes what a compound **is** and what has been **studied**.
 * None of it says what anyone should take, how much, or why. A content test
 * (`__tests__/research.test.ts`) fails the build on recommendation phrasing.
 *
 * References are deliberately **pointers into authoritative databases** rather
 * than specific citations. A hand-written PMID or DOI that turns out to name
 * the wrong paper is worse than no citation at all; a search pointer is
 * verifiable by anyone who taps it, and stays correct as the literature grows.
 *
 * ⚠️ **This content is engineering-authored and has not been through medical
 * or legal review.** It is written conservatively and sourced by pointer, but
 * the founders' content review (Open Question #17) is still owed before this
 * ships to users.
 */

import type { PeptideDefinition, ResearchReference } from '../../model/types';

/** A catalog entry before `origin` and `catalogVersion` are stamped on. */
export type CatalogSeed = Omit<PeptideDefinition, 'origin' | 'catalogVersion'>;

/** A PubMed literature search for a compound. */
export function pubmed(term: string): ResearchReference {
  return {
    label: `PubMed literature — ${term}`,
    url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(term)}`,
    sourceType: 'study',
  };
}

/** A ClinicalTrials.gov search for a compound. */
export function trials(term: string): ResearchReference {
  return {
    label: `ClinicalTrials.gov — ${term}`,
    url: `https://clinicaltrials.gov/search?intr=${encodeURIComponent(term)}`,
    sourceType: 'clinical-trial',
  };
}

/** The FDA's approved-drug database, for anything whose approval status matters. */
export function fdaLabel(term: string): ResearchReference {
  return {
    label: `FDA Drugs@FDA — ${term}`,
    url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=BasicSearch.process`,
    sourceType: 'regulatory',
  };
}
