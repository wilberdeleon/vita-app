/**
 * The dose calculator's arithmetic.
 *
 * This is the one part of VITA where being wrong has a physical consequence:
 * a user reads a number off this screen and draws that many units into a
 * syringe. So the founder's worked examples are pinned literally, the inverse
 * is checked against the forward direction rather than against a second
 * hand-written formula, and every way the inputs can be malformed has a test
 * proving the result is a typed refusal instead of `NaN` reaching the screen.
 */

import {
  DEFAULT_UNITS_PER_ML,
  calculateAmountFromUnits,
  calculateConcentration,
  calculateSyringeUnits,
  calculateSyringeUnitsForMass,
  doseConsistencyNotes,
  unitConversionReference,
  type DoseCalculationResult,
  type VialInputs,
} from '../model/dose';
import {
  formatConcentration,
  formatMcg,
  formatSyringeUnits,
  formatVolume,
  toMcg,
} from '../model/units';
import type { MassUnit } from '../model/types';

/** A 10 mg vial reconstituted with 1 mL — the founder's reference setup. */
const TEN_MG_IN_ONE_ML: VialInputs = { vialAmountMcg: toMcg(10, 'mg'), reconstitutionMl: 1 };

function expectOk(result: DoseCalculationResult) {
  if (!result.ok) throw new Error(`expected a calculation, got "${result.reason}"`);
  return result;
}

describe('the founder’s worked examples', () => {
  it('Example A — 10 mg vial, 1 mL water, 2 mg → 20 units', () => {
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(2, 'mg')));

    expect(result.concentrationMcgPerMl).toBe(10_000); // 10 mg/mL
    expect(result.volumeMl).toBeCloseTo(0.2, 10);
    expect(result.syringeUnits).toBeCloseTo(20, 10);
    expect(formatSyringeUnits(result.syringeUnits)).toBe('20 units');
  });

  it('Example B — 10 mg vial, 2 mL water, 2 mg → 40 units', () => {
    const result = expectOk(
      calculateSyringeUnits({ vialAmountMcg: toMcg(10, 'mg'), reconstitutionMl: 2 }, toMcg(2, 'mg')),
    );

    expect(result.concentrationMcgPerMl).toBe(5_000); // 5 mg/mL
    expect(result.volumeMl).toBeCloseTo(0.4, 10);
    expect(result.syringeUnits).toBeCloseTo(40, 10);
  });

  it('Example C — 5 mg vial, 2 mL water, 500 mcg → 20 units', () => {
    // Crosses the unit boundary: the vial is authored in mg, the amount in mcg.
    const result = expectOk(
      calculateSyringeUnits({ vialAmountMcg: toMcg(5, 'mg'), reconstitutionMl: 2 }, toMcg(500, 'mcg')),
    );

    expect(result.concentrationMcgPerMl).toBe(2_500);
    expect(result.volumeMl).toBeCloseTo(0.2, 10);
    expect(result.syringeUnits).toBeCloseTo(20, 10);
  });

  it('Example D — 10 mg vial, 1 mL water, 250 mcg → 2.5 units', () => {
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(250, 'mcg')));

    expect(result.syringeUnits).toBeCloseTo(2.5, 10);
    expect(formatSyringeUnits(result.syringeUnits)).toBe('2.5 units');
  });
});

describe('reverse conversion', () => {
  it('10 mg vial, 1 mL water, 20 units → 2 mg', () => {
    const result = expectOk(calculateAmountFromUnits(TEN_MG_IN_ONE_ML, 20));

    expect(result.amountMcg).toBeCloseTo(toMcg(2, 'mg'), 6);
    expect(result.volumeMl).toBeCloseTo(0.2, 10);
  });

  it('5 mg vial, 2 mL water, 20 units → 500 mcg', () => {
    const result = expectOk(
      calculateAmountFromUnits({ vialAmountMcg: toMcg(5, 'mg'), reconstitutionMl: 2 }, 20),
    );

    expect(result.amountMcg).toBeCloseTo(500, 6);
  });

  it('is a true inverse of the forward conversion', () => {
    /**
     * Checked as a round-trip rather than against a second literal, so the two
     * directions cannot drift into agreeing only on the cases someone thought
     * to write down.
     */
    const vials: VialInputs[] = [
      TEN_MG_IN_ONE_ML,
      { vialAmountMcg: toMcg(5, 'mg'), reconstitutionMl: 2 },
      { vialAmountMcg: toMcg(2, 'mg'), reconstitutionMl: 0.5 },
      { vialAmountMcg: toMcg(15, 'mg'), reconstitutionMl: 3 },
    ];
    const amounts = [toMcg(2, 'mg'), toMcg(250, 'mcg'), toMcg(0.5, 'mg'), toMcg(1.25, 'mg')];

    for (const vial of vials) {
      for (const amountMcg of amounts) {
        const forward = expectOk(calculateSyringeUnits(vial, amountMcg));
        const back = expectOk(calculateAmountFromUnits(vial, forward.syringeUnits));
        expect(back.amountMcg).toBeCloseTo(amountMcg, 6);
      }
    }
  });
});

