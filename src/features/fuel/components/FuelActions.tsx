import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { MEAL_SLOTS, type MealSlot } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * The one thing this screen is for.
 *
 * ## Why it is outlined rather than filled orange
 *
 * The old screen had a solid-orange *Log Food* card beside a bordered *Scan
 * Barcode* card, both with shadows and subtitles — the largest colour block
 * on the page spent on a control. Sprint 5's rule since 5.1 is that the
 * primary action is the app's neutral treatment and the feature colour is
 * carried by the objects and states around it; Peptides' *Add to Routine*
 * and Water's primary both follow it. The orange lives on the flame, the
 * calorie figure and the accent here, not on a filled rectangle.
 */
export function AddFoodAction({ onPress }: { onPress: () => void }) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityLabel="Add food"
      accessibilityHint="Search, scan, or enter a food"
      style={[styles.add, { borderColor: surfaces.border, backgroundColor: surfaces.card }]}
    >
      <Ionicons name="add" size={18} color={palette.primary} />
      <Text style={[styles.addLabel, { color: surfaces.text }]}>Add food</Text>
    </PressableScale>
  );
}

/**
 * Meal shortcuts, for a day with nothing on it yet.
 *
 * The four canonical slots are genuine orientation on an empty screen —
 * *this is what a day is made of* — and they carry the meal through to Food
 * Detail so it is not asked for twice. Once anything is logged they go away:
 * the meals that exist become the section headings below, and reaching an
 * empty slot is what Add Food is for. Chips rather than rows, because four
 * full-width rows saying nothing is exactly the weight this screen shed.
 */
export function MealShortcuts({ onAddToMeal }: { onAddToMeal: (meal: MealSlot) => void }) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.shortcuts}>
      {MEAL_SLOTS.map((slot) => (
        <PressableScale
          key={slot}
          onPress={() => onAddToMeal(slot)}
          accessibilityLabel={`Add food to ${slot}`}
          style={[styles.chip, { borderColor: surfaces.border }]}
        >
          <Text style={[styles.chipLabel, { color: surfaces.textSecondary }]}>{slot}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

/**
 * The way into goals, for someone who has none.
 *
 * Shown only while **neither** goal is set, and never as a warning: Fuel is
 * fully usable without goals, and calories are counted whether or not one
 * exists. The copy says what goals *add* rather than implying tracking is
 * gated behind them. It disappears the moment either goal is set — nagging
 * for the second would contradict them being optional — and returns if they
 * are cleared.
 */
export function GoalPrompt({ onPress }: { onPress: () => void }) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel="Set nutrition goals"
      accessibilityHint="Add optional calorie and protein goals"
      style={[styles.goals, { borderColor: surfaces.border }]}
    >
      <View style={styles.goalsText}>
        <Text style={[styles.goalsTitle, { color: surfaces.text }]}>Set nutrition goals</Text>
        <Text style={[styles.goalsBody, { color: surfaces.textTertiary }]} numberOfLines={2}>
          Add calorie and protein goals to track progress. Optional — Fuel works without them.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingVertical: 14,
    minHeight: 50,
  },
  addLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  shortcuts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: 8,
  },
  chipLabel: {
    ...typography.caption,
  },
  goals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  goalsText: {
    flex: 1,
    gap: 1,
  },
  goalsTitle: {
    ...typography.bodyMedium,
  },
  goalsBody: {
    ...typography.caption,
  },
});
