/**
 * Development status.
 *
 * This is the most perishable content in the app and the one place a wrong
 * word carries a real cost: "planned submission" and "approval expected" are
 * one edit apart, and only one of them is a fact. These tests guard the
 * difference, and guard against a phase being asserted without a date or a
 * source behind it.
 */

import { PEPTIDE_CATALOG, findCatalogDefinition } from '../data/catalog';
import { TIME_SENSITIVE_STAGES, type DevelopmentStage } from '../model/types';

const VALID_STAGES: DevelopmentStage[] = [
  'approved',
  'submitted',
  'phase-3',
  'phase-2',
  'phase-1',
  'early-human',
  'preclinical',
  'not-in-clinical-development',
  'discontinued',
  'unknown',
];

const WITH_STATUS = PEPTIDE_CATALOG.filter((entry) => entry.research?.developmentStatus);

describe('shape', () => {
  it('uses only valid stages', () => {
    for (const entry of WITH_STATUS) {
      expect(VALID_STAGES).toContain(entry.research!.developmentStatus!.stage);
    }
  });

  it('gives every status a label', () => {
    for (const entry of WITH_STATUS) {
      expect(entry.research!.developmentStatus!.label.length).toBeGreaterThan(0);
    }
  });

  it('formats every date as "Month YYYY"', () => {
    for (const entry of WITH_STATUS) {
      const { lastUpdated } = entry.research!.developmentStatus!;
      if (!lastUpdated) continue;
      expect(lastUpdated).toMatch(
        /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/,
      );
    }
  });
});

describe('freshness', () => {
  /**
   * A phase stated without a date asserts permanent truth about something that
   * changes. The date is what makes it a point-in-time report.
   */
  it('dates every time-sensitive stage', () => {
    for (const entry of WITH_STATUS) {
      const status = entry.research!.developmentStatus!;
      if (!TIME_SENSITIVE_STAGES.includes(status.stage)) continue;
      expect(status.lastUpdated).toBeTruthy();
    }
  });

  it('sources every time-sensitive stage', () => {
    // A pipeline fact from memory is exactly what must not happen here.
    for (const entry of WITH_STATUS) {
      const status = entry.research!.developmentStatus!;
      if (!TIME_SENSITIVE_STAGES.includes(status.stage)) continue;
      expect((status.references ?? []).length).toBeGreaterThan(0);
    }
  });

  it('sources every stated next milestone', () => {
    for (const entry of WITH_STATUS) {
      const status = entry.research!.developmentStatus!;
      if (!status.nextMilestone) continue;
      expect((status.references ?? []).length).toBeGreaterThan(0);
      expect(status.lastUpdated).toBeTruthy();
    }
  });
});

describe('approved medications', () => {
  it('never carry a clinical phase as their status', () => {
    // An approved drug has no phase to report, and inventing one is nonsense.
    for (const entry of PEPTIDE_CATALOG) {
      if (entry.classification !== 'approved-medication') continue;
      const stage = entry.research?.developmentStatus?.stage;
      if (!stage) continue;
      expect(['phase-1', 'phase-2', 'phase-3', 'submitted']).not.toContain(stage);
    }
  });

  it('use the approved stage where a status is given', () => {
    for (const entry of PEPTIDE_CATALOG) {
      if (entry.classification !== 'approved-medication') continue;
      const stage = entry.research?.developmentStatus?.stage;
      if (!stage) continue;
      expect(stage).toBe('approved');
    }
  });

  it('reserve the approved stage for approved medications', () => {
    for (const entry of WITH_STATUS) {
      if (entry.research!.developmentStatus!.stage !== 'approved') continue;
      expect(entry.classification).toBe('approved-medication');
    }
  });
});

describe('language', () => {
  const allStatusText = WITH_STATUS.map((entry) => {
    const status = entry.research!.developmentStatus!;
    return [status.label, status.summary ?? '', status.nextMilestone ?? ''].join(' ');
  })
    .join(' \n ')
    .toLowerCase();

  /**
   * Submission is not approval. A sponsor saying it plans to file is a fact
   * about an announcement; "approval expected" is a prediction VITA has no
   * standing to make.
   */
  it('never promises or predicts approval', () => {
    for (const phrase of [
      'will be approved',
      'expected to be approved',
      'approval expected',
      'awaiting approval',
      'guaranteed',
      'approval is likely',
      'should be approved',
      'set to be approved',
    ]) {
      expect(allStatusText).not.toContain(phrase);
    }
  });

  /**
   * "Sponsor discontinued", "trial terminated", "application rejected",
   * "withdrawn" and "never submitted" are five different things. Only claim
   * an FDA action where one actually happened.
   */
  it('never claims an FDA rejection', () => {
    for (const phrase of ['fda denied', 'fda rejected', 'rejected by the fda', 'refused approval']) {
      expect(allStatusText).not.toContain(phrase);
    }
  });

  it('does not say "awaiting approval" for compounds with no approval path', () => {
    for (const entry of WITH_STATUS) {
      const status = entry.research!.developmentStatus!;
      if (status.stage !== 'not-in-clinical-development') continue;
      expect((status.summary ?? '').toLowerCase()).not.toContain('awaiting');
    }
  });
});

describe('specific records', () => {
  it('Retatrutide is Phase 3, dated, sourced, and describes a planned submission', () => {
    const status = findCatalogDefinition('catalog:retatrutide')?.research?.developmentStatus;
    expect(status?.stage).toBe('phase-3');
    expect(status?.lastUpdated).toBe('July 2026');
    expect(status?.nextMilestone).toContain('plans to submit');
    // A plan, not an outcome.
    expect(status?.nextMilestone?.toLowerCase()).not.toContain('approv');
    expect((status?.references ?? []).length).toBeGreaterThan(0);
    expect(status?.references?.some((reference) => reference.sourceType === 'manufacturer')).toBe(true);
  });

  it('Retatrutide remains classified as a research compound despite Phase 3', () => {
    // Late-stage is not approved, and the classification must not drift.
    expect(findCatalogDefinition('catalog:retatrutide')?.classification).toBe('research-compound');
  });

  /**
   * A withdrawn approval is not a rejection and not a safety action. Sermorelin
   * is the catalog's one discontinued record and says which it was.
   */
  it('Sermorelin is discontinued and distinguishes withdrawal from rejection', () => {
    const status = findCatalogDefinition('catalog:sermorelin')?.research?.developmentStatus;
    expect(status?.stage).toBe('discontinued');
    expect(status?.summary).toContain('not an FDA safety action');
    expect(status?.summary).toContain('not a rejected application');
  });

  it('Semaglutide and Tirzepatide report approval, not a phase', () => {
    for (const id of ['catalog:semaglutide', 'catalog:tirzepatide']) {
      const status = findCatalogDefinition(id)?.research?.developmentStatus;
      expect(status?.stage).toBe('approved');
      expect(status?.label).toBe('FDA Approved');
    }
  });

  it('research compounds with no programme say so plainly', () => {
    for (const id of ['catalog:bpc-157', 'catalog:5-amino-1mq', 'catalog:mk-677']) {
      const status = findCatalogDefinition(id)?.research?.developmentStatus;
      expect(status?.stage).toBe('not-in-clinical-development');
    }
  });
});
