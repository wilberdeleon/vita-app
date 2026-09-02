/**
 * These guards are the boundary between stored JSON and everything the user
 * reads as fact. The cases that matter are the ones a naive `typeof` check
 * lets through — `NaN`, `Infinity`, `null` — because those are what turn a
 * corrupted record into a wrong number rather than a missing one.
 */

import { isFiniteNumber, isNonEmptyString, isPositiveNumber, isRecord } from '../guards';

describe('isRecord', () => {
  it('accepts plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ amountMl: 250 })).toBe(true);
  });

  it('rejects null, which typeof calls an object', () => {
    expect(isRecord(null)).toBe(false);
  });

  it('rejects arrays, which typeof also calls an object', () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([{ amountMl: 250 }])).toBe(false);
  });

  it('rejects primitives', () => {
    for (const value of [undefined, 0, '', 'x', true]) {
      expect(isRecord(value)).toBe(false);
    }
  });
});

describe('isFiniteNumber', () => {
  it('accepts ordinary numbers including zero and negatives', () => {
    for (const value of [0, -1, 1, 0.5, 1e6]) {
      expect(isFiniteNumber(value)).toBe(true);
    }
  });

  it('rejects NaN and Infinity — the whole reason it exists', () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(isFiniteNumber(value)).toBe(false);
    }
  });

  it('rejects numeric strings, so a stored "250" is never treated as 250', () => {
    expect(isFiniteNumber('250')).toBe(false);
  });

  it('rejects null and undefined', () => {
    expect(isFiniteNumber(null)).toBe(false);
    expect(isFiniteNumber(undefined)).toBe(false);
  });
});

describe('isPositiveNumber', () => {
  it('accepts real quantities', () => {
    expect(isPositiveNumber(250)).toBe(true);
    expect(isPositiveNumber(0.5)).toBe(true);
  });

  it('rejects zero and negatives — neither is a quantity anyone logged', () => {
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-1)).toBe(false);
  });

  it('rejects NaN and Infinity', () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(isPositiveNumber(value)).toBe(false);
    }
  });
});

describe('isNonEmptyString', () => {
  it('accepts non-empty strings', () => {
    expect(isNonEmptyString('a')).toBe(true);
    expect(isNonEmptyString('BPC-157')).toBe(true);
  });

  it('rejects the empty string, which is how a missing name usually arrives', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('rejects non-strings', () => {
    for (const value of [null, undefined, 0, {}, []]) {
      expect(isNonEmptyString(value)).toBe(false);
    }
  });
});
