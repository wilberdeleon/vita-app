import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, ProgressBar } from '../../../components/ui';
import type { DailyNutrition } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  today: DailyNutrition;
  /** Opens the Fuel tab. */
  onOpen: () => void;
  /** Opens Fuel's own Add flow. */
  onLog: () => void;
};

/**
 * Fuel on Home — a full-width strip, and the third shape.
 *
 * Horizontal because the pair above it is vertical, and because calories are
 * one number moving along one axis. Water gets a ring, Peptides a tally, Fuel
 * a bar: a person glancing at Home should be able to tell the three apart
 * without reading a word, which is precisely what the old five identical
 * metric tiles made impossible.
 *
 * **Every figure here is real.** Calories and the meal count come from
 * `useDailyNutrition()` — the same engine Fuel itself reads, so Home and Fuel
 * cannot disagree. Nothing on this strip is a fixture, and when the day is
 * empty it says so rather than showing a plausible number.
 *
 * **No score of any kind.** Not a VITA Score, not a grade, not a rating —
 * none is authorised and none is invented here. Calories remaining against a
 * target the user's own settings produced, and how many meals have something
 * in them.
 */
export function FuelStrip({ today, onOpen, onLog }: Props) {
  const { surfaces } = useTheme();

  const consumed = Math.round(today.nutrition.calories);
  const target = Math.round(today.targets.calories);
  const remaining = Math.max(0, target - consumed);
  const over = Math.max(0, consumed - target);
  const progress = target > 0 ? Math.min(1, consumed / target) : 0;

  const headline = today.isLoading
    ? '—'
    : target <= 0
      ? `${consumed.toLocaleString()} cal`
      : over > 0
        ? `${over.toLocaleString()} cal over`
        : `${remaining.toLocaleString()} cal left`;

  const detail = today.isLoading
    ? ''
    : today.isEmpty
      ? 'No meals logged yet'
      : `${today.mealsLoggedCount} of ${today.totalMealSlots} meals logged`;

  return (
    <PressableScale
      style={[styles.strip, { borderColor: surfaces.border }]}
      onPress={onOpen}
      accessibilityLabel={`Fuel, ${headline}${detail ? `, ${detail}` : ''}. Opens Fuel`}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <View style={styles.head}>
            <Ionicons name="flame" size={15} color={palette.primary} />
            <Text style={[styles.title, { color: surfaces.textSecondary }]}>Fuel</Text>
          </View>
          <Text style={[styles.headline, { color: surfaces.text }]} numberOfLines={1}>
            {headline}
          </Text>
          <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={1}>
            {detail}
          </Text>
        </View>

        <PressableScale
          onPress={onLog}
          haptic="selection"
          hitSlop={6}
          accessibilityLabel="Log food"
          style={[styles.action, { borderColor: surfaces.border }]}
        >
          <Ionicons name="add" size={14} color={palette.primary} />
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>Log</Text>
        </PressableScale>
      </View>

      {/*
        * The bar is decorative — the strip already announces the same figures
        * in words, and a second spoken progress value would just be noise.
        * It renders only against a real target; a bar with nothing to fill is
        * the "empty track reads as complete" problem in miniature.
        */}
      {target > 0 ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressBar progress={progress} color={palette.primary} height={4} />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  strip: {
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing.m,
    gap: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.captionMedium,
  },
  headline: {
    ...typography.heading,
  },
  detail: {
    ...typography.caption,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 40,
  },
  actionLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});
