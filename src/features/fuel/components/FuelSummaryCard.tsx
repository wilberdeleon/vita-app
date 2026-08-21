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
 * Every number is derived from the shared nutrition engine. While the day
 * is still loading, figures hold an em dash rather than showing a real "0"
 * that jumps a frame later — a false zero reads as data loss. The layout
 * never shifts between the two states.
 */
export function FuelSummaryCard({ today }: Props) {
  const { surfaces } = useTheme();
  const pending = today.isLoading;

  // Stored exactly, rounded only here at the display edge, so a half serving
  // never accumulates rounding error across a day's totals.
  const consumed = roundForDisplay(today.nutrition);

  return (
    <Card>
      <View style={styles.headRow}>
        <ProgressRing progress={pending ? 0 : today.calorieProgress} size={104} thickness={9}>
          <Text
            style={[styles.ringValue, { color: surfaces.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {pending ? PENDING : formatCalories(consumed.calories)}
          </Text>
          <Text style={[styles.ringLabel, { color: surfaces.textTertiary }]}>cal eaten</Text>
        </ProgressRing>

        <View style={styles.summary}>
          <Text
            style={[styles.remaining, { color: surfaces.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {pending ? PENDING : formatCalories(today.caloriesRemaining)}
          </Text>
          <Text style={[styles.remainingLabel, { color: surfaces.textSecondary }]}>Calories remaining</Text>

          <View style={styles.bar}>
            <ProgressBar progress={pending ? 0 : today.calorieProgress} height={6} />
          </View>

          <Text style={[styles.target, { color: surfaces.textTertiary }]} numberOfLines={1}>
            <Text style={styles.percent}>{pending ? PENDING : `${today.caloriePercent}%`}</Text>
            {` of ${formatCalories(today.targets.calories)} Calories`}
          </Text>
        </View>
      </View>

      <View style={[styles.macros, { borderTopColor: surfaces.border }]}>
        {MACROS.map((macro) => (
          <StatBar
            key={macro.key}
            label={macro.label}
            valueLabel={`${pending ? PENDING : formatAmount(consumed[macro.key])} / ${today.targets[macro.key]}${macro.unit}`}
            progress={pending ? 0 : progress(consumed[macro.key], today.targets[macro.key])}
            color={palette[macro.key]}
          />
        ))}
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
    marginTop: -1,
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
  macros: {
    flexDirection: 'row',
    gap: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.l,
    paddingTop: spacing.l,
  },
});
