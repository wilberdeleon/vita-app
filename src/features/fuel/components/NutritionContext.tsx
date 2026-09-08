import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../../../components/ui';
import {
  formatAmount,
  formatCalories,
  progress,
  roundForDisplay,
  type DailyNutrition,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Amber, not red, when a calorie goal is passed. Passing a target is worth
 * noticing and not worth being scolded for, and red is the colour VITA uses
 * for nothing else here.
 */
const OVER_ACCENT = palette.carbs;

type Props = {
  today: DailyNutrition;
};

/**
 * What the day added up to — stated, not scored.
 *
 * ## Calories lead, and say only what is true
 *
 * With no goal: the figure and `Calories today`. No ring, no percentage, no
 * remainder, no denominator — there is nothing to be a fraction of. With a
 * goal the user set: the same figure, the goal beneath it, what is left or
 * what is over, and a slim rail. **Never a large ring**: a ring is the
 * gesture of a scoreboard, and it was the single most generic thing on the
 * old screen.
 *
 * ## Protein can have a goal; carbs and fat cannot
 *
 * Founder ruling, 5.6A.1. Protein is something people set out to reach, so
 * it may carry a target and a rail. Carbohydrate and fat are secondary
 * totals: they are tracked, summed and shown exactly as before, and can
 * never gain a denominator, a rail, or an implied ceiling. VITA does not
 * invent limits it was not given.
 *
 * ## Why there is no composition bar
 *
 * The audit proposed one — a slim bar showing the share of the day's energy
 * from each macro — and 5.6B built it before removing it. Rendered, it was
 * the single most generic object on the screen: VITA's macro tokens are
 * green, amber and red, so a contiguous tri-colour bar reads as a **traffic
 * light**, which is precisely the health verdict §25 forbids and the
 * opposite of what a description of a day should do. Recolouring it to one
 * hue made it unreadable — three anonymous segments with nothing to map them
 * to — and adding a legend to explain a decoration is how a screen acquires
 * a chart nobody asked for.
 *
 * The three figures above already say what the day was made of, in words,
 * in the same order. The authorization made this object explicitly optional
 * and said not to force it; this is that case.
 */
export function NutritionContext({ today }: Props) {
  const { surfaces } = useTheme();

  const consumed = roundForDisplay(today.nutrition);
  const goal = today.targets?.calories;
  const proteinGoal = today.targets?.protein;
  const over = (today.caloriesOver ?? 0) > 0;

  return (
    <View style={styles.section}>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={
          goal === undefined
            ? `${formatCalories(consumed.calories)} calories today`
            : `Calories. ${formatCalories(consumed.calories)} of ${formatCalories(goal)} goal. ${
                over
                  ? `${formatCalories(today.caloriesOver ?? 0)} over.`
                  : `${formatCalories(today.caloriesRemaining ?? 0)} remaining.`
              }`
        }
      >
        <Text style={[styles.calories, { color: over ? OVER_ACCENT : surfaces.text }]}>
          {formatCalories(consumed.calories)}
        </Text>
        <Text style={[styles.caloriesLabel, { color: surfaces.textSecondary }]}>
          {goal === undefined
            ? 'Calories today'
            : `Calories · ${formatCalories(goal)} goal · ${
                over
                  ? `${formatCalories(today.caloriesOver ?? 0)} over`
                  : `${formatCalories(today.caloriesRemaining ?? 0)} left`
              }`}
        </Text>
      </View>

      {/* A rail only where there is a real target to fill it. */}
      {goal === undefined ? null : (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressBar
            progress={today.calorieProgress ?? 0}
            height={3}
            color={over ? OVER_ACCENT : palette.primary}
          />
        </View>
      )}

      <View style={[styles.macros, { borderTopColor: surfaces.border }]}>
        <Macro
          label="Protein"
          value={`${formatAmount(consumed.protein)}${proteinGoal === undefined ? '' : ` / ${proteinGoal}`} g`}
          spoken={
            proteinGoal === undefined
              ? `Protein. ${formatAmount(consumed.protein)} grams.`
              : `Protein. ${formatAmount(consumed.protein)} of ${proteinGoal} gram goal.`
          }
          rail={
            proteinGoal === undefined ? null : progress(consumed.protein, proteinGoal)
          }
          color={palette.protein}
        />
        <Macro
          label="Carbs"
          value={`${formatAmount(consumed.carbs)} g`}
          spoken={`Carbs. ${formatAmount(consumed.carbs)} grams.`}
          rail={null}
          color={palette.carbs}
        />
        <Macro
          label="Fat"
          value={`${formatAmount(consumed.fat)} g`}
          spoken={`Fat. ${formatAmount(consumed.fat)} grams.`}
          rail={null}
          color={palette.fat}
        />
      </View>

    </View>
  );
}

function Macro({
  label,
  value,
  spoken,
  rail,
  color,
}: {
  label: string;
  value: string;
  spoken: string;
  /** `null` when this macro has no goal — carbs and fat never do. */
  rail: number | null;
  color: string;
}) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.macro} accessible accessibilityRole="text" accessibilityLabel={spoken}>
      <Text style={[styles.macroLabel, { color: surfaces.textTertiary }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.macroValue, { color: surfaces.text }]} numberOfLines={2}>
        {value}
      </Text>
      {rail === null ? null : (
        <View style={styles.macroRail}>
          <ProgressBar progress={rail} height={2} color={color} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.s,
  },
  calories: {
    ...typography.display,
  },
  caloriesLabel: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.l,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
    marginTop: spacing.xs,
  },
  macro: {
    flex: 1,
    gap: 1,
  },
  macroLabel: {
    ...typography.micro,
    letterSpacing: 0.4,
  },
  macroValue: {
    ...typography.bodyMedium,
  },
  macroRail: {
    marginTop: spacing.xs,
  },
  composition: {
    marginTop: spacing.xs,
  },
  compositionBar: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
});
