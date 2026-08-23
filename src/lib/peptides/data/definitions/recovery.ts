/**
 * Tissue, recovery, and immune-related research peptides.
 *
 * Most of this group's evidence is preclinical — animal and cell work — and the
 * `evidenceLevel` field says so rather than letting a confident-sounding
 * summary imply more than exists. TB-500 and Thymosin Beta-4 are kept apart
 * on purpose: they are routinely treated as interchangeable and are not.
 */

import type { CatalogSeed } from './seed';
import { pubmed, trials } from './seed';

export const RECOVERY_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:bpc-157',
    name: 'BPC-157',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Gastric pentadecapeptide',
    aliases: ['Body Protection Compound 157', 'PL 14736'],
    research: {
      summary:
        'A synthetic 15-amino-acid sequence derived from a protein found in gastric juice. Most published work is animal and cell research examining tissue repair and gastrointestinal models.',
      studiedFor: ['tissue repair in animal models', 'gastrointestinal injury in animal models'],
      researchStatus:
        'Not FDA-approved. Placed on the FDA’s list of substances that present significant safety risks for compounding (category 2) in 2023.',
      evidenceLevel: 'preclinical',
      references: [pubmed('BPC 157'), trials('BPC-157')],
    },
  },
  {
    id: 'catalog:pentadeca-arginate',
    name: 'Pentadeca Arginate',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Research peptide',
    aliases: ['PDA', 'BPC-157 arginate'],
    research: {
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'limited',
      references: [pubmed('pentadecapeptide arginate')],
    },
  },
  {
    id: 'catalog:tb-500',
    name: 'TB-500',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Thymosin beta-4 fragment',
    research: {
      summary:
        'A synthetic peptide corresponding to the actin-binding region of thymosin beta-4, rather than the full protein. Listed separately from Thymosin Beta-4 because the two are frequently sold interchangeably and are not the same molecule.',
      studiedFor: ['tissue repair in animal models'],
      researchStatus: 'Not FDA-approved. Prohibited in sport by WADA.',
      evidenceLevel: 'preclinical',
      references: [pubmed('TB-500 thymosin beta 4 fragment')],
    },
  },
  {
    id: 'catalog:thymosin-beta-4',
    name: 'Thymosin Beta-4',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Actin-binding peptide',
    aliases: ['Tβ4', 'TB4'],
    research: {
      summary:
        'The full 43-amino-acid thymosin beta-4 peptide, an actin-sequestering molecule found widely in tissue. Distinct from the shorter TB-500 fragment.',
      studiedFor: ['wound healing and corneal repair in clinical research', 'tissue repair in animal models'],
      researchStatus: 'Not FDA-approved. Has been evaluated in human trials.',
      evidenceLevel: 'early-human',
      references: [pubmed('thymosin beta 4'), trials('Thymosin beta 4')],
    },
  },
  {
    id: 'catalog:ghk-cu',
    name: 'GHK-Cu',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Copper peptide',
    aliases: ['Copper tripeptide-1', 'GHK copper'],
    research: {
      summary:
        'A naturally occurring tripeptide (glycyl-L-histidyl-L-lysine) that binds copper. Widely used in topical cosmetic formulations and studied in skin and wound-healing research.',
      studiedFor: ['skin and wound healing', 'collagen synthesis in laboratory research'],
      researchStatus: 'Used in cosmetics. Not FDA-approved as an injectable drug.',
      evidenceLevel: 'preclinical',
      references: [pubmed('GHK-Cu copper tripeptide')],
    },
  },
  {
    id: 'catalog:kpv',
    name: 'KPV',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'α-MSH fragment',
    aliases: ['Lys-Pro-Val'],
    research: {
      summary:
        'A tripeptide corresponding to the C-terminal fragment of alpha-melanocyte-stimulating hormone, studied for anti-inflammatory activity in laboratory models.',
      studiedFor: ['inflammation in animal and cell models'],
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'preclinical',
      references: [pubmed('KPV peptide inflammation')],
    },
  },
  {
    id: 'catalog:ll-37',
    name: 'LL-37',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Antimicrobial peptide',
    aliases: ['Cathelicidin LL-37', 'hCAP18'],
    research: {
      summary:
        'The only human cathelicidin-derived antimicrobial peptide, part of innate immune defence. Extensively studied in microbiology and immunology research.',
      studiedFor: ['antimicrobial activity', 'innate immune signalling', 'wound healing in laboratory research'],
      researchStatus: 'Not FDA-approved. A research reagent.',
      evidenceLevel: 'preclinical',
      references: [pubmed('LL-37 cathelicidin')],
    },
  },
  {
    id: 'catalog:ara-290',
    name: 'ARA-290',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'EPO-derived peptide',
    aliases: ['Cibinetide'],
    research: {
      summary:
        'An 11-amino-acid peptide derived from a region of erythropoietin, designed to act at the innate repair receptor without erythropoietic activity. Evaluated in human trials.',
      studiedFor: ['small-fibre neuropathy', 'sarcoidosis-associated neuropathic pain'],
      targets: ['Innate repair receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'early-human',
      references: [trials('Cibinetide'), pubmed('ARA 290 cibinetide')],
    },
  },
  {
    id: 'catalog:thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Immune-modulating peptide',
    aliases: ['Thymalfasin', 'Zadaxin', 'Tα1'],
    research: {
      summary:
        'A 28-amino-acid peptide derived from prothymosin alpha, studied for effects on T-cell function and immune signalling.',
      studiedFor: ['chronic hepatitis B and C', 'immune function in clinical research', 'sepsis'],
      researchStatus:
        'Approved in a number of countries outside the United States as thymalfasin. Not FDA-approved; the FDA placed it on the category 2 compounding list in 2023.',
      evidenceLevel: 'human-clinical',
      references: [pubmed('thymosin alpha 1 thymalfasin'), trials('Thymalfasin')],
    },
  },
  {
    id: 'catalog:thymulin',
    name: 'Thymulin',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Thymic peptide',
    research: {
      summary: 'A zinc-dependent thymic peptide studied in immunology research.',
      studiedFor: ['immune signalling in laboratory research'],
      researchStatus: 'Not FDA-approved. A research reagent.',
      evidenceLevel: 'preclinical',
      references: [pubmed('thymulin')],
    },
  },
  {
    id: 'catalog:larazotide',
    name: 'Larazotide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Tight-junction regulator',
    aliases: ['AT-1001', 'Larazotide acetate'],
    research: {
      summary:
        'An octapeptide studied as a regulator of intestinal tight junctions, evaluated in clinical trials for coeliac disease.',
      studiedFor: ['coeliac disease'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Larazotide'), pubmed('larazotide acetate')],
    },
  },
  {
    id: 'catalog:vip',
    name: 'Vasoactive Intestinal Peptide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Neuropeptide',
    aliases: ['VIP', 'Aviptadil'],
    research: {
      summary:
        'A 28-amino-acid neuropeptide with wide distribution in the nervous and immune systems, acting at VPAC receptors. A synthetic form, aviptadil, has been evaluated in clinical trials.',
      studiedFor: ['pulmonary conditions', 'inflammatory signalling in research'],
      targets: ['VPAC1 receptor', 'VPAC2 receptor'],
      researchStatus: 'Not FDA-approved. Aviptadil has been studied under investigational status.',
      evidenceLevel: 'early-human',
      references: [trials('Aviptadil'), pubmed('vasoactive intestinal peptide')],
    },
  },
  {
    id: 'catalog:glutathione',
    name: 'Glutathione',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Tripeptide antioxidant',
    aliases: ['GSH', 'L-glutathione'],
    research: {
      summary:
        'A naturally occurring tripeptide of glutamate, cysteine and glycine, central to cellular redox balance. Genuinely a peptide, though usually discussed as a supplement.',
      studiedFor: ['oxidative stress', 'liver function in clinical research'],
      researchStatus:
        'Available as a dietary supplement in the United States. Injectable forms are not FDA-approved; the FDA placed injectable glutathione on the category 2 compounding list in 2023.',
      evidenceLevel: 'early-human',
      references: [pubmed('glutathione supplementation')],
    },
  },
];
