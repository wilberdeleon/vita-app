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
      summary:
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
      summary:
        'A non-selective melanocortin receptor agonist, active at MC1R, MC3R, MC4R and MC5R. Unlike Melanotan I, it has never been approved anywhere.',
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
      summary:
        'A melanocortin receptor agonist and a metabolite of Melanotan II, developed as a distinct compound. Approved as Vyleesi.',
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
      summary:
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
      summary:
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
      summary:
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
      summary:
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
      summary:
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
      summary:
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
      summary:
        'A small molecule, not a peptide, though it is commonly sold and tracked alongside them. It inhibits nicotinamide N-methyltransferase and has been studied in animal models of metabolic disease.',
      studiedFor: ['metabolic regulation in animal models'],
      targets: ['Nicotinamide N-methyltransferase (NNMT)'],
      researchStatus: 'Not FDA-approved. A research compound.',
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
      summary:
        'A coenzyme central to cellular metabolism. Not a peptide — a dinucleotide — but very commonly tracked alongside them, so it is listed with its chemistry stated honestly.',
      studiedFor: ['cellular metabolism', 'ageing biology in research settings'],
      researchStatus:
        'Available as a supplement in some forms. Injectable NAD+ is not FDA-approved; the FDA placed it on the category 2 compounding list in 2023.',
      evidenceLevel: 'early-human',
      references: [pubmed('nicotinamide adenine dinucleotide supplementation'), trials('NAD+')],
    },
  },
];
