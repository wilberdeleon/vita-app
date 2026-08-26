/**
 * Recorded administrations.
 *
 * The rule everything here exists to protect: **a log entry is a snapshot,
 * never a view.** A setup edited next month must not reach back and change
 * what someone drew last week. That is the difference between a health record
 * and a spreadsheet formula, and it is the single most important property in
 * this slice.
 */

// `model/logs` reaches the shared daily barrel, which pulls in storage.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { applyLogChanges, createLogEntry, parseLogEntry, sortLogsNewestFirst } from '../model/logs';
import type { PeptideLogDraft, PeptideLogEntry, PeptideSetup } from '../model/types';
import { toMcg } from '../model/units';

const NOW = new Date('2026-08-25T20:32:00.000Z');

/** A 20 mg vial in 2 mL — 10 mg/mL, so 2 mg is 20 units. */
function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    routineState: 'active',
    active: true,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

function draft(overrides: Partial<PeptideLogDraft> = {}): PeptideLogDraft {
  return {
    authoredAmount: 2,
    authoredUnit: 'mg',
    // Local noon, so the derived calendar day is unambiguous in any timezone.
    loggedAt: new Date(2026, 7, 25, 12, 0).toISOString(),
    ...overrides,
  };
}

describe('creating an entry', () => {
  it('records the amount as authored and canonically', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);

    expect(entry.amount.authoredAmount).toBe(2);
    expect(entry.amount.authoredUnit).toBe('mg');
    expect(entry.amount.amountMcg).toBe(2000);
  });

  it('normalises an mcg amount to the same canonical micrograms', () => {
    const asMg = createLogEntry(setupFixture(), draft({ authoredAmount: 2, authoredUnit: 'mg' }), NOW);
    const asMcg = createLogEntry(
      setupFixture(),
      draft({ authoredAmount: 2000, authoredUnit: 'mcg' }),
      NOW,
    );

    expect(asMcg.amount.amountMcg).toBe(asMg.amount.amountMcg);
    // …but each keeps the unit its user actually typed.
    expect(asMcg.amount.authoredUnit).toBe('mcg');
    expect(asMcg.amount.authoredAmount).toBe(2000);
  });

  it('captures the conversion snapshot from the setup', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);

    expect(entry.calculationSnapshot).toEqual({
      vialAmountMcg: 20_000,
      reconstitutionMl: 2,
      unitsPerMl: 100,
      calculatedUnits: 20,
      calculatedVolumeMl: 0.2,
    });
  });

  it('records without a snapshot when the setup has no vial', () => {
    const entry = createLogEntry(setupFixture({ vial: undefined }), draft(), NOW);

    // Logging is never blocked on calculator information — a pen user has
    // nothing to reconstitute.
    expect(entry.calculationSnapshot).toBeUndefined();
    expect(entry.amount.amountMcg).toBe(2000);
  });

  it('records without a snapshot when the setup has no reconstitution', () => {
    const entry = createLogEntry(setupFixture({ reconstitutionMl: undefined }), draft(), NOW);
    expect(entry.calculationSnapshot).toBeUndefined();
  });

  it('derives the calendar day from the entry’s own timestamp', () => {
    // Not from "today": someone correcting last night's log at 00:20 means
    // last night. Water shipped that defect in 3.3 and this is the same trap.
    const entry = createLogEntry(
      setupFixture(),
      draft({ loggedAt: new Date(2026, 7, 21, 19, 15).toISOString() }),
      NOW,
    );
    expect(entry.logDate).toBe('2026-08-21');
  });

  it('denormalises the definition so history can name its compound', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    expect(entry.definitionId).toBe('catalog:retatrutide');
    expect(entry.setupId).toBe('setup-1');
  });

  it('drops blank notes rather than storing empty strings', () => {
    expect(createLogEntry(setupFixture(), draft({ notes: '   ' }), NOW).notes).toBeUndefined();
    expect(createLogEntry(setupFixture(), draft({ notes: ' sore ' }), NOW).notes).toBe('sore');
  });

  it('gives every entry a distinct id', () => {
    const ids = new Set(
      Array.from({ length: 25 }, () => createLogEntry(setupFixture(), draft(), NOW).id),
    );
    expect(ids.size).toBe(25);
  });
});

