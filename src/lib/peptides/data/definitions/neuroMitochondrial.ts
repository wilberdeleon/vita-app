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
      summary:
        'A 16-amino-acid peptide encoded in mitochondrial DNA. Studied in metabolic research, including work on AMPK signalling and exercise physiology.',
      studiedFor: ['metabolic regulation in animal models', 'exercise and mitochondrial physiology'],
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
      summary:
        'A mitochondria-targeted tetrapeptide that associates with cardiolipin in the inner mitochondrial membrane. Evaluated in clinical trials for mitochondrial and cardiac conditions.',
      studiedFor: ['primary mitochondrial myopathy', 'Barth syndrome', 'cardiac and renal conditions'],
      targets: ['Cardiolipin'],
      researchStatus: 'Investigational; not FDA-approved.',
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
      summary:
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
      summary:
        'A synthetic peptide based on a fragment of adrenocorticotropic hormone with the melanocortin activity removed. Research has examined effects on BDNF expression and neuroprotection.',
      studiedFor: ['stroke and cerebrovascular conditions', 'cognitive function in research settings'],
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
      summary:
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
      summary:
        'A synthetic heptapeptide based on the immunomodulatory peptide tuftsin. Studied for anxiolytic activity and effects on GABAergic and monoamine signalling.',
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
      summary: 'A chemically modified Selank, acetylated at the N-terminus and amidated at the C-terminus.',
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
      summary:
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
      summary: 'A synthetic tripeptide (Glu-Asp-Arg) from the peptide bioregulator research literature.',
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
      summary:
        'A nonapeptide first isolated in research on sleep physiology. Its mechanism is not well characterised despite decades of study.',
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
      summary:
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
      summary:
        'A preparation of low-molecular-weight peptides and amino acids derived from porcine brain tissue — a mixture rather than a single defined peptide.',
      studiedFor: ['stroke recovery', 'dementia', 'traumatic brain injury'],
      researchStatus:
        'Approved in a number of countries outside the United States. Not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Cerebrolysin'), pubmed('cerebrolysin')],
    },
  },
];
