import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, ProgressBar } from '../../../components/ui';
import type { DailyNutrition } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { ModuleSize } from '../modules';
import { SQUARE_RADIUS, TYPE, WIDE_RADIUS, isCompactSquare, squareHeight } from '../widget';

type Props = {
  today: DailyNutrition;
  size: ModuleSize;
  onOpen: () => void;
  onLog: () => void;
  /**
   * Enters Home's edit mode. Lives on this module's own root pressable
   * because React Native gives the innermost pressable the responder — a
   * wrapper above it would never see the hold — and because `Pressable`
   * suppresses `onPress` once a long press fires, so holding a widget cannot
   * also open the feature.
   */
  onLongPress?: () => void;
};

/**
 * Fuel on Home — a bar in both shapes, and wide by default.
 *
 * The bar is Fuel's identity here because calories are one number travelling
 * along one axis; Water owns the ring and Peptides the count. Wide is the
 * shipped default at the founders' direction, so Home opens with one
 * prominent module above a pair.
 *
 * **The two layouts are designed, not stretched.** Wide runs the bar the full
 * width beneath a single row; square stacks the figure over the meal count
 * with a shorter bar. Neither is the other squeezed.
 *
 * **Every figure is real** and comes from `useDailyNutrition()` — the engine
 * Fuel itself reads, so Home and Fuel cannot disagree. An empty day says so
 * rather than showing a plausible number, and **no score of any kind** is
 * computed here: not a VITA Score, not a grade, not a rating. None is
 * authorised and none is invented.
 */
export function FuelStrip({ today, size, onOpen, onLog, onLongPress }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const compact = isCompactSquare(fontScale);

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

  const detail = today.isLoading
    ? ''
    : today.isEmpty
      ? 'No meals'
      : `${today.mealsLoggedCount} of ${today.totalMealSlots} meals`;

  const spoken = `Fuel, ${value}, ${
    today.isEmpty ? 'no meals logged yet' : detail
  }. Opens Fuel`;

  /* Decorative — the module states the same figures in words. Rendered only
     against a real target: a bar with nothing to fill is the "empty track
     reads as complete" problem in miniature. */
  const bar =
    target > 0 ? (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ProgressBar progress={progress} color={palette.primary} height={3} />
      </View>
    ) : null;

  const logAction = (
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
  );

  if (size === 'square') {
    return (
      <PressableScale
        style={[
          styles.square,
          { borderColor: surfaces.border, minHeight: squareHeight(fontScale), maxHeight: squareHeight(fontScale) },
        ]}
        onPress={onOpen}
        onLongPress={onLongPress}
        delayLongPress={450}
        accessibilityLabel={spoken}
      >
        <View style={styles.head}>
          <Ionicons name="flame" size={14} color={palette.primary} />
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Fuel</Text>
        </View>

        <View style={styles.squareBody}>
          <Text style={[styles.squareValue, { color: surfaces.text }]} numberOfLines={2} adjustsFontSizeToFit>
            {value}
          </Text>
          <Text
            style={[styles.squareDetail, { color: surfaces.textTertiary }]}
            numberOfLines={compact ? 2 : 1}
          >
            {detail}
          </Text>
        </View>

        {/* Decorative, and the first thing to give way to larger text. */}
        {compact ? null : bar}
        {logAction}
      </PressableScale>
    );
  }

  return (
    <PressableScale
      style={[styles.wide, { borderColor: surfaces.border }]}
      onPress={onOpen}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityLabel={spoken}
    >
      <View style={styles.wideRow}>
        <View style={[styles.badge, { backgroundColor: `${palette.primary}1A` }]}>
          <Ionicons name="flame" size={16} color={palette.primary} />
        </View>

        <View style={styles.wideText}>
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Fuel</Text>
          {/* A figure is information, so it wraps rather than truncating once
            the text is large — 5.3D found `2,000 c…` on a wide Fuel strip. */}
        <Text
          style={[styles.wideValue, { color: surfaces.text }]}
          numberOfLines={compact ? 3 : 1}
        >
            {value}
            {detail ? <Text style={[styles.detail, { color: surfaces.textTertiary }]}> · {detail}</Text> : null}
          </Text>
        </View>

        {logAction}
      </View>

      {bar}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  square: {
    flex: 1,
    borderWidth: 1,
    borderRadius: SQUARE_RADIUS,
    padding: spacing.m,
    alignItems: 'center',
    gap: spacing.s,
    /*
     * One shared footprint — see `widget.ts`. A widget must not resize because
     * its feature happened to have less to say today.
     *
     * Both bounds, not `height`: `flex: 1` above resolves a flex basis of 0 on
     * the main axis, which would win over a plain height and collapse the
     * cell. Clamping the range pins the footprint whatever the flex maths
     * decides, in either direction.
     */
    /* The value is applied inline — it depends on the system text scale. */
  },
  wide: {
    borderWidth: 1,
    borderRadius: WIDE_RADIUS,
    padding: spacing.m,
    gap: spacing.s,
    minHeight: 64,
  },
  wideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.micro,
    fontSize: TYPE.moduleLabel,
    letterSpacing: 0.6,
  },
  squareBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  squareValue: {
    ...typography.heading,
    fontSize: TYPE.squareValue,
    fontWeight: '700',
    textAlign: 'center',
  },
  squareDetail: {
    ...typography.caption,
    fontSize: TYPE.support,
    textAlign: 'center',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideText: {
    flex: 1,
    gap: 1,
  },
  wideValue: {
    ...typography.bodyMedium,
    fontSize: TYPE.wideValue,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    fontSize: TYPE.support,
    fontWeight: '400',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 40,
  },
  actionLabel: {
    ...typography.captionMedium,
    fontSize: TYPE.actionLabel,
    fontWeight: '600',
  },
});