describe('mass units', () => {
  it('converts the mg/mcg boundary exactly', () => {
    expect(toMcg(1, 'mg')).toBe(1000);
    expect(toMcg(0.1, 'mg')).toBe(100);
    expect(toMcg(0.025, 'mg')).toBe(25);
    expect(toMcg(500, 'mcg')).toBe(500);
    expect(toMcg(2500, 'mcg')).toBe(2500);
  });

  it('gives the same answer whichever unit the amount was authored in', () => {
    // 2 mg and 2000 mcg are the same quantity and must not differ by a float.
    const asMg = expectOk(calculateSyringeUnitsForMass(TEN_MG_IN_ONE_ML, 2, 'mg'));
    const asMcg = expectOk(calculateSyringeUnitsForMass(TEN_MG_IN_ONE_ML, 2000, 'mcg'));
    expect(asMg.syringeUnits).toBe(asMcg.syringeUnits);
  });

  it('accepts an mcg-authored vial', () => {
    const result = expectOk(
      calculateSyringeUnits({ vialAmountMcg: 5000, reconstitutionMl: 2 }, 500),
    );
    expect(result.syringeUnits).toBeCloseTo(20, 10);
  });
});

describe('decimals', () => {
  it('handles realistic fractional input', () => {
    const result = expectOk(calculateSyringeUnitsForMass(TEN_MG_IN_ONE_ML, 1.25, 'mg'));
    expect(result.syringeUnits).toBeCloseTo(12.5, 10);
  });

  it('handles a fractional reconstitution volume', () => {
    const result = expectOk(
      calculateSyringeUnits({ vialAmountMcg: toMcg(10, 'mg'), reconstitutionMl: 1.5 }, toMcg(2, 'mg')),
    );
    expect(result.concentrationMcgPerMl).toBeCloseTo(6_666.67, 1);
    expect(result.syringeUnits).toBeCloseTo(30, 6);
  });

  it('keeps very small but valid amounts', () => {
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, 1));
    expect(result.syringeUnits).toBeCloseTo(0.01, 10);
    expect(result.syringeUnits).toBeGreaterThan(0);
  });
});

describe('the syringe scale', () => {
  it('defaults to U-100', () => {
    expect(DEFAULT_UNITS_PER_ML).toBe(100);
    expect(expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(2, 'mg'))).unitsPerMl).toBe(100);
  });

  it('honours a different graduation density if a setup carries one', () => {
    // Not offered in the V1 UI, but the model supports it without a migration.
    const result = expectOk(
      calculateSyringeUnits({ ...TEN_MG_IN_ONE_ML, unitsPerMl: 50 }, toMcg(2, 'mg')),
    );
    expect(result.volumeMl).toBeCloseTo(0.2, 10); // volume is unchanged…
    expect(result.syringeUnits).toBeCloseTo(10, 10); // …only the reading changes
  });
});

