import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, ProgressRing } from '../../../components/ui';
import type { WaterToday } from '../../../lib/water';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { ModuleSize } from '../modules';
import { SQUARE_RADIUS, TYPE, WIDE_RADIUS, isCompactSquare, squareHeight } from '../widget';

type Props = {
  today: WaterToday;
  size: ModuleSize;
  /** Opens Water with the Add Water sheet already up. */
  onAdd: () => void;
  onOpen: () => void;
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
 * Hydration on Home, in two genuinely different shapes.
 *
 * **Not one component stretched.** The square stacks a large ring over its
 * numbers because a column has height and no width; the wide lays the ring
 * beside them and puts the action on the right because a row has the
 * opposite. Stretching the wide layout into one column is what produces the
 * squeezed widget this slice was told not to ship.
 *
 * The ring is Water's shape in both — Fuel is a bar, Peptides a count — so a
 * glance separates the domains before a word is read. The vessel stays on
 * Water's own screen; Home shows a reading, not a smaller copy of a feature.
 *
 * **No goal is an honest state.** Without a target there is nothing to be a
 * fraction of, so the module shows the day's real total and offers to set
 * one. A ring at 0% would say the user is failing a goal they never chose.
 */
export function WaterModule({ today, size, onAdd, onOpen, onLongPress }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const compact = isCompactSquare(fontScale);
  const { hasGoal, percent, isGoalMet, remainingLabel, totalLabel, isLoading } = today;

  const value = isLoading ? '—' : hasGoal && percent !== null ? `${percent}%` : totalLabel;
  const detail = isLoading
    ? ''
    : !hasGoal
      ? 'No goal set'
      : isGoalMet
        ? 'Goal reached'
        : `${remainingLabel} to go`;

  const spoken =
    hasGoal && percent !== null
      ? `Water, ${percent} percent of goal, ${detail}. Opens Water`
      : `Water, ${value} today, no daily goal set. Opens Water`;

  /* The ring encodes only what the text already says, so it is decorative. */
  const ring = (diameter: number, thickness: number, inner: React.ReactNode) => (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <ProgressRing progress={today.progress} size={diameter} thickness={thickness} color={palette.water}>
        {inner}
      </ProgressRing>
    </View>
  );

  const addAction = (
    <PressableScale
      onPress={onAdd}
      haptic="selection"
      hitSlop={6}
      accessibilityLabel="Add water"
      style={[styles.action, { borderColor: surfaces.border }]}
    >
      <Ionicons name="add" size={14} color={palette.water} />
      <Text style={[styles.actionLabel, { color: surfaces.text }]}>Add</Text>
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
          <Ionicons name="water" size={14} color={palette.water} />
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Water</Text>
        </View>

        {/*
          * A percentage fits inside the ring; a volume does not. Without a
          * goal the ring has nothing to show anyway, so it carries the glyph
          * and the day's real total moves below it where it has room — which
          * is also the right hierarchy, since with no goal the total *is* the
          * headline.
          */}
        {/*
          * At large system text sizes the ring stands aside so the words can
          * have its 56pt — see `isCompactSquare`. It is decorative in every
          * state (it encodes only what the text already says), so nothing is
          * lost, and the percentage moves out of it rather than disappearing.
          */}
        {compact
          ? null
          : hasGoal
            ? ring(
                56,
                5,
                <Text style={[styles.ringValue, { color: surfaces.text }]} numberOfLines={1}>
                  {value}
                </Text>,
              )
            : ring(56, 5, <Ionicons name="water" size={19} color={palette.water} />)}

        <View style={styles.squareText}>
          {compact || !hasGoal ? (
            <Text
              style={[styles.squareValue, { color: surfaces.text }]}
              numberOfLines={compact ? 2 : 1}
            >
              {value}
            </Text>
          ) : null}
          <Text style={[styles.squareDetail, { color: surfaces.textTertiary }]} numberOfLines={2}>
            {detail}
          </Text>
        </View>

        {addAction}
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
      {ring(40, 4, <Ionicons name="water" size={14} color={palette.water} />)}

      <View style={styles.wideText}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Water</Text>
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

      {addAction}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  square: {
    flex: 1,
    borderWidth: 1,
    // A touch rounder than the wide strip — a square widget is more of an
    // object and reads better with a softer corner.
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: WIDE_RADIUS,
    padding: spacing.m,
    minHeight: 64,
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
  ringValue: {
    ...typography.captionMedium,
    fontSize: TYPE.ringValue,
    fontWeight: '700',
  },
  squareText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  squareValue: {
    ...typography.bodyMedium,
    fontSize: TYPE.squareValueSmall,
    fontWeight: '700',
  },
  squareDetail: {
    ...typography.caption,
    fontSize: TYPE.support,
    textAlign: 'center',
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
