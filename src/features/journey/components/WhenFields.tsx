import { StyleSheet, Text, View } from 'react-native';
import { Chip, TextField } from '../../../components/ui';
import { fromDateAndTime, isValidLogDate, toLogDate, toTimeInput, type LogDate } from '../../../lib/daily';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Date + 24-hour time fields with Today / Now — the same interaction VITA's
 * peptide log and Log Weight use (6.6 photos). No picker dependency.
 */
export function WhenFields({
  date,
  time,
  onDate,
  onTime,
  error,
}: {
  date: string;
  time: string;
  onDate: (value: string) => void;
  onTime: (value: string) => void;
  error?: string | null;
}) {
  const { surfaces } = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label="Date (YYYY-MM-DD)"
            autoCapitalize="none"
            autoCorrect={false}
            value={date}
            onChangeText={onDate}
            accessibilityLabel="Date, year dash month dash day"
          />
        </View>
        <Chip label="Today" onPress={() => onDate(toLogDate(new Date()))} />
      </View>
      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label="Time (24-hour)"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            value={time}
            onChangeText={onTime}
            accessibilityLabel="Time, hours colon minutes"
          />
        </View>
        <Chip label="Now" onPress={() => onTime(toTimeInput(new Date().toISOString()))} />
      </View>
      {error ? <Text style={[styles.error, { color: surfaces.textSecondary }]}>{error}</Text> : null}
    </View>
  );
}

/** The instant the fields describe, or `null` while they do not describe one. */
export function whenFromFields(date: string, time: string): Date | null {
  if (!isValidLogDate(date)) return null;
  const iso = fromDateAndTime(date as LogDate, time);
  return iso ? new Date(iso) : null;
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.s,
  },
  grow: {
    flex: 1,
  },
  error: {
    ...typography.caption,
  },
});
