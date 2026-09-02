import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip, SectionHeader, TextField } from '../../../components/ui';
import { formatEntered, parseAmount, unitName, type VolumeUnit } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { UnitSelector } from './UnitSelector';

/**
 * Quick-add amounts, fixed per unit for Sprint 3 (founders, 2026-08-21 —
 * presets are not user-configurable yet).
 *
 * These are common container sizes, not advice: a glass, a bottle, a large
 * bottle. The user always has Custom, so the list only has to cover the
 * ordinary cases rather than everyone's.
 */
const QUICK_ADDS: Record<VolumeUnit, readonly number[]> = {
  floz: [8, 12, 16, 24],
  cup: [0.5, 1, 2, 3],
  ml: [250, 500, 750, 1000],
  l: [0.25, 0.5, 1, 1.5],
};

export type AmountValue = {
  /** `null` until the user has chosen or typed something usable. */
  amount: number | null;
  unit: VolumeUnit;
};

type Props = {
  /** Seeds the editor once. Add starts empty in the preferred unit; Edit starts from the entry. */
  initial: AmountValue;
  onChange: (value: AmountValue) => void;
};

/**
 * Amount + unit entry, shared by Add Water and Edit Entry.
 *
 * One editor rather than two on purpose. Add and Edit ask the same question —
 * how much, in which unit — and two implementations of it would eventually
 * disagree about parsing, rounding, or what happens when the unit changes.
 * Fuel learned the same lesson with `PortionEditor`.
 *
 * **The unit chosen here belongs to this amount, not to the user.** Switching
 * to mL for one drink does not change how the rest of Water is displayed;
 * that is the explicit preference control on the goal screen. Slice 3.2
 * temporarily conflated the two, and the founders separated them.
 */
export function AmountEditor({ initial, onChange }: Props) {
  const { surfaces } = useTheme();
  const [unit, setUnit] = useState<VolumeUnit>(initial.unit);
  const [quick, setQuick] = useState<number | null>(initial.amount);
  const [custom, setCustom] = useState('');

  const customAmount = parseAmount(custom);
  // A typed amount wins over a tapped chip: it is the more recent intent, and
  // each control clears the other when used.
  const amount = customAmount ?? quick;

  const emit = (next: AmountValue) => onChange(next);

  const selectUnit = (nextUnit: VolumeUnit) => {
    // The amount does not carry across a unit change. "16" means something
    // very different in ounces and litres, and silently reinterpreting it
    // would log a drink the user never chose.
    setUnit(nextUnit);
    setQuick(null);
    setCustom('');
    emit({ amount: null, unit: nextUnit });
  };

  const selectQuick = (value: number) => {
    setQuick(value);
    setCustom('');
    emit({ amount: value, unit });
  };

  const typeCustom = (text: string) => {
    setCustom(text);
    setQuick(null);
    emit({ amount: parseAmount(text), unit });
  };

  return (
    <>
      <UnitSelector value={unit} onChange={selectUnit} />

      <View
        style={styles.display}
        accessible
        accessibilityRole="text"
        accessibilityLabel={amount === null ? 'No amount chosen yet' : `Amount ${formatEntered(amount, unit)}`}
      >
        <Text style={[styles.amount, { color: surfaces.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {amount === null ? '—' : formatEntered(amount, unit)}
        </Text>
      </View>

      <SectionHeader title="Quick add" />
      <View style={styles.chips}>
        {QUICK_ADDS[unit].map((option) => (
          <Chip
            key={option}
            label={formatEntered(option, unit)}
            selected={amount === option && customAmount === null}
            color={palette.water}
            onPress={() => selectQuick(option)}
          />
        ))}
      </View>

      <SectionHeader title="Custom amount" />
      <TextField
        label={`Amount in ${unitName(unit)}`}
        placeholder={`Enter ${unitName(unit)}`}
        keyboardType="decimal-pad"
        value={custom}
        onChangeText={typeCustom}
        accessibilityLabel={`Custom amount in ${unitName(unit)}`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  display: {
    alignItems: 'center',
    marginVertical: spacing.s,
  },
  amount: {
    ...typography.display,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
});
