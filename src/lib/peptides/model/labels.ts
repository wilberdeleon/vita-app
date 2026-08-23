/**
 * How classifications and evidence levels read on screen.
 *
 * Centralised so the same words appear in the catalog, the detail page, and a
 * setup row — and so the spoken forms stay attached to the visible ones. The
 * short label is what fits in a chip; the spoken label is what a screen reader
 * needs, because "Approved" or "Early human" alone is ambiguous out of context.
 */

import type { EvidenceLevel, PeptideClassification } from './types';

const CLASSIFICATION_LABELS: Record<PeptideClassification, string> = {
  'approved-medication': 'Approved',
  'research-compound': 'Research',
  custom: 'Custom',
};

const CLASSIFICATION_SPOKEN: Record<PeptideClassification, string> = {
  'approved-medication': 'Approved medication',
  'research-compound': 'Research compound',
  custom: 'Custom entry',
};

export function classificationLabel(classification: PeptideClassification): string {
  return CLASSIFICATION_LABELS[classification];
}

export function classificationSpoken(classification: PeptideClassification): string {
  return CLASSIFICATION_SPOKEN[classification];
}

/**
 * Plain descriptions of how mature the evidence is.
 *
 * Phrased as statements about the *literature*, not about the compound. "Early
 * human studies" says what exists; it does not say the compound is promising,
 * risky, or worth taking — which is the line this whole feature sits on.
 */
export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  'approved-use': 'Approved for clinical use',
  'human-clinical': 'Studied in human clinical trials',
  'early-human': 'Early human studies',
  preclinical: 'Mainly animal or laboratory research',
  limited: 'Little direct research',
};

export function evidenceLabel(level: EvidenceLevel): string {
  return EVIDENCE_LABELS[level];
}
