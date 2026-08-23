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
import { pubmed } from './seed';

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
      summary:
        'A community- and vendor-named combination of GHK-Cu, BPC-157 and TB-500. The name describes which compounds are present, not how much of each — formulations vary between suppliers.',
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
      summary:
        'The GLOW combination with KPV added — the K in the name. As with GLOW, the name identifies the components rather than a fixed formulation, and amounts vary between suppliers.',
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
      summary:
        'The most commonly encountered two-component tissue-research blend. Sold under a range of vendor names; ratios are not standardized.',
      researchStatus: 'Not FDA-approved. Neither component is an FDA-approved drug.',
      evidenceLevel: 'limited',
      blendCaveat: true,
      references: [pubmed('BPC 157'), pubmed('TB-500 thymosin beta 4 fragment')],
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
      summary:
        'A combination of the two Russian-developed research peptides Semax and Selank. Each has its own research literature; the combination does not have a standardized ratio.',
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
      summary:
        'A manufacturer-developed fixed-dose combination of cagrilintide and semaglutide — unlike the vendor blends in this group, it is a defined investigational product evaluated as a single formulation in clinical trials.',
      studiedFor: ['obesity and weight management', 'type 2 diabetes'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'human-clinical',
      // Deliberately no caveat: this combination has been studied as a
      // combination, which is precisely what the caveat exists to flag when
      // it is not true.
      references: [pubmed('cagrisema'), pubmed('cagrilintide semaglutide')],
    },
  },
];
