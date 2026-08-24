/**
 * Research-area tags for every catalog entry.
 *
 * ── Why this is one table and not a field on each definition ────────────
 *
 * A discovery taxonomy is only useful if it is *consistent*, and consistency
 * is impossible to audit when the assignments are scattered across six files.
 * Here the whole taxonomy is visible at once: it is obvious if one bucket has
 * swallowed half the catalog, or if two similar compounds were tagged
 * differently by accident. A test asserts every catalog id appears exactly
 * once, so an entry can never be added without being deliberately placed.
 *
 * ── How compounds were assigned ────────────────────────────────────────
 *
 * By the genuine common research context of the compound — where its
 * literature actually sits — **not** by what vendors market it for. A compound
 * carries several tags where several are genuinely true; GHK-Cu belongs in
 * both Recovery and Aesthetics, and forcing a single choice would make
 * discovery worse while quietly asserting a primary purpose it does not have.
 *
 * `other` is a last resort, not a dumping ground.
 *
 * **These tags are not indications and not recommendations.** Tagging Semax as
 * Cognitive says where its research sits, not that anyone should take it for
 * anything.
 */

import type { ResearchArea } from '../../model/types';

export const RESEARCH_AREA_ASSIGNMENTS: Record<string, ResearchArea[]> = {
  /* ── Incretin and metabolic ─────────────────────────────────────────── */
  'catalog:semaglutide': ['weight-metabolic', 'endocrine'],
  'catalog:tirzepatide': ['weight-metabolic', 'endocrine'],
  'catalog:liraglutide': ['weight-metabolic', 'endocrine'],
  'catalog:dulaglutide': ['weight-metabolic', 'endocrine'],
  'catalog:exenatide': ['weight-metabolic', 'endocrine'],
  'catalog:lixisenatide': ['weight-metabolic', 'endocrine'],
  'catalog:pramlintide': ['weight-metabolic', 'endocrine'],
  'catalog:retatrutide': ['weight-metabolic'],
  'catalog:cagrilintide': ['weight-metabolic'],
  'catalog:mazdutide': ['weight-metabolic'],
  'catalog:survodutide': ['weight-metabolic'],
  'catalog:pemvidutide': ['weight-metabolic'],
  'catalog:efinopegdutide': ['weight-metabolic'],
  'catalog:tesofensine': ['weight-metabolic'],

  /* ── Growth hormone family ──────────────────────────────────────────── */
  'catalog:somatropin': ['growth-hormone', 'endocrine'],
  'catalog:tesamorelin': ['growth-hormone', 'weight-metabolic'],
  'catalog:sermorelin': ['growth-hormone'],
  'catalog:cjc-1295-dac': ['growth-hormone'],
  'catalog:cjc-1295-no-dac': ['growth-hormone'],
  'catalog:ipamorelin': ['growth-hormone'],
  'catalog:ghrp-2': ['growth-hormone'],
  'catalog:ghrp-6': ['growth-hormone'],
  'catalog:hexarelin': ['growth-hormone'],
  'catalog:mk-677': ['growth-hormone'],
  'catalog:aod-9604': ['weight-metabolic', 'growth-hormone'],
  'catalog:hgh-fragment-176-191': ['weight-metabolic', 'growth-hormone'],
  'catalog:igf-1-lr3': ['growth-hormone'],
  'catalog:igf-1-des': ['growth-hormone'],
  'catalog:mgf': ['growth-hormone', 'recovery'],
  'catalog:follistatin-344': ['growth-hormone'],

  /* ── Recovery, tissue, immune ───────────────────────────────────────── */
  'catalog:bpc-157': ['recovery'],
  'catalog:pentadeca-arginate': ['recovery'],
  'catalog:tb-500': ['recovery'],
  'catalog:thymosin-beta-4': ['recovery'],
  // Genuinely both: a copper peptide with a skin literature and a wound one.
  'catalog:ghk-cu': ['recovery', 'aesthetics'],
  'catalog:kpv': ['immune-inflammation', 'recovery'],
  'catalog:ll-37': ['immune-inflammation'],
  'catalog:ara-290': ['immune-inflammation', 'recovery'],
  'catalog:thymosin-alpha-1': ['immune-inflammation'],
  'catalog:thymulin': ['immune-inflammation'],
  'catalog:larazotide': ['immune-inflammation'],
  'catalog:vip': ['immune-inflammation'],
  'catalog:glutathione': ['longevity-aging', 'immune-inflammation'],

  /* ── Mitochondrial ──────────────────────────────────────────────────── */
  'catalog:mots-c': ['mitochondrial', 'weight-metabolic'],
  'catalog:ss-31': ['mitochondrial'],
  'catalog:humanin': ['mitochondrial', 'longevity-aging'],

  /* ── Neurological and cognitive ─────────────────────────────────────── */
  'catalog:semax': ['cognitive'],
  'catalog:na-semax-amidate': ['cognitive'],
  'catalog:selank': ['cognitive'],
  'catalog:na-selank-amidate': ['cognitive'],
  'catalog:epitalon': ['longevity-aging'],
  'catalog:pinealon': ['cognitive', 'longevity-aging'],
  'catalog:dsip': ['sleep'],
  'catalog:dihexa': ['cognitive'],
  'catalog:cerebrolysin': ['cognitive'],

  /* ── Melanocortin, reproductive, endocrine ──────────────────────────── */
  'catalog:melanotan-i': ['aesthetics'],
  'catalog:melanotan-ii': ['aesthetics'],
  'catalog:bremelanotide': ['sexual-health'],
  'catalog:kisspeptin-10': ['sexual-health', 'endocrine'],
  'catalog:gonadorelin': ['sexual-health', 'endocrine'],
  'catalog:triptorelin': ['endocrine'],
  'catalog:hcg': ['sexual-health', 'endocrine'],
  'catalog:oxytocin': ['endocrine'],
  'catalog:adipotide': ['weight-metabolic'],
  'catalog:5-amino-1mq': ['weight-metabolic'],
  'catalog:nad-plus': ['longevity-aging', 'mitochondrial'],

  /* ── Blends ─────────────────────────────────────────────────────────── */
  'catalog:blend-glow': ['recovery', 'aesthetics'],
  // KPV's inflammation literature is what the extra component brings.
  'catalog:blend-klow': ['recovery', 'aesthetics', 'immune-inflammation'],
  'catalog:blend-bpc157-tb500': ['recovery'],
  'catalog:blend-semax-selank': ['cognitive'],
  'catalog:blend-cagrisema': ['weight-metabolic'],
  'catalog:blend-cjc-ipamorelin': ['growth-hormone'],
};
