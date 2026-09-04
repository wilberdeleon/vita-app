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
  onOpen: () => void;
};

/**
 * Hydration on Home — a horizontal strip, and still not the vessel.
 *
 * **Reshaped after the 5.3 founder review.** It was a tall half-width box
 * beside an identical one, which read as two large blocks with air around
 * them. Horizontal costs a third of the height, so three domains fit where
 * two used to, and it lets the ring sit beside its own numbers rather than
 * above them.
 *
 * The ring stays because it is Water's shape here: Fuel is a bar, Peptides a
 * count, and a glance should tell them apart before a word is read. The
 * vessel remains Water's own — Home shows a reading, not a smaller copy of
 * the feature screen.
 *
 * **No goal is still an honest state.** Without a target there is nothing to
 * be a fraction of, so the strip shows the day's real total and offers to set
 * one. A ring at 0% would say the user is failing a goal they never chose.
 */
export function WaterModule({ today, onAdd, onOpen }: Props) {
  const { surfaces } = useTheme();

  const { hasGoal, percent, isGoalMet, remainingLabel, totalLabel, isLoading } = today;

  const value = isLoading ? '—' : hasGoal && percent !== null ? `${percent}%` : totalLabel;
  /*
   * Kept short deliberately. The value and the detail share one line beside
   * an action button, so a longer phrase truncates mid-word — which the first
   * 5.3A device render did. The spoken label below carries the full wording.
   */
  const detail = isLoading
    ? ''
    : !hasGoal
      ? 'No goal set'
      : isGoalMet
        ? 'Goal reached'
        : `${remainingLabel} to go`;

  return (
    <PressableScale
      style={[styles.strip, { borderColor: surfaces.border }]}
      onPress={onOpen}
      accessibilityLabel={
        hasGoal && percent !== null
          ? `Water, ${percent} percent of goal, ${detail}. Opens Water`
          : `Water, ${value} today, no daily goal set. Opens Water`
      }
    >
      {/*
        * Decorative: every figure it encodes is in the text beside it, and
        * the strip already announces itself as one labelled control.
        */}
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ProgressRing progress={today.progress} size={40} thickness={4} color={palette.water}>
          <Ionicons name="water" size={14} color={palette.water} />
        </ProgressRing>
      </View>

      <View style={styles.text}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Water</Text>
        <Text style={[styles.value, { color: surfaces.text }]} numberOfLines={1}>
          {value}
          {detail ? <Text style={[styles.detail, { color: surfaces.textTertiary }]}> · {detail}</Text> : null}
        </Text>
      </View>

      <PressableScale
        onPress={onAdd}
        haptic="selection"
        hitSlop={6}
        accessibilityLabel={hasGoal ? 'Add water' : 'Add water'}
        style={[styles.action, { borderColor: surfaces.border }]}
      >
        <Ionicons name="add" size={14} color={palette.water} />
        <Text style={[styles.actionLabel, { color: surfaces.text }]}>Add</Text>
      </PressableScale>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: radii.card,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    minHeight: 64,
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
