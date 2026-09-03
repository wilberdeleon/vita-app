/**
 * Quick-add presets, and the unit arithmetic underneath them.
 *
 * Two separate promises are checked here. The first is that the four amounts
 * offered in each unit are amounts a person would actually say — the whole
 * reason the table is per-unit rather than one canonical set converted four
 * ways. The second is that whatever is offered converts through the domain's
 * own helpers to the right physical volume, because a friendly label over a
 * wrong millilitre value is worse than an awkward one over a right one.
 *
 * The conversion assertions deliberately use `ML_PER_FLOZ` and friends rather
 * than typing 29.5735 into the test. A test that re-states a constant only
 * proves the constant was copied twice.
 */

// The Water barrel re-exports the AsyncStorage repository, so importing even
// the pure unit helpers from it pulls the native module into scope.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import {
  ML_PER_CUP,
  ML_PER_FLOZ,
  ML_PER_L,
  formatEntered,
  fromMl,
  toMl,
  type VolumeUnit,
} from '../../../lib/water';
import {
  QUICK_ADDS,
  quickAddAccessibilityLabel,
  quickAddUnitLabel,
  quickAddValueLabel,
} from '../quickAdds';

const UNITS: VolumeUnit[] = ['floz', 'cup', 'ml', 'l'];

describe('the preset table', () => {
  it('offers exactly four amounts in every supported unit', () => {
    for (const unit of UNITS) {
      expect(QUICK_ADDS[unit]).toHaveLength(4);
    }
  });

  it('offers amounts a person would actually say', () => {
    // The point of the per-unit table: no 0.35 cups, no 709 mL.
    expect(QUICK_ADDS.floz).toEqual([8, 12, 16, 24]);
    expect(QUICK_ADDS.cup).toEqual([0.5, 1, 1.5, 2]);
    expect(QUICK_ADDS.ml).toEqual([250, 500, 750, 1000]);
    expect(QUICK_ADDS.l).toEqual([0.25, 0.5, 1, 1.5]);
  });

  it('rises, and never offers nothing', () => {
    for (const unit of UNITS) {
      const amounts = QUICK_ADDS[unit];
      expect(amounts.every((amount) => amount > 0)).toBe(true);
      for (let i = 1; i < amounts.length; i += 1) {
        expect(amounts[i]).toBeGreaterThan(amounts[i - 1]);
      }
    }
  });

  it('converts to the physical volume the label claims', () => {
    expect(toMl(8, 'floz')).toBeCloseTo(8 * ML_PER_FLOZ, 10);
    expect(toMl(0.5, 'cup')).toBeCloseTo(ML_PER_CUP / 2, 10);
    expect(toMl(1.5, 'cup')).toBeCloseTo(1.5 * ML_PER_CUP, 10);
    expect(toMl(750, 'ml')).toBe(750);
    expect(toMl(0.25, 'l')).toBeCloseTo(250, 10);
  });
});

describe('preset labels', () => {
  it('writes halves and quarters as fractions', () => {
    expect(quickAddValueLabel(0.5)).toBe('½');
    expect(quickAddValueLabel(0.25)).toBe('¼');
    expect(quickAddValueLabel(1.5)).toBe('1½');
    expect(quickAddValueLabel(12)).toBe('12');
    expect(quickAddValueLabel(1000)).toBe('1000');
  });

  it('falls back to digits for anything it does not recognise', () => {
    // A lookup, not a general rational formatter — an unmapped value shows
    // its digits rather than guessing at a glyph.
    expect(quickAddValueLabel(0.7)).toBe('0.7');
  });

  it('is compact on the control, and singular through one cup', () => {
    expect(quickAddUnitLabel('floz', 24)).toBe('oz');
    expect(quickAddUnitLabel('cup', 0.5)).toBe('cup');
    expect(quickAddUnitLabel('cup', 1)).toBe('cup');
    expect(quickAddUnitLabel('cup', 1.5)).toBe('cups');
    expect(quickAddUnitLabel('ml', 250)).toBe('mL');
    expect(quickAddUnitLabel('l', 1)).toBe('L');
  });

  it('renders every preset as something short and readable', () => {
    // "½ cup", "12 oz", "250 mL" — never a stacked kicker or a long decimal.
    for (const unit of UNITS) {
      for (const amount of QUICK_ADDS[unit]) {
        const label = `${quickAddValueLabel(amount)} ${quickAddUnitLabel(unit, amount)}`;
        expect(label.length).toBeLessThanOrEqual(8);
      }
    }
  });

  it('speaks the domain’s own words, not the compact ones', () => {
    // `½` is ambiguous read aloud; `0.5 cups` is not, and it names the unit
    // the way the rest of the app does.
    expect(quickAddAccessibilityLabel(0.5, 'cup')).toBe('Add 0.5 cups');
    expect(quickAddAccessibilityLabel(1, 'cup')).toBe('Add 1 cup');
    expect(quickAddAccessibilityLabel(24, 'floz')).toBe('Add 24 fl oz');
    expect(quickAddAccessibilityLabel(500, 'ml')).toBe('Add 500 mL');
  });

  it('names each preset uniquely within its unit', () => {
    // Four controls that differ only by a number must not announce alike.
    for (const unit of UNITS) {
      const spoken = QUICK_ADDS[unit].map((amount) => quickAddAccessibilityLabel(amount, unit));
      expect(new Set(spoken).size).toBe(spoken.length);
    }
  });
});

describe('unit conversion, as the redesign relies on it', () => {
  it('round-trips an authored amount through canonical millilitres', () => {
    for (const unit of UNITS) {
      for (const amount of QUICK_ADDS[unit]) {
        expect(fromMl(toMl(amount, unit), unit)).toBeCloseTo(amount, 10);
      }
    }
  });

  it('holds the exact-by-definition relationships between units', () => {
    expect(toMl(1, 'cup')).toBeCloseTo(toMl(8, 'floz'), 10);
    expect(toMl(1, 'l')).toBe(ML_PER_L);
    expect(toMl(1000, 'ml')).toBe(toMl(1, 'l'));
  });

  it('renders the same physical volume in whichever unit is displayed', () => {
    /*
     * The guarantee behind "switch your display unit and history stays
     * true": one stored millilitre value, four correct renderings, and no
     * rewriting of anything.
     */
    const oneCup = toMl(1, 'cup');
    expect(formatEntered(fromMl(oneCup, 'floz'), 'floz')).toBe('8 fl oz');
    expect(formatEntered(fromMl(oneCup, 'cup'), 'cup')).toBe('1 cup');
    expect(formatEntered(fromMl(oneCup, 'ml'), 'ml')).toBe('237 mL');
    expect(formatEntered(fromMl(oneCup, 'l'), 'l')).toBe('0.24 L');
  });
});
