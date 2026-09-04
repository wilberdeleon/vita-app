import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, ProgressRing } from '../../../components/ui';
import type { WaterToday } from '../../../lib/water';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { ModuleSize } from '../modules';

type Props = {
  today: WaterToday;
  size: ModuleSize;
  /** Opens Water with the Add Water sheet already up. */
  onAdd: () => void;
  onOpen: () => void;
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
export function WaterModule({ today, size, onAdd, onOpen }: Props) {
  const { surfaces } = useTheme();
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
        style={[styles.square, { borderColor: surfaces.border }]}
        onPress={onOpen}
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
        {hasGoal
          ? ring(
              64,
              6,
              <Text style={[styles.ringValue, { color: surfaces.text }]} numberOfLines={1}>
                {value}
              </Text>,
            )
          : ring(64, 6, <Ionicons name="water" size={20} color={palette.water} />)}

        <View style={styles.squareText}>
          {!hasGoal ? (
            <Text style={[styles.squareValue, { color: surfaces.text }]} numberOfLines={1}>
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
      accessibilityLabel={spoken}
    >
      {ring(40, 4, <Ionicons name="water" size={14} color={palette.water} />)}

      <View style={styles.wideText}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Water</Text>
        <Text style={[styles.wideValue, { color: surfaces.text }]} numberOfLines={1}>
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
    borderRadius: radii.glassLarge,
    padding: spacing.m,
    alignItems: 'center',
    gap: spacing.s,
    minHeight: 168,
  },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: radii.card,
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
    letterSpacing: 0.6,
  },
  ringValue: {
    ...typography.captionMedium,
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
    fontWeight: '700',
  },
  squareDetail: {
    ...typography.caption,
    textAlign: 'center',
  },
  wideText: {
    flex: 1,
    gap: 1,
  },
  wideValue: {
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
    justifyContent: 'center',
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
