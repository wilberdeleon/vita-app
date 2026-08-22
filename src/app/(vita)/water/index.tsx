import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ListRow, ProgressBar, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { formatEntered, useWaterToday } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Water — real hydration state, plainly presented.
 *
 * Slice 3.2 replaced the engine behind this screen, not the screen. What was
 * a frozen `5 / 8 cups` is now the day's actual total, read from persisted
 * entries and keyed to the local calendar day. It is deliberately plain:
 * slice 3.3 owns the goal experience and the logged-entry interactions, and
 * 3.4 owns the progress visualization, so polishing here would be work done
 * twice.
 *
 * **No goal is invented.** Until the user sets one — slice 3.3's job — the
 * screen says so rather than showing progress toward a number VITA made up.
 * A hydration target presented as if it came from somewhere is exactly the
 * kind of quiet false authority the product must not have.
 */
export default function WaterLog() {
  const today = useWaterToday();
  const { surfaces } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Water" back />

      <Card style={styles.summary}>
        <Text style={[styles.total, { color: surfaces.text }]}>
          {today.isLoading ? '—' : today.totalLabel}
        </Text>

        {today.hasGoal ? (
          <>
            <Text style={[styles.context, { color: surfaces.textSecondary }]}>
              {today.isGoalMet
                ? `Goal reached — ${today.goalLabel}`
                : `${today.remainingLabel} to go of ${today.goalLabel}`}
            </Text>
            <ProgressBar progress={today.progress} color={palette.water} />
          </>
        ) : (
          <Text style={[styles.context, { color: surfaces.textTertiary }]}>
            Logged today. You haven't set a daily goal yet.
          </Text>
        )}
      </Card>

      {today.error ? <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text> : null}

      <SectionHeader title="Today's log" />
      {today.isEmpty && !today.isLoading ? (
        <EmptyState icon="water-outline" title="No water logged yet" body="Add your first drink of the day." />
      ) : (
        <View style={styles.entries}>
          {today.recentFirst.map((entry) => (
            <ListRow
              key={entry.id}
              icon="water-outline"
              iconColor={palette.water}
              title={formatEntered(entry.enteredAmount, entry.enteredUnit)}
              subtitle={timeLabel(entry.loggedAt)}
            />
          ))}
        </View>
      )}

      <Button label="+ Add Water" color={palette.water} onPress={() => router.push('/water/add')} />
    </Screen>
  );
}

/**
 * The clock time a drink was logged, e.g. `2:15 PM`.
 *
 * Hand-formatted rather than via `toLocaleTimeString`, matching the reasoning
 * already recorded for `formatLogDateLong`: Hermes' Intl support varies by
 * platform and engine build, and VITA is a US-English product today.
 */
function timeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

const styles = StyleSheet.create({
  summary: {
    gap: spacing.s,
  },
  total: {
    ...typography.heading,
  },
  context: {
    ...typography.caption,
  },
  error: {
    ...typography.caption,
  },
  entries: {
    gap: spacing.s,
  },
});
