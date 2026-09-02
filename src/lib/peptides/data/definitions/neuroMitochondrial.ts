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
        'MOTS-c is a small peptide encoded inside mitochondria — the parts of your cells that turn food into usable energy. It is researched for metabolism, exercise capacity and how efficiently the body burns fuel rather than stores it, and it appears often in longevity work because mitochondrial function declines with age.',
      claims: [
        {
          title: 'Metabolism & Energy Use',
          summary:
            'Researched for improving how the body handles blood sugar and for shifting cells toward burning energy instead of storing it. This is the main reason it is tracked.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Exercise Capacity',
          summary:
            'Studied for physical performance and endurance — the body’s own MOTS-c levels rise with exercise, which is what drew researchers to it.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Ageing',
          summary:
            'Commonly tracked in longevity contexts, on the reasoning that supporting mitochondrial function may counter some of the metabolic decline that comes with age.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'AMPK pathway',
          title: 'AMPK energy sensing',
          explanation:
            'AMPK is the cell’s fuel gauge. When energy runs low it flips cells from storing fuel to burning it — the same switch that exercise and fasting activate. MOTS-c research has focused on this pathway.',
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
        'SS-31, also called elamipretide, is designed to go straight into the mitochondria — the parts of cells that generate energy — and repair the membrane structure they need to work efficiently. It is tracked for cellular energy, muscle fatigue and age-related decline. Unlike most compounds here it has a genuine late-stage clinical programme, in rare inherited mitochondrial diseases.',
      claims: [
        {
          title: 'Cellular Energy',
          summary:
            'Researched for restoring efficient energy production in mitochondria that have stopped working properly, the core of its clinical programme.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Muscle Fatigue & Strength',
          summary:
            'Studied in people with inherited mitochondrial disease for improvements in muscle fatigue, strength and walking distance.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Heart & Kidney Function',
          summary:
            'Also studied for protecting heart and kidney tissue, both of which depend heavily on mitochondrial energy.',
          evidenceLevel: 'early-human',
        },
      ],
      mechanisms: [
        {
          target: 'Cardiolipin',
          title: 'Repairing the energy machinery',
          explanation:
            'Mitochondria generate energy across an inner membrane held together by a fat called cardiolipin. When that structure degrades — through disease or age — energy production leaks and falters. SS-31 binds cardiolipin and helps restore the membrane’s shape so the machinery works again.',
        },
      ],
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
        'Humanin is a peptide the mitochondria themselves produce, discovered in brain tissue that had survived Alzheimer’s disease when surrounding tissue had not. It appears to act as a cellular survival signal, and levels fall with age — which is why it is tracked in longevity, brain-protection and metabolic research.',
      claims: [
        {
          title: 'Cell Protection',
          summary:
            'Researched for keeping cells alive under stress, the effect that led to its discovery in brain tissue that resisted degeneration.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Metabolism & Insulin',
          summary:
            'Studied for improving how the body responds to insulin and handles blood sugar.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Ageing',
          summary:
            'Tracked in longevity research because natural humanin levels decline with age, and higher levels have been observed in people who live unusually long.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Mitochondrial signalling',
          title: 'A survival signal from the mitochondria',
          explanation:
            'Mitochondria are not only power plants — they also send chemical messages to the rest of the cell. Humanin is one of those messages, and research has focused on how it tells a stressed cell to repair itself rather than shut down.',
        },
      ],
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
            'Researched for sharper attention, better memory and less mental fatigue — the effects it is most commonly tracked for. Most of this work comes from Russian-language literature.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Stroke Recovery',
          summary:
            'Studied clinically for recovering movement and thinking after an ischaemic stroke, which is the basis of its registration in Russia.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Neuroprotection',
          summary:
            'Researched for protecting nerve cells from damage and supporting their survival, including under low-oxygen conditions.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'BDNF signalling',
          title: 'Supporting neuron growth',
          explanation:
            'BDNF is a protein that helps brain cells grow, survive and form new connections — a large part of what learning and recovery physically consist of. Research on Semax has focused on whether it raises BDNF activity.',
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
        'N-Acetyl Semax Amidate is a modified Semax, chemically capped at both ends so it survives longer in the body. It is tracked for the same reasons as Semax — focus, memory and mental stamina — and is often preferred for that longer duration. Kept separate here because the modifications make it a different molecule.',
      claims: [
        {
          title: 'Focus & Memory',
          summary:
            'Tracked for the same attention and memory effects as Semax, with the chemical modifications intended to make them last longer.',
          evidenceLevel: 'limited',
        },
      ],
      studiedFor: ['cognitive function in research settings'],
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
        'Selank is a research peptide developed in Russia, where it is registered as a medicine for anxiety. It is tracked for reducing anxiety and stress without the drowsiness and dependence associated with common anti-anxiety drugs. It is not approved in the United States.',
      claims: [
        {
          title: 'Anxiety & Stress',
          summary:
            'Researched for reducing anxiety and the physical symptoms of stress without sedation — the basis of its registration as a medicine in Russia.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Focus & Mood',
          summary:
            'Commonly tracked alongside Semax for steadier mood and clearer thinking, particularly under stress.',
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
      overview:
        'N-Acetyl Selank Amidate is a modified Selank, chemically capped at both ends so it lasts longer in the body. It is tracked for the same anxiety and stress effects as Selank. Kept separate here because the modifications make it a different molecule.',
      claims: [
        {
          title: 'Anxiety & Stress',
          summary:
            'Tracked for the same calming effects as Selank, with the chemical modifications intended to extend how long they last.',
          evidenceLevel: 'limited',
        },
      ],
      studiedFor: ['anxiety in research settings'],
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
        'Epitalon is a four-amino-acid peptide from Russian ageing research, developed from extracts of the pineal gland — the gland that governs sleep and daily rhythm. It is tracked almost entirely for longevity, on the basis of laboratory work suggesting it can lengthen telomeres, the protective caps on chromosomes that shorten as cells divide.',
      claims: [
        {
          title: 'Ageing & Telomeres',
          summary:
            'Researched for lengthening telomeres, the chromosome caps that shorten as cells age. This is the reason it is tracked in longevity contexts.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Sleep & Daily Rhythm',
          summary:
            'Also studied for restoring normal melatonin patterns and sleep rhythm, reflecting its pineal-gland origin.',
          evidenceLevel: 'preclinical',
        },
      ],
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
      overview:
        'Pinealon is a three-amino-acid peptide from the same Russian bioregulator research tradition as Epitalon, studied for protecting brain cells and supporting memory in ageing animals. Research is confined to that literature and has not been widely replicated elsewhere.',
      claims: [
        {
          title: 'Brain Cell Protection',
          summary:
            'Researched for protecting neurons from oxidative damage and supporting memory in ageing animal models.',
          evidenceLevel: 'preclinical',
        },
      ],
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
        'DSIP — delta sleep-inducing peptide — was found decades ago in research on sleep, and is tracked for falling asleep more easily and getting deeper, less broken sleep. Despite the name and a long history, how it actually works is still not well understood.',
      claims: [
        {
          title: 'Sleep',
          summary:
            'Commonly tracked for deeper, more restorative sleep and for falling asleep faster. Findings across studies have been inconsistent, which is unusual enough to be worth knowing here.',
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
        'Dihexa is a research compound studied for forming new connections between brain cells — the physical basis of learning and memory. Animal work in models of Alzheimer’s disease drew attention to it. It is derived from a peptide rather than being one, which is why it is typed as "other".',
      claims: [
        {
          title: 'Memory & Brain Connections',
          summary:
            'Researched for building new synapses between neurons, studied in animal models of memory loss and Alzheimer’s disease.',
          evidenceLevel: 'preclinical',
        },
      ],
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
        'Cerebrolysin is a mixture of small peptides derived from pig brain tissue, not a single defined compound. It is an approved medicine in a number of countries — though not the United States — and is used there for stroke recovery, dementia and traumatic brain injury.',
      claims: [
        {
          title: 'Stroke & Brain Injury Recovery',
          summary:
            'Used and studied for recovering movement and thinking after a stroke or head injury, its main approved use outside the United States.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Memory & Dementia',
          summary:
            'Studied for slowing cognitive decline in dementia, with trial results that have been mixed.',
          evidenceLevel: 'human-clinical',
        },
      ],
      studiedFor: ['stroke recovery', 'dementia', 'traumatic brain injury'],
      researchStatus:
        'Approved in a number of countries outside the United States. Not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Cerebrolysin'), pubmed('cerebrolysin')],
    },
  },
];
