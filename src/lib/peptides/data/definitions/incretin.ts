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
            'Reduces appetite and makes people feel full sooner and for longer, which is how it produces the weight reduction measured in its trials.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Blood Sugar',
          summary: 'Lowers blood sugar in type 2 diabetes by prompting insulin release when glucose is high, measured in trials as improved A1C.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Cardiovascular Risk',
          summary:
            'Studied for reducing heart attacks and strokes in people with type 2 diabetes, and in people with obesity and existing heart disease.',
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
            'Reduces appetite and increases fullness, producing larger average weight reduction than single-pathway GLP-1 medicines in head-to-head trials.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Blood Sugar',
          summary: 'Lowers blood sugar in type 2 diabetes, measured in trials as improved A1C and glucose control.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Sleep Apnoea',
          summary: 'Approved for moderate-to-severe obstructive sleep apnoea in adults with obesity, where trials measured fewer breathing interruptions during sleep.',
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
        'Liraglutide is an approved daily injection for type 2 diabetes and weight management, sold as Victoza and Saxenda. It was one of the first GLP-1 medicines to reach wide use, working the same way as semaglutide but needing a daily rather than weekly dose.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Reduces appetite and increases fullness after eating, which is the basis of its approval for weight management.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Blood Sugar',
          summary:
            'Lowers blood sugar in type 2 diabetes by prompting insulin release when glucose is high.',
          evidenceLevel: 'approved-use',
        },
      ],
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
        'Dulaglutide is an approved once-weekly injection for type 2 diabetes, sold as Trulicity. It lowers blood sugar and has also been shown to reduce cardiovascular risk. It is built as a larger fusion protein rather than a short peptide, which is what gives it its weekly dosing.',
      claims: [
        {
          title: 'Blood Sugar',
          summary:
            'Lowers blood sugar in type 2 diabetes, taken once a week rather than daily.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Heart Health',
          summary:
            'Studied for reducing heart attacks and strokes in people with type 2 diabetes and cardiovascular risk factors.',
          evidenceLevel: 'approved-use',
        },
      ],
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
        'Exenatide is an approved medicine for type 2 diabetes and the first of the GLP-1 drugs to reach the market. Its origin is genuinely unusual: it is based on a compound found in Gila monster venom, which happens to closely resemble a human gut hormone.',
      claims: [
        {
          title: 'Blood Sugar',
          summary:
            'Lowers blood sugar in type 2 diabetes by boosting the insulin response to a meal and slowing digestion.',
          evidenceLevel: 'approved-use',
        },
      ],
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
      overview:
        'Lixisenatide is an approved short-acting GLP-1 medicine for type 2 diabetes. Its shorter duration means it acts mainly on the blood-sugar rise that follows a meal, rather than across the whole day.',
      claims: [
        {
          title: 'Blood Sugar',
          summary:
            'Blunts the rise in blood sugar after eating, by slowing how quickly the stomach empties and supporting the mealtime insulin response.',
          evidenceLevel: 'approved-use',
        },
      ],
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
        'Pramlintide is an approved medicine used alongside insulin in type 1 and type 2 diabetes. It copies amylin, a hormone the pancreas normally releases together with insulin, which people with diabetes are often short of. It slows digestion and reduces appetite.',
      claims: [
        {
          title: 'Blood Sugar',
          summary:
            'Steadies blood sugar after meals when used with insulin, by slowing how quickly food leaves the stomach.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Appetite & Fullness',
          summary:
            'Increases the sense of having eaten enough, which is why it has also been studied in weight management.',
          evidenceLevel: 'approved-use',
        },
      ],
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
        'Retatrutide is an investigational obesity and diabetes drug being developed by Eli Lilly. It is designed to act on three of the body’s appetite and blood-sugar hormone systems at once, rather than the one or two that current GLP-1 medicines target. It has been through large late-stage human trials but is not approved anywhere yet.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Studied for major weight reduction — Phase 3 trials reported large average losses over roughly 18 months — driven by reduced appetite and feeling full sooner.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Blood Sugar',
          summary:
            'Studied for better blood-sugar control in people with type 2 diabetes, measured as lower A1C and steadier glucose levels.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Heart & Related Conditions',
          summary:
            'Trials have included people with existing heart disease, sleep apnoea, fatty liver disease and knee osteoarthritis pain, looking at whether the benefits reach beyond weight itself.',
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
            'Studied for reducing appetite and body weight by making meals feel satisfying sooner — both on its own and in a fixed combination with semaglutide.',
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
      overview:
        'Mazdutide is an investigational weight and diabetes drug that acts on two hormone systems — GLP-1 for appetite and blood sugar, and glucagon for how much energy the body burns. It has been studied most extensively in China.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Studied for reducing appetite and body weight, with the glucagon side intended to raise energy expenditure alongside.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Blood Sugar',
          summary:
            'Studied for improving blood-sugar control in type 2 diabetes.',
          evidenceLevel: 'human-clinical',
        },
      ],
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
      overview:
        'Survodutide is an investigational weight-management and liver drug acting on two hormone systems at once — GLP-1 for appetite and blood sugar, and glucagon for energy burn and liver fat. It is furthest along in trials for fatty liver disease.',
      claims: [
        {
          title: 'Weight & Appetite',
          summary:
            'Studied for reducing appetite and body weight, combining appetite signalling with increased energy expenditure.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Liver Fat',
          summary:
            'Studied for reducing fat and inflammation in the liver in people with fatty liver disease.',
          evidenceLevel: 'human-clinical',
        },
      ],
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
      overview:
        'Pemvidutide is an investigational dual GLP-1 and glucagon drug studied for weight loss and fatty liver disease. Its stated design goal is to reduce liver fat and body weight while preserving more lean muscle than appetite suppression alone tends to.',
      claims: [
        {
          title: 'Weight & Body Composition',
          summary:
            'Studied for weight reduction with attention to preserving lean muscle rather than losing weight from all tissue equally.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Liver Fat',
          summary:
            'Studied for reducing liver fat in people with fatty liver disease.',
          evidenceLevel: 'human-clinical',
        },
      ],
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
      overview:
        'Efinopegdutide is an investigational dual GLP-1 and glucagon drug studied primarily for fatty liver disease rather than weight alone — the glucagon side is thought to push the liver to burn its own stored fat.',
      claims: [
        {
          title: 'Liver Fat',
          summary:
            'Studied for reducing fat stored in the liver, the main focus of its trial programme.',
          evidenceLevel: 'early-human',
        },
      ],
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
        'Tesofensine is a weight-loss compound that works through brain chemistry rather than gut hormones — it raises levels of three neurotransmitters that influence appetite and alertness. It is a small molecule, not a peptide, though it is commonly tracked alongside them. Originally developed for Parkinson’s disease, where the weight loss was an unexpected side effect.',
      claims: [
        {
          title: 'Appetite & Weight',
          summary:
            'Studied for reducing appetite and body weight through brain signalling rather than through the gut-hormone route the GLP-1 drugs use.',
          evidenceLevel: 'early-human',
        },
      ],
      studiedFor: ['obesity & weight management'],
      targets: ['Noradrenaline transporter', 'Dopamine transporter', 'Serotonin transporter'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'early-human',
      references: [trials('Tesofensine'), pubmed('tesofensine')],
    },
  },
];
