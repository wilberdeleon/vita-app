import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, ProgressRing } from '../../../components/ui';
import type { WaterToday } from '../../../lib/water';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  today: WaterToday;
  /** Opens Water with the Add Water sheet already up. */
  onAdd: () => void;
  /** Opens Water. */
  onOpen: () => void;
};

/**
 * Hydration on Home — compact, and deliberately not the vessel.
 *
 * The vessel is Water's own identity object and belongs on Water's screen,
 * where it has room to be the subject. Repeating it here would make Home a
 * smaller copy of a feature screen and would give a quarter of the Dashboard
 * to one domain. A ring says the same thing in a fraction of the space, and
 * — this is the point — it does not look like the other modules: Water is a
 * ring, Fuel is a bar, Peptides is neither. Three domains, three shapes.
 *
 * `ProgressRing` already existed and its own docstring makes the argument
 * better than this one does: *the shape is the hierarchy.* Until now it had
 * exactly one caller.
 *
 * **No goal is an honest state, not an empty one.** Without a target there is
 * no ring to fill, so the module shows the day's real total and offers to set
 * one — the same rule Water itself follows, for the same reason: a ring at 0%
 * says the user is failing a goal they never chose.
 */
export function WaterModule({ today, onAdd, onOpen }: Props) {
  const { surfaces } = useTheme();

  const { hasGoal, percent, isGoalMet, remainingLabel, totalLabel, isLoading } = today;

  const detail = isLoading
    ? '—'
    : !hasGoal
      ? totalLabel
      : isGoalMet
        ? 'Goal reached'
        : `${remainingLabel} to go`;

  return (
    <PressableScale
      style={[styles.module, { borderColor: surfaces.border }]}
      onPress={onOpen}
      accessibilityLabel={
        hasGoal && percent !== null
          ? `Water, ${percent} percent of goal, ${detail}. Opens Water`
          : `Water, ${detail}, no daily goal set. Opens Water`
      }
    >
      <View style={styles.head}>
        <Ionicons name="water" size={15} color={palette.water} />
        <Text style={[styles.title, { color: surfaces.textSecondary }]}>Water</Text>
      </View>

      <View style={styles.body}>
        {/*
          * The ring is decorative here — every figure it encodes is in the
          * text beside it, and the whole module already announces itself as
          * one labelled control.
          */}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressRing progress={today.progress} size={54} thickness={5} color={palette.water}>
            <Text style={[styles.percent, { color: surfaces.text }]}>
              {hasGoal && percent !== null ? `${Math.min(999, percent)}%` : '—'}
            </Text>
          </ProgressRing>
        </View>

        <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={2}>
          {detail}
        </Text>
      </View>

      <View style={[styles.action, { borderTopColor: surfaces.border }]}>
        {/*
          * A nested pressable, so the module opens Water and the action logs
          * water. Two targets, two labels — never one control that does
          * different things depending on where the thumb lands.
          */}
        <PressableScale
          onPress={onAdd}
          haptic="selection"
          hitSlop={6}
          accessibilityLabel="Add water"
          style={styles.actionInner}
        >
          <Ionicons name="add" size={14} color={palette.water} />
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>
            {hasGoal ? 'Add' : 'Add water'}
          </Text>
        </PressableScale>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  module: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.card,
    paddingTop: spacing.m,
    gap: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
  },
  title: {
    ...typography.captionMedium,
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    // Matches PeptidesModule so the two sit level and read as one row rather
    // than as two blocks that happen to be adjacent.
    minHeight: 78,
  },
  percent: {
    ...typography.captionMedium,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    textAlign: 'center',
  },
  action: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  actionLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});
