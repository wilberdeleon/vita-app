import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  onPress: () => void;
};

/**
 * The way from Peptides into the month across every routine.
 *
 * ## Why a row and not a card
 *
 * The founder's note was that Home can feel sparse with one or two routines,
 * and that the fix must not be the card soup 5.4 removed. A card here would
 * compete with Today, which is the one region on this screen that carries
 * actions; a single quiet row adds a destination without adding weight. The
 * depth comes from what is behind it, not from how loudly it is announced.
 *
 * It sits after the routines rather than under Today for the same reason —
 * Today stays the hero, and history reads naturally last.
 *
 * **No number on it.** A count of anything here — events this month, days
 * logged — would be a statistic on a screen that deliberately has none, and
 * the whole point of the destination is that the user reads their own month.
 */
export function ActivityLink({ onPress }: Props) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Monthly activity"
      accessibilityHint="What you logged across all your routines"
      style={[styles.row, { borderTopColor: surfaces.border }]}
    >
      <Ionicons name="calendar-outline" size={18} color={surfaces.textSecondary} />
      {/* Only the text column flexes — `PressableScale` does not pass `flex`
          through to the row it wraps. */}
      <View style={styles.text}>
        <Text style={[styles.title, { color: surfaces.text }]}>Monthly activity</Text>
        <Text style={[styles.body, { color: surfaces.textTertiary }]} numberOfLines={2}>
          What you logged across all your routines
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.l,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
  },
  body: {
    ...typography.caption,
  },
});