describe('history is a snapshot, not a view', () => {
  it('keeps its original units after the setup changes — the critical rule', () => {
    // Logged from a 20 mg / 2 mL vial: 2 mg was 20 units that day.
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    expect(entry.calculationSnapshot?.calculatedUnits).toBe(20);

    // The next vial is reconstituted with half the water. Under the new setup
    // the same 2 mg would be 10 units — but the syringe already pushed held
    // 20, and the record must still say so.
    const changed = setupFixture({ reconstitutionMl: 1 });
    const fresh = createLogEntry(changed, draft(), NOW);
    expect(fresh.calculationSnapshot?.calculatedUnits).toBe(10);

    // The original entry is untouched by any of that.
    expect(entry.calculationSnapshot?.calculatedUnits).toBe(20);
    expect(entry.calculationSnapshot?.reconstitutionMl).toBe(2);
  });

  it('stores the vial context, not a pointer to the setup', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    const snapshot = entry.calculationSnapshot!;

    // Everything needed to explain "2 mg = 20 units" years later.
    expect(snapshot.vialAmountMcg).toBe(20_000);
    expect(snapshot.reconstitutionMl).toBe(2);
    expect(snapshot.unitsPerMl).toBe(100);
  });
});

describe('editing an entry', () => {
  it('recomputes within the entry’s own original context', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    const edited = applyLogChanges(entry, draft({ authoredAmount: 1 }), NOW);

    // 1 mg against the *original* 10 mg/mL vial is 10 units.
    expect(edited.calculationSnapshot?.calculatedUnits).toBe(10);
    expect(edited.calculationSnapshot?.reconstitutionMl).toBe(2);
  });

  it('ignores today’s setup entirely when recomputing', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    const edited = applyLogChanges(entry, draft({ authoredAmount: 2 }), NOW);

    // Even though a current setup at 1 mL would make 2 mg = 10 units, the
    // entry's own 2 mL context still gives 20. Fixing a typo must not
    // silently re-date the arithmetic.
    expect(edited.calculationSnapshot?.calculatedUnits).toBe(20);
  });

  it('does not invent a snapshot for an entry that never had one', () => {
    const entry = createLogEntry(setupFixture({ vial: undefined }), draft(), NOW);
    const edited = applyLogChanges(entry, draft({ authoredAmount: 1 }), NOW);
    expect(edited.calculationSnapshot).toBeUndefined();
  });

  it('moves the calendar day when the timestamp moves', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    const edited = applyLogChanges(
      entry,
      draft({ loggedAt: new Date(2026, 7, 20, 9, 0).toISOString() }),
      NOW,
    );
    expect(edited.logDate).toBe('2026-08-20');
  });

  it('keeps id, setup and creation time', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    const edited = applyLogChanges(entry, draft({ authoredAmount: 3 }), new Date('2026-08-26T10:00:00.000Z'));

    expect(edited.id).toBe(entry.id);
    expect(edited.setupId).toBe(entry.setupId);
    expect(edited.createdAt).toBe(entry.createdAt);
    expect(edited.updatedAt).not.toBe(entry.updatedAt);
  });

  it('changes the authored unit without changing the quantity’s meaning', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    const edited = applyLogChanges(entry, draft({ authoredAmount: 2000, authoredUnit: 'mcg' }), NOW);

    expect(edited.amount.amountMcg).toBe(2000);
    expect(edited.amount.authoredUnit).toBe('mcg');
    expect(edited.calculationSnapshot?.calculatedUnits).toBe(20);
  });
});

