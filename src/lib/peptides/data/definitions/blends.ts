/**
 * Peptide blends.
 *
 * ── The rule that governs this whole file ───────────────────────────────
 *
 * A blend entry defines a **name and a component list**, never a formula.
 * Vendor- and community-named blends like GLOW and KLOW have no standardized
 * composition: two suppliers selling "GLOW" may put quite different amounts in
 * the vial, and stating one vendor's ratio as if it were the definition would
 * be inventing a standard that does not exist.
 *
 * So `components` carry identity only, with `amount` omitted. **The user's own
 * setup owns what is actually in their vial** — the catalog never overrides the
 * label on the bottle in front of them.
 *
 * ── Evidence ───────────────────────────────────────────────────────────
 *
 * Every blend here carries `blendCaveat`, which the detail page renders as an
 * explicit statement that research context comes from the individual
 * components and that the combination itself may never have been studied as a
 * formulation. That is the honest middle between pretending a blend is proven
 * and refusing to list something people demonstrably track.
 *
 * ── Why vendor blends carry no `claims` ────────────────────────────────
 *
 * Adding up every component's claimed effects would manufacture a claim about
 * the *blend* out of evidence that only exists for its parts. GLOW is not
 * "clinically studied" because GHK-Cu, BPC-157 and TB-500 each have separate
 * literature. So vendor blends get an overview, a formulation note and the
 * research-context caveat — and no claims list. A test enforces this.
 *
 * CagriSema is the deliberate exception: a manufacturer combination evaluated
 * as one formulation in trials, so a claim about the combination is supported.
 *
 * ── On "CLOW" ──────────────────────────────────────────────────────────
 *
 * Raised in founder review and **deliberately not added**. GLOW and KLOW have
 * transparent, self-consistent naming — G for GHK-Cu, K for KPV added to the
 * same base — and no comparable established meaning for "CLOW" could be
 * verified. It is most plausibly a variant spelling or mishearing of KLOW.
 * Inventing a component list to fit the name is exactly what this file's rule
 * forbids, and Custom already covers vendor-specific blends.
 */

import type { CatalogSeed } from './seed';
import { pubmed, trialProgram } from './seed';

