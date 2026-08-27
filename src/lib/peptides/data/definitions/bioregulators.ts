/**
 * Khavinson peptide bioregulators.
 *
 * A family of very short peptides — most of them two to four amino acids —
 * developed in the Soviet Union and Russia from the 1970s onward and grouped
 * together because they share an origin, a proposed mechanism, and an
 * evidence problem, not because they do the same thing. Each is associated
 * with a specific tissue.
 *
 * ── Why they are all `limited` and none is `approved-medication` ────────
 *
 * Several are registered in Russia and sold there as medicines or
 * supplements. That is not US approval, and `classification` in this catalog
 * records **US regulatory standing** — so calling any of them approved would
 * assert something false to the user in front of it. The nuance lives in
 * `researchStatus`, which says where each one actually stands.
 *
 * The published literature is overwhelmingly from a single research group,
 * largely in Russian-language journals, and independent replication is thin.
 * That is stated once per entry, plainly, without editorialising about
 * whether anyone should be interested.
 *
 * ── Why each entry is written separately ───────────────────────────────
 *
 * These compounds are the easiest in the whole catalog to cross-contaminate:
 * they are short, similarly named, and share a template. A copied paragraph
 * with one organ swapped would look completely plausible and be wrong. Every
 * summary, mechanism and studied-for list below is written for its own
 * compound, and `__tests__/research.test.ts` checks that no two entries share
 * an overview.
 */

import type { CatalogSeed } from './seed';
import { fdaLabel, pubmed, trials } from './seed';

/** The shared evidence caveat, stated once per entry rather than implied. */
const KHAVINSON_STATUS =
  'Not FDA-approved and not in US clinical development. Research is largely from a single Russian group and independent replication is limited.';

