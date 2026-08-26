import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState, Screen, ScreenHeader } from '../../../../../components/ui';
import { LogRow } from '../../../../../features/peptides/components/LogRow';
import { formatLogDateLong, type LogDate } from '../../../../../lib/daily';
import { usePeptideContext, useResolvedSetup, type PeptideLogEntry } from '../../../../../lib/peptides';
import { spacing, typography } from '../../../../../theme/tokens';
import { useTheme } from '../../../../../theme/ThemeProvider';

/**
 * Everything recorded for one setup, newest first.
 *
 * Grouped by day rather than flattened: a date printed once as a heading
 * reads better than the same date repeated down every row, and it makes "how
 * often" visible at a glance without any of the adherence scoring VITA
 * deliberately does not do.
 *
 * Available for inactive setups too. Deactivating a setup has never deleted
 * anything, and history that disappears when you stop tracking something is
 * not history.
 */
export default function PeptideHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const { logsForSetup } = usePeptideContext();
  const resolved = useResolvedSetup(setupId);
  const { surfaces } = useTheme();

  const entries = logsForSetup(setupId);

  const days = useMemo(() => {
    const grouped = new Map<LogDate, PeptideLogEntry[]>();
    for (const entry of entries) {
      const day = grouped.get(entry.logDate);
      if (day) day.push(entry);
      else grouped.set(entry.logDate, [entry]);
    }
    // `entries` already arrives newest first, so insertion order is the order.
    return [...grouped.entries()];
  }, [entries]);

  if (!resolved) {
    return (
      <Screen>
        <ScreenHeader title="History" back />
        <EmptyState
          icon="help-circle-outline"
          title="This setup is no longer available"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="History" back />
      <Text style={[styles.name, { color: surfaces.text }]}>{resolved.name}</Text>

      {days.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="Nothing logged yet"
          body="Administrations you record will appear here."
        />
      ) : (
        days.map(([day, dayEntries]) => (
          <View key={day} style={styles.day}>
            <Text style={[styles.dayHeading, { color: surfaces.textTertiary }]}>
              {formatLogDateLong(day).toUpperCase()}
            </Text>
            {dayEntries.map((entry) => (
              <LogRow
                key={entry.id}
                entry={entry}
                onPress={() => router.push(`/peptides/log/${encodeURIComponent(entry.id)}`)}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    ...typography.heading,
  },
  day: {
    gap: spacing.s,
  },
  dayHeading: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
});
