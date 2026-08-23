/**
 * Growth hormone, GHRH analogs, and secretagogues.
 *
 * Two mechanisms sit in this group and are routinely confused, so the
 * categories separate them: a **GHRH analog** mimics growth-hormone-releasing
 * hormone at the GHRH receptor, while a **growth hormone secretagogue** acts at
 * the ghrelin/GHS receptor. The two CJC-1295 variants are GHRH analogs, not
 * secretagogues — corrected here from the slice 3.5 catalog.
 */

import type { CatalogSeed } from './seed';
import { fdaLabel, pubmed, trials } from './seed';

export const GROWTH_HORMONE_DEFINITIONS: readonly CatalogSeed[] = [
  {
    id: 'catalog:somatropin',
    name: 'Somatropin',
    classification: 'approved-medication',
    compoundType: 'protein',
    category: 'Recombinant human growth hormone',
    aliases: ['HGH', 'Human growth hormone', 'rhGH'],
    research: {
      summary:
        'Recombinant human growth hormone — a 191-amino-acid protein rather than a short peptide. Approved for a range of growth-hormone-related conditions.',
      studiedFor: ['growth hormone deficiency', 'short stature of several causes', 'HIV-associated wasting'],
      targets: ['Growth hormone receptor'],
      researchStatus: 'FDA-approved for specific indications. A controlled substance in the United States.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Somatropin'), pubmed('somatropin growth hormone')],
    },
  },
  {
    id: 'catalog:tesamorelin',
    name: 'Tesamorelin',
    classification: 'approved-medication',
    compoundType: 'peptide',
    category: 'GHRH analog',
    aliases: ['Egrifta'],
    research: {
      summary:
        'A stabilized analog of growth-hormone-releasing hormone that acts at the GHRH receptor to stimulate the body’s own growth hormone release.',
      studiedFor: ['HIV-associated lipodystrophy'],
      targets: ['GHRH receptor'],
      researchStatus: 'FDA-approved for reduction of excess abdominal fat in HIV-associated lipodystrophy.',
      evidenceLevel: 'approved-use',
      references: [fdaLabel('Tesamorelin'), pubmed('tesamorelin')],
    },
  },
  {
    id: 'catalog:sermorelin',
    name: 'Sermorelin',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'GHRH analog',
    aliases: ['GHRH (1-29)', 'Geref'],
    research: {
      summary:
        'The first 29 amino acids of growth-hormone-releasing hormone — the shortest fragment that retains activity at the GHRH receptor.',
      studiedFor: ['growth hormone deficiency', 'diagnostic assessment of growth hormone secretion'],
      targets: ['GHRH receptor'],
      researchStatus:
        'Previously FDA-approved as Geref and withdrawn from the US market in 2008. No FDA-approved product is currently marketed; material is typically supplied through compounding pharmacies or as a research chemical.',
      evidenceLevel: 'human-clinical',
      references: [pubmed('sermorelin'), fdaLabel('Sermorelin')],
    },
  },
  {
    id: 'catalog:cjc-1295-dac',
    name: 'CJC-1295 with DAC',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'GHRH analog',
    aliases: ['CJC-1295 DAC', 'DAC:GRF'],
    research: {
      summary:
        'A modified GHRH analog carrying a Drug Affinity Complex (DAC) that binds albumin, substantially extending its half-life compared with the DAC-free form.',
      studiedFor: ['growth hormone secretion in early human studies'],
      targets: ['GHRH receptor'],
      researchStatus: 'Not FDA-approved. Studied in early human research; sold as a research chemical.',
      evidenceLevel: 'early-human',
      references: [pubmed('CJC-1295')],
    },
  },
  {
    id: 'catalog:cjc-1295-no-dac',
    name: 'CJC-1295 without DAC',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'GHRH analog',
    aliases: ['Mod GRF 1-29', 'Modified GRF (1-29)', 'CJC-1295 DAC-free'],
    research: {
      summary:
        'A modified GHRH (1-29) analog without the albumin-binding DAC, giving it a much shorter duration of action than the DAC form. In common ecosystem usage this name and "Mod GRF 1-29" refer to the same compound.',
      studiedFor: ['growth hormone secretion in early research'],
      targets: ['GHRH receptor'],
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'preclinical',
      references: [pubmed('modified GRF 1-29')],
    },
  },
  {
    id: 'catalog:ipamorelin',
    name: 'Ipamorelin',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Growth hormone secretagogue',
    research: {
      summary:
        'A pentapeptide that acts at the ghrelin (growth hormone secretagogue) receptor. Characterised in research as relatively selective compared with earlier secretagogues.',
      studiedFor: ['growth hormone release', 'post-operative gastrointestinal motility in early trials'],
      targets: ['Ghrelin / GHS-R1a receptor'],
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'early-human',
      references: [pubmed('ipamorelin')],
    },
  },
  {
    id: 'catalog:ghrp-2',
    name: 'GHRP-2',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Growth hormone secretagogue',
    aliases: ['Pralmorelin'],
    research: {
      summary:
        'A synthetic growth hormone releasing peptide acting at the ghrelin receptor. Used in some countries as a diagnostic agent for growth hormone secretion.',
      studiedFor: ['growth hormone release', 'diagnostic assessment of growth hormone secretion'],
      targets: ['Ghrelin / GHS-R1a receptor'],
      researchStatus: 'Not FDA-approved in the United States.',
      evidenceLevel: 'early-human',
      references: [pubmed('GHRP-2 pralmorelin')],
    },
  },
  {
    id: 'catalog:ghrp-6',
    name: 'GHRP-6',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Growth hormone secretagogue',
    research: {
      summary:
        'One of the earliest synthetic growth hormone releasing peptides, acting at the ghrelin receptor. Notably associated in research with appetite signalling.',
      studiedFor: ['growth hormone release', 'appetite signalling'],
      targets: ['Ghrelin / GHS-R1a receptor'],
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'early-human',
      references: [pubmed('GHRP-6')],
    },
  },
  {
    id: 'catalog:hexarelin',
    name: 'Hexarelin',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Growth hormone secretagogue',
    aliases: ['Examorelin'],
    research: {
      summary:
        'A synthetic hexapeptide growth hormone secretagogue. Research has also examined effects at the CD36 receptor independent of growth hormone release.',
      studiedFor: ['growth hormone release', 'cardiac tissue in preclinical research'],
      targets: ['Ghrelin / GHS-R1a receptor', 'CD36'],
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'early-human',
      references: [pubmed('hexarelin')],
    },
  },
  {
    id: 'catalog:mk-677',
    name: 'MK-677',
    classification: 'research-compound',
    compoundType: 'small-molecule',
    category: 'Growth hormone secretagogue',
    aliases: ['Ibutamoren', 'Ibutamoren mesylate', 'MK-0677'],
    research: {
      summary:
        'An orally active small molecule, **not a peptide**, though it is routinely grouped with them. It acts at the ghrelin receptor and has been evaluated in human trials.',
      studiedFor: ['growth hormone and IGF-1 levels', 'body composition', 'age-related decline in growth hormone'],
      targets: ['Ghrelin / GHS-R1a receptor'],
      researchStatus: 'Investigational; not FDA-approved.',
      evidenceLevel: 'human-clinical',
      references: [trials('Ibutamoren'), pubmed('MK-677 ibutamoren')],
    },
  },
  {
    id: 'catalog:aod-9604',
    name: 'AOD-9604',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Growth hormone fragment',
    research: {
      summary:
        'A modified fragment of human growth hormone corresponding to residues 177-191 with an added tyrosine. Distinct from the unmodified HGH Fragment 176-191, which is listed separately.',
      studiedFor: ['fat metabolism', 'obesity in early human trials'],
      researchStatus: 'Investigational; not FDA-approved as a drug.',
      evidenceLevel: 'early-human',
      references: [pubmed('AOD9604'), trials('AOD-9604')],
    },
  },
  {
    id: 'catalog:hgh-fragment-176-191',
    name: 'HGH Fragment 176-191',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'Growth hormone fragment',
    research: {
      summary:
        'The C-terminal fragment of human growth hormone spanning residues 176-191. Frequently conflated with AOD-9604, which is a modified version of a slightly different span — the two are kept as separate entries here because they are not the same molecule.',
      studiedFor: ['fat metabolism in preclinical research'],
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'preclinical',
      references: [pubmed('growth hormone fragment 176-191')],
    },
  },
  {
    id: 'catalog:igf-1-lr3',
    name: 'IGF-1 LR3',
    classification: 'research-compound',
    compoundType: 'protein',
    category: 'IGF-1 analog',
    aliases: ['Long R3 IGF-1'],
    research: {
      summary:
        'A modified analog of insulin-like growth factor 1 with reduced binding to IGF binding proteins, extending its activity. Widely used as a cell-culture reagent.',
      studiedFor: ['cell growth and proliferation in laboratory research'],
      targets: ['IGF-1 receptor'],
      researchStatus: 'Not FDA-approved. A laboratory reagent and research chemical.',
      evidenceLevel: 'preclinical',
      references: [pubmed('long R3 IGF-1')],
    },
  },
  {
    id: 'catalog:igf-1-des',
    name: 'IGF-1 DES',
    classification: 'research-compound',
    compoundType: 'protein',
    category: 'IGF-1 analog',
    aliases: ['DES(1-3) IGF-1'],
    research: {
      summary:
        'A truncated IGF-1 analog missing the first three N-terminal amino acids, which reduces binding-protein affinity.',
      studiedFor: ['cell growth in laboratory research'],
      targets: ['IGF-1 receptor'],
      researchStatus: 'Not FDA-approved. A laboratory reagent and research chemical.',
      evidenceLevel: 'preclinical',
      references: [pubmed('DES(1-3)IGF-1')],
    },
  },
  {
    id: 'catalog:mgf',
    name: 'Mechano Growth Factor',
    classification: 'research-compound',
    compoundType: 'peptide',
    category: 'IGF-1 splice variant',
    aliases: ['MGF', 'IGF-1Ec'],
    research: {
      summary:
        'A splice variant of IGF-1 expressed in muscle in response to mechanical loading, studied in muscle tissue research.',
      studiedFor: ['muscle tissue repair in preclinical research'],
      researchStatus: 'Not FDA-approved. Sold as a research chemical.',
      evidenceLevel: 'preclinical',
      references: [pubmed('mechano growth factor IGF-1Ec')],
    },
  },
  {
    id: 'catalog:follistatin-344',
    name: 'Follistatin-344',
    classification: 'research-compound',
    compoundType: 'protein',
    category: 'Myostatin-binding protein',
    research: {
      summary:
        'A recombinant form of follistatin, a protein that binds and inhibits members of the TGF-β family including myostatin. Studied in muscle biology research.',
      studiedFor: ['muscle mass regulation in preclinical research'],
      targets: ['Myostatin', 'Activin'],
      researchStatus: 'Not FDA-approved. A research reagent.',
      evidenceLevel: 'preclinical',
      references: [pubmed('follistatin myostatin')],
    },
  },
];
