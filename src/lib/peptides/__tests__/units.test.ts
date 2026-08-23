/**
 * Mass conversion.
 *
 * An exact power of ten, so unlike volume there is no representation error to
 * reason about — which makes the interesting cases the guards, not the
 * arithmetic. These values feed the dose calculator in slice 3.6, where a
 * silently wrong number would be worse than a missing one.
 */

import {
  MCG_PER_MG,
  formatMass,
  formatMcg,
  fromMcg,
  isMassUnit,
  parseAmount,
  roundForDisplay,
  toMcg,
} from '../model/units';
import { MASS_UNITS } from '../model/types';

describe('conversion', () => {
  it('uses the exact definition', () => {
    expect(MCG_PER_MG).toBe(1000);
  });

  it('converts milligrams to micrograms exactly', () => {
    expect(toMcg(10, 'mg')).toBe(10000);
    expect(toMcg(0.25, 'mg')).toBe(250);
    expect(toMcg(2.5, 'mg')).toBe(2500);
  });

  it('leaves micrograms alone', () => {
    expect(toMcg(250, 'mcg')).toBe(250);
  });

  it('converts back', () => {
    expect(fromMcg(10000, 'mg')).toBe(10);
    expect(fromMcg(250, 'mcg')).toBe(250);
    expect(fromMcg(500, 'mg')).toBe(0.5);
  });

  it('round-trips exactly for both units, unlike a lossy conversion', () => {
    for (const unit of MASS_UNITS) {
      for (const amount of [0.1, 0.25, 1, 2.5, 10, 250, 5000]) {
        expect(fromMcg(toMcg(amount, unit), unit)).toBeCloseTo(amount, 10);
      }
    }
  });
});

describe('isMassUnit', () => {
  it('accepts the two supported units', () => {
    expect(isMassUnit('mg')).toBe(true);
    expect(isMassUnit('mcg')).toBe(true);
  });

  it('rejects anything else, including plausible near-misses', () => {
    for (const value of ['g', 'ug', 'µg', 'MG', '', null, undefined, 1, {}, []]) {
      expect(isMassUnit(value)).toBe(false);
    }
  });

  /**
   * `in` walks the prototype chain, so a stored unit of 'toString' would pass
   * a naive lookup and then index the conversion table to a function, making
   * `toMcg` return NaN. The water domain shipped that bug once; this pins it
   * closed here.
   */
  it('rejects inherited Object properties', () => {
    for (const value of ['toString', 'constructor', 'hasOwnProperty', '__proto__']) {
      expect(isMassUnit(value)).toBe(false);
    }
  });
});

describe('display', () => {
  it('gives micrograms no decimals and milligrams two', () => {
    expect(roundForDisplay(250.4, 'mcg')).toBe(250);
    expect(roundForDisplay(0.256, 'mg')).toBe(0.26);
  });

  it('drops trailing zeros', () => {
    expect(formatMass(10, 'mg')).toBe('10 mg');
    expect(formatMass(250, 'mcg')).toBe('250 mcg');
  });

  it('renders canonical micrograms in either unit', () => {
    expect(formatMcg(10000, 'mg')).toBe('10 mg');
    expect(formatMcg(250, 'mcg')).toBe('250 mcg');
    expect(formatMcg(250, 'mg')).toBe('0.25 mg');
  });
});

describe('parseAmount', () => {
  it('accepts what people type', () => {
    expect(parseAmount('10')).toBe(10);
    expect(parseAmount('0.5')).toBe(0.5);
    expect(parseAmount('.5')).toBe(0.5);
    expect(parseAmount(' 2.5 ')).toBe(2.5);
  });

  it('rejects anything that is not a real positive quantity', () => {
    for (const input of ['', '   ', '0', '-1', 'abc', 'NaN', 'Infinity']) {
      expect(parseAmount(input)).toBeNull();
    }
  });

  it('never returns NaN, which a caller could mistake for a number', () => {
    for (const input of ['', 'abc', '1..2', '--3']) {
      const value = parseAmount(input);
      expect(value === null || Number.isFinite(value)).toBe(true);
    }
  });
});
