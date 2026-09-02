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
        'BPC-157 is one of the most widely tracked research peptides, based on a fragment of a protein found in stomach fluid. It is researched almost entirely for healing and recovery — tendon, muscle, ligament and gut tissue — which is why it is so often discussed around injury. Its evidence base is animal and laboratory work rather than human trials.',
      claims: [
        {
          title: 'Tissue & Injury Repair',
          summary:
            'Researched for speeding up repair of tendon, muscle and ligament injuries, and for improving how well damaged tissue heals. This is the effect it is best known for.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Gut Health',
          summary:
            'Studied for protecting and repairing the gut lining, including damage from anti-inflammatory drugs — fitting, since the original sequence was found in stomach fluid.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Joint & Connective Tissue',
          summary:
            'Commonly tracked for joint comfort and connective-tissue recovery, particularly around long-standing tendon problems.',
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
      overview:
        'Pentadeca Arginate is a newer variant of BPC-157, salt-modified with arginate in an attempt to make it more stable. It is sold and tracked for the same reasons as BPC-157 — tissue repair, gut health and recovery from injury. It is much newer than BPC-157 and has correspondingly little research of its own.',
      claims: [
        {
          title: 'Tissue & Injury Repair',
          summary:
            'Marketed and tracked as a more stable alternative to BPC-157 for healing tendon, muscle and gut tissue. Almost all supporting research concerns BPC-157 rather than this variant.',
          evidenceLevel: 'limited',
        },
      ],
      studiedFor: ['tissue repair'],
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
        'TB-500 is a synthetic fragment of a natural protein called thymosin beta-4, researched for tissue repair, flexibility and recovery from injury. It is frequently sold as though it were the full protein — it is not, and the two are listed separately here for that reason.',
      claims: [
        {
          title: 'Tissue & Injury Repair',
          summary:
            'Researched for helping repair cells reach an injury and rebuild tissue, which is why it is so often paired with BPC-157 in recovery contexts.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Flexibility & Recovery',
          summary:
            'Commonly tracked for range of motion and general recovery, including after repeated soft-tissue injuries.',
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
        'Thymosin Beta-4 is the complete natural protein that TB-500 is only a fragment of — distinct compounds, listed separately here. It occurs throughout the body’s tissues and is tracked for wound healing and tissue repair. Unlike TB-500 it has genuinely been through human trials for eye and skin wounds.',
      claims: [
        {
          title: 'Wound & Eye Repair',
          summary:
            'Taken into human trials for healing stubborn wounds and damage to the surface of the eye — rare in this catalog for having reached that stage.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Tissue Repair',
          summary:
            'Researched more broadly for repairing heart, muscle and other tissue after injury, mostly in animal models.',
          evidenceLevel: 'preclinical',
        },
      ],
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
        'GHK-Cu is a small copper-carrying peptide found naturally in human blood, and one of the few compounds here in genuine mainstream use — it appears in ordinary skincare products. It is researched for firmer, better-quality skin, collagen production, wound healing and hair.',
      claims: [
        {
          title: 'Skin & Collagen',
          summary:
            'Researched for stimulating collagen production and improving skin firmness, texture and the appearance of fine lines. This is its most established area, and the reason it appears in commercial skincare.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Wound Healing',
          summary: 'Studied for speeding up wound closure and improving how skin repairs itself, which is where much of the early literature originates.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Hair',
          summary: 'Commonly tracked for hair thickness and growth, often in scalp preparations alongside its skin uses.',
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
        'KPV is a three-amino-acid fragment of a natural hormone, kept because that short piece carries the anti-inflammatory effect without the pigmentation effect of the whole molecule. It is tracked for calming inflammation, particularly in the gut and on the skin, and is the fourth component that distinguishes the KLOW blend from GLOW.',
      claims: [
        {
          title: 'Inflammation',
          summary:
            'Researched for calming inflammation, particularly in the gut lining and on the skin, without the pigmentation effects of the larger hormone it comes from.',
          evidenceLevel: 'preclinical',
        },
      ],
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
        'LL-37 is part of the body’s own first-line defence — a natural antibiotic your cells produce to attack bacteria directly, and one of the reasons ordinary cuts do not routinely become infected. It is tracked for immune support, wound healing and biofilm-related infections.',
      claims: [
        {
          title: 'Bacteria & Infection',
          summary:
            'Kills bacteria directly and breaks down the protective films they form — one of the body’s own first-line defences against infection.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Wound Healing',
          summary:
            'Also researched for closing wounds, recruiting the immune and repair cells that rebuild damaged skin.',
          evidenceLevel: 'preclinical',
        },
      ],
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
        'ARA-290 is derived from EPO, the hormone that drives red blood cell production — but deliberately engineered to keep only its tissue-protective side and none of the blood-thickening. It has been through human trials for nerve pain and damage to the small nerve fibres in the skin.',
      claims: [
        {
          title: 'Nerve Pain',
          summary:
            'Studied in human trials for reducing the burning nerve pain of small-fibre neuropathy, and for regrowing damaged nerve endings in the skin.',
          evidenceLevel: 'early-human',
        },
      ],
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
        'Thymosin Alpha-1 is a natural immune-signalling peptide made by the thymus, the gland that trains the body’s T-cells. It is used as an approved medicine in over thirty countries — though not the United States — for hepatitis and as a vaccine booster, and is tracked for immune support.',
      claims: [
        {
          title: 'Immune Support',
          summary:
            'Helps the immune system"+A+"s T-cells mature and respond, its approved use for hepatitis in over thirty countries and the reason it is tracked for immune resilience.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Vaccine Response',
          summary:
            'Also used and studied for improving how well vaccines take in people whose immune systems respond poorly.',
          evidenceLevel: 'human-clinical',
        },
      ],
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
      overview:
        'Thymulin is a hormone from the thymus gland, tracked for immune support and studied in immune-ageing research. It helps immune cells mature, and only works when bound to zinc — one of the mechanisms linking zinc deficiency to weakened immunity. Thymus output falls sharply with age.',
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
        'Larazotide is designed to tighten the seals between the cells lining the gut — the barrier that decides what gets absorbed and what stays out. It reached late-stage human trials for coeliac disease, making it one of the most seriously studied compounds in this catalog, and it is the compound most often referenced in "leaky gut" discussion.',
      claims: [
        {
          title: 'Gut Barrier',
          summary:
            'Studied for tightening the junctions between gut-lining cells, so less passes through the barrier than should — the idea behind "leaky gut".',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Coeliac Symptoms',
          summary:
            'Taken into late-stage trials for reducing symptoms in coeliac disease alongside a gluten-free diet.',
          evidenceLevel: 'human-clinical',
        },
      ],
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
        'Vasoactive Intestinal Peptide is a natural signalling molecule found throughout the nerves, lungs and immune system. It relaxes airways and blood vessels and damps down inflammation, which is why a synthetic form was trialled in severe lung disease. It is commonly tracked in chronic inflammatory and mould-illness contexts.',
      claims: [
        {
          title: 'Airways & Breathing',
          summary:
            'Relaxes the airways and the blood vessels of the lung, which is why a synthetic form was trialled in severe respiratory illness.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Inflammation',
          summary:
            'Also researched for damping down inflammatory immune signalling, the basis of its use in chronic inflammatory contexts.',
          evidenceLevel: 'preclinical',
        },
      ],
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
        'Glutathione is an antioxidant the body makes for itself, present in nearly every cell. Its job is to mop up reactive molecules — the unstable by-products of normal metabolism — before they damage cells. It is tracked for antioxidant support, liver function and skin, and it is genuinely a peptide, built from three amino acids, though most people meet it as a supplement.',
      claims: [
        {
          title: 'Antioxidant Protection',
          summary:
            'Glutathione neutralises reactive molecules that build up as a by-product of normal metabolism, which is the basis for research into protecting cells from that kind of damage.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Liver Function',
          summary:
            'The liver uses glutathione heavily when it breaks down and clears substances from the body, and it has been studied in that context — including as an established hospital treatment for paracetamol overdose, given as its precursor.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Cellular Balance',
          summary:
            'Researched more broadly for keeping cells in balance between damaging and protective molecules, which is why it appears in work on ageing and general cellular health.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Skin & Pigmentation',
          summary:
            'Widely used and studied for skin brightening and pigmentation, particularly in Asia. Oral and topical research is more established here than the injectable forms sold online.',
          evidenceLevel: 'early-human',
        },
      ],
      mechanisms: [
        {
          target: 'Cellular redox balance',
          title: 'Neutralising reactive molecules',
          explanation:
            'Everyday energy production leaves behind unstable molecules that can damage cells if they accumulate faster than the body clears them — what research calls oxidative stress. Glutathione donates part of itself to neutralise them, then is recycled back into its active form.',
        },
        {
          target: 'Glutathione S-transferase pathway',
          title: 'Helping the liver clear substances',
          explanation:
            'The liver attaches glutathione to certain drugs, toxins and metabolic waste, which makes them water-soluble so the body can excrete them. This is why glutathione levels matter to how well the liver does its normal clearing work.',
        },
      ],
      studiedFor: ['oxidative stress & antioxidant capacity', 'liver function in clinical research', 'skin pigmentation'],
      researchStatus:
        'Available as a dietary supplement in the United States. Injectable forms are not FDA-approved; the FDA placed injectable glutathione on the category 2 compounding list in 2023.',
      evidenceLevel: 'early-human',
      references: [pubmed('glutathione supplementation')],
    },
  },
];
