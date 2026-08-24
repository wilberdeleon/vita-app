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
      overview:
        'BPC-157 is one of the most widely tracked research peptides, based on a fragment of a protein found in stomach fluid. It is researched almost entirely for tissue repair. Despite how commonly it is discussed, essentially all published evidence is from animal and laboratory studies rather than human trials.',
      claims: [
        {
          title: 'Tissue & Injury Repair',
          summary:
            'Animal and laboratory research has suggested effects on healing in tendon, muscle and gut tissue. This is the claim it is best known for.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Gut Health',
          summary:
            'Studied in animal models of gastrointestinal injury, reflecting where the original sequence was found.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Joint & Connective Tissue',
          summary:
            'Commonly claimed for joint and connective-tissue recovery, although direct human evidence is limited.',
          evidenceLevel: 'limited',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'No active approval programme in the United States. The FDA placed it on its category 2 compounding list in 2023, meaning it identified significant safety concerns for compounded use.',
      },
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
      overview:
        'TB-500 is a synthetic fragment of a natural protein called thymosin beta-4, and is researched mainly for tissue repair and recovery. It is frequently sold as though it were the full protein — it is not, and the two are listed separately here for that reason. Evidence is largely from animal studies.',
      claims: [
        {
          title: 'Tissue & Injury Repair',
          summary:
            'Animal research has suggested effects on cell movement and repair after injury. Frequently paired with BPC-157 in recovery-focused research claims.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Flexibility & Recovery',
          summary:
            'Commonly claimed for recovery and mobility, although direct human evidence is limited.',
          evidenceLevel: 'limited',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary: 'No active approval programme. Prohibited in sport by WADA.',
      },
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
      overview:
        'The full 43-amino-acid thymosin beta-4 peptide, an actin-sequestering molecule found widely in tissue. Distinct from the shorter TB-500 fragment.',
      studiedFor: ['wound healing & corneal repair in clinical research', 'tissue repair in animal models'],
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
      overview:
        'GHK-Cu is a small naturally occurring peptide that carries copper, found in human plasma and widely used in skincare products. Most of its research concerns skin, wound healing and collagen. It is one of the few compounds here with genuine mainstream cosmetic use.',
      claims: [
        {
          title: 'Skin & Collagen',
          summary:
            'Laboratory and topical research has examined effects on collagen production and skin appearance. This is its best-supported area.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Wound Healing',
          summary: 'Studied in wound-repair models, which is where much of the early literature originates.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Hair',
          summary: 'Commonly claimed for hair growth, although direct human evidence is limited.',
          evidenceLevel: 'limited',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'Used in cosmetic products rather than developed as a drug. Injectable forms are not FDA-approved.',
      },
      studiedFor: ['skin & wound healing', 'collagen synthesis in laboratory research'],
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
      overview:
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
      overview:
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
      overview:
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
      overview:
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
      overview: 'A zinc-dependent thymic peptide studied in immunology research.',
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
      overview:
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
      overview:
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
      overview:
        'A naturally occurring tripeptide of glutamate, cysteine and glycine, central to cellular redox balance. Genuinely a peptide, though usually discussed as a supplement.',
      studiedFor: ['oxidative stress', 'liver function in clinical research'],
      researchStatus:
        'Available as a dietary supplement in the United States. Injectable forms are not FDA-approved; the FDA placed injectable glutathione on the category 2 compounding list in 2023.',
      evidenceLevel: 'early-human',
      references: [pubmed('glutathione supplementation')],
    },
  },
];
