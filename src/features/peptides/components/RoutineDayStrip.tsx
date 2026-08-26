import { StyleSheet, Text, View } from 'react-native';
import { routineDayMarkLabel, routineDayMarkSymbol, type RoutineDayMark } from '../../../lib/peptides';
import { fromLogDate, type LogDate } from '../../../lib/daily';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Day = { logDate: LogDate; mark: RoutineDayMark };

type Props = {
  days: readonly Day[];
};

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/**
 * A week of a routine, at a glance.
 *
 * **A strip, not a calendar application.** It answers "how has this week
 * gone?" and stops. A month grid would be a second screen pretending to be a
 * component, and the founder asked for something manageable.
 *
 * **Shape and text carry the meaning, never colour alone.** Each day shows a
 * glyph — ✓ taken, – skipped, ○ nothing recorded — and every cell carries an
 * accessible sentence naming the date and the state. Someone who cannot
 * distinguish the fills reads exactly the same information.
 *
 * **Nothing here is scored.** There is no percentage, no streak, no "good
 * week". A day the user did not answer says *No response*, which is the whole
 * truth: VITA was not told.
 */
export function RoutineDayStrip({ days }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.row}>
      {days.map((day) => {
        const weekday = WEEKDAY_INITIALS[fromLogDate(day.logDate).getDay()];
        const taken = day.mark === 'taken';
        const scheduled = day.mark !== 'not-scheduled';

        return (
          <View
            key={day.logDate}
            style={styles.cell}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${day.logDate}. ${routineDayMarkLabel(day.mark)}`}
          >
            <Text style={[styles.weekday, { color: surfaces.textTertiary }]}>{weekday}</Text>
            <View
              style={[
                styles.dot,
                {
                  borderColor: scheduled ? surfaces.border : 'transparent',
                  backgroundColor: taken ? `${palette.peptide}26` : surfaces.card,
                },
                taken && { borderColor: palette.peptide },
              ]}
            >
              <Text
                style={[
                  styles.glyph,
                  { color: taken ? palette.peptide : surfaces.textTertiary },
                ]}
              >
                {routineDayMarkSymbol(day.mark)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  cell: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  weekday: {
    ...typography.micro,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    ...typography.caption,
  },
});
