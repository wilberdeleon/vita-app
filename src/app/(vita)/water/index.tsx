import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Button, Screen, ScreenHeader, SectionHeader, useToast } from '../../../components/ui';
import { WaterLevelPanel } from '../../../features/water/components/WaterLevelPanel';
import { WaterLogPanel } from '../../../features/water/components/WaterLogPanel';
import { WaterWeekStrip } from '../../../features/water/components/WaterWeekStrip';
import {
  formatEntered,
  useWater,
  useWaterToday,
  useWaterWeek,
  type WaterEntry,
} from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';

/**
 * Water.
 *
 * Four things, in the order they are needed: how the day is going, how to add
 * to it, how this week has looked, and what was actually logged. Each fact
 * appears exactly once — the total is large in the panel and nowhere else, the
 * goal and percentage share one quiet line, and the week is context rather
 * than a second scoreboard.
 *
 * That restraint is the point of this slice. The Design System's conclusion
 * from Fuel — *size communicates importance, not availability* — is what keeps
 * this from becoming a progress card, a remaining card, a goal card, and a
 * history card stacked down the screen.
 */
export default function WaterLog() {
  const today = useWaterToday();
  const week = useWaterWeek();
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

      <WaterLevelPanel today={today} onEditGoal={() => router.push('/water/goal')} />

      {today.error ? <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text> : null}

      <Button
        label="Add Water"
        icon="add"
        color={palette.water}
        onPress={() => router.push('/water/add')}
      />

      <SectionHeader title="Last 7 days" />
      <WaterWeekStrip days={week} unit={today.unit} />

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
