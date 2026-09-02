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
      overview:
        'Somatropin is manufactured human growth hormone itself, not a compound that prompts the body to make its own. It is an approved medicine for genuine growth hormone deficiency and several other conditions, and it is a controlled substance in the United States.',
      claims: [
        {
          title: 'Growth & Development',
          summary:
            'Restores normal growth in children who do not produce enough growth hormone of their own — the use it was developed for.',
          evidenceLevel: 'approved-use',
        },
        {
          title: 'Muscle & Body Composition',
          summary:
            'In diagnosed adult deficiency, approved use includes restoring lean muscle mass and reducing body fat toward normal levels.',
          evidenceLevel: 'approved-use',
        },
      ],
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
      overview:
        'Tesamorelin is an approved medicine, sold as Egrifta, used to reduce excess abdominal fat in people with HIV-associated lipodystrophy. It works by prompting the body to release its own growth hormone. It is the only GHRH analog in this catalog with FDA approval.',
      claims: [
        {
          title: 'Abdominal Fat',
          summary:
            'Reduces deep abdominal fat — the kind stored around the organs rather than under the skin — in people with HIV-associated lipodystrophy. This is what it is approved for.',
          evidenceLevel: 'approved-use',
        },
      ],
      mechanisms: [
        {
          target: 'GHRH receptor',
          title: 'Prompting your own growth hormone',
          explanation:
            'Stimulates the pituitary to release growth hormone in the body’s own pattern, rather than supplying growth hormone directly.',
        },
      ],
      developmentStatus: {
        stage: 'approved',
        label: 'FDA Approved',
        summary: 'Approved in the United States for reduction of excess abdominal fat in HIV-associated lipodystrophy.',
      },
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
      overview:
        'Sermorelin is a shortened version of the body’s own growth-hormone-releasing hormone, tracked for recovery, sleep and body composition. It prompts the pituitary to release growth hormone rather than supplying the hormone itself. It was once an approved US medicine and is now supplied mainly through compounding pharmacies.',
      claims: [
        {
          title: 'Growth Hormone Release',
          summary:
            'Prompts the pituitary to release growth hormone, which supported its former approved use in growth hormone deficiency and as a test of pituitary function.',
          evidenceLevel: 'human-clinical',
        },
      ],
      developmentStatus: {
        stage: 'discontinued',
        label: 'Discontinued',
        summary:
          'Approved as Geref and withdrawn from the US market in 2008 by the manufacturer. This was a commercial withdrawal, not an FDA safety action and not a rejected application.',
        lastUpdated: 'August 2026',
        references: [fdaLabel('Sermorelin')],
      },
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
      overview:
        'CJC-1295 with DAC signals the pituitary to release growth hormone, and is tracked for recovery, sleep and body composition. The DAC attachment binds it to a blood protein so it keeps growth hormone raised for days rather than minutes — the DAC-free form is a genuinely different compound and the two are not interchangeable.',
      claims: [
        {
          title: 'Growth Hormone Release',
          summary:
            'Raises growth hormone and IGF-1 levels and holds them raised for days rather than hours, which is the whole point of the DAC attachment.',
          evidenceLevel: 'early-human',
        },
      ],
      mechanisms: [
        {
          target: 'GHRH receptor',
          title: 'Prompting your own growth hormone',
          explanation:
            'The receptor the body’s own growth-hormone-releasing hormone acts on. Stimulating it prompts the pituitary to release growth hormone, rather than supplying the hormone directly.',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary: 'Studied in early human research but with no known active approval programme.',
      },
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
      overview:
        'CJC-1295 without DAC prompts the pituitary to release growth hormone in a short, sharp pulse rather than a sustained rise — which is why it is usually paired with a secretagogue like ipamorelin. It is tracked for recovery and body composition. The DAC form lasts days instead of minutes and is a different compound. In common usage this name and "Mod GRF 1-29" mean the same thing.',
      claims: [
        {
          title: 'Growth Hormone Release',
          summary:
            'Triggers a short pulse of the body’s own growth hormone, closer to its natural release pattern than the long-acting DAC form.',
          evidenceLevel: 'preclinical',
        },
      ],
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
      overview:
        'Ipamorelin prompts the body to release its own growth hormone rather than supplying it directly. It is tracked for recovery, sleep quality and body composition, and is the most commonly used compound in this group because it does this without the hunger and cortisol effects of the older secretagogues.',
      claims: [
        {
          title: 'Growth Hormone Release',
          summary:
            'Raises the body’s own growth hormone output in short pulses that resemble its natural release pattern, without the appetite spike the older secretagogues cause.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Recovery & Body Composition',
          summary:
            'Tracked for faster recovery from training, deeper sleep and leaner body composition — the downstream effects people are actually seeking from raised growth hormone.',
          evidenceLevel: 'limited',
        },
      ],
      mechanisms: [
        {
          target: 'Ghrelin / GHS-R1a receptor',
          title: 'Ghrelin receptor',
          explanation:
            'Ghrelin is the hormone that signals hunger, but its receptor does a second job: activating it makes the pituitary release a pulse of growth hormone. Ipamorelin is designed to trigger that second effect while barely touching the first.',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary: 'Studied in early human research but with no known active approval programme.',
      },
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
      overview:
        'GHRP-2 prompts the body to release its own growth hormone by acting on the ghrelin receptor. It is tracked for recovery and body composition, and is reliable enough at raising growth hormone that some countries use it as a clinical test of pituitary function. It also increases appetite.',
      claims: [
        {
          title: 'Growth Hormone Release',
          summary:
            'Raises the body’s own growth hormone output dependably enough to be used as a diagnostic test in some countries.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Appetite',
          summary:
            'Also stimulates appetite, since it acts on the same receptor as the hunger hormone ghrelin.',
          evidenceLevel: 'early-human',
        },
      ],
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
      overview:
        'GHRP-6 is one of the earliest compounds of its kind, prompting growth hormone release through the ghrelin receptor. It is known above all for a strong hunger effect — pronounced enough that it is sometimes tracked specifically for appetite rather than for growth hormone.',
      claims: [
        {
          title: 'Appetite',
          summary:
            'Produces a marked increase in hunger, the effect it is most known for and sometimes used for deliberately.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Growth Hormone Release',
          summary:
            'Raises the body’s own growth hormone output, tracked for recovery and body composition.',
          evidenceLevel: 'early-human',
        },
      ],
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
      overview:
        'Hexarelin is among the strongest of the growth hormone releasing peptides, tracked for recovery and body composition. It is unusual in this group for a second line of research entirely separate from growth hormone: possible protective effects on heart tissue.',
      claims: [
        {
          title: 'Growth Hormone Release',
          summary:
            'One of the more potent compounds in this group at raising the body’s own growth hormone, though the response tends to fade with continued use.',
          evidenceLevel: 'early-human',
        },
        {
          title: 'Heart Tissue',
          summary:
            'Studied for protective effects on heart muscle through a separate receptor, independent of growth hormone.',
          evidenceLevel: 'preclinical',
        },
      ],
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
      overview:
        'MK-677 is a pill rather than an injection, and a small molecule rather than a peptide, though it is routinely sold beside them. It raises the body’s own growth hormone and IGF-1 levels and is tracked for muscle, recovery, sleep and appetite. Unlike most compounds here it has been through genuine long-term human trials.',
      claims: [
        {
          title: 'Growth Hormone & IGF-1',
          summary:
            'Raises growth hormone and IGF-1 levels and keeps them raised with daily use — measured over months in human trials rather than inferred from single doses.',
          evidenceLevel: 'human-clinical',
        },
        {
          title: 'Body Composition',
          summary:
            'Increases lean body mass in trials. Strong appetite stimulation and water retention are consistently reported alongside it, which is part of why it never reached approval.',
          evidenceLevel: 'human-clinical',
        },
      ],
      mechanisms: [
        {
          target: 'Ghrelin / GHS-R1a receptor',
          title: 'Ghrelin receptor',
          explanation:
            'Acts on the same receptor as ghrelin, the hunger hormone. That single receptor drives both effects people report: the growth hormone release they are after, and the sharp appetite increase that comes with it.',
        },
      ],
      developmentStatus: {
        stage: 'not-in-clinical-development',
        label: 'Not in Clinical Development',
        summary:
          'Studied in human trials over many years but never brought to approval. No known active programme.',
      },
      studiedFor: ['growth hormone & IGF-1 levels', 'body composition', 'age-related decline in growth hormone'],
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
      overview:
        'AOD-9604 is a small piece of the growth hormone molecule, kept because it was thought to carry the fat-burning effect without raising growth hormone or blood sugar. It is tracked for fat loss. Human obesity trials did not show a weight benefit over placebo. It is a modified version of HGH Fragment 176-191, which is listed separately.',
      claims: [
        {
          title: 'Fat Metabolism',
          summary:
            'Designed and researched for breaking down stored fat without the blood-sugar and growth-hormone effects of the full hormone. Human weight trials did not confirm the benefit.',
          evidenceLevel: 'early-human',
        },
      ],
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
      overview:
        'HGH Fragment 176-191 is the tail end of the growth hormone molecule, the part associated in research with breaking down fat. It is tracked for fat loss on the reasoning that it may do that without growth hormone’s other effects. Frequently sold as AOD-9604, which is a modified version of a slightly different span — not the same molecule.',
      claims: [
        {
          title: 'Fat Metabolism',
          summary:
            'Researched for breaking down stored fat, the effect this section of the growth hormone molecule is associated with.',
          evidenceLevel: 'preclinical',
        },
      ],
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
      overview:
        'IGF-1 LR3 is a modified version of insulin-like growth factor 1, the hormone through which much of growth hormone’s muscle-building effect actually happens. It is tracked for muscle growth and recovery, since the modification stops it being mopped up by carrier proteins and keeps it active far longer. Its established use, though, is as a laboratory reagent for growing cells.',
      claims: [
        {
          title: 'Cell & Muscle Growth',
          summary:
            'Drives the growth signalling that IGF-1 normally carries, which is why it is tracked in muscle contexts and used to grow cells in the laboratory.',
          evidenceLevel: 'preclinical',
        },
      ],
      studiedFor: ['cell growth & proliferation in laboratory research'],
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
      overview:
        'IGF-1 DES is a shortened, much more potent form of insulin-like growth factor 1 that clears from the body very quickly — the opposite trade-off from IGF-1 LR3. It is tracked in muscle-growth contexts for that local, short-lived action, but its established role is as a laboratory reagent rather than a studied treatment.',
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
      overview:
        'Mechano Growth Factor is the form of IGF-1 that muscle produces itself in response to being worked hard — the body’s own local repair signal after training or injury. It is tracked for muscle repair, though research is confined to laboratory and animal work.',
      claims: [
        {
          title: 'Muscle Repair',
          summary:
            'Researched for activating the satellite cells that rebuild muscle fibres after they are damaged by exercise or injury.',
          evidenceLevel: 'preclinical',
        },
      ],
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
      overview:
        'Follistatin-344 blocks myostatin, the body’s own brake on muscle growth. It is tracked for muscle mass on that basis — animals bred without myostatin are strikingly muscular. Human evidence is confined to gene-therapy trials in muscle-wasting disease rather than to the injectable material sold online.',
      claims: [
        {
          title: 'Muscle Mass',
          summary:
            'Researched for increasing muscle by removing myostatin, the signal that normally limits how much muscle the body will build.',
          evidenceLevel: 'preclinical',
        },
      ],
      studiedFor: ['muscle mass regulation in preclinical research'],
      targets: ['Myostatin', 'Activin'],
      researchStatus: 'Not FDA-approved. A research reagent.',
      evidenceLevel: 'preclinical',
      references: [pubmed('follistatin myostatin')],
    },
  },
];
