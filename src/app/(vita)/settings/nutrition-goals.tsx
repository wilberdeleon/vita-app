import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  Button,
  NumericField,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  useToast,
} from '../../../components/ui';
import { GOAL_FIELDS, hasAnyGoal, useNutrition, type GoalField } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * What each goal is called and measured in. Order matches `GOAL_FIELDS`.
 *
 * **The placeholders carry no numbers.** An `e.g. 2200` in a calorie field
 * is a figure VITA put in front of the user at the moment they are deciding
 * — which is the same thing the hardcoded defaults did, in a quieter voice.
 * `Optional` says the only thing that needs saying.
 */
const FIELDS: Record<GoalField, { label: string; unit: string }> = {
  // `cal`, never `kcal` — the Design System's calorie-terminology rule, and
  // the same label Fuel's own setup screen shows for this exact number.
  calories: { label: 'Daily calorie goal', unit: 'cal' },
  protein: { label: 'Daily protein goal', unit: 'g' },
};

/** Positive finite numbers only. Blank means *no goal for this one*. */
function parseGoal(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Where a nutrition goal comes from — the user, typing it.
 *
 * ## Why this screen exists
 *
 * Until slice 5.6A VITA shipped hardcoded goals of 2,000 kcal, 160 g
 * protein, 214 g carbs and 64 g fat, presented across Fuel as though the
 * user had chosen them, while `updateTargets` had no caller anywhere in the
 * app. The founder ruling was that **VITA does not invent nutrition goals**:
 * one exists when the user creates it and not before. That makes an
 * authoring path a requirement rather than a nicety — removing the invented
 * figures without one would have left a feature nobody could reach.
 *
 * ## Plain by design, then finished in 5.7B
 *
 * This shipped as functional infrastructure in 5.6A with a note saying the
 * visual identity would arrive with Fuel's in 5.6B and Settings' in 5.7 — a
 * considered design at the time would have been work thrown away twice.
 * **5.7B is that slice**, and the only thing it changed here is the commit
 * action: a hand-rolled full-width white pill (`borderRadius: 999`, the
 * theme's text colour as a fill) became `Button variant="neutral"`, the
 * shared primary that Food Detail's *Add to Dinner* and Fuel's own saves
 * use.
 *
 * Two faults in one swap. The pill was a **second implementation** of a
 * treatment that has been shared since 5.6D, and its geometry disagreed with
 * it — a full 999 radius where every Fuel commit is `radii.control`. §22
 * asks this screen to match current Fuel product language; the way to do
 * that is to render the same component, not to copy its pixels again.
 *
 * **Nothing else moved.** Same fields, same labels, same validation, same
 * toast, same `updateTargets` call, same storage.
 *
 * ## Two goals, both optional
 *
 * **Calories and protein only** (founder ruling, 5.6A.1). Carbohydrate and
 * fat are secondary totals rather than things people set out to hit, and
 * asking for four numbers turned setting a goal into a configuration
 * exercise. They are still tracked and shown everywhere — as totals, with no
 * denominator.
 *
 * Either goal may be set alone. Someone tracking protein leaves calories
 * blank and gets exactly that — no calorie goal is inferred from a protein
 * one, and no macro split is derived from a calorie figure.
 *
 * ## Nothing is suggested, computed, or judged
 *
 * No field is prefilled. Nothing is derived from age, sex, height, weight,
 * activity or a weight target; there is no TDEE, no BMR, no deficit and no
 * macro-split calculator. Values are validated only for being positive
 * numbers — there is no "healthy range", because ruling on the *size* of
 * someone's goal is a nutrition recommendation and VITA makes none.
 */
export default function NutritionGoals() {
  const { status, targets, updateTargets } = useNutrition();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [draft, setDraft] = useState<Record<GoalField, string>>({ calories: '', protein: '' });
  const [saving, setSaving] = useState(false);

  /**
   * Seeded once, when the day has finished loading.
   *
   * The provider hydrates goals from storage asynchronously, so reading
   * `targets` during the first render gives `null` for everyone — which
   * would silently open this screen blank for a user who *has* goals and
   * then overwrite them on save. Seeding after the load, exactly once,
   * keeps the fields editable afterwards.
   */
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || status === 'loading') return;
    seeded.current = true;
    setDraft({
      calories: targets?.calories !== undefined ? String(targets.calories) : '',
      protein: targets?.protein !== undefined ? String(targets.protein) : '',
    });
  }, [status, targets]);

  /** A field with text in it that is not a usable number. Blank is fine. */
  const invalid = GOAL_FIELDS.filter(
    (field) => draft[field].trim() !== '' && parseGoal(draft[field]) === null,
  );

  const configured = hasAnyGoal(targets);

  const save = async () => {
    if (saving || invalid.length > 0) return;
    setSaving(true);

    const next: Record<string, number> = {};
    for (const field of GOAL_FIELDS) {
      const value = parseGoal(draft[field]);
      if (value !== null) next[field] = value;
    }

    // Every field blank is not an empty goal — it is no goal, which is what
    // `null` means everywhere else in the model.
    const goals = Object.keys(next).length > 0 ? next : null;
    await updateTargets(goals);
    showToast({ message: goals ? 'Goals saved' : 'Goals cleared' });
    setSaving(false);
  };

  const clear = async () => {
    if (saving) return;
    setSaving(true);
    setDraft({ calories: '', protein: '' });
    // Clearing restores *no goal* — never the figures 5.6A removed.
    await updateTargets(null);
    showToast({ message: 'Goals cleared' });
    setSaving(false);
  };

  return (
    <Screen keyboardAware>
      <ScreenHeader title="Nutrition Goals" back />

      <Text style={[styles.intro, { color: surfaces.textSecondary }]}>
        Set the daily goals you want Fuel to measure against. Both are optional — leave one blank
        and Fuel simply shows the total. Carbs and fat are always shown as totals.
      </Text>

      <SectionHeader title="Daily goals" />

      {GOAL_FIELDS.map((field) => (
        <NumericField
          key={field}
          label={`${FIELDS[field].label} (${FIELDS[field].unit})`}
          placeholder="Optional"
          value={draft[field]}
          onChangeText={(text) => setDraft((current) => ({ ...current, [field]: text }))}
          accessibilityLabel={`${FIELDS[field].label} in ${FIELDS[field].unit}, optional`}
        />
      ))}

      {invalid.length > 0 ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Your goals are yours to choose. VITA doesn't set them for you or suggest what they should be.
      </Text>

      <Button
        label="Save goals"
        variant="neutral"
        disabled={saving || invalid.length > 0}
        onPress={() => void save()}
        accessibilityLabel="Save goals"
      />

      {configured ? (
        <PressableScale
          onPress={() => void clear()}
          disabled={saving}
          hitSlop={8}
          style={styles.clear}
          accessibilityLabel="Clear goals"
          accessibilityHint="Removes your goals; Fuel goes back to showing totals only"
        >
          <Text style={[styles.clearLabel, { color: palette.fat }]}>Clear goals</Text>
        </PressableScale>
      ) : null}
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
  },
  error: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  clear: {
    alignItems: 'center',
    paddingVertical: spacing.s,
    minHeight: 44,
    justifyContent: 'center',
  },
  clearLabel: {
    /* The destructive treatment Edit Entry's `Remove from log` uses — same
       token, same weight, same centring. It was a half-match before. */
    ...typography.captionMedium,
    fontWeight: '600',
    textAlign: 'center',
  },
});
