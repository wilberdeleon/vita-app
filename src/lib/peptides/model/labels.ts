/**
 * How classifications and evidence levels read on screen.
 *
 * Centralised so the same words appear in the catalog, the detail page, and a
 * setup row — and so the spoken forms stay attached to the visible ones. The
 * short label is what fits in a chip; the spoken label is what a screen reader
 * needs, because "Approved" or "Early human" alone is ambiguous out of context.
 */

import type { EvidenceLevel, PeptideClassification, ResearchArea } from './types';

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
  'approved-use': 'Approved for Clinical Use',
  'human-clinical': 'Studied in Human Clinical Trials',
  'early-human': 'Early Human Research',
  preclinical: 'Mainly Preclinical Research',
  limited: 'Limited Direct Research',
};

export function evidenceLabel(level: EvidenceLevel): string {
  return EVIDENCE_LABELS[level];
}

/**
 * Human-readable research-area names.
 *
 * Neutral and descriptive. None of them is phrased as a purpose or an outcome
 * — "Weight & Metabolic" names a field of research, where "Weight Loss" would
 * name a result the app would be implying it can deliver.
 */
export const RESEARCH_AREA_LABELS: Record<ResearchArea, string> = {
  'weight-metabolic': 'Weight & Metabolic',
  cognitive: 'Cognitive',
  sleep: 'Sleep',
  'growth-hormone': 'Growth Hormone',
  recovery: 'Recovery',
  'sexual-health': 'Sexual Health',
  aesthetics: 'Aesthetics',
  mitochondrial: 'Mitochondrial',
  'longevity-aging': 'Longevity & Aging Research',
  'immune-inflammation': 'Immune & Inflammation',
  endocrine: 'Endocrine',
  other: 'Other',
};

export function researchAreaLabel(area: ResearchArea): string {
  return RESEARCH_AREA_LABELS[area];
}
