/**
 * Mitochondrial peptides and neurological / cognitive research compounds.
 *
 * Several entries here are approved outside the United States but not by the
 * FDA — Semax and Selank in particular. That distinction lives in
 * `researchStatus`, while `classification` stays `research-compound`, because
 * VITA's classification describes US regulatory standing and saying otherwise
 * would quietly overstate it.
 */

import type { CatalogSeed } from './seed';
import { pubmed, trials } from './seed';

export const MITOCHONDRIAL_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:mots-c',
    name: 'MOTS-c',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Mitochondrial peptide',
    aliases: ['Mitochondrial ORF of the 12S rRNA type-c'],
    research: {
      overview:
        'MOTS-c is a small peptide encoded inside mitochondria — the parts of the cell that produce energy. It is researched for how the body uses energy, and is often discussed in connection with exercise and metabolism. Its research is almost entirely in animals and cells.',
      claims: [
        {
          title: 'Metabolism & Energy Use',
          summary:
            'Animal research has suggested effects on how the body handles glucose and uses energy. This is the main reason it is tracked.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Exercise Capacity',
          summary:
            'Studied in exercise-physiology models, where its levels appear to change with physical activity.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Ageing',
          summary:
            'Commonly discussed in longevity contexts because mitochondrial function declines with age, although direct human evidence is limited.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'AMPK pathway',
          title: 'AMPK energy sensing',
          explanation:
            'AMPK is the cell\u2019s low-energy sensor: when fuel runs short it switches cells toward producing energy rather than storing it. MOTS-c research has focused on this pathway.',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary: 'No known clinical trial programme. Research has been conducted in animal and laboratory models.',
      },
      studiedFor: ['metabolic regulation in animal models', 'exercise & mitochondrial physiology'],
      targets: ['AMPK pathway'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('MOTS-c mitochondrial peptide')],
    },
  },
  {
    id: 'catalog:ss-31',
    name: 'SS-31',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Mitochondrial peptide',
    aliases: ['Elamipretide', 'MTP-131', 'Bendavia'],
    research: {
      overview:
        'A mitochondria-targeted tetrapeptide that associates with cardiolipin in the inner mitochondrial membrane. Evaluated in clinical trials for mitochondrial and cardiac conditions.',
      studiedFor: ['primary mitochondrial myopathy', 'Barth syndrome', 'cardiac and renal conditions'],
      targets: ['Cardiolipin'],
      researchStatus: 'Investigational; not FDA-approved.',
      developmentStatus: {
        stage: 'phase-3',
        label: 'Phase 3',
        summary:
          'Unlike most compounds in this catalog, elamipretide has a real clinical development programme and has been evaluated in late-stage trials for rare mitochondrial conditions.',
        lastUpdated: 'August 2026',
        references: [trials('Elamipretide')],
      },
      evidenceLevel: 'human-clinical',
      references: [trials('Elamipretide'), pubmed('elamipretide SS-31')],
    },
  },
  {
    id: 'catalog:humanin',
    name: 'Humanin',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Mitochondrial peptide',
    research: {
      overview:
        'A mitochondria-derived peptide identified in research on neuronal survival, studied in cell and animal models of metabolic and neurodegenerative conditions.',
      studiedFor: ['neuronal survival in laboratory models', 'metabolic signalling'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('humanin mitochondrial derived peptide')],
    },
  },
];

