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
import { fdaLabel, pubmed, trials } from './seed';

export const INCRETIN_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:semaglutide',
    name: 'Semaglutide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'GLP-1 receptor agonist',
    aliases: ['Ozempic', 'Wegovy', 'Rybelsus'],
    research: {
      summary:
        'A long-acting GLP-1 receptor agonist. It mimics the incretin hormone GLP-1, which acts on receptors involved in insulin secretion, gastric emptying and appetite signalling. It has been evaluated in large cardiometabolic outcome trials.',
      studiedFor: ['type 2 diabetes', 'obesity & weight management', 'cardiovascular risk reduction'],
      targets: ['GLP-1 receptor'],
      researchStatus: 'FDA-approved. Marketed for type 2 diabetes and for chronic weight management.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Semaglutide'), trials('Semaglutide'), pubmed('semaglutide')],
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
      summary:
        'A single peptide that activates both the GIP and GLP-1 receptors. The dual mechanism distinguishes it from GLP-1-only agonists, and it has been studied in large trials across metabolic conditions.',
      studiedFor: ['type 2 diabetes', 'obesity & weight management', 'obstructive sleep apnoea'],
      targets: ['GIP receptor', 'GLP-1 receptor'],
      researchStatus: 'FDA-approved. Marketed for type 2 diabetes and for chronic weight management.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Tirzepatide'), trials('Tirzepatide'), pubmed('tirzepatide')],
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
      summary:
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
      summary:
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
      summary:
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
      summary: 'A short-acting GLP-1 receptor agonist.',
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
      summary:
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
      summary:
        'An investigational compound designed to activate the GIP, GLP-1 and glucagon receptors together. The added glucagon-receptor activity is what distinguishes it from dual agonists. It has been evaluated in clinical trials for metabolic conditions including obesity.',
      studiedFor: ['obesity & weight management', 'type 2 diabetes', 'other cardiometabolic conditions'],
      targets: ['GIP receptor', 'GLP-1 receptor', 'Glucagon receptor'],
      researchStatus: 'Investigational; not FDA-approved. Evaluated in late-stage clinical trials.',
      evidenceLevel: 'human-clinical',
      references: [trials('Retatrutide'), pubmed('retatrutide')],
    },
  },
  {
    id: 'catalog:cagrilintide',
    name: 'Cagrilintide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Long-acting amylin analog',
    research: {
      summary:
        'An investigational long-acting amylin analog. It has been studied alone and in a fixed combination with semaglutide.',
      studiedFor: ['obesity & weight management', 'type 2 diabetes'],
      targets: ['Amylin receptor', 'Calcitonin receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Cagrilintide'), pubmed('cagrilintide')],
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
      summary: 'An investigational dual GLP-1 and glucagon receptor agonist studied in metabolic conditions.',
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
      summary: 'An investigational dual GLP-1 and glucagon receptor agonist evaluated in clinical trials.',
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
      summary: 'An investigational dual GLP-1 and glucagon receptor agonist evaluated in clinical trials.',
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
      summary: 'An investigational dual GLP-1 and glucagon receptor agonist studied in liver and metabolic conditions.',
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
      summary:
        'A small molecule, not a peptide, though it is commonly tracked alongside metabolic peptides. It inhibits reuptake of noradrenaline, dopamine and serotonin and has been studied for weight management.',
      studiedFor: ['obesity & weight management'],
      targets: ['Noradrenaline transporter', 'Dopamine transporter', 'Serotonin transporter'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'early-human',
      references: [trials('Tesofensine'), pubmed('tesofensine')],
    },
  },
];