describe('invalid input never reaches the screen', () => {
  const cases: Array<[string, DoseCalculationResult, string]> = [
    ['no vial amount', calculateSyringeUnits({ reconstitutionMl: 1 }, 2000), 'missing-vial-amount'],
    ['vial amount of zero', calculateSyringeUnits({ vialAmountMcg: 0, reconstitutionMl: 1 }, 2000), 'invalid-vial-amount'],
    ['negative vial amount', calculateSyringeUnits({ vialAmountMcg: -5, reconstitutionMl: 1 }, 2000), 'invalid-vial-amount'],
    ['NaN vial amount', calculateSyringeUnits({ vialAmountMcg: Number.NaN, reconstitutionMl: 1 }, 2000), 'invalid-vial-amount'],
    ['infinite vial amount', calculateSyringeUnits({ vialAmountMcg: Number.POSITIVE_INFINITY, reconstitutionMl: 1 }, 2000), 'invalid-vial-amount'],
    ['no reconstitution', calculateSyringeUnits({ vialAmountMcg: 10_000 }, 2000), 'missing-reconstitution'],
    ['reconstitution of zero', calculateSyringeUnits({ vialAmountMcg: 10_000, reconstitutionMl: 0 }, 2000), 'invalid-reconstitution'],
    ['negative reconstitution', calculateSyringeUnits({ vialAmountMcg: 10_000, reconstitutionMl: -1 }, 2000), 'invalid-reconstitution'],
    ['NaN reconstitution', calculateSyringeUnits({ vialAmountMcg: 10_000, reconstitutionMl: Number.NaN }, 2000), 'invalid-reconstitution'],
    ['no amount', calculateSyringeUnits(TEN_MG_IN_ONE_ML, undefined), 'missing-amount'],
    ['amount of zero', calculateSyringeUnits(TEN_MG_IN_ONE_ML, 0), 'invalid-amount'],
    ['negative amount', calculateSyringeUnits(TEN_MG_IN_ONE_ML, -100), 'invalid-amount'],
    ['NaN amount', calculateSyringeUnits(TEN_MG_IN_ONE_ML, Number.NaN), 'invalid-amount'],
    ['units per mL of zero', calculateSyringeUnits({ ...TEN_MG_IN_ONE_ML, unitsPerMl: 0 }, 2000), 'invalid-units-per-ml'],
    ['negative units per mL', calculateSyringeUnits({ ...TEN_MG_IN_ONE_ML, unitsPerMl: -100 }, 2000), 'invalid-units-per-ml'],
    ['no units, reversed', calculateAmountFromUnits(TEN_MG_IN_ONE_ML, undefined), 'missing-units'],
    ['zero units, reversed', calculateAmountFromUnits(TEN_MG_IN_ONE_ML, 0), 'invalid-units'],
    ['negative units, reversed', calculateAmountFromUnits(TEN_MG_IN_ONE_ML, -20), 'invalid-units'],
    ['NaN units, reversed', calculateAmountFromUnits(TEN_MG_IN_ONE_ML, Number.NaN), 'invalid-units'],
  ];

  for (const [label, result, reason] of cases) {
    it(`refuses ${label}`, () => {
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe(reason);
    });
  }

  it('never returns a partially valid calculation', () => {
    // The union means a failure carries no numbers at all to misread.
    const result = calculateSyringeUnits({ vialAmountMcg: 10_000, reconstitutionMl: 0 }, 2000);
    expect(result.ok).toBe(false);
    expect(result).not.toHaveProperty('syringeUnits');
    expect(result).not.toHaveProperty('volumeMl');
  });

  it('divides by zero nowhere', () => {
    for (const [, result] of cases) {
      if (!result.ok) continue;
      expect(Number.isFinite(result.syringeUnits)).toBe(true);
    }
  });
});

describe('concentration on its own', () => {
  it('is available before any amount has been entered', () => {
    const result = calculateConcentration(TEN_MG_IN_ONE_ML);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.concentrationMcgPerMl).toBe(10_000);
  });

  it('refuses the same malformed vials as the full calculation', () => {
    expect(calculateConcentration({ reconstitutionMl: 1 }).ok).toBe(false);
    expect(calculateConcentration({ vialAmountMcg: 10_000, reconstitutionMl: 0 }).ok).toBe(false);
  });
});

describe('display formatting', () => {
  it('shows whole units without decimals', () => {
    expect(formatSyringeUnits(20)).toBe('20 units');
    expect(formatSyringeUnits(40)).toBe('40 units');
  });

  it('shows one decimal only when it means something', () => {
    expect(formatSyringeUnits(2.5)).toBe('2.5 units');
    expect(formatSyringeUnits(12.5)).toBe('12.5 units');
  });

  it('refuses false precision', () => {
    // A third of a 10 mg / 1 mL vial: 13.3333… units.
    expect(formatSyringeUnits(40 / 3)).toBe('13.3 units');
    expect(formatSyringeUnits(20.000000001)).toBe('20 units');
  });

  it('does not mutate the calculation it formats', () => {
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(1, 'mg') / 3));
    const before = result.syringeUnits;
    formatSyringeUnits(result.syringeUnits);
    expect(result.syringeUnits).toBe(before);
  });

  it('singularises exactly one unit', () => {
    expect(formatSyringeUnits(1)).toBe('1 unit');
  });

  it('formats volume to three decimals, without trailing zeros', () => {
    expect(formatVolume(0.2)).toBe('0.2 mL');
    expect(formatVolume(0.025)).toBe('0.025 mL');
    expect(formatVolume(1)).toBe('1 mL');
    expect(formatVolume(1.2)).toBe('1.2 mL');
  });

  it('formats concentration as a rate in the authored unit', () => {
    expect(formatConcentration(10_000, 'mg')).toBe('10 mg/mL');
    expect(formatConcentration(2_500, 'mcg')).toBe('2500 mcg/mL');
  });
});

