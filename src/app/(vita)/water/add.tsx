import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Chip, Screen, ScreenHeader, SectionHeader, SegmentedTabs, TextField } from '../../../components/ui';
import {
  VOLUME_UNITS,
  createWaterEntry,
  formatEntered,
  parseAmount,
  unitName,
  useWater,
  type VolumeUnit,
} from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Add Water — the same screen shape as before, now actually logging.
 *
 * Until slice 3.2 this screen's Save button called `router.back()` and threw
 * away everything the user had typed. The layout survives; the behaviour is
 * new.
 *
 * Quick-add amounts are **fixed per unit** for now. Customizing them is
 * slice 3.3's decision (founders, 2026-08-21: presets stay fixed in Sprint 3),
 * so they live here as a constant rather than in stored preferences — there
 * is nothing to configure yet, and a stored configuration nobody can change
 * is a migration to do later for no gain today.
 */
const QUICK_ADDS: Record<VolumeUnit, readonly number[]> = {
  floz: [8, 12, 16, 24],
  cup: [0.5, 1, 2],
  ml: [250, 500, 750],
  l: [0.5, 1],
};

const UNIT_OPTIONS = VOLUME_UNITS.map(unitName);

export default function AddWater() {
  const { preferences, addEntry, setUnit } = useWater();
  const { surfaces } = useTheme();

  // Seeded from the saved preference so the screen opens in the unit the
  // user already thinks in.
  const [unitIndex, setUnitIndex] = useState(() => Math.max(0, VOLUME_UNITS.indexOf(preferences.unit)));
  const [quick, setQuick] = useState<number | null>(null);
  const [custom, setCustom] = useState('');

  const unit = VOLUME_UNITS[unitIndex];
  const customAmount = parseAmount(custom);
  // A typed amount wins over a tapped chip — it is the more recent intent,
  // and both fields clear the other when used.
  const amount = customAmount ?? quick;

  const selectUnit = (index: number) => {
    // Amounts do not carry across a unit change: 16 means something very
    // different in ounces and litres, and silently reinterpreting it would
    // log a drink the user never chose.
    setUnitIndex(index);
    setQuick(null);
    setCustom('');
  };

  const save = async () => {
    if (amount === null) return;
    await addEntry(createWaterEntry({ amount, unit }));
    // The unit someone logs in is the unit they think in, so it becomes the
    // display preference. Slice 3.3 owns the explicit preference control;
    // this keeps the Water screen from reading back in a unit the user has
    // stopped using. Removing it is a one-line change.
    if (unit !== preferences.unit) await setUnit(unit);
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Add Water" back />

      <SegmentedTabs
        options={UNIT_OPTIONS}
        selectedIndex={unitIndex}
        onChange={selectUnit}
        activeColor={palette.water}
      />

      <View style={styles.display}>
        <Text style={[styles.amount, { color: surfaces.text }]}>
          {amount === null ? '—' : formatEntered(amount, unit)}
        </Text>
        <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
          {amount === null ? 'Choose an amount' : 'Tap Add Water to log it'}
        </Text>
      </View>

      <SectionHeader title="Quick add" />
      <View style={styles.chips}>
        {QUICK_ADDS[unit].map((option) => (
          <Chip
            key={option}
            label={formatEntered(option, unit)}
            selected={quick === option && customAmount === null}
            color={palette.water}
            onPress={() => {
              setQuick(option);
              setCustom('');
            }}
          />
        ))}
      </View>

      <SectionHeader title="Custom amount" />
      <TextField
        placeholder={`Enter ${unitName(unit)}`}
        keyboardType="numeric"
        value={custom}
        onChangeText={(text) => {
          setCustom(text);
          setQuick(null);
        }}
      />

      <Button
        label="+ Add Water"
        color={palette.water}
        disabled={amount === null}
        onPress={() => void save()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  display: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.s,
  },
  amount: {
    fontSize: 44,
    fontWeight: '700',
  },
  hint: {
    ...typography.caption,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
});
