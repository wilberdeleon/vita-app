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
        'Melanotan I darkens the skin by prompting it to produce melanin, the same pigment that sunlight triggers. Unlike Melanotan II it reached genuine approval — as afamelanotide, an implant given to people with a rare condition that makes sunlight painfully damaging, where extra pigment is protective. Material sold online as "Melanotan I" is not that approved product.',
      claims: [
        {
          title: 'Pigmentation & Sun Protection',
          summary:
            'Increases skin pigmentation, approved to protect people with erythropoietic protoporphyria from painful reactions to light.',
          evidenceLevel: 'approved-use',
        },
      ],
      mechanisms: [
        {
          target: 'MC1 receptor',
          title: 'Producing pigment without sun',
          explanation:
            'MC1R is the switch that tells skin cells to make melanin. Sunlight normally flips it; this compound flips it directly, producing pigment without the ultraviolet exposure that causes the damage.',
        },
      ],
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
        'Melanotan II is a research compound that acts on the body’s pigmentation and appetite signalling systems. It is most commonly discussed for skin tanning without sun exposure. Unlike Melanotan I it has never been approved anywhere, and several regulators have issued safety warnings about products sold under this name.',
      claims: [
        {
          title: 'Pigmentation',
          summary:
            'Researched for tanning the skin without sun exposure, by prompting the skin to produce more melanin. This is the effect it is overwhelmingly tracked for.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Appetite & Sexual Arousal',
          summary:
            'Also tracked for reduced appetite and increased sexual arousal — it acts on several melanocortin receptors, not only the pigmentation one.',
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
            'Increases sexual desire and reduces the distress caused by its absence. Trials in premenopausal women measured both, and are the basis of its approval.',
          evidenceLevel: 'approved-use',
        },
      ],
      mechanisms: [
        {
          target: 'MC4 receptor',
          title: 'Melanocortin arousal pathway',
          explanation:
            'Works on arousal pathways in the brain rather than on blood flow — which is what separates it from erectile-dysfunction drugs, and why it is taken before anticipated activity rather than daily.',
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
        'Kisspeptin-10 sits at the very top of the chain that controls reproductive hormones — it is the signal that starts puberty, and without it that cascade never begins. It is studied in fertility research and, more recently, for effects on sexual desire and attraction.',
      claims: [
        {
          title: 'Reproductive Hormones',
          summary:
            'Triggers the hormone cascade that drives testosterone and oestrogen production, studied in fertility and delayed-puberty research.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Desire & Attraction',
          summary:
            'Studied in human brain-imaging research for effects on sexual and emotional response.',
          evidenceLevel: 'early-human',
        },
      ],
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
        'Gonadorelin is a synthetic copy of the body’s own signal telling the pituitary to release the hormones that drive the testes and ovaries. It is commonly tracked alongside testosterone therapy, on the reasoning that keeping that natural signal going may preserve function that external testosterone would otherwise shut down.',
      claims: [
        {
          title: 'Reproductive Hormones',
          summary:
            'Prompts the pituitary to release LH and FSH, the hormones that drive natural testosterone and oestrogen production.',
          evidenceLevel: 'human-clinical',
        },
      ],
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
        'Triptorelin is approved for prostate cancer, endometriosis and for halting puberty that starts far too early. It works by a deliberate paradox: it overstimulates the reproductive-hormone switch until the body stops responding to it, shutting hormone production down rather than driving it up.',
      claims: [
        {
          title: 'Hormone Suppression',
          summary:
            'Approved for shutting down testosterone or oestrogen production where that is the goal of treatment — prostate cancer, endometriosis and precocious puberty.',
          evidenceLevel: 'approved-use',
        },
      ],
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
        'hCG is the hormone of pregnancy — the one home pregnancy tests detect. Because it closely mimics the pituitary signal that drives the testes and ovaries, it is used as an approved fertility medicine and is commonly tracked alongside testosterone therapy. The FDA requires labelling stating it does not work for weight loss.',
      claims: [
        {
          title: 'Fertility & Ovulation',
          summary:
            'Approved for triggering ovulation in fertility treatment and for undescended testes and low testosterone caused by a pituitary signal failure.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Testicular Function',
          summary:
            'Mimics the pituitary signal to the testes, which is why it is tracked for maintaining natural testosterone production and testicular size.',
          evidenceLevel: 'approved-use',
        },
      ],
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
        'Oxytocin is the hormone behind labour contractions and breastfeeding, and also the one popularly called the bonding hormone — it rises with touch, closeness and trust. It is approved as a medicine for starting labour, and is separately studied for its effects on trust, empathy and social connection, which are not an approved use.',
      claims: [
        {
          title: 'Labour & Breastfeeding',
          summary:
            'Approved for starting and strengthening labour contractions and for controlling bleeding after birth.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Bonding & Social Response',
          summary:
            'Extensively studied for effects on trust, empathy and social bonding, mostly using a nasal spray in research settings.',
          evidenceLevel: 'early-human',
        },
      ],
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
        'Adipotide takes an unusual approach to fat loss: rather than suppressing appetite, it is designed to cut off the blood supply feeding fat tissue so that the fat cells die. Animal studies showed rapid fat loss, but also kidney toxicity, and it has never entered general human trials.',
      claims: [
        {
          title: 'Fat Loss',
          summary:
            'Researched for destroying fat tissue directly by starving it of blood supply, rather than by reducing appetite. Animal work also showed kidney damage.',
          evidenceLevel: 'preclinical',
        },
      ],
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
        '5-Amino-1MQ is a small research molecule commonly tracked for its potential effects on fat metabolism, body composition and how the body uses energy. It is not a peptide itself, but it is routinely sold and discussed alongside them. Research so far has been in animals and cells rather than people.',
      claims: [
        {
          title: 'Fat & Body Composition',
          summary:
            'Researchers have studied whether 5-Amino-1MQ can reduce fat accumulation and support a leaner body composition by changing how the body stores and burns energy.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Metabolism & Energy Use',
          summary:
            'Studied for whether blocking the NNMT enzyme makes cells use energy more readily rather than storing it — the effect most of its metabolic research is built around.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'NNMT',
          title: 'Blocking the NNMT enzyme',
          explanation:
            'NNMT is an enzyme that helps decide how cells process energy and nutrients. 5-Amino-1MQ is designed to block it, and researchers are studying whether turning that enzyme down makes the body readier to burn stored energy than to hold onto it.',
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
        'NAD+ is a molecule every cell uses to turn food into usable energy. Levels fall as people get older, which is why it is tracked for energy, metabolism and healthy ageing. It is not a peptide, but it is so commonly sold and discussed alongside them that it is listed here.',
      claims: [
        {
          title: 'Cellular Energy',
          summary:
            'Cells cannot produce energy from food without NAD+ — this part is settled biochemistry, and it is the reason low levels are thought to matter at all.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Energy & Healthy Ageing',
          summary:
            'Tracked for restoring the cellular energy production that declines with age, and for supporting DNA repair. Whether raising NAD+ levels changes ageing outcomes in people is still an open question.',
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