describe('data-consistency notes', () => {
  it('says nothing when the numbers are consistent', () => {
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(2, 'mg')));
    expect(doseConsistencyNotes(TEN_MG_IN_ONE_ML, result)).toEqual([]);
  });

  it('notices an amount larger than the whole vial', () => {
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(12, 'mg')));
    expect(doseConsistencyNotes(TEN_MG_IN_ONE_ML, result)).toEqual(['amount-exceeds-vial']);
  });

  it('still calculates that amount rather than blocking it', () => {
    // Arithmetically valid input always gets an answer; the note is advisory.
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(12, 'mg')));
    expect(result.syringeUnits).toBeCloseTo(120, 10);
  });

  it('does not say the same thing twice', () => {
    // Exceeding the vial mass and exceeding the volume are one inconsistency.
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(12, 'mg')));
    expect(doseConsistencyNotes(TEN_MG_IN_ONE_ML, result)).toHaveLength(1);
  });

  it('calculates a result above 100 units without comment on how to use it', () => {
    const result = expectOk(calculateSyringeUnits(TEN_MG_IN_ONE_ML, toMcg(12, 'mg')));
    expect(formatSyringeUnits(result.syringeUnits)).toBe('120 units');
    expect(formatVolume(result.volumeMl)).toBe('1.2 mL');
  });
});

/* ── every row must be distinguishable ──────────────────────────────────── */

/**
 * The founder's §15 audit question, answered with a test rather than a look.
 *
 * Micrograms display as whole numbers, so a row whose true amount is 0.5 mcg
 * rendered as "1 mcg" — directly above the row that genuinely is 1 mcg, with
 * a different syringe value beside it. Two lines, the same amount, different
 * answers: a table that contradicts itself, and reachable through the
 * standalone calculator's mcg vial toggle.
 */
describe('no two reference rows may read the same', () => {
  const rendered = (vialMcg: number, ml: number, unit: MassUnit) => {
    const reference = unitConversionReference(
      { vialAmountMcg: vialMcg, reconstitutionMl: ml, unitsPerMl: 100 },
      unit,
    );
    if (!reference.ok) return null;
    return reference.rows.map((row) => formatMcg(row.amountMcg, unit));
  };

  it('no longer renders 1 mcg twice for the vial that used to', () => {
    // 1 mcg in 1 mL was the founder's example, exactly.
    const rows = rendered(1, 1, 'mcg')!;
    expect(rows).toEqual([...new Set(rows)]);
  });

  it('never repeats an amount, across every vial and volume worth trying', () => {
    const collisions: string[] = [];
    for (const unit of ['mcg', 'mg'] as const) {
      for (const vial of [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 500, 1000]) {
        for (const ml of [0.25, 0.5, 1, 1.5, 2, 3, 5, 10]) {
          const rows = rendered(unit === 'mg' ? vial * 1000 : vial, ml, unit);
          if (!rows) continue;
          if (new Set(rows).size !== rows.length) {
            collisions.push(`${vial} ${unit} / ${ml} mL :: ${rows.join(' | ')}`);
          }
        }
      }
    }
    expect(collisions).toEqual([]);
  });

  it('keeps the milligram reference exactly as the founder approved it', () => {
    // The guard must not quietly drop a row from the path people actually use.
    expect(rendered(10_000, 1, 'mg')).toEqual(['0.5 mg', '1 mg', '2 mg', '3 mg', '4 mg', '5 mg']);
  });

  it('still returns a reference rather than an empty table', () => {
    expect(rendered(1, 1, 'mcg')!.length).toBeGreaterThan(0);
  });
});
