import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  NumericField,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  useToast,
} from '../../../components/ui';
import { useFuelSetup } from '../../../features/fuel/useFuelSetup';
import { useNutrition } from '../../../lib/nutrition';
import { createWaterGoal, unitName, useWater } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** Positive finite numbers only. Blank means *no goal for this one*. */
function parseGoal(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Set up Fuel — the one place a new user is offered goals.
 *
 * ## Why this exists next to Settings
 *
 * 5.6A.1 put a quiet *Set nutrition goals* line on Fuel, and the founder's
 * device review was that it still felt like being sent to a settings screen
 * to configure an app. This is the same writers behind a first-use surface:
 * three optional fields, a save, and a way past it.
 *
 * ## It writes through the existing domains — both of them
 *
 * Calories and protein go to `updateTargets`, the nutrition writer 5.6A
 * built. **The water goal goes to Water's own `setGoal`**, the same function
 * the Water screen's goal editor calls, so there is exactly one water goal
 * in the product. Setting 8 cups here is setting 8 cups there, immediately,
 * and Home's water widget follows because all three read the same provider.
 * A second water goal owned by Fuel would be two numbers that disagree by
 * Tuesday.
 *
 * ## Nothing here is required, and nothing is suggested
 *
 * Every field is optional and *Skip for now* is a real exit: food logging,
 * calories, macros and the scanner all work without a single goal. No field
 * is prefilled, no placeholder carries a number, and nothing is derived from
 * age, sex, weight, activity or a weight target — there is no TDEE, no BMR
 * and no macro split. **Carbs and fat are deliberately absent**: they are
 * tracked totals, and VITA has no validated basis for a limit on either.
 */
export default function FuelSetup() {
  const { status, targets, updateTargets } = useNutrition();
  const { status: waterStatus, goal: waterGoal, preferences, setGoal } = useWater();
  const { dismiss } = useFuelSetup();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const unit = preferences.unit;

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [water, setWater] = useState('');
  const [saving, setSaving] = useState(false);

  /*
   * Seeded once both providers have hydrated. Reading during the first
   * render gives `null` for everyone, which would open this blank for a user
   * who already has goals and overwrite them on save — the bug 5.6A's tests
   * caught in the Settings editor.
   */
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || status === 'loading' || waterStatus === 'loading') return;
    seeded.current = true;
    setCalories(targets?.calories !== undefined ? String(targets.calories) : '');
    setProtein(targets?.protein !== undefined ? String(targets.protein) : '');
    setWater(waterGoal ? String(waterGoal.amount) : '');
  }, [status, waterStatus, targets, waterGoal]);

  const invalid = [calories, protein, water].some(
    (field) => field.trim() !== '' && parseGoal(field) === null,
  );

  const save = async () => {
    if (saving || invalid) return;
    setSaving(true);

    const nutrition: Record<string, number> = {};
    const kcal = parseGoal(calories);
    const grams = parseGoal(protein);
    if (kcal !== null) nutrition.calories = kcal;
    if (grams !== null) nutrition.protein = grams;
    await updateTargets(Object.keys(nutrition).length > 0 ? nutrition : null);

    // Water's own writer, in the user's own display unit — Water stores
    // canonical millilitres and this never bypasses that.
    const volume = parseGoal(water);
    if (volume !== null) await setGoal(createWaterGoal(volume, unit));

    showToast({ message: 'Fuel is set up' });
    setSaving(false);
    router.back();
  };

  return (
    <Screen keyboardAware>
      <ScreenHeader title="Set up Fuel" back />

      <Text style={[styles.intro, { color: surfaces.textSecondary }]}>
        Set the daily goals you want Fuel to measure against. Every one is optional — leave a field
        blank and Fuel simply shows the total.
      </Text>

      <SectionHeader title="Nutrition" />

      <NumericField
        label="Daily calorie goal (kcal)"
        placeholder="Optional"
        value={calories}
        onChangeText={setCalories}
        accessibilityLabel="Daily calorie goal in kcal, optional"
      />
      <NumericField
        label="Daily protein goal (g)"
        placeholder="Optional"
        value={protein}
        onChangeText={setProtein}
        accessibilityLabel="Daily protein goal in grams, optional"
      />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Carbs and fat are always shown as totals.
      </Text>

      <SectionHeader title="Water" />

      <NumericField
        label={`Daily water goal (${unitName(unit)})`}
        placeholder="Optional"
        value={water}
        onChangeText={setWater}
        accessibilityLabel={`Daily water goal in ${unitName(unit)}, optional`}
      />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        This is the same goal the Water screen uses. Change it in either place.
      </Text>

      {invalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Your goals are yours to choose. VITA doesn't set them for you or suggest what they should be.
      </Text>

      <PressableScale
        onPress={() => void save()}
        disabled={saving || invalid}
        haptic="selection"
        style={[styles.save, { backgroundColor: surfaces.text }, (saving || invalid) && styles.disabled]}
        accessibilityLabel="Save goals"
      >
        <Text style={[styles.saveLabel, { color: surfaces.background }]}>Save</Text>
      </PressableScale>

      {/*
        * A real exit, not a dismissal. Fuel works without any of this, and
        * making setup feel mandatory would be the onboarding gate the
        * authorization rules out.
        */}
      <PressableScale
        onPress={() => {
          // Remembered, so the invitation does not return on every launch —
          // declining once is an answer, not a state to be asked about again.
          dismiss();
          router.back();
        }}
        hitSlop={8}
        style={styles.skip}
        accessibilityLabel="Skip for now"
        accessibilityHint="Fuel works without goals; you can set them later"
      >
        <Text style={[styles.skipLabel, { color: surfaces.textSecondary }]}>Skip for now</Text>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  note: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  error: {
    ...typography.caption,
  },
  save: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 14,
    minHeight: 50,
  },
  disabled: {
    opacity: 0.4,
  },
  saveLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  skip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  skipLabel: {
    ...typography.captionMedium,
  },
});
