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
        'GLOW combines three compounds commonly researched around skin quality, collagen and tissue repair — GHK-Cu for skin and collagen, BPC-157 and TB-500 for healing and recovery. That overlap is why they are sold together, usually for skin appearance and recovery at the same time. Evidence for the named blend itself is limited; the research concerns its individual components. The name says which compounds are present, not how much of each.',
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
        'KLOW is the GLOW combination with KPV added — the K in the name. KPV is researched for calming inflammation, particularly in the gut and skin, which is what the fourth component is meant to add to a mix otherwise aimed at repair and skin quality. Evidence for the named blend itself is limited; the research concerns its individual components.',
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
        'The most commonly encountered recovery pairing, sold under a range of vendor names. Both components are researched for repairing injured tissue but by different routes — BPC-157 is associated with gut and tendon healing, TB-500 with helping repair cells reach the damage. That difference is the stated reason for combining them. Evidence for the pairing itself is limited; the research concerns each component separately.',
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
        'The most commonly encountered growth-hormone pairing, tracked for recovery, sleep and body composition. The two components reach the same result by different routes — one tells the pituitary to release growth hormone, the other acts on the ghrelin receptor to trigger the same pulse — which is the stated reason for combining them rather than doubling either. This is the DAC-free variant; the DAC form lasts far longer and is a different compound. Evidence for the pairing itself is limited.',
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
        'Semax and Selank are Russian research peptides commonly tracked together for sharper thinking without the edge that can come with it. They cover complementary ground — Semax for focus, memory and mental stamina, Selank for anxiety and stress — which is the stated reason for pairing them. Each has its own research literature; the pairing does not.',
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
        'CagriSema is an investigational weight-management drug combining cagrilintide and semaglutide in one injection, studied for larger weight reduction than either produces alone. The two act on different appetite signals — amylin and GLP-1 — which is the stated reason for pairing them. Unlike the vendor blends in this group it is a defined product tested as a single formulation in clinical trials, which is why it is the one blend here with trial evidence behind the combination itself.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Studied for weight reduction from the two-compound combination itself, pairing amylin’s fullness signal with GLP-1’s rather than relying on either alone.',
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
  {
    id: 'catalog:blend-tesamorelin-ipamorelin',
    name: 'Tesamorelin + Ipamorelin',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · Tesamorelin / Ipamorelin',
    components: [
      { definitionId: 'catalog:tesamorelin' },
      { definitionId: 'catalog:ipamorelin' },
    ],
    research: {
      overview:
        'This pairs two compounds that prompt the body to release its own growth hormone through different switches — Tesamorelin acting like the hormone that tells the pituitary to release, Ipamorelin acting on the hunger-hormone receptor that amplifies the same pulse. Combining them is common precisely because the two routes are separate. Evidence concerns the components; the combination itself has not been studied as a product. Tesamorelin is an approved medicine, but this combination is not.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'A supplier-named combination rather than a developed product. No clinical programme exists for the pairing.',
      },
      researchStatus:
        'Not FDA-approved as a combination. Tesamorelin is separately approved as a single agent; that approval does not extend to this blend.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('tesamorelin'), pubmed('ipamorelin')],
    },
  },
  {
    id: 'catalog:blend-mitochondrial-stack',
    name: 'MOTS-c + NAD+ + 5-Amino-1MQ',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · MOTS-c / NAD+ / 5-Amino-1MQ',
    components: [
      { definitionId: 'catalog:mots-c' },
      { definitionId: 'catalog:nad-plus' },
      { definitionId: 'catalog:5-amino-1mq' },
    ],
    research: {
      overview:
        'Three compounds sold together because each is researched around how cells produce and spend energy — MOTS-c as a signal from the mitochondria themselves, NAD+ as the coenzyme those reactions depend on, and 5-Amino-1MQ for blocking an enzyme that consumes it. The shared theme is metabolic rather than any studied interaction. Evidence concerns the individual components; the combination has not been studied as a product.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'A supplier-named combination rather than a developed product. No clinical programme exists for the combination.',
      },
      researchStatus: 'Not FDA-approved. None of the components is an FDA-approved drug.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [
        pubmed('MOTS-c mitochondrial peptide'),
        pubmed('nicotinamide adenine dinucleotide supplementation'),
        pubmed('5-amino-1MQ NNMT'),
      ],
    },
  },
  {
    id: 'catalog:blend-thymic',
    name: 'Thymosin Alpha-1 + Thymalin',
    classification: 'research-compound',
    compoundType: 'blend',
    category: 'Blend · Thymosin Alpha-1 / Thymalin',
    components: [
      { definitionId: 'catalog:thymosin-alpha-1' },
      { definitionId: 'catalog:thymalin' },
    ],
    research: {
      overview:
        'Both components come from the thymus, the gland that trains immune cells and shrinks with age, which is why they are sold together for immune support. They are not the same kind of thing: one is a single defined peptide with genuine clinical use in some countries, the other a tissue extract with a much thinner evidence base. Research concerns each separately; the pairing has not been studied.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'A supplier-named combination rather than a developed product. No clinical programme exists for the pairing.',
      },
      researchStatus:
        'Not FDA-approved as a combination. Neither component is an FDA-approved drug in the United States.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('thymosin alpha 1 thymalfasin'), pubmed('thymalin thymus peptide')],
    },
  },
];
