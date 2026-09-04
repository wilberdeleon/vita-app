import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, ProgressBar } from '../../../components/ui';
import type { DailyNutrition } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  today: DailyNutrition;
  onOpen: () => void;
  onLog: () => void;
};

/**
 * Fuel on Home — the third shape.
 *
 * A bar, because calories are one number travelling along one axis, and
 * because Water already owns the ring and Peptides the count. Matching the
 * other two strips in height keeps the group reading as a set while the
 * accents keep the domains apart.
 *
 * **Every figure is real** and comes from `useDailyNutrition()` — the engine
 * Fuel itself reads, so Home and Fuel cannot disagree. An empty day says so
 * rather than showing a plausible number.
 *
 * **No score of any kind.** Not a VITA Score, not a grade, not a rating; none
 * is authorised and none is invented here.
 */
export function FuelStrip({ today, onOpen, onLog }: Props) {
  const { surfaces } = useTheme();

  const consumed = Math.round(today.nutrition.calories);
  const target = Math.round(today.targets.calories);
  const remaining = Math.max(0, target - consumed);
  const over = Math.max(0, consumed - target);
  const progress = target > 0 ? Math.min(1, consumed / target) : 0;

  const value = today.isLoading
    ? '—'
    : target <= 0
      ? `${consumed.toLocaleString()} cal`
      : over > 0
        ? `${over.toLocaleString()} cal over`
        : `${remaining.toLocaleString()} cal left`;

  // Short enough to share a line with the value and an action button.
  const detail = today.isLoading
    ? ''
    : today.isEmpty
      ? 'No meals'
      : `${today.mealsLoggedCount} of ${today.totalMealSlots} meals`;

  return (
    <PressableScale
      style={[styles.strip, { borderColor: surfaces.border }]}
      onPress={onOpen}
      accessibilityLabel={`Fuel, ${value}, ${
        today.isEmpty ? 'no meals logged yet' : detail
      }. Opens Fuel`}
    >
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: `${palette.primary}1A` }]}>
          <Ionicons name="flame" size={16} color={palette.primary} />
        </View>

        <View style={styles.text}>
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Fuel</Text>
          <Text style={[styles.value, { color: surfaces.text }]} numberOfLines={1}>
            {value}
            {detail ? <Text style={[styles.detail, { color: surfaces.textTertiary }]}> · {detail}</Text> : null}
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
        * Decorative — the strip states the same figures in words. Rendered
        * only against a real target: a bar with nothing to fill is the
        * "empty track reads as complete" problem in miniature.
        */}
      {target > 0 ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressBar progress={progress} color={palette.primary} height={3} />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  strip: {
    borderWidth: 1,
    borderRadius: radii.card,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    gap: spacing.s,
    minHeight: 64,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 1,
  },
  label: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  value: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    fontWeight: '400',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 36,
  },
  actionLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});
