/**
 * The catalog as a whole, and what slice 3.9A added to it.
 *
 * Two separate anxieties are covered here. The first is *integrity*: unique
 * ids, no duplicate names, valid enum values, sourced time-sensitive claims —
 * the things a hand-written data file drifts on as it grows. The second is
 * *identity*: a family of similarly named compounds is the easiest place in
 * this app to accidentally give one entry another's copy, and the reader has
 * no way to detect it.
 *
 * The PT-141 case is worth stating plainly, because it is why this file
 * exists. The compound was already in the catalog under its approved name,
 * Bremelanotide, with `PT-141` as an alias — and founder QA still reported it
 * missing. The gap was punctuation: search compared raw strings, so `PT141`
 * matched nothing. That is a search defect wearing a catalog defect's
 * clothes, and the fix belonged in `normalize`, not in a second entry.
 */

import {
  PEPTIDE_CATALOG,
  findCatalogDefinition,
  searchCatalog,
} from '../data/catalog';
import { RESEARCH_AREAS, TIME_SENSITIVE_STAGES } from '../model/types';

const ids = PEPTIDE_CATALOG.map((entry) => entry.id);

/* ── integrity ──────────────────────────────────────────────────────── */

describe('catalog integrity', () => {
  it('gives every entry a unique id', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every entry a unique name', () => {
    const names = PEPTIDE_CATALOG.map((entry) => entry.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('never lets an alias collide with another entry’s name', () => {
    // An alias that is also somebody else's name makes one of them
    // unreachable and the other ambiguous.
    const names = new Map(PEPTIDE_CATALOG.map((entry) => [entry.name.toLowerCase(), entry.id]));
    for (const entry of PEPTIDE_CATALOG) {
      for (const alias of entry.aliases ?? []) {
        const owner = names.get(alias.toLowerCase());
        expect(owner === undefined || owner === entry.id).toBe(true);
      }
    }
  });

  it('never lets two entries claim the same alias', () => {
    const seen = new Map<string, string>();
    for (const entry of PEPTIDE_CATALOG) {
      for (const alias of entry.aliases ?? []) {
        const key = alias.toLowerCase();
        const previous = seen.get(key);
        expect(previous === undefined || previous === entry.id).toBe(true);
        seen.set(key, entry.id);
      }
    }
  });

  it('uses only real research areas', () => {
    for (const entry of PEPTIDE_CATALOG) {
      for (const area of entry.researchAreas ?? []) {
        expect(RESEARCH_AREAS).toContain(area);
      }
    }
  });

  it('dates and sources every time-sensitive development stage', () => {
    for (const entry of PEPTIDE_CATALOG) {
      const status = entry.research?.developmentStatus;
      if (!status || !TIME_SENSITIVE_STAGES.includes(status.stage)) continue;
      // A phase without a date asserts permanent truth about something that
      // changes every few months.
      expect({ id: entry.id, dated: Boolean(status.lastUpdated) }).toEqual({
        id: entry.id,
        dated: true,
      });
      expect((status.references ?? []).length).toBeGreaterThan(0);
    }
  });

  it('gives every entry the content sections a detail page renders', () => {
    for (const entry of PEPTIDE_CATALOG) {
      expect(entry.research?.overview?.length ?? 0).toBeGreaterThan(40);
      expect((entry.research?.references ?? []).length).toBeGreaterThan(0);
    }
  });

  it('resolves every blend component to a real entry', () => {
    for (const entry of PEPTIDE_CATALOG) {
      for (const component of entry.components ?? []) {
        expect(ids).toContain(component.definitionId);
      }
    }
  });

  it('has no duplicate blend — one component set, one entry', () => {
    const blends = PEPTIDE_CATALOG.filter((entry) => entry.compoundType === 'blend');
    const signatures = blends.map((entry) =>
      (entry.components ?? [])
        .map((c) => c.definitionId)
        .slice()
        .sort()
        .join('|'),
    );
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it('never carries dosing or protocol content', () => {
    const prose = PEPTIDE_CATALOG.map((entry) =>
      [
        entry.research?.overview ?? '',
        ...(entry.research?.claims ?? []).map((c) => c.summary),
        ...(entry.research?.mechanisms ?? []).map((m) => m.explanation),
      ].join(' '),
    )
      .join(' ')
      .toLowerCase();

    for (const phrase of ['mg per', 'twice weekly', 'once weekly dose', 'titrate', 'cycle length']) {
      expect(prose).not.toContain(phrase);
    }
  });
});

/* ── PT-141, the reported gap ───────────────────────────────────────── */

describe('PT-141', () => {
  const expected = 'catalog:bremelanotide';

  it.each(['PT-141', 'PT141', 'pt 141', 'bremelanotide', 'Vyleesi'])(
    'resolves "%s" to the same entry',
    (query) => {
      const results = searchCatalog(query);
      expect(results.map((entry) => entry.id)).toContain(expected);
    },
  );

  it('is one entry, not an alias promoted to a second definition', () => {
    const matches = PEPTIDE_CATALOG.filter(
      (entry) =>
        entry.name.toLowerCase().includes('pt-141') ||
        entry.name.toLowerCase() === 'bremelanotide',
    );
    expect(matches.map((entry) => entry.id)).toEqual([expected]);
  });

  it('carries the full content structure a detail page needs', () => {
    const entry = findCatalogDefinition(expected)!;
    expect(entry.research?.overview).toBeTruthy();
    expect((entry.research?.claims ?? []).length).toBeGreaterThan(0);
    expect((entry.research?.mechanisms ?? []).length).toBeGreaterThan(0);
    expect((entry.research?.studiedFor ?? []).length).toBeGreaterThan(0);
    expect((entry.research?.references ?? []).length).toBeGreaterThan(0);
  });
});

/* ── punctuation-insensitive search ─────────────────────────────────── */

describe('search ignores punctuation and spacing', () => {
  it.each([
    ['hghfragment176191', 'catalog:hgh-fragment-176-191'],
    ['ghrp2', 'catalog:ghrp-2'],
    ['igf1lr3', 'catalog:igf-1-lr3'],
    ['pegmgf', 'catalog:peg-mgf'],
    ['foxo4dri', 'catalog:foxo4-dri'],
    ['pe2228', 'catalog:pe-22-28'],
    ['ll37', 'catalog:ll-37'],
    ['5amino1mq', 'catalog:5-amino-1mq'],
  ])('finds %s', (query, id) => {
    expect(searchCatalog(query).map((entry) => entry.id)).toContain(id);
  });

  it('still resolves a full-punctuation query', () => {
    expect(searchCatalog('HGH Fragment 176-191').map((e) => e.id)).toContain(
      'catalog:hgh-fragment-176-191',
    );
  });
});

/* ── every compound added in 3.9A is reachable ──────────────────────── */

describe('slice 3.9A additions', () => {
  const ADDED = [
    ['Thymalin', 'catalog:thymalin'],
    ['Thymogen', 'catalog:thymogen'],
    ['Vilon', 'catalog:vilon'],
    ['Cortagen', 'catalog:cortagen'],
    ['Cartalax', 'catalog:cartalax'],
    ['Vesugen', 'catalog:vesugen'],
    ['Bronchogen', 'catalog:bronchogen'],
    ['Livagen', 'catalog:livagen'],
    ['Pancragen', 'catalog:pancragen'],
    ['Prostamax', 'catalog:prostamax'],
    ['Testagen', 'catalog:testagen'],
    ['Ovagen', 'catalog:ovagen'],
    ['Chonluten', 'catalog:chonluten'],
    ['PEG-MGF', 'catalog:peg-mgf'],
    ['FOXO4-DRI', 'catalog:foxo4-dri'],
    ['AICAR', 'catalog:aicar'],
    ['P21', 'catalog:p21'],
    ['PE-22-28', 'catalog:pe-22-28'],
    ['Setmelanotide', 'catalog:setmelanotide'],
    ['Eloralintide', 'catalog:eloralintide'],
    ['Orforglipron', 'catalog:orforglipron'],
  ] as const;

  it.each(ADDED)('finds %s by name', (name, id) => {
    expect(searchCatalog(name).map((entry) => entry.id)).toContain(id);
  });

  it.each(ADDED)('%s carries a research area', (_name, id) => {
    expect((findCatalogDefinition(id)?.researchAreas ?? []).length).toBeGreaterThan(0);
  });

  it('classifies the two approved-status additions correctly', () => {
    // Not everything new is "research". Setmelanotide is an approved drug and
    // saying otherwise would be a factual error in the direction that matters.
    expect(findCatalogDefinition('catalog:setmelanotide')?.classification).toBe(
      'approved-medication',
    );
    expect(findCatalogDefinition('catalog:orforglipron')?.classification).toBe('research-compound');
    expect(findCatalogDefinition('catalog:orforglipron')?.research?.developmentStatus?.stage).toBe(
      'phase-3',
    );
  });

  it('records AICAR as the small molecule it is, not as a peptide', () => {
    expect(findCatalogDefinition('catalog:aicar')?.compoundType).toBe('small-molecule');
  });
});

/* ── contamination between similar names ────────────────────────────── */

describe('similar compounds keep their own copy', () => {
  const PAIRS: ReadonlyArray<readonly [string, string]> = [
    ['catalog:bremelanotide', 'catalog:melanotan-ii'],
    ['catalog:melanotan-i', 'catalog:melanotan-ii'],
    ['catalog:ghrp-2', 'catalog:ghrp-6'],
    ['catalog:thymosin-alpha-1', 'catalog:thymalin'],
    ['catalog:thymalin', 'catalog:thymogen'],
    ['catalog:igf-1-lr3', 'catalog:peg-mgf'],
    ['catalog:mgf', 'catalog:peg-mgf'],
    ['catalog:p21', 'catalog:pe-22-28'],
    ['catalog:bronchogen', 'catalog:chonluten'],
    ['catalog:cortagen', 'catalog:cartalax'],
  ];

  it.each(PAIRS)('%s and %s do not share an overview', (a, b) => {
    const first = findCatalogDefinition(a)!;
    const second = findCatalogDefinition(b)!;
    expect(first.research?.overview).not.toBe(second.research?.overview);
  });

  it.each(PAIRS)('%s and %s do not share a mechanism explanation', (a, b) => {
    const explanations = (id: string) =>
      (findCatalogDefinition(id)?.research?.mechanisms ?? []).map((m) => m.explanation);
    for (const explanation of explanations(a)) {
      expect(explanations(b)).not.toContain(explanation);
    }
  });

  it('keeps every overview in the catalog distinct', () => {
    const overviews = PEPTIDE_CATALOG.map((entry) => entry.research?.overview).filter(Boolean);
    expect(new Set(overviews).size).toBe(overviews.length);
  });

  it('does not describe a bioregulator using another one’s tissue', () => {
    // These are the entries most at risk: same template, one organ swapped.
    const tissues: Record<string, string> = {
      'catalog:cartalax': 'cartilage',
      'catalog:vesugen': 'vascular',
      'catalog:livagen': 'liver',
      'catalog:pancragen': 'pancrea',
      'catalog:prostamax': 'prostate',
      'catalog:testagen': 'testicular',
    };
    for (const [id, tissue] of Object.entries(tissues)) {
      expect(findCatalogDefinition(id)!.research!.overview!.toLowerCase()).toContain(tissue);
    }
  });
});
