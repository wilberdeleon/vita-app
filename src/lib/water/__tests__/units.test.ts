/**
 * Conversion is the one place Water can be quietly, permanently wrong. An
 * entry logged in ounces and read back as the wrong number of millilitres
 * does not throw — it just makes every total after it a lie.
 *
 * The constants are exact by definition, so most assertions here are exact
 * too; `toBeCloseTo` appears only where binary floating point genuinely
 * cannot represent the result.
 */

import {
  FLOZ_PER_CUP,
  ML_PER_CUP,
  ML_PER_FLOZ,
  ML_PER_L,
  formatAmount,
  formatEntered,
  formatVolume,
  fromMl,
  isVolumeUnit,
  parseAmount,
  roundForDisplay,
  toMl,
  unitLabel,
  unitName,
} from '../model/units';
import { VOLUME_UNITS, type VolumeUnit } from '../model/types';

describe('conversion constants', () => {
  it('uses the exact US customary definitions', () => {
    expect(ML_PER_FLOZ).toBe(29.5735295625);
    expect(FLOZ_PER_CUP).toBe(8);
    expect(ML_PER_L).toBe(1000);
  });

  it('derives a cup from fluid ounces rather than restating it', () => {
    expect(ML_PER_CUP).toBe(ML_PER_FLOZ * 8);
    expect(ML_PER_CUP).toBeCloseTo(236.5882365, 7);
  });
});

describe('toMl', () => {
  it('leaves millilitres alone', () => {
    expect(toMl(250, 'ml')).toBe(250);
  });

  it('converts litres exactly', () => {
    expect(toMl(1, 'l')).toBe(1000);
    expect(toMl(0.5, 'l')).toBe(500);
    expect(toMl(2.5, 'l')).toBe(2500);
  });

  it('converts fluid ounces', () => {
    expect(toMl(8, 'floz')).toBeCloseTo(236.588, 3);
    expect(toMl(16, 'floz')).toBeCloseTo(473.176, 3);
    expect(toMl(16.9, 'floz')).toBeCloseTo(499.79, 2);
  });

  it('converts cups', () => {
    expect(toMl(1, 'cup')).toBeCloseTo(236.588, 3);
    expect(toMl(8, 'cup')).toBeCloseTo(1892.706, 3);
  });

  it('agrees that one cup is eight fluid ounces', () => {
    expect(toMl(1, 'cup')).toBe(toMl(8, 'floz'));
    expect(toMl(0.5, 'cup')).toBe(toMl(4, 'floz'));
  });

  it('handles fractional amounts', () => {
    expect(toMl(0.5, 'cup')).toBeCloseTo(118.294, 3);
    expect(toMl(1.5, 'floz')).toBeCloseTo(44.36, 2);
  });
});

describe('fromMl', () => {
  it('converts back to each unit', () => {
    expect(fromMl(1000, 'ml')).toBe(1000);
    expect(fromMl(1000, 'l')).toBe(1);
    expect(fromMl(500, 'floz')).toBeCloseTo(16.907, 3);
    expect(fromMl(236.5882365, 'cup')).toBeCloseTo(1, 9);
  });

  it('matches the founder-stated reference values', () => {
    // The three examples named in the slice authorization.
    expect(toMl(8, 'floz')).toBeCloseTo(236.588, 3);
    expect(toMl(1, 'cup')).toBeCloseTo(236.588, 3);
    expect(fromMl(500, 'floz')).toBeCloseTo(16.907, 3);
  });
});

describe('round trips', () => {
  it('returns the original amount for every unit', () => {
    const amounts = [0.5, 1, 1.5, 8, 12, 16, 16.9, 24, 250, 500, 1000];
    for (const unit of VOLUME_UNITS) {
      for (const amount of amounts) {
        expect(fromMl(toMl(amount, unit), unit)).toBeCloseTo(amount, 9);
      }
    }
  });

  it('survives a trip through a different unit', () => {
    // 24 fl oz → mL → cups → mL → fl oz
    const ml = toMl(24, 'floz');
    const cups = fromMl(ml, 'cup');
    expect(fromMl(toMl(cups, 'cup'), 'floz')).toBeCloseTo(24, 9);
  });

  it('cross-converts fl oz and cups exactly', () => {
    expect(fromMl(toMl(8, 'floz'), 'cup')).toBeCloseTo(1, 9);
    expect(fromMl(toMl(2, 'cup'), 'floz')).toBeCloseTo(16, 9);
  });
});

