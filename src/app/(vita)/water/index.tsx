import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Button, Screen, ScreenHeader, SectionHeader, useToast } from '../../../components/ui';
import { WaterLogPanel } from '../../../features/water/components/WaterLogPanel';
import { WaterSummaryCard } from '../../../features/water/components/WaterSummaryCard';
import { formatEntered, useWater, useWaterToday, type WaterEntry } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';

/**
 * Water — today's hydration, and everything needed to change it.
 *
 * The hierarchy is deliberately flat: what you've had today, one way to add
 * more, and what you actually logged. Goal and unit controls are reachable but
 * quiet, because they are occasional. Anything that would repeat the same
 * number in a second place has been left out.
 *
 * **A goal is optional.** Logging works with or without one, and setting a
 * goal is never a gate in front of recording water — a user may perfectly
 * reasonably log for a week before deciding what they're aiming at.
 *
 * The premium progress visualization, its motion, and the seven-day view are
 * slice 3.4's. This screen is about the workflow being complete and correct.
 */
export default function WaterLog() {
  const today = useWaterToday();
  const { removeEntry, restoreEntry } = useWater();
  const { showToast } = useToast();

  const handleDelete = (entry: WaterEntry) => {
    // Captured before removal so Undo restores the entry to where it was,
    // not to the end of the list.
    const index = today.entries.findIndex((candidate) => candidate.id === entry.id);
    void removeEntry(entry.id);
    showToast({
      message: `Removed · ${formatEntered(entry.enteredAmount, entry.enteredUnit)}`,
      actionLabel: 'Undo',
      onAction: () => {
        void restoreEntry(entry, index);
      },
    });
  };

  return (
    <Screen>
      <ScreenHeader title="Water" back />

      <WaterSummaryCard today={today} onEditGoal={() => router.push('/water/goal')} />

      {today.error ? <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text> : null}

      <Button
        label="Add Water"
        icon="add"
        color={palette.water}
        onPress={() => router.push('/water/add')}
      />

      <SectionHeader title="Today's log" />
      <WaterLogPanel entries={today.recentFirst} isLoading={today.isLoading} onDelete={handleDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
});