export const BIOREGULATOR_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:thymalin',
    name: 'Thymalin',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Thymic peptide',
    aliases: ['Thymalinum'],
    research: {
      overview:
        'Thymalin is an extract of thymus tissue rather than a single molecule — a mixture of small peptides. The thymus trains immune cells and shrinks with age, and the idea behind Thymalin is that its peptides help an ageing immune system behave more like a younger one. It has been used in Russia for decades; that use is not US approval.',
      claims: [
        {
          title: 'Immune Function in Ageing',
          summary:
            'Studied for restoring immune measures that decline with age, such as T-cell counts and responsiveness.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'Thymic tissue',
          title: 'Supporting the gland that trains immune cells',
          explanation:
            'A peptide fraction taken from thymus tissue, proposed to act on the same gland it came from. The thymus is where T-cells learn what to attack, and it shrinks steadily from adolescence onward.',
        },
      ],
      studiedFor: ['immune ageing', 'immune function'],
      targets: ['thymic tissue'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US development',
        summary:
          'Registered and used in Russia. No US regulatory filing and no active US clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'limited',
      references: [pubmed('thymalin thymus peptide')],
    },
  },
  {
    id: 'catalog:thymogen',
    name: 'Thymogen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Thymic peptide',
    aliases: ['Glutamyl-Tryptophan', 'Glu-Trp'],
    research: {
      overview:
        'Thymogen is a two-amino-acid peptide — glutamic acid joined to tryptophan — isolated as the fragment thought to carry Thymalin’s activity. Being a single defined molecule rather than a tissue extract is the main thing that distinguishes it from Thymalin. It has been studied in Russia for immune support during infection and recovery.',
      claims: [
        {
          title: 'Immune Response',
          summary:
            'Studied as an immune modulator during infection and post-surgical recovery, mostly in Russian clinical literature.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'T-lymphocytes',
          title: 'A defined fragment rather than an extract',
          explanation:
            'A synthetic dipeptide, proposed to influence T-cell maturation. Its appeal over Thymalin is chemical: one known molecule can be made consistently, where a tissue extract cannot.',
        },
      ],
      studiedFor: ['immune modulation', 'recovery after infection'],
      targets: ['T-lymphocytes'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US development',
        summary: 'Registered in Russia. No US regulatory filing or active US trial programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'limited',
      references: [pubmed('thymogen glutamyl tryptophan peptide')],
    },
  },
  {
    id: 'catalog:vilon',
    name: 'Vilon',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    aliases: ['Lys-Glu', 'KE peptide'],
    research: {
      overview:
        'Vilon is a two-amino-acid peptide, lysine joined to glutamic acid, and is the simplest member of this family. Research on it sits at the intersection of immune function and ageing — it is the entry most often discussed in the context of lifespan studies in animals rather than any specific organ.',
      claims: [
        {
          title: 'Immune & Ageing Research',
          summary:
            'Studied in animal work for effects on immune measures and lifespan; human data is very limited.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Gene expression',
          title: 'Short enough to reach DNA',
          explanation:
            'The proposal for this whole family is that peptides this small can enter a cell nucleus and influence which genes are read. It is a mechanism of hypothesis rather than one established by independent work.',
        },
      ],
      studiedFor: ['immune function', 'ageing research'],
      targets: ['gene expression'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary: 'Animal and cell studies only. No registered human clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'preclinical',
      references: [pubmed('vilon Lys-Glu peptide bioregulator')],
    },
  },
  {
    id: 'catalog:cortagen',
    name: 'Cortagen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    aliases: ['Cortexin-related peptide'],
    research: {
      overview:
        'Cortagen is a short synthetic peptide from the Khavinson family, associated in its literature with the cerebral cortex. Research interest sits around nerve tissue and recovery after injury to it. Almost all of that research is Russian and has not been independently replicated.',
      claims: [
        {
          title: 'Nerve Tissue Research',
          summary:
            'Studied in Russian literature for effects on nerve tissue and recovery after peripheral nerve injury.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'Brain cortex',
          title: 'Named for the tissue it is associated with',
          explanation:
            'Every compound in this family is named for a tissue its research is oriented around — here, the cortex. The proposal is that very short peptides influence gene expression in that tissue; it remains a hypothesis rather than an independently established mechanism.',
        },
      ],
      studiedFor: ['nerve tissue', 'recovery after nerve injury'],
      targets: ['brain cortex'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US development',
        summary:
          'Registered or sold in Russia. No US regulatory filing and no active US clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'limited',
      references: [pubmed('cortagen peptide bioregulator')],
    },
  },
  {
    id: 'catalog:cartalax',
    name: 'Cartalax',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Cartalax is a short synthetic peptide associated in its literature with cartilage and connective tissue. It is discussed in the context of joint and musculoskeletal ageing. The published work is small, Russian, and not independently replicated.',
      claims: [
        {
          title: 'Cartilage & Joint Research',
          summary:
            'Studied for effects on cartilage cells and connective tissue in laboratory and small clinical work.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'Cartilage',
          title: 'Oriented around connective tissue',
          explanation:
            'Named for cartilage, the tissue its research is oriented around. The family hypothesis is that peptides this short can act on gene expression within their associated tissue.',
        },
      ],
      studiedFor: ['cartilage', 'joint and connective tissue'],
      targets: ['cartilage tissue'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US development',
        summary:
          'Registered or sold in Russia. No US regulatory filing and no active US clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'limited',
      references: [pubmed('cartalax peptide bioregulator')],
    },
  },
  {
    id: 'catalog:vesugen',
    name: 'Vesugen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Vesugen is a short synthetic peptide associated in its literature with blood vessel walls. Research interest sits around the vascular endothelium — the single-cell lining of every blood vessel — and how it changes with age. Evidence is preliminary and largely from one group.',
      claims: [
        {
          title: 'Vascular Tissue Research',
          summary:
            'Studied for effects on vascular endothelial cells, mostly in cell and animal work.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Vascular tissue',
          title: 'Oriented around the vessel lining',
          explanation:
            'Named for vascular tissue. The endothelium is the layer that controls how vessels dilate, clot and leak, and it is where much age-related vascular change begins.',
        },
      ],
      studiedFor: ['vascular tissue', 'endothelial function'],
      targets: ['vascular endothelium'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary:
          'Cell and animal studies. No registered human clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'preclinical',
      references: [pubmed('vesugen peptide bioregulator')],
    },
  },
  {
    id: 'catalog:bronchogen',
    name: 'Bronchogen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Bronchogen is a short synthetic peptide associated in its literature with the airways. Research interest sits around chronic bronchial conditions. As with the rest of this family, the work is small and has not been replicated outside its originating group.',
      claims: [
        {
          title: 'Airway Tissue Research',
          summary:
            'Studied for effects on bronchial tissue in chronic airway conditions, in limited Russian clinical work.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'Bronchial tissue',
          title: 'Oriented around the airway lining',
          explanation:
            'Named for bronchial tissue — the branching airways below the windpipe. The family hypothesis is action on gene expression within the associated tissue.',
        },
      ],
      studiedFor: ['bronchial tissue', 'chronic airway conditions'],
      targets: ['bronchial epithelium'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US development',
        summary:
          'Registered or sold in Russia. No US regulatory filing and no active US clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'limited',
      references: [pubmed('bronchogen peptide bioregulator')],
    },
  },
  {
    id: 'catalog:livagen',
    name: 'Livagen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Livagen is a short synthetic peptide studied for effects on liver tissue, and — more often — on how tightly the genetic material inside a cell is packed. That second line of work is what most of its published research is actually about, which is unusual for a compound named after an organ.',
      claims: [
        {
          title: 'Liver & Cell Research',
          summary:
            'Studied for effects on liver tissue and, at the cell level, on chromatin structure in lymphocytes.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Liver tissue',
          title: 'Oriented around the liver',
          explanation:
            'Named for liver tissue, though the mechanistic work most often cited is about chromatin — the way DNA is wound and packaged inside a cell nucleus, which determines how readable each gene is.',
        },
      ],
      studiedFor: ['liver tissue', 'chromatin research'],
      targets: ['liver tissue'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary:
          'Cell and animal studies. No registered human clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'preclinical',
      references: [pubmed('livagen peptide bioregulator')],
    },
  },
  {
    id: 'catalog:pancragen',
    name: 'Pancragen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Pancragen is a short synthetic peptide associated in its literature with the pancreas. Research interest sits around carbohydrate metabolism and pancreatic tissue in ageing. The evidence base is small and Russian.',
      claims: [
        {
          title: 'Pancreatic Tissue Research',
          summary:
            'Studied for effects on pancreatic tissue and carbohydrate metabolism measures in limited work.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'Pancreatic tissue',
          title: 'Oriented around the pancreas',
          explanation:
            'Named for pancreatic tissue, which produces both digestive enzymes and the hormones that regulate blood sugar.',
        },
      ],
      studiedFor: ['pancreatic tissue', 'carbohydrate metabolism'],
      targets: ['pancreatic tissue'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US development',
        summary:
          'Registered or sold in Russia. No US regulatory filing and no active US clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'limited',
      references: [pubmed('pancragen peptide bioregulator')],
    },
  },
  {
    id: 'catalog:prostamax',
    name: 'Prostamax',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Prostamax is a short synthetic peptide associated in its literature with the prostate. It sits alongside older prostate tissue extracts used in Russia. Independent evidence is very limited, and nothing here is an approved treatment for any prostate condition.',
      claims: [
        {
          title: 'Prostate Tissue Research',
          summary:
            'Studied for effects on prostate tissue in men with age-related prostate change.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'Prostate tissue',
          title: 'Oriented around the prostate',
          explanation:
            'Named for prostate tissue. The family hypothesis is action on gene expression within the associated tissue rather than on a receptor.',
        },
      ],
      studiedFor: ['prostate tissue'],
      targets: ['prostate tissue'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in US development',
        summary:
          'Registered or sold in Russia. No US regulatory filing and no active US clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'limited',
      references: [pubmed('prostamax prostate peptide bioregulator')],
    },
  },
  {
    id: 'catalog:testagen',
    name: 'Testagen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Testagen is studied for effects on testicular tissue and reproductive measures, in preliminary animal and cell work. It is not a hormone and not a testosterone replacement — it is a short peptide with a proposed gene-expression mechanism.',
      claims: [
        {
          title: 'Reproductive Tissue Research',
          summary:
            'Studied in animal work for effects on testicular tissue and reproductive measures.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Testicular tissue',
          title: 'Oriented around testicular tissue',
          explanation:
            'Named for the tissue its research concerns. Distinct from hormones such as testosterone — this is a short peptide with a proposed gene-expression mechanism, not an androgen.',
        },
      ],
      studiedFor: ['testicular tissue', 'reproductive research'],
      targets: ['testicular tissue'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary:
          'Animal and cell studies. No registered human clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'preclinical',
      references: [pubmed('testagen peptide bioregulator')],
    },
  },
  {
    id: 'catalog:ovagen',
    name: 'Ovagen',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Ovagen is a short synthetic peptide in the Khavinson family. Despite a name that suggests reproductive tissue, the literature associates it with the liver and with protein synthesis. It is one of the least studied entries in an already thinly studied family.',
      claims: [
        {
          title: 'Liver & Protein Research',
          summary:
            'Studied for effects on liver tissue and protein synthesis in preliminary work.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Liver tissue',
          title: 'Named misleadingly for its association',
          explanation:
            'Its name suggests ovarian tissue; the published association is hepatic. That mismatch is worth stating rather than papering over, because it is a common point of confusion.',
        },
      ],
      studiedFor: ['liver tissue', 'protein synthesis'],
      targets: ['liver tissue'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary:
          'Preliminary work only. No registered human clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'preclinical',
      references: [pubmed('ovagen peptide bioregulator')],
    },
  },
  {
    id: 'catalog:chonluten',
    name: 'Chonluten',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Peptide bioregulator',
    research: {
      overview:
        'Chonluten is a short synthetic peptide studied for effects on lung and bronchial tissue. Suppliers often use its name interchangeably with the other airway peptide in this family; they are separate molecules, each with its own — equally limited — evidence.',
      claims: [
        {
          title: 'Lung Tissue Research',
          summary:
            'Studied for effects on bronchial and lung tissue in limited work.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Bronchial tissue',
          title: 'One of two airway peptides, not the same one',
          explanation:
            'This family contains two compounds oriented around the airways, and their names are frequently swapped by suppliers. They are different molecules, and neither has evidence that would justify treating them as interchangeable.',
        },
      ],
      studiedFor: ['lung tissue', 'bronchial tissue'],
      targets: ['bronchial epithelium'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary:
          'Preliminary work only. No registered human clinical programme.',
        lastUpdated: 'August 2026',
      },
      researchStatus: KHAVINSON_STATUS,
      evidenceLevel: 'preclinical',
      references: [pubmed('chonluten peptide bioregulator')],
    },
  },
];

/**
 * Compounds that are not Khavinson bioregulators but were audited alongside
 * them, and belong in no existing file cleanly.
 *
 * Grouped here rather than scattered so the additions of slice 3.9A stay
 * reviewable in one place. Each is a genuinely distinct molecule with its own
 * evidence base — none is an alias of anything already in the catalog.
 */
export const ADDITIONAL_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:peg-mgf',
    name: 'PEG-MGF',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'IGF-1 variant',
    aliases: ['Pegylated MGF', 'PEG Mechano Growth Factor'],
    research: {
      overview:
        'PEG-MGF is Mechano Growth Factor with a polyethylene glycol chain attached. MGF itself breaks down within minutes; the added chain is there purely to make it last longer in the bloodstream. It is sold separately from MGF for that reason, and the research interest is the same — muscle repair after damage.',
      claims: [
        {
          title: 'Muscle Repair Research',
          summary:
            'Studied in animal and cell work for activating the satellite cells involved in repairing damaged muscle.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'Muscle satellite cells',
          title: 'The same molecule, made to last longer',
          explanation:
            'Pegylation is a formulation change, not a different mechanism: attaching an inert chain slows clearance. What it does once it arrives is what MGF does — signal to the dormant repair cells that sit alongside muscle fibres.',
        },
      ],
      studiedFor: ['muscle repair', 'muscle growth research'],
      targets: ['IGF-1 receptor pathway', 'muscle satellite cells'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary: 'No human clinical development. Sold only as a research chemical.',
        lastUpdated: 'August 2026',
      },
      researchStatus:
        'Not FDA-approved and not in clinical development. A pegylated form of Mechano Growth Factor, which is itself a research compound.',
      evidenceLevel: 'preclinical',
      references: [pubmed('pegylated mechano growth factor')],
    },
  },
  {
    id: 'catalog:foxo4-dri',
    name: 'FOXO4-DRI',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Senolytic peptide',
    aliases: ['FOXO4-D-Retro-Inverso', 'Proxofim'],
    research: {
      overview:
        'FOXO4-DRI is a senolytic — a compound designed to kill senescent cells. These are cells that have stopped dividing but refuse to die, accumulate with age, and leak inflammatory signals into the tissue around them. The peptide is built to break the specific protein interaction those cells rely on to stay alive. Results so far are in mice.',
      claims: [
        {
          title: 'Clearing Senescent Cells',
          summary:
            'Studied in mice for selectively killing senescent cells, with reported improvements in fur density, kidney measures and stamina in aged animals.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'FOXO4–p53 interaction',
          title: 'Removing what keeps a worn-out cell alive',
          explanation:
            'Senescent cells hold p53 — the protein that would normally order a damaged cell to self-destruct — bound up and inactive. This peptide is designed to release it, so the cell completes the death it was avoiding.',
        },
      ],
      studiedFor: ['cellular senescence', 'ageing research'],
      targets: ['FOXO4', 'p53'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary:
          'Animal studies only. No registered human clinical trial of this peptide.',
        lastUpdated: 'August 2026',
      },
      researchStatus:
        'Not FDA-approved and not in human clinical development. Widely discussed on the basis of a 2017 mouse study.',
      evidenceLevel: 'preclinical',
      references: [pubmed('FOXO4-DRI senolytic peptide'), pubmed('senescent cell clearance FOXO4')],
    },
  },
  {
    id: 'catalog:aicar',
    name: 'AICAR',
    classification: 'research-compound',
    compoundType: 'small-molecule',
    category: 'AMPK activator',
    aliases: ['Acadesine', 'AICA riboside', 'AICA ribonucleotide'],
    research: {
      overview:
        'AICAR is not a peptide — it is a small molecule that switches on AMPK, the enzyme a cell uses to signal that it is short of energy. Doing that mimics some of what exercise does at the cellular level, which is why it became known as an "exercise mimetic". It is banned in sport and has been studied clinically for entirely different reasons.',
      claims: [
        {
          title: 'Endurance Research',
          summary:
            'Studied in mice for increasing running endurance without training, which is the origin of the exercise-mimetic label.',
          evidenceLevel: 'preclinical',
        },
        {
          title: 'Cardiac & Metabolic Studies',
          summary:
            'Investigated in humans for protecting the heart during cardiac surgery and for effects on insulin sensitivity.',
          evidenceLevel: 'early-human',
        },
      ],
      mechanisms: [
        {
          target: 'AMPK',
          title: 'Telling the cell it is running low',
          explanation:
            'AMPK is the sensor that notices when a cell is short of energy and responds by burning fuel rather than storing it. AICAR resembles the molecule that normally triggers it, so it flips that switch without the exertion that usually would.',
        },
      ],
      studiedFor: ['endurance research', 'insulin sensitivity', 'cardiac protection'],
      targets: ['AMPK'],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in active development',
        summary:
          'Studied in human trials for cardiac indications; no active programme toward approval for metabolic or performance use.',
        lastUpdated: 'August 2026',
      },
      researchStatus:
        'Not FDA-approved. Prohibited at all times by the World Anti-Doping Agency. A small molecule rather than a peptide.',
      evidenceLevel: 'preclinical',
      references: [pubmed('AICAR AMPK exercise mimetic'), trials('AICAR')],
    },
  },
  {
    id: 'catalog:p21',
    name: 'P21',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Neurotrophic peptide',
    aliases: ['P021'],
    research: {
      overview:
        'P21 is a small synthetic peptide derived from a fragment of CNTF, a natural nerve growth factor. It was designed to keep the useful part of that protein while dropping the parts that made the full molecule unusable as a drug. Research interest is in whether it can encourage the brain to grow new neurons.',
      claims: [
        {
          title: 'Neurogenesis Research',
          summary:
            'Studied in animal models for stimulating the growth of new neurons and improving memory measures.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'BDNF pathway',
          title: 'A usable fragment of a nerve growth factor',
          explanation:
            'Derived from ciliary neurotrophic factor. The full protein caused side effects that ended its development; this fragment was selected to retain the growth signalling and increase BDNF, a protein central to forming new connections.',
        },
      ],
      studiedFor: ['neurogenesis', 'memory research', 'Alzheimer research'],
      targets: ['BDNF pathway', 'CNTF receptor'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary: 'Animal studies only. No registered human clinical trial.',
        lastUpdated: 'August 2026',
      },
      researchStatus: 'Not FDA-approved and not in human clinical development.',
      evidenceLevel: 'preclinical',
      references: [pubmed('P021 neurogenic peptide CNTF')],
    },
  },
  {
    id: 'catalog:pe-22-28',
    name: 'PE-22-28',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Neurotrophic peptide',
    aliases: ['PE22-28'],
    research: {
      overview:
        'PE-22-28 is studied for mood — specifically for antidepressant-like effects that animal work reports appearing within days rather than the weeks conventional antidepressants take. It is a fragment of spadin, and works by blocking a potassium channel in the brain rather than by acting on serotonin transport.',
      claims: [
        {
          title: 'Mood Research',
          summary:
            'Studied in animal models for rapid antidepressant-like effects and for increases in the growth of new neurons.',
          evidenceLevel: 'preclinical',
        },
      ],
      mechanisms: [
        {
          target: 'TREK-1 potassium channel',
          title: 'Blocking a channel rather than a transporter',
          explanation:
            'Most antidepressants act on serotonin transport. TREK-1 is a potassium channel whose removal in animals produces a depression-resistant phenotype; this peptide blocks it directly, which is why the timescale in animal work is different.',
        },
      ],
      studiedFor: ['depression research', 'neurogenesis'],
      targets: ['TREK-1 potassium channel'],
      developmentStatus: {
        stage: 'preclinical',
        label: 'Preclinical',
        summary: 'Animal studies only. No registered human clinical trial.',
        lastUpdated: 'August 2026',
      },
      researchStatus: 'Not FDA-approved and not in human clinical development.',
      evidenceLevel: 'preclinical',
      references: [pubmed('PE 22-28 spadin TREK-1')],
    },
  },
  {
    id: 'catalog:setmelanotide',
    name: 'Setmelanotide',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'Melanocortin agonist',
    aliases: ['Imcivree', 'RM-493'],
    research: {
      overview:
        'Setmelanotide is an approved medicine for obesity caused by specific rare genetic faults in the brain pathway that controls appetite. In those people the "I am full" signal never arrives properly; this restores it downstream of the break. It is not a general weight-loss drug and is not approved for common obesity.',
      claims: [
        {
          title: 'Weight in Genetic Obesity',
          summary:
            'Produces substantial weight reduction in people with specific rare genetic deficiencies of the melanocortin pathway, which is what it is approved for.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Hunger',
          summary:
            'Reduces reported hunger and appetite in the same genetically defined groups studied in its trials.',
          evidenceLevel: 'approved-use',
        },
      ],
      mechanisms: [
        {
          target: 'MC4 receptor',
          title: 'Restoring a broken fullness signal',
          explanation:
            'MC4R is the receptor at the end of the brain circuit that registers being full. Certain rare mutations upstream of it mean the signal never arrives; acting on the receptor directly bypasses the break.',
        },
      ],
      studiedFor: ['POMC deficiency obesity', 'LEPR deficiency obesity', 'Bardet-Biedl syndrome'],
      targets: ['MC4 receptor'],
      developmentStatus: {
        stage: 'approved',
        label: 'FDA Approved',
        summary:
          'Approved for chronic weight management in specific rare genetic causes of obesity, not for obesity generally.',
      },
      researchStatus:
        'FDA-approved for named rare genetic obesity syndromes. Not approved for common obesity.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Setmelanotide'), trials('setmelanotide')],
    },
  },
  {
    id: 'catalog:eloralintide',
    name: 'Eloralintide',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Amylin receptor agonist',
    aliases: ['LY3841136'],
    research: {
      overview:
        'Eloralintide is an investigational amylin drug. Amylin is a hormone released alongside insulin that contributes to feeling full, and drugs acting on its receptor are being studied as an alternative to — and alongside — the GLP-1 medicines. It is in mid-stage trials and is not approved.',
      claims: [
        {
          title: 'Weight Research',
          summary:
            'Studied in clinical trials for weight reduction in obesity, on its own and in combination work.',
          evidenceLevel: 'early-human',
        },
      ],
      mechanisms: [
        {
          target: 'Amylin receptor',
          title: 'A different fullness hormone',
          explanation:
            'Amylin is co-released with insulin and slows stomach emptying while signalling satiety through the brainstem — a separate pathway from GLP-1, which is why the two are studied together.',
        },
      ],
      studiedFor: ['obesity', 'weight management'],
      targets: ['amylin receptor'],
      developmentStatus: {
        stage: 'phase-2',
        label: 'Phase 2',
        summary:
          'In mid-stage clinical trials for obesity. Not approved, and an ongoing trial is not a result.',
        lastUpdated: 'August 2026',
        references: [trials('eloralintide')],
      },
      researchStatus: 'Investigational. Not FDA-approved for any use.',
      evidenceLevel: 'early-human',
      references: [trials('eloralintide'), pubmed('eloralintide amylin')],
    },
  },
  {
    id: 'catalog:orforglipron',
    name: 'Orforglipron',
    classification: 'research-compound',
    compoundType: 'small-molecule',
    category: 'GLP-1 receptor agonist',
    aliases: ['LY3502970'],
    research: {
      overview:
        'Orforglipron is studied for weight and blood sugar in the same way the injectable GLP-1 medicines are, with one difference that explains all the attention: it is a small molecule rather than a peptide, so it can be taken as an ordinary tablet with no injection and no refrigeration.',
      claims: [
        {
          title: 'Weight & Blood Sugar',
          summary:
            'Studied in late-stage trials for weight reduction and blood sugar control in obesity and type 2 diabetes.',
          evidenceLevel: 'human-clinical',
        },
      ],
      mechanisms: [
        {
          target: 'GLP-1 receptor',
          title: 'A familiar target reached by tablet',
          explanation:
            'Acts on the GLP-1 receptor — the same target as the injectable medicines, which is the switch a gut hormone normally flips after a meal. Being a small molecule rather than a peptide is what lets it survive digestion intact.',
        },
      ],
      studiedFor: ['obesity', 'type 2 diabetes'],
      targets: ['GLP-1 receptor'],
      developmentStatus: {
        stage: 'phase-3',
        label: 'Phase 3 · Late Stage',
        summary:
          'In late-stage trials for obesity and type 2 diabetes. Not approved; a completed trial is not an approval.',
        lastUpdated: 'August 2026',
        references: [trials('orforglipron')],
      },
      researchStatus: 'Investigational. Not FDA-approved for any use.',
      evidenceLevel: 'human-clinical',
      references: [trials('orforglipron'), pubmed('orforglipron oral GLP-1')],
    },
  },
];
