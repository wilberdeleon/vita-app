/**
 * Incretin and metabolic compounds — GLP-1, GIP, glucagon, and amylin.
 *
 * The group where approved medicines and investigational compounds sit closest
 * together, so classification matters most here. `approved-medication` means an
 * FDA-approved product exists in the United States for the active ingredient;
 * everything in late-stage trials is still `research-compound`, with the actual
 * development stage carried by `researchStatus` rather than smuggled into the
 * classification.
 */

import type { CatalogSeed } from './seed';
import { fdaLabel, pubmed, sponsor, trialProgram, trials } from './seed';

export const INCRETIN_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:semaglutide',
    name: 'Semaglutide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'GLP-1 receptor agonist',
    aliases: ['Ozempic', 'Wegovy', 'Rybelsus'],
    research: {
      overview:
        'Semaglutide is an approved medicine for type 2 diabetes and for weight management, sold as Ozempic, Wegovy and Rybelsus. It copies a natural gut hormone the body releases after eating, which is why it affects both appetite and blood sugar. It has been studied in some of the largest trials run in this area.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Clinical trials have reported meaningful weight reduction, with effects on appetite and how full people feel after eating.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Blood Sugar',
          summary: 'Approved for type 2 diabetes, where trials measured improvements in A1C and glucose control.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Cardiovascular Risk',
          summary:
            'Outcome trials have examined cardiovascular events in people with type 2 diabetes and in people with obesity and existing heart disease.',
          evidenceLevel: 'approved-use',
        },
      ],
      mechanisms: [
        {
          target: 'GLP-1 receptor',
          title: 'Feeling full after a meal',
          explanation:
            'A hormone the gut releases after a meal. Acting on its receptor contributes to feeling full, slows how quickly the stomach empties, and supports insulin release when blood sugar is high.',
        },
      ],
      studiedFor: ['type 2 diabetes', 'obesity & weight management', 'cardiovascular risk reduction'],
      targets: ['GLP-1 receptor'],
      researchStatus: 'FDA-approved. Marketed for type 2 diabetes and for chronic weight management.',
      developmentStatus: {
        stage: 'approved',
        label: 'FDA Approved',
        summary:
          'Approved in the United States for type 2 diabetes and, separately, for chronic weight management. Different brands cover different approved uses.',
      },
      evidenceLevel: 'approved-use',
      references: [
        fdaLabel('Semaglutide'),
        trialProgram('ClinicalTrials.gov — STEP and SUSTAIN programmes', 'STEP semaglutide'),
        pubmed('semaglutide'),
      ],
    },
  },
  {
    id: 'catalog:tirzepatide',
    name: 'Tirzepatide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'Dual GIP / GLP-1 agonist',
    aliases: ['Mounjaro', 'Zepbound', 'LY3298176'],
    research: {
      overview:
        'Tirzepatide is an approved medicine for type 2 diabetes and weight management, sold as Mounjaro and Zepbound. Unlike earlier GLP-1 medicines it acts on two gut-hormone systems rather than one, which is the main thing that distinguishes it.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Trials have reported larger average weight reduction than single-pathway GLP-1 medicines in head-to-head comparisons.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Blood Sugar',
          summary: 'Approved for type 2 diabetes, with trials measuring A1C and glucose control.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Sleep Apnoea',
          summary: 'Also studied and approved for moderate-to-severe obstructive sleep apnoea in adults with obesity.',
          evidenceLevel: 'approved-use',
        },
      ],
      mechanisms: [
        {
          target: 'GLP-1 receptor',
          title: 'Feeling full after a meal',
          explanation:
            'Contributes to fullness, slows stomach emptying, and supports insulin release when blood sugar is high.',
        },
        {
          target: 'GIP receptor',
          title: 'Handling energy from food',
          explanation:
            'A second gut hormone released after eating, involved in the insulin response to a meal and in how the body stores and uses energy.',
        },
      ],
      studiedFor: ['type 2 diabetes', 'obesity & weight management', 'obstructive sleep apnoea'],
      targets: ['GIP receptor', 'GLP-1 receptor'],
      researchStatus: 'FDA-approved. Marketed for type 2 diabetes and for chronic weight management.',
      developmentStatus: {
        stage: 'approved',
        label: 'FDA Approved',
        summary: 'Approved in the United States for type 2 diabetes, chronic weight management, and obstructive sleep apnoea in adults with obesity.',
      },
      evidenceLevel: 'approved-use',
      references: [
        fdaLabel('Tirzepatide'),
        trialProgram('ClinicalTrials.gov — SURMOUNT and SURPASS programmes', 'SURMOUNT tirzepatide'),
        pubmed('tirzepatide'),
      ],
    },
  },
  {
    id: 'catalog:liraglutide',
    name: 'Liraglutide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'GLP-1 receptor agonist',
    aliases: ['Victoza', 'Saxenda'],
    research: {
      overview:
        'A once-daily GLP-1 receptor agonist and one of the earlier compounds in this class to reach wide clinical use.',
      studiedFor: ['type 2 diabetes', 'obesity & weight management'],
      targets: ['GLP-1 receptor'],
      researchStatus: 'FDA-approved.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Liraglutide'), pubmed('liraglutide')],
    },
  },
  {
    id: 'catalog:dulaglutide',
    name: 'Dulaglutide',
    classification: 'approved-medication',
    compoundType: 'protein',
    category: 'GLP-1 receptor agonist',
    aliases: ['Trulicity'],
    research: {
      overview:
        'A once-weekly GLP-1 receptor agonist built as a fusion protein, which is why it is classed here as a protein rather than a short peptide.',
      studiedFor: ['type 2 diabetes', 'cardiovascular risk reduction'],
      targets: ['GLP-1 receptor'],
      researchStatus: 'FDA-approved.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Dulaglutide'), pubmed('dulaglutide')],
    },
  },
  {
    id: 'catalog:exenatide',
    name: 'Exenatide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'GLP-1 receptor agonist',
    aliases: ['Byetta', 'Bydureon'],
    research: {
      overview:
        'A GLP-1 receptor agonist derived from exendin-4, originally identified in Gila monster venom. One of the first incretin-based medicines approved.',
      studiedFor: ['type 2 diabetes'],
      targets: ['GLP-1 receptor'],
      researchStatus: 'FDA-approved.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Exenatide'), pubmed('exenatide')],
    },
  },
  {
    id: 'catalog:lixisenatide',
    name: 'Lixisenatide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'GLP-1 receptor agonist',
    aliases: ['Adlyxin'],
    research: {
      overview: 'A short-acting GLP-1 receptor agonist.',
      studiedFor: ['type 2 diabetes'],
      targets: ['GLP-1 receptor'],
      researchStatus: 'FDA-approved.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Lixisenatide'), pubmed('lixisenatide')],
    },
  },
  {
    id: 'catalog:pramlintide',
    name: 'Pramlintide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'Amylin analog',
    aliases: ['Symlin'],
    research: {
      overview:
        'A synthetic analog of amylin, a hormone co-secreted with insulin. It acts on amylin receptors and has been studied alongside insulin therapy.',
      studiedFor: ['type 1 and type 2 diabetes'],
      targets: ['Amylin receptor'],
      researchStatus: 'FDA-approved.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Pramlintide'), pubmed('pramlintide')],
    },
  },
  {
    id: 'catalog:retatrutide',
    name: 'Retatrutide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Triple agonist · GIP / GLP-1 / glucagon',
    aliases: ['LY3437943'],
    research: {
      overview:
        'Retatrutide is an investigational obesity and diabetes drug being developed by Eli Lilly. It is designed to act on three of the body\u2019s appetite and blood-sugar hormone systems at once, rather than the one or two that current GLP-1 medicines target. It has been through large late-stage human trials but is not approved anywhere yet.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Phase 3 trials have reported substantial average weight reduction over roughly 18 months, alongside effects on appetite and fullness.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Blood Sugar',
          summary:
            'Trials in people with type 2 diabetes have also measured improvements in A1C and glucose control.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Cardiometabolic Outcomes',
          summary:
            'Studies have included people with established cardiovascular disease and other obesity-related conditions, examining outcomes beyond weight alone.',
          evidenceLevel: 'human-clinical',
        },
      ],
      mechanisms: [
        {
          target: 'GLP-1 receptor',
          title: 'Feeling full after a meal',
          explanation:
            'The pathway existing weight-loss medicines act on. It contributes to feeling full, slows how quickly the stomach empties, and supports insulin release when blood sugar is high.',
        },
        {
          target: 'GIP receptor',
          title: 'Handling energy from food',
          explanation:
            'Another gut hormone released after eating. It takes part in the insulin response to a meal and in how the body handles and stores energy.',
        },
        {
          target: 'Glucagon receptor',
          title: 'Energy burn and the liver',
          explanation:
            'The addition that sets retatrutide apart from dual agonists. Glucagon is involved in how the liver manages glucose and in how much energy the body expends.',
        },
      ],
      studiedFor: ['obesity & weight management', 'type 2 diabetes', 'other cardiometabolic conditions'],
      targets: ['GIP receptor', 'GLP-1 receptor', 'Glucagon receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      developmentStatus: {
        stage: 'phase-3',
        label: 'Phase 3 · Late Stage',
        summary:
          'Multiple Phase 3 TRIUMPH studies have reported positive results across obesity, type 2 diabetes, cardiovascular disease and knee osteoarthritis pain.',
        // A stated plan, phrased as a plan. Submission is not approval, and
        // nothing here predicts the outcome.
        nextMilestone: 'Lilly has said it plans to submit retatrutide to the U.S. FDA in Q1 2027.',
        lastUpdated: 'July 2026',
        references: [
          sponsor(
            'Lilly — TRIUMPH-2 and TRIUMPH-3 results (July 2026)',
            'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-successful-two-additional',
          ),
          trialProgram('ClinicalTrials.gov — TRIUMPH programme', 'TRIUMPH retatrutide'),
        ],
      },
      evidenceLevel: 'human-clinical',
      references: [trialProgram('ClinicalTrials.gov — TRIUMPH programme', 'TRIUMPH retatrutide'), pubmed('retatrutide')],
    },
  },
  {
    id: 'catalog:cagrilintide',
    name: 'Cagrilintide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Long-acting amylin analog',
    research: {
      overview:
        'Cagrilintide is an investigational weight-management compound based on amylin — a hormone the pancreas releases alongside insulin. It works through a different route from the GLP-1 medicines, which is why it has been studied both alone and combined with semaglutide.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Human trials have investigated weight reduction and effects on fullness, both on its own and in a fixed combination with semaglutide.',
          evidenceLevel: 'human-clinical',
        },
      ],
      mechanisms: [
        {
          target: 'Amylin receptor',
          title: 'Knowing you have eaten enough',
          explanation:
            'Amylin is released with insulin after eating and contributes to the sense of having eaten enough. Cagrilintide is a longer-lasting version designed to act on the same receptors.',
        },
      ],
      studiedFor: ['obesity & weight management', 'type 2 diabetes'],
      targets: ['Amylin receptor', 'Calcitonin receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      developmentStatus: {
        stage: 'phase-3',
        label: 'Phase 3',
        summary:
          'Studied in late-stage trials, largely as part of the CagriSema fixed combination with semaglutide rather than on its own.',
        lastUpdated: 'August 2026',
        references: [trialProgram('ClinicalTrials.gov — REDEFINE programme', 'REDEFINE cagrilintide')],
      },
      evidenceLevel: 'human-clinical',
      references: [trialProgram('ClinicalTrials.gov — cagrilintide trials', 'cagrilintide'), pubmed('cagrilintide')],
    },
  },
  {
    id: 'catalog:mazdutide',
    name: 'Mazdutide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Dual GLP-1 / glucagon agonist',
    aliases: ['IBI362', 'LY3305677'],
    research: {
      overview: 'An investigational dual GLP-1 and glucagon receptor agonist studied in metabolic conditions.',
      studiedFor: ['obesity & weight management', 'type 2 diabetes'],
      targets: ['GLP-1 receptor', 'Glucagon receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Mazdutide'), pubmed('mazdutide')],
    },
  },
  {
    id: 'catalog:survodutide',
    name: 'Survodutide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Dual GLP-1 / glucagon agonist',
    aliases: ['BI 456906'],
    research: {
      overview: 'An investigational dual GLP-1 and glucagon receptor agonist evaluated in clinical trials.',
      studiedFor: ['obesity & weight management', 'metabolic dysfunction-associated steatohepatitis'],
      targets: ['GLP-1 receptor', 'Glucagon receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Survodutide'), pubmed('survodutide')],
    },
  },
  {
    id: 'catalog:pemvidutide',
    name: 'Pemvidutide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Dual GLP-1 / glucagon agonist',
    aliases: ['ALT-801'],
    research: {
      overview: 'An investigational dual GLP-1 and glucagon receptor agonist evaluated in clinical trials.',
      studiedFor: ['obesity & weight management', 'metabolic dysfunction-associated steatohepatitis'],
      targets: ['GLP-1 receptor', 'Glucagon receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Pemvidutide'), pubmed('pemvidutide')],
    },
  },
  {
    id: 'catalog:efinopegdutide',
    name: 'Efinopegdutide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Dual GLP-1 / glucagon agonist',
    aliases: ['MK-6024', 'HM12525A'],
    research: {
      overview: 'An investigational dual GLP-1 and glucagon receptor agonist studied in liver and metabolic conditions.',
      studiedFor: ['metabolic dysfunction-associated steatohepatitis', 'obesity & weight management'],
      targets: ['GLP-1 receptor', 'Glucagon receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'early-human',
      references: [trials('Efinopegdutide'), pubmed('efinopegdutide')],
    },
  },
  {
    id: 'catalog:tesofensine',
    name: 'Tesofensine',
    classification: 'research-compound',
    compoundType: 'small-molecule',
    category: 'Monoamine reuptake inhibitor',
    research: {
      overview:
        'A small molecule, not a peptide, though it is commonly tracked alongside metabolic peptides. It inhibits reuptake of noradrenaline, dopamine and serotonin and has been studied for weight management.',
      studiedFor: ['obesity & weight management'],
      targets: ['Noradrenaline transporter', 'Dopamine transporter', 'Serotonin transporter'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'early-human',
      references: [trials('Tesofensine'), pubmed('tesofensine')],
    },
  },
];
