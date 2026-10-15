/**
 * Body-weight arithmetic. Validation is mathematical, never medical.
 */

import { LB_TO_KG } from '../../bmi';
import { KG_PER_LB, formatWeight, fromKg, isValidWeight, parseWeight, roundForDisplay, toKg } from '../model/units';

describe('the pound', () => {
  it('is the exact international definition', () => {
    expect(KG_PER_LB).toBe(0.45359237);
  });

  it('cannot drift from the definition the BMI tool uses', () => {
    expect(KG_PER_LB).toBe(LB_TO_KG);
  });
});

describe('conversion vectors', () => {
  it('180 lb is 81.64662660 kg', () => {
    expect(toKg(180, 'lb')).toBeCloseTo(81.6466266, 7);
  });

  it('80 kg is 176.3698 lb', () => {
    expect(fromKg(80, 'lb')).toBeCloseTo(176.36980, 4);
  });

  it('kg input is stored as typed', () => {
    expect(toKg(81.6, 'kg')).toBe(81.6);
    expect(fromKg(81.6, 'kg')).toBe(81.6);
  });

  it('a decimal is accepted', () => {
    expect(toKg(180.4, 'lb')).toBeCloseTo(180.4 * 0.45359237, 10);
  });

  it('round-trips without drift, however many times the unit is switched', () => {
    const kg = toKg(180, 'lb');
    let value = kg;
    for (let i = 0; i < 1000; i++) value = toKg(fromKg(value, 'lb'), 'lb');
    expect(value).toBeCloseTo(kg, 9);
    expect(formatWeight(value, 'lb')).toBe('180.0 lb');
  });
});

describe('display boundary', () => {
  it('rounds to one decimal only when formatting', () => {
    const kg = toKg(180, 'lb');
    expect(formatWeight(kg, 'lb')).toBe('180.0 lb');
    expect(formatWeight(kg, 'kg')).toBe('81.6 kg');
    expect(roundForDisplay(81.6466266)).toBe(81.6);
  });
});

describe('validation', () => {
  it.each([0, -1, -0.1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('rejects %p', (value) => {
    expect(isValidWeight(value)).toBe(false);
  });

  it('has no medical bounds — any positive weight is a weight', () => {
    for (const value of [0.1, 1, 40, 69.9, 500.1, 1400]) expect(isValidWeight(value)).toBe(true);
  });

  it.each([
    ['180', 180],
    ['180.4', 180.4],
    ['81,6', 81.6],
    ['.5', 0.5],
    ['  72 ', 72],
  ])('parses %p', (input, expected) => {
    expect(parseWeight(input)).toBe(expected);
  });

  it.each(['', '0', '0.0', '-5', 'abc', '1e3', 'Infinity', 'NaN', '18o', '1.2.3'])('rejects %p', (input) => {
    expect(parseWeight(input)).toBeNull();
  });
});
