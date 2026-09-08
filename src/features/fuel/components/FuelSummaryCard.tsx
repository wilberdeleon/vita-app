import { StyleSheet, Text, View } from 'react-native';
import { Card, ProgressBar, ProgressRing, StatBar } from '../../../components/ui';
import {
  MACROS,
  formatAmount,
  formatCalories,
  progress,
  roundForDisplay,
  type DailyNutrition,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** Stand-in for a number that hasn't been read from storage yet. */
const PENDING = '—';

/**
 * The over-target accent. Amber rather than the macro red: passing a
 * calorie target is worth noticing, not worth being scolded for, and red is
 * the color VITA uses for nothing else on this card.
 */
const OVER_ACCENT = palette.carbs;

type Props = {
  today: DailyNutrition;
};

/**
 * The day's nutrition status, as one statement rather than three widgets.
 *
 * Hierarchy, top to bottom: the ring is *what has happened* (calories
 * eaten), the headline beside it is *what is left* — the number a person
 * actually decides their next meal on — and the macros beneath are the
 * detail you look at second. One card, one hairline, no inner boxes: the
 * ring and the headline are two halves of a sentence, and putting each in
 * its own container would break the sentence in half.
 *
 * Macros sit below the ring row rather than in a third column beside it.
 * The concept reference fits three columns because it is one wide frame;
 * on an SE-class 375pt screen a third column squeezes "10 / 160g" to the
 * point of wrapping. Full width below, they get room and stay readable at
 * every device width — the information is identical, the fit is not.
 *
 * Past the target the right-hand figure switches from what is left to what
 * is over — "236 · Calories over" rather than a flat "0 remaining", which
 * throws away the only number that still matters at that point. It is drawn
 * in amber, not red: this is information about the day, not a verdict on
 * it. The ring, the bar, and the percentage all switch to the same accent
 * together — one state change, not three competing colors in one card. The
 * ring and bar cap at 100% so the geometry stays honest while the
 * percentage above keeps counting (116%).
 *
 * ## Goals are the user's, or absent (slice 5.6A)
 *
 * This card used to claim `2000 Calories remaining`, `0% of 2000 Calories`
 * and `Protein Goal 0 / 160 g` to **every** user, against figures VITA had
 * invented; the comment here even described them as "the user's own
 * configured targets", which no screen could make true because none could
 * set them. With no goal it now states what was eaten and stops: no ring,
 * no remaining, no percentage, no denominator.
 *
 * With a goal the previous behaviour is unchanged, deliberately — the
 * visual treatment belongs to 5.6B, and 5.6A only removes the false claims.
 * Nothing turns red, warns, or changes state at 100%: bars fill and stop,
 * and `caloriesRemaining` floors at zero rather than going negative, the
 * same no-guilt rule the rest of the product follows.
 *
 * Protein says "Goal" only when one is set, because reaching it is the
 * intent; Carbs and Fat carry no verb because their targets are neither
 * floors nor ceilings, and labelling them as either would be VITA inventing
 * dietary advice.
 *
 * Every number is derived from the shared nutrition engine. While the day
 * is still loading, figures hold an em dash rather than showing a real "0"
 * that jumps a frame later — a false zero reads as data loss. The layout
 * never shifts between the two states.
 */
export function FuelSummaryCard({ today }: Props) {
  const { surfaces } = useTheme();
  const pending = today.isLoading;
  /** `undefined` when the user has authored no calorie goal. */
  const goal = today.targets?.calories;
  const over = !pending && (today.caloriesOver ?? 0) > 0;

  // Stored exactly, rounded only here at the display edge, so a half serving
  // never accumulates rounding error across a day's totals.
  const consumed = roundForDisplay(today.nutrition);

  return (
    <Card>
      {goal === undefined ? (
        /*
         * No goal: the total is the whole statement.
         *
         * No ring, because a ring with nothing to fill reads as 0% of
         * something — the "empty track reads as a score" problem. No
         * remaining, no percentage, no denominator.
         */
        <View>
          <Text
            style={[styles.remaining, { color: surfaces.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {pending ? PENDING : formatCalories(consumed.calories)}
          </Text>
          <Text style={[styles.remainingLabel, { color: surfaces.textSecondary }]} numberOfLines={1}>
            Calories today
          </Text>
        </View>
      ) : (
      <View style={styles.headRow}>
        {/* Number and unit both sit inside the ring. The ring itself is
            what communicates consumption, so the word below it only needs
            to name the unit — "Calories" fits where "Calories consumed"
            did not, which is what pushed it outside in the first place. */}
        <ProgressRing
          progress={pending ? 0 : (today.calorieProgress ?? 0)}
          size={104}
          thickness={9}
          color={over ? OVER_ACCENT : palette.primary}
        >
          <Text
            style={[styles.ringValue, { color: surfaces.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {pending ? PENDING : formatCalories(consumed.calories)}
          </Text>
          <Text style={[styles.ringLabel, { color: surfaces.textTertiary }]} numberOfLines={1}>
            Calories
          </Text>
        </ProgressRing>

        <View style={styles.summary}>
          <Text
            style={[styles.remaining, { color: over ? OVER_ACCENT : surfaces.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {pending
              ? PENDING
              : formatCalories((over ? today.caloriesOver : today.caloriesRemaining) ?? 0)}
          </Text>
          <Text
            style={[styles.remainingLabel, { color: over ? OVER_ACCENT : surfaces.textSecondary }]}
            numberOfLines={1}
          >
            {over ? 'Calories over' : 'Calories remaining'}
          </Text>

          <View style={styles.bar}>
            <ProgressBar
              progress={pending ? 0 : (today.calorieProgress ?? 0)}
              height={6}
              color={over ? OVER_ACCENT : palette.primary}
            />
          </View>

          <Text style={[styles.target, { color: surfaces.textTertiary }]} numberOfLines={1}>
            <Text style={[styles.percent, over && { color: OVER_ACCENT }]}>
              {pending ? PENDING : `${today.caloriePercent}%`}
            </Text>
            {` of ${formatCalories(goal)} Calories`}
          </Text>
        </View>
      </View>
      )}

      <View style={[styles.macros, { borderTopColor: surfaces.border }]}>
        {MACROS.map((macro) => {
          const macroGoal = today.targets?.[macro.key];
          const eaten = pending ? PENDING : formatAmount(consumed[macro.key]);

          // Without a goal there is no bar to fill, so the figure stands on
          // its own rather than beside an empty track and a denominator
          // nobody chose.
          if (macroGoal === undefined) {
            return (
              <View key={macro.key} style={styles.macro}>
                <Text style={[styles.macroLabel, { color: surfaces.textSecondary }]} numberOfLines={1}>
                  {macro.label}
                </Text>
                <Text style={[styles.macroValue, { color: surfaces.text }]} numberOfLines={1}>
                  {eaten} {macro.unit}
                </Text>
              </View>
            );
          }

          return (
            <StatBar
              key={macro.key}
              label={macro.key === 'protein' ? `${macro.label} Goal` : macro.label}
              valueLabel={`${eaten} / ${macroGoal} ${macro.unit}`}
              progress={pending ? 0 : progress(consumed[macro.key], macroGoal)}
              color={palette[macro.key]}
            />
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  ringValue: {
    ...typography.title,
    fontSize: 26,
  },
  ringLabel: {
    ...typography.micro,
    marginTop: -2,
  },
  summary: {
    flex: 1,
  },
  remaining: {
    ...typography.title,
  },
  remainingLabel: {
    ...typography.caption,
    marginTop: -2,
  },
  bar: {
    marginTop: spacing.s,
  },
  target: {
    ...typography.micro,
    marginTop: spacing.xs,
  },
  percent: {
    color: palette.primary,
    fontWeight: '700',
  },
  macro: {
    flex: 1,
    gap: 2,
  },
  macroLabel: {
    ...typography.caption,
  },
  macroValue: {
    ...typography.bodyMedium,
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.l,
    paddingTop: spacing.l,
  },
});