export const NEURO_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:semax',
    name: 'Semax',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'ACTH (4-10) analog',
    research: {
      overview:
        'Semax is a research peptide developed in Russia and used there as a medicine, though it is not approved in the United States. It is studied for effects on the brain — memory, focus and recovery after stroke. It is unrelated to the metabolic peptides despite the similar-sounding name.',
      claims: [
        {
          title: 'Cognition & Focus',
          summary:
            'Early human research has explored effects on attention, memory and mental fatigue. Most of this work comes from Russian-language literature.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Stroke Recovery',
          summary:
            'Studied clinically in Russia for recovery after ischaemic stroke, which is the basis of its registration there.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Neuroprotection',
          summary:
            'Laboratory research has examined protective effects on nerve cells, including changes in BDNF, a protein involved in neuron growth and survival.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'BDNF signalling',
          title: 'Supporting neuron growth',
          explanation:
            'BDNF is a protein that supports the growth and survival of neurons. Research on Semax has focused on whether it increases BDNF activity in the brain.',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US Development',
        summary:
          'Registered as a medicine in Russia and some neighbouring countries. There is no known US approval programme.',
      },
      studiedFor: ['stroke & cerebrovascular conditions', 'cognitive function in research settings'],
      targets: ['BDNF signalling'],
      researchStatus:
        'Registered as a medicine in Russia and some neighbouring countries. Not FDA-approved in the United States.',
      evidenceLevel: 'early-human',
      references: [pubmed('semax peptide')],
    },
  },
  {
    id: 'catalog:na-semax-amidate',
    name: 'N-Acetyl Semax Amidate',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'ACTH (4-10) analog',
    aliases: ['NA-Semax-Amidate', 'NASA'],
    research: {
      overview:
        'A chemically modified Semax with an acetyl group at the N-terminus and an amide at the C-terminus. Kept separate from Semax because the modifications change the molecule.',
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'limited',
      references: [pubmed('N-acetyl semax amidate')],
    },
  },
  {
    id: 'catalog:selank',
    name: 'Selank',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Tuftsin analog',
    research: {
      overview:
        'Selank is a research peptide developed in Russia, where it is registered as a medicine for anxiety. It is studied for calming effects without the sedation associated with common anti-anxiety drugs. It is not approved in the United States.',
      claims: [
        {
          title: 'Anxiety & Stress',
          summary:
            'Early human research in Russia has explored anxiolytic effects, which is the basis of its registration there.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Focus & Mood',
          summary:
            'Commonly discussed alongside Semax for mental clarity and mood, although direct human evidence outside Russian literature is limited.',
          evidenceLevel: 'limited',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US Development',
        summary: 'Registered as a medicine in Russia. There is no known US approval programme.',
      },
      studiedFor: ['anxiety in research settings', 'immune signalling'],
      researchStatus:
        'Registered as a medicine in Russia. Not FDA-approved in the United States.',
      evidenceLevel: 'early-human',
      references: [pubmed('selank peptide')],
    },
  },
  {
    id: 'catalog:na-selank-amidate',
    name: 'N-Acetyl Selank Amidate',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Tuftsin analog',
    aliases: ['NA-Selank-Amidate'],
    research: {
      overview: 'A chemically modified Selank, acetylated at the N-terminus and amidated at the C-terminus.',
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'limited',
      references: [pubmed('N-acetyl selank amidate')],
    },
  },
  {
    id: 'catalog:epitalon',
    name: 'Epitalon',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Pineal tetrapeptide',
    aliases: ['Epithalon', 'Epithalamin', 'AEDG'],
    research: {
      overview:
        'A synthetic tetrapeptide (Ala-Glu-Asp-Gly) developed from research on pineal extracts. Studied in ageing research, including work on telomerase activity in cell models.',
      studiedFor: ['ageing biology in animal and cell models'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('epitalon epithalon peptide')],
    },
  },
  {
    id: 'catalog:pinealon',
    name: 'Pinealon',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    aliases: ['EDR peptide'],
    research: {
      overview: 'A synthetic tripeptide (Glu-Asp-Arg) from the peptide bioregulator research literature.',
      studiedFor: ['neuronal function in animal models'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('pinealon EDR peptide')],
    },
  },
  {
    id: 'catalog:dsip',
    name: 'DSIP',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Neuropeptide',
    aliases: ['Delta sleep-inducing peptide'],
    research: {
      overview:
        'DSIP — delta sleep-inducing peptide — was identified decades ago in research on sleep. Despite the name and a long research history, how it works is still poorly understood, and evidence that it reliably improves sleep in people is thin.',
      claims: [
        {
          title: 'Sleep',
          summary:
            'Commonly claimed for improving sleep quality. Research dates back decades but direct human evidence remains limited and inconsistent.',
          evidenceLevel: 'limited',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary: 'No known active clinical programme despite a long research history.',
      },
      studiedFor: ['sleep physiology in research settings'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('delta sleep inducing peptide')],
    },
  },
  {
    id: 'catalog:dihexa',
    name: 'Dihexa',
    classification: 'research-compound',
    compoundType: 'other',
    category: 'Angiotensin IV analog · peptidomimetic',
    aliases: ['N-hexanoic-Tyr-Ile-(6) aminohexanoic amide', 'PNB-0408'],
    research: {
      overview:
        'A peptidomimetic derived from angiotensin IV — a peptide-derived molecule rather than a peptide proper, which is why it is typed as "other". Studied in preclinical work on hepatocyte growth factor signalling.',
      studiedFor: ['cognition in animal models'],
      targets: ['HGF / c-Met signalling'],
      researchStatus: 'Not FDA-approved. A research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('dihexa angiotensin IV')],
    },
  },
  {
    id: 'catalog:cerebrolysin',
    name: 'Cerebrolysin',
    classification: 'research-compound',
    compoundType: 'other',
    category: 'Peptide preparation',
    research: {
      overview:
        'A preparation of low-molecular-weight peptides and amino acids derived from porcine brain tissue — a mixture rather than a single defined peptide.',
      studiedFor: ['stroke recovery', 'dementia', 'traumatic brain injury'],
      researchStatus:
        'Approved in a number of countries outside the United States. Not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Cerebrolysin'), pubmed('cerebrolysin')],
    },
  },
];