describe('reading stored entries', () => {
  const stored = () => JSON.parse(JSON.stringify(createLogEntry(setupFixture(), draft(), NOW)));

  it('round-trips a valid entry', () => {
    const value = stored();
    expect(parseLogEntry(value, '2026-08-25')).toEqual(value);
  });

  it('drops an entry whose day contradicts the key it was read from', () => {
    // Keeping it would double-count the moment its real day is opened.
    expect(parseLogEntry(stored(), '2026-08-24')).toBeNull();
  });

  const REQUIRED = ['id', 'setupId', 'definitionId', 'loggedAt', 'logDate', 'amount', 'createdAt', 'updatedAt'];
  for (const field of REQUIRED) {
    it(`drops an entry missing ${field}`, () => {
      const value = stored();
      delete value[field];
      expect(parseLogEntry(value, '2026-08-25')).toBeNull();
    });
  }

  const BAD_AMOUNTS: Array<[string, unknown]> = [
    ['zero', { authoredAmount: 0, authoredUnit: 'mg', amountMcg: 0 }],
    ['negative', { authoredAmount: -2, authoredUnit: 'mg', amountMcg: -2000 }],
    ['NaN', { authoredAmount: Number.NaN, authoredUnit: 'mg', amountMcg: Number.NaN }],
    ['an unknown unit', { authoredAmount: 2, authoredUnit: 'grams', amountMcg: 2000 }],
    ['a prototype key as a unit', { authoredAmount: 2, authoredUnit: 'toString', amountMcg: 2000 }],
  ];
  for (const [label, amount] of BAD_AMOUNTS) {
    it(`drops an entry with ${label}`, () => {
      expect(parseLogEntry({ ...stored(), amount }, '2026-08-25')).toBeNull();
    });
  }

  it('drops a partial snapshot rather than half-rescuing it', () => {
    const value = stored();
    delete value.calculationSnapshot.reconstitutionMl;

    // A half-remembered conversion is worse than an honest absence — but the
    // entry itself is still real and survives.
    const parsed = parseLogEntry(value, '2026-08-25');
    expect(parsed).not.toBeNull();
    expect(parsed?.calculationSnapshot).toBeUndefined();
    expect(parsed?.amount.amountMcg).toBe(2000);
  });

  it('rejects non-objects and arrays', () => {
    for (const junk of [null, undefined, 42, 'entry', []]) {
      expect(parseLogEntry(junk, '2026-08-25')).toBeNull();
    }
  });

  it('drops an unparseable timestamp', () => {
    expect(parseLogEntry({ ...stored(), loggedAt: 'not-a-date' }, '2026-08-25')).toBeNull();
  });
});

describe('ordering', () => {
  function at(iso: string, id: string): PeptideLogEntry {
    return { ...createLogEntry(setupFixture(), draft({ loggedAt: iso }), NOW), id };
  }

  it('puts the newest first', () => {
    const entries = [
      at(new Date(2026, 7, 25, 8, 0).toISOString(), 'a'),
      at(new Date(2026, 7, 25, 20, 0).toISOString(), 'b'),
      at(new Date(2026, 7, 25, 13, 0).toISOString(), 'c'),
    ];
    expect(sortLogsNewestFirst(entries).map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
  });

  it('is stable within the same instant', () => {
    const same = new Date(2026, 7, 25, 8, 0).toISOString();
    const entries = [at(same, 'a'), at(same, 'b')];
    // Deterministic, so a re-render never reshuffles rows under the reader.
    expect(sortLogsNewestFirst(entries).map((entry) => entry.id)).toEqual(
      sortLogsNewestFirst([...entries].reverse()).map((entry) => entry.id),
    );
  });

  it('does not mutate its input', () => {
    const entries = [at(new Date(2026, 7, 25, 8, 0).toISOString(), 'a')];
    const before = [...entries];
    sortLogsNewestFirst(entries);
    expect(entries).toEqual(before);
  });
});

describe('multiple administrations', () => {
  it('allows several on the same day', () => {
    // Never prohibited — people split doses, or re-dose.
    const morning = createLogEntry(
      setupFixture(),
      draft({ loggedAt: new Date(2026, 7, 25, 8, 0).toISOString() }),
      NOW,
    );
    const evening = createLogEntry(
      setupFixture(),
      draft({ loggedAt: new Date(2026, 7, 25, 20, 0).toISOString() }),
      NOW,
    );

    expect(morning.logDate).toBe(evening.logDate);
    expect(morning.id).not.toBe(evening.id);
  });
});

describe('no recommendation surface', () => {
  it('has no field that could hold a suggested amount', () => {
    const entry = createLogEntry(setupFixture(), draft(), NOW);
    const serialized = JSON.stringify(entry).toLowerCase();

    for (const word of ['recommended', 'suggested', 'typical', 'standard', 'target', 'scheduled', 'expected']) {
      expect(serialized).not.toContain(word);
    }
    expect(Object.keys(entry)).not.toContain('scheduledAmount');
  });
});