export const BLEND_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:blend-glow',
    name: 'GLOW',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · GHK-Cu / BPC-157 / TB-500',
    components: [
      { definitionId: 'catalog:ghk-cu' },
      { definitionId: 'catalog:bpc-157' },
      { definitionId: 'catalog:tb-500' },
    ],
    research: {
      overview:
        'GLOW is a vendor and community name for a mix of three research compounds sold together — GHK-Cu, BPC-157 and TB-500. It is usually discussed for skin and recovery, reflecting what its components are individually researched for. The name identifies which compounds are present, not how much of each.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'A supplier-named combination rather than a developed product. No clinical programme exists for the blend, and none of its components is an FDA-approved drug.',
      },
      researchStatus: 'Not FDA-approved. None of the components is an FDA-approved drug.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('GHK-Cu copper tripeptide'), pubmed('BPC 157'), pubmed('thymosin beta 4')],
    },
  },
  {
    id: 'catalog:blend-klow',
    name: 'KLOW',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · GHK-Cu / BPC-157 / TB-500 / KPV',
    components: [
      { definitionId: 'catalog:ghk-cu' },
      { definitionId: 'catalog:bpc-157' },
      { definitionId: 'catalog:tb-500' },
      { definitionId: 'catalog:kpv' },
    ],
    research: {
      overview:
        'KLOW is the GLOW combination with KPV added — the K in the name. KPV is researched for inflammation, which is what the fourth component adds to the mix. As with GLOW, the name says which compounds are present, not the amounts.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'A supplier-named combination rather than a developed product. No clinical programme exists for the blend.',
      },
      researchStatus: 'Not FDA-approved. None of the components is an FDA-approved drug.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('GHK-Cu copper tripeptide'), pubmed('BPC 157'), pubmed('KPV peptide inflammation')],
    },
  },
  {
    id: 'catalog:blend-bpc157-tb500',
    name: 'BPC-157 + TB-500',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · BPC-157 / TB-500',
    components: [{ definitionId: 'catalog:bpc-157' }, { definitionId: 'catalog:tb-500' }],
    research: {
      overview:
        'The most commonly encountered two-component recovery blend, sold under a range of vendor names. Both components are researched for tissue repair, which is why they are so often paired.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary: 'A supplier-named combination. No clinical programme exists for the blend.',
      },
      researchStatus: 'Not FDA-approved. Neither component is an FDA-approved drug.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('BPC 157'), pubmed('TB-500 thymosin beta 4 fragment')],
    },
  },
  {
    id: 'catalog:blend-cjc-ipamorelin',
    name: 'CJC-1295 without DAC + Ipamorelin',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · GHRH analog / secretagogue',
    components: [
      { definitionId: 'catalog:cjc-1295-no-dac' },
      { definitionId: 'catalog:ipamorelin' },
    ],
    research: {
      overview:
        'The most commonly encountered growth-hormone research pairing. The two components work through different routes — one signals the pituitary directly, the other acts on the ghrelin receptor — which is why they are combined rather than doubled up. This is the DAC-free variant; the DAC form lasts far longer in the body and is a different compound.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary: 'A supplier-named combination. No clinical programme exists for the blend.',
      },
      researchStatus: 'Not FDA-approved. Neither component is an FDA-approved drug.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('modified GRF 1-29'), pubmed('ipamorelin')],
    },
  },
  {
    id: 'catalog:blend-semax-selank',
    name: 'Semax + Selank',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · Semax / Selank',
    components: [{ definitionId: 'catalog:semax' }, { definitionId: 'catalog:selank' }],
    research: {
      overview:
        'A combination of Semax and Selank, two research peptides developed in Russia and often used together — one studied for focus and cognition, the other for anxiety. Each has its own research literature; the pairing does not.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'Both components are registered medicines in Russia, but the combination is not a developed product and has no US programme.',
      },
      // The blend's own status leads. Describing only the components' status
      // leaves the thing the user is actually holding unaddressed.
      researchStatus:
        'Not FDA-approved. Both components are registered medicines in Russia but neither is approved in the United States.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('semax peptide'), pubmed('selank peptide')],
    },
  },
  {
    id: 'catalog:blend-cagrisema',
    name: 'CagriSema',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · Cagrilintide / Semaglutide',
    components: [{ definitionId: 'catalog:cagrilintide' }, { definitionId: 'catalog:semaglutide' }],
    research: {
      overview:
        'CagriSema is a manufacturer-developed combination of cagrilintide and semaglutide in one injection. Unlike the vendor blends in this group it is a defined investigational product that has been tested as a single formulation in clinical trials, which is why it is the one blend here with real trial evidence behind the combination itself.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Late-stage trials have evaluated weight reduction from the combination itself, not only from its components separately.',
          evidenceLevel: 'human-clinical',
        },
      ],
      studiedFor: ['obesity & weight management', 'type 2 diabetes'],
      researchStatus: 'Investigational; not FDA-approved.',
      developmentStatus: {
        stage: 'phase-3',
        label: 'Phase 3',
        summary:
          'Evaluated in the late-stage REDEFINE programme as a single fixed-dose combination.',
        lastUpdated: 'August 2026',
        references: [trialProgram('ClinicalTrials.gov — REDEFINE programme', 'REDEFINE CagriSema')],
      },
      evidenceLevel: 'human-clinical',
      // Deliberately no caveat: this combination has been studied as a
      // combination, which is precisely what the caveat exists to flag when
      // it is not true.
      references: [pubmed('cagrisema'), pubmed('cagrilintide semaglutide')],
    },
  },
];
