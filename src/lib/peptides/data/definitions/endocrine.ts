/**
 * Melanocortin, reproductive, and other endocrine compounds.
 *
 * Two entries here were **omitted from the slice 3.5 catalog** because one
 * molecule carried both an approved-product name and a research-chemical name,
 * and there was no field to hold the nuance. There is now: `classification`
 * records US regulatory standing and `researchStatus` explains what that does
 * and does not mean for material bought under the research name. Melanotan I
 * and Bremelanotide are included on that basis.
 */

import type { CatalogSeed } from './seed';
import { fdaLabel, pubmed, trials } from './seed';

export const ENDOCRINE_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:melanotan-i',
    name: 'Melanotan I',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'Melanocortin agonist',
    aliases: ['Afamelanotide', 'Scenesse', 'MT-1'],
    research: {
      overview:
        'A synthetic analog of alpha-melanocyte-stimulating hormone acting at melanocortin receptors, principally MC1R. Approved as afamelanotide (Scenesse) as an implant.',
      studiedFor: ['erythropoietic protoporphyria', 'photoprotection'],
      targets: ['MC1 receptor'],
      researchStatus:
        'FDA-approved as afamelanotide (Scenesse) for erythropoietic protoporphyria. Material sold as "Melanotan I" by research suppliers is not the approved product.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Afamelanotide'), pubmed('afamelanotide melanotan I')],
    },
  },
  {
    id: 'catalog:melanotan-ii',
    name: 'Melanotan II',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Melanocortin agonist',
    aliases: ['MT-2', 'MT-II'],
    research: {
      overview:
        'Melanotan II is a research compound that acts on the body\u2019s pigmentation and appetite signalling systems. It is most commonly discussed for skin tanning without sun exposure. Unlike Melanotan I it has never been approved anywhere, and several regulators have issued safety warnings about products sold under this name.',
      claims: [
        {
          title: 'Pigmentation',
          summary:
            'Commonly claimed and researched for skin darkening through melanin production. Early human research explored this; it was never developed into an approved product.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Appetite & Sexual Arousal',
          summary:
            'Also commonly discussed for appetite and arousal effects, reflecting its action at several melanocortin receptors, although direct human evidence is limited.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'MC1 receptor',
          title: 'Pigmentation signalling',
          explanation:
            'MC1R is the receptor that triggers melanin production in skin cells — the same system that responds to sun exposure.',
        },
        {
          target: 'MC3 / MC4 receptors',
          title: 'Appetite and arousal signalling',
          explanation:
            'These receptors take part in appetite regulation and sexual arousal pathways, which is why a non-selective compound affects more than pigmentation.',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'No active approval programme. Regulators including the FDA and several European agencies have published warnings about products sold under this name.',
      },
      studiedFor: ['pigmentation in early research', 'melanocortin signalling'],
      targets: ['MC1 receptor', 'MC3 receptor', 'MC4 receptor', 'MC5 receptor'],
      researchStatus:
        'Not approved in any jurisdiction. Several regulators have issued public safety warnings about products sold under this name.',
      evidenceLevel: 'preclinical',
      references: [pubmed('melanotan II')],
    },
  },
  {
    id: 'catalog:bremelanotide',
    name: 'Bremelanotide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'Melanocortin agonist',
    aliases: ['PT-141', 'Vyleesi'],
    research: {
      overview:
        'Bremelanotide is an approved medicine, sold as Vyleesi, for low sexual desire in premenopausal women. It acts on brain pathways involved in arousal rather than on blood flow, which is what distinguishes it from erectile-dysfunction drugs. It is also widely sold as a research chemical under the name PT-141 — that material is not the approved product.',
      claims: [
        {
          title: 'Sexual Arousal',
          summary:
            'Clinical trials supporting approval measured improvements in sexual desire and related distress in premenopausal women.',
          evidenceLevel: 'approved-use',
        },
      ],
      mechanisms: [
        {
          target: 'MC4 receptor',
          title: 'Melanocortin arousal pathway',
          explanation:
            'Acts on melanocortin receptors in the brain that take part in sexual arousal signalling, rather than acting on blood vessels.',
        },
      ],
      developmentStatus: {
        stage: 'approved',
        label: 'FDA Approved',
        summary: 'Approved in the United States as Vyleesi for hypoactive sexual desire disorder in premenopausal women.',
      },
      studiedFor: ['hypoactive sexual desire disorder'],
      targets: ['MC3 receptor', 'MC4 receptor'],
      researchStatus:
        'FDA-approved as Vyleesi for hypoactive sexual desire disorder in premenopausal women. Material sold as "PT-141" by research suppliers is not the approved product.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Bremelanotide'), pubmed('bremelanotide PT-141')],
    },
  },
  {
    id: 'catalog:kisspeptin-10',
    name: 'Kisspeptin-10',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Kisspeptin fragment',
    aliases: ['KP-10', 'Metastin (45-54)'],
    research: {
      overview:
        'A 10-amino-acid fragment of kisspeptin acting at the KISS1 receptor, upstream of GnRH release. Studied in reproductive endocrinology research.',
      studiedFor: ['reproductive hormone signalling in clinical research'],
      targets: ['KISS1 receptor'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'early-human',
      references: [trials('Kisspeptin'), pubmed('kisspeptin-10')],
    },
  },
  {
    id: 'catalog:gonadorelin',
    name: 'Gonadorelin',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'GnRH analog',
    aliases: ['GnRH', 'LHRH', 'Factrel'],
    research: {
      overview:
        'Synthetic gonadotropin-releasing hormone, the decapeptide that stimulates LH and FSH release from the pituitary.',
      studiedFor: ['diagnostic assessment of pituitary function', 'reproductive endocrinology'],
      targets: ['GnRH receptor'],
      researchStatus:
        'Previously marketed in the United States; no FDA-approved product is currently marketed. Typically supplied through compounding.',
      evidenceLevel: 'human-clinical',
      references: [pubmed('gonadorelin GnRH'), fdaLabel('Gonadorelin')],
    },
  },
  {
    id: 'catalog:triptorelin',
    name: 'Triptorelin',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'GnRH agonist',
    aliases: ['Trelstar', 'Decapeptyl'],
    research: {
      overview:
        'A long-acting GnRH agonist. Sustained receptor stimulation ultimately suppresses gonadotropin release, which is the basis of its clinical use.',
      studiedFor: ['prostate cancer', 'endometriosis', 'central precocious puberty'],
      targets: ['GnRH receptor'],
      researchStatus: 'FDA-approved.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Triptorelin'), pubmed('triptorelin')],
    },
  },
  {
    id: 'catalog:hcg',
    name: 'Human Chorionic Gonadotropin',
    classification: 'approved-medication',
    compoundType: 'protein',
    category: 'Gonadotropin',
    aliases: ['hCG', 'Chorionic gonadotropin', 'Pregnyl', 'Ovidrel'],
    research: {
      overview:
        'A glycoprotein hormone that acts at the LH receptor. A full glycoprotein rather than a peptide, despite being commonly grouped with them.',
      studiedFor: ['ovulation induction', 'hypogonadotropic hypogonadism', 'cryptorchidism'],
      targets: ['LH / hCG receptor'],
      researchStatus:
        'FDA-approved for specific indications. The FDA has stated that hCG is not effective for weight loss and requires a warning to that effect on labelling.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Chorionic gonadotropin'), pubmed('human chorionic gonadotropin')],
    },
  },
  {
    id: 'catalog:oxytocin',
    name: 'Oxytocin',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'Neurohypophyseal peptide',
    aliases: ['Pitocin', 'Syntocinon'],
    research: {
      overview:
        'A nonapeptide hormone produced in the hypothalamus, acting at the oxytocin receptor. Widely studied in both obstetric and social-neuroscience contexts.',
      studiedFor: ['labour induction', 'social & affiliative behaviour in research'],
      targets: ['Oxytocin receptor'],
      researchStatus: 'FDA-approved for obstetric use. Other uses are investigational.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Oxytocin'), pubmed('oxytocin')],
    },
  },
  {
    id: 'catalog:adipotide',
    name: 'Adipotide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Pro-apoptotic peptidomimetic',
    aliases: ['FTPP', 'Prohibitin-targeting peptide'],
    research: {
      overview:
        'A peptidomimetic designed to target prohibitin in the vasculature supporting white adipose tissue. Studied in animal models.',
      studiedFor: ['obesity in animal models'],
      targets: ['Prohibitin'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('adipotide prohibitin')],
    },
  },
  {
    id: 'catalog:5-amino-1mq',
    name: '5-Amino-1MQ',
    classification: 'research-compound',
    compoundType: 'small-molecule',
    category: 'NNMT inhibitor',
    research: {
      overview:
        '5-Amino-1MQ is a small research molecule commonly tracked alongside peptides, though it is not one itself. It has mainly been studied for metabolic and body-composition-related effects. Almost all of that work has been in animals and cells rather than people.',
      claims: [
        {
          title: 'Body Composition',
          summary:
            'Animal research has examined whether it affects fat accumulation and body weight. There is no meaningful human evidence.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Energy Metabolism',
          summary:
            'Laboratory work has looked at effects on how cells use energy. Commonly discussed in this context, although direct human evidence is limited.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'NNMT',
          title: 'Blocking the NNMT enzyme',
          explanation:
            'NNMT is an enzyme involved in cellular metabolism. 5-Amino-1MQ is designed to inhibit it, which researchers have studied for possible downstream effects on energy use and fat metabolism.',
        },
      ],
      studiedFor: ['metabolic regulation in animal models'],
      targets: ['Nicotinamide N-methyltransferase (NNMT)'],
      researchStatus: 'Not FDA-approved. A research compound.',
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'No known clinical trial programme. Research has been conducted in animal and laboratory models.',
      },
      evidenceLevel: 'preclinical',
      references: [pubmed('5-amino-1MQ NNMT')],
    },
  },
  {
    id: 'catalog:nad-plus',
    name: 'NAD+',
    classification: 'research-compound',
    compoundType: 'other',
    category: 'Dinucleotide coenzyme',
    aliases: ['Nicotinamide adenine dinucleotide'],
    research: {
      overview:
        'NAD+ is a molecule every cell uses to convert food into energy. It is not a peptide, but it is very commonly tracked alongside them, so it is listed here with its chemistry stated plainly. Levels fall with age, which is why it appears so often in longevity research.',
      claims: [
        {
          title: 'Cellular Energy',
          summary:
            'Research has examined its role in how cells produce and use energy. This part is well established biochemistry.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Ageing & Longevity',
          summary:
            'Commonly claimed for anti-ageing effects. Human evidence that raising NAD+ levels changes ageing outcomes is limited, and most supporting work is in animals.',
          evidenceLevel: 'preclinical',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'Sold as a supplement in some forms rather than developed as a drug. The FDA placed injectable NAD+ on its category 2 compounding list in 2023.',
      },
      studiedFor: ['cellular metabolism', 'ageing biology in research settings'],
      researchStatus:
        'Available as a supplement in some forms. Injectable NAD+ is not FDA-approved; the FDA placed it on the category 2 compounding list in 2023.',
      evidenceLevel: 'early-human',
      references: [pubmed('nicotinamide adenine dinucleotide supplementation'), trials('NAD+')],
    },
  },
];
