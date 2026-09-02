import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Screen, ScreenHeader, SectionHeader, TextField, useToast } from '../../../components/ui';
import { UnitSelector } from '../../../features/water/components/UnitSelector';
import {
  createWaterGoal,
  formatEntered,
  parseAmount,
  unitName,
  useWater,
  type VolumeUnit,
} from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * The daily goal, and the unit Water displays.
 *
 * **VITA does not suggest an amount.** There is no preset goal, no "typical"
 * figure, and no placeholder number that could be mistaken for a
 * recommendation — the field starts empty for a new user and pre-filled with
 * their own previous goal for an existing one. Hydration needs vary with body,
 * climate, and activity, and a health app that quietly implies otherwise is
 * making a medical claim it has no basis for.
 *
 * The unit control is the **explicit** preference control (founder decision,
 * 2026-08-22): this is the only place `WaterPreferences.unit` changes. Picking
 * mL for a single drink on the Add screen does not come here.
 *
 * Both are on one screen because they are one thought — "my goal is 64 fl oz"
 * decides the number and the unit together — and because a separate screen for
 * a single segmented control would be a settings panel, which this is not.
 */
export default function WaterGoalScreen() {
  const { goal, preferences, setGoal, setUnit } = useWater();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [unit, setUnitDraft] = useState<VolumeUnit>(goal?.unit ?? preferences.unit);
  const [amount, setAmount] = useState(goal ? String(goal.amount) : '');
  const [saving, setSaving] = useState(false);
  /** True once the user has changed something, so loading can't overwrite them. */
  const [touched, setTouched] = useState(false);

  /**
   * Seed from the stored goal once it arrives.
   *
   * A `useState` initializer runs on the first render only, and this screen can
   * mount before `WaterProvider` has finished reading storage — reliably so
   * when it is opened from a cold start or a deep link. The initializer then
   * captures `goal === null` and the field stays empty even though the user has
   * a goal, so "edit my goal" silently becomes "retype my goal". Found in
   * device QA, and it is the same defect class the entry editor guards against.
   *
   * `touched` is what keeps a late load from overwriting something the user has
   * already started typing.
   */
  useEffect(() => {
    if (touched || !goal) return;
    setUnitDraft(goal.unit);
    setAmount(String(goal.amount));
  }, [goal?.amount, goal?.unit, touched]);

  const parsed = parseAmount(amount);
  const isEditing = goal !== null;

  const selectUnit = (next: VolumeUnit) => {
    // The amount does not carry across a unit change: 64 fl oz and 64 L are
    // not the same intention, and reinterpreting the digits would set a goal
    // the user never chose.
    setTouched(true);
    setUnitDraft(next);
    setAmount('');
  };

  const typeAmount = (text: string) => {
    setTouched(true);
    setAmount(text);
  };

  const save = async () => {
    if (parsed === null || saving) return;
    setSaving(true);

    await setGoal(createWaterGoal(parsed, unit));
    // Saving here — and only here — moves the display preference, because
    // choosing the unit was an explicit act on this screen.
    if (unit !== preferences.unit) await setUnit(unit);

    showToast({ message: `Daily goal · ${formatEntered(parsed, unit)}` });
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Daily Goal" back />

      <SectionHeader title="Unit" />
      <UnitSelector value={unit} onChange={selectUnit} />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Used for your goal and for totals across Water. Entries you've already logged keep the unit you
        entered them in.
      </Text>

      <SectionHeader title="Your daily goal" />
      <TextField
        label={`Goal in ${unitName(unit)}`}
        placeholder={`Enter ${unitName(unit)}`}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={typeAmount}
        accessibilityLabel={`Daily water goal in ${unitName(unit)}`}
      />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Your goal is yours to choose. VITA doesn't set one for you.
      </Text>

      <Button
        label={isEditing ? 'Save goal' : 'Set goal'}
        color={palette.water}
        disabled={parsed === null || saving}
        onPress={() => void save()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
});