describe('roundForDisplay', () => {
  it('gives millilitres no decimals — nobody drank 236.588 mL', () => {
    expect(roundForDisplay(236.5882365, 'ml')).toBe(237);
    expect(roundForDisplay(499.79, 'ml')).toBe(500);
  });

  it('gives the US units one decimal', () => {
    expect(roundForDisplay(16.907, 'floz')).toBe(16.9);
    expect(roundForDisplay(1.0567, 'cup')).toBe(1.1);
  });

  it('gives litres two, because 0.25 L must not round to 0', () => {
    expect(roundForDisplay(0.25, 'l')).toBe(0.25);
    expect(roundForDisplay(1.006, 'l')).toBe(1.01);
  });

  it('does not mutate a value that needs no rounding', () => {
    expect(roundForDisplay(16, 'floz')).toBe(16);
    expect(roundForDisplay(500, 'ml')).toBe(500);
  });
});

describe('labels', () => {
  it('inflects only cups', () => {
    expect(unitLabel('cup', 1)).toBe('cup');
    expect(unitLabel('cup', 2)).toBe('cups');
    expect(unitLabel('floz', 1)).toBe('fl oz');
    expect(unitLabel('floz', 16)).toBe('fl oz');
    expect(unitLabel('ml', 1)).toBe('mL');
    expect(unitLabel('l', 1)).toBe('L');
  });

  it('names a unit on its own', () => {
    expect(unitName('floz')).toBe('fl oz');
    expect(unitName('cup')).toBe('cups');
  });
});

describe('formatting', () => {
  it('drops a trailing .0 from whole amounts', () => {
    expect(formatAmount(16.0, 'floz')).toBe('16');
    expect(formatEntered(1, 'cup')).toBe('1 cup');
    expect(formatEntered(2, 'cup')).toBe('2 cups');
  });

  it('renders canonical millilitres in the reader’s unit', () => {
    expect(formatVolume(toMl(16, 'floz'), 'floz')).toBe('16 fl oz');
    expect(formatVolume(toMl(1, 'cup'), 'cup')).toBe('1 cup');
    expect(formatVolume(500, 'ml')).toBe('500 mL');
    expect(formatVolume(1000, 'l')).toBe('1 L');
  });

  it('rounds a converted amount rather than showing false precision', () => {
    expect(formatVolume(500, 'floz')).toBe('16.9 fl oz');
    expect(formatVolume(236.5882365, 'ml')).toBe('237 mL');
  });

  it('renders an empty day as zero in every unit', () => {
    for (const unit of VOLUME_UNITS) {
      expect(formatVolume(0, unit).startsWith('0')).toBe(true);
    }
  });
});

describe('isVolumeUnit', () => {
  it('accepts the four supported units', () => {
    for (const unit of VOLUME_UNITS) {
      expect(isVolumeUnit(unit)).toBe(true);
    }
  });

  it('rejects anything else, including plausible near-misses', () => {
    for (const value of ['oz', 'litre', 'cups', 'ML', '', null, undefined, 1, {}, []]) {
      expect(isVolumeUnit(value)).toBe(false);
    }
  });

  /**
   * `in` on a plain object also finds inherited keys, so a unit named
   * 'toString' or 'constructor' would sneak through a naive lookup and then
   * index the conversion table to a function.
   */
  it('rejects inherited Object properties', () => {
    for (const value of ['toString', 'constructor', 'hasOwnProperty', '__proto__']) {
      expect(isVolumeUnit(value)).toBe(false);
    }
  });
});

describe('parseAmount', () => {
  it('accepts what people actually type', () => {
    expect(parseAmount('16')).toBe(16);
    expect(parseAmount('0.5')).toBe(0.5);
    expect(parseAmount('.5')).toBe(0.5);
    expect(parseAmount(' 12 ')).toBe(12);
    expect(parseAmount('16.9')).toBe(16.9);
  });

  it('rejects an empty field rather than calling it zero', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('   ')).toBeNull();
  });

  it('rejects amounts that are not a drink', () => {
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('Infinity')).toBeNull();
    expect(parseAmount('NaN')).toBeNull();
  });

  it('never returns NaN, which a caller could mistake for a number', () => {
    for (const input of ['', 'abc', '1..2', '--3']) {
      const value = parseAmount(input);
      expect(value === null || Number.isFinite(value)).toBe(true);
    }
  });
});

describe('every unit is fully specified', () => {
  it('has a conversion, a label, and a display precision', () => {
    for (const unit of VOLUME_UNITS as readonly VolumeUnit[]) {
      expect(Number.isFinite(toMl(1, unit))).toBe(true);
      expect(toMl(1, unit)).toBeGreaterThan(0);
      expect(unitName(unit).length).toBeGreaterThan(0);
      expect(Number.isFinite(roundForDisplay(1.234, unit))).toBe(true);
    }
  });
});
