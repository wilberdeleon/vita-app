import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ProgressBar } from '../../../components/ui';
import type { WaterToday } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  today: WaterToday;
  onEditGoal: () => void;
};

const PENDING = '—';

/**
 * Today's hydration, in one card.
 *
 * Deliberately restrained: one number, one line of context, one bar. The
 * Design System's own conclusion from Fuel's refinement — *size communicates
 * importance, not availability* — is why the total uses the display scale
 * rather than filling the card, and why the percentage appears once rather
 * than beside every element that could carry it.
 *
 * The premium progress visualization is slice 3.4's, not this one's.
 *
 * **Two honest states, not one padded state.** With a goal it shows progress
 * toward the number the user chose. Without one it says so and offers to set
 * one — it does not divide by an invented target, because VITA has no opinion
 * about how much anyone should drink.
 */
export function WaterSummaryCard({ today, onEditGoal }: Props) {
  const { surfaces } = useTheme();

  const context = today.isGoalMet
    ? `Goal reached · ${today.goalLabel}`
    : `${today.remainingLabel} to go of ${today.goalLabel}`;

  return (
    <Card style={styles.card}>
      <View style={styles.headline}>
        <Text style={[styles.total, { color: surfaces.text }]}>
          {today.isLoading ? PENDING : today.totalLabel}
        </Text>
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>today</Text>
      </View>

      {today.hasGoal ? (
        <>
          <Text style={[styles.context, { color: surfaces.textSecondary }]}>{context}</Text>
          <ProgressBar
            progress={today.progress}
            color={palette.water}
            accessibilityLabel={`${today.totalLabel} of ${today.goalLabel}, ${today.percent} percent`}
          />
          {/*
            * The only goal control on this screen. A row, not a settings
            * panel — discoverable because it states the current goal, and
            * quiet because changing it is occasional.
            */}
          <Pressable
            onPress={onEditGoal}
            accessibilityRole="button"
            accessibilityLabel={`Daily goal ${today.goalLabel}. Edit`}
            hitSlop={8}
            style={styles.goalRow}
          >
            <Text style={[styles.goalLabel, { color: surfaces.textTertiary }]}>
              Daily goal · {today.goalLabel}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={surfaces.textTertiary} />
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[styles.context, { color: surfaces.textTertiary }]}>
            Set a daily goal to track progress. Logging works either way.
          </Text>
          <Button label="Set a daily goal" variant="soft" color={palette.water} onPress={onEditGoal} />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.s,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.s,
  },
  total: {
    ...typography.display,
  },
  caption: {
    ...typography.caption,
  },
  context: {
    ...typography.caption,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  goalLabel: {
    ...typography.caption,
  },
});
