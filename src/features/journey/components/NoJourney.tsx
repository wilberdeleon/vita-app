import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button, PressableScale, SectionHeader } from '../../../components/ui';
import { toLogDate } from '../../../lib/daily';
import { elapsedDays, type Journey } from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { dateRange, dayCount, spokenCalendarDay } from '../format';
import { useJourneyAccent } from './useJourneyAccent';

type Props = {
  /** Completed Journeys, most recently finished first. */
  past: readonly Journey[];
  /** Starts the setup flow. Omitted in the read-only preview. */
  onStart?: () => void;
  /** Opens a past Journey's read-only summary. */
  onOpenPast?: (journey: Journey) => void;
};

/**
 * My Journey with no active Journey (slice 6.5).
 *
 * The one thing to do here is begin one, so that is all the screen asks.
 * No Overview / Weight / Photos switcher and no row of empty sections: those
 * belong to a Journey, and there is not one yet.
 *
 * The drawing is the idea, not decoration: a filled beginning, a gold path,
 * an open destination — a Journey has both. It carries no dates, no weight
 * and no events, because nothing has happened.
 *
 * Past Journeys appear only when there are some — an empty "Past Journeys"
 * heading would be a section about nothing.
 */
export function NoJourney({ past, onStart, onOpenPast }: Props) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.path} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[styles.start, { backgroundColor: accent }]} />
          <View style={[styles.line, { backgroundColor: accent }]} />
          <View style={[styles.end, { borderColor: accent }]} />
        </View>
        <Text style={[styles.title, { color: surfaces.text }]} accessibilityRole="header">
          Start a New Journey
        </Text>
        <Text style={[styles.body, { color: surfaces.textSecondary }]}>
          Create a Journey to give your weight, photos and progress a beginning and an end.
        </Text>
        {onStart ? (
          <View style={styles.cta}>
            <Button variant="neutral" label="Start a New Journey" onPress={onStart} />
          </View>
        ) : null}
      </View>

      {past.length > 0 ? (
        <View style={styles.past}>
          <SectionHeader title="Past Journeys" />
          {past.map((journey, index) => {
            const end = toLogDate(new Date(journey.completedAt!));
            const days = elapsedDays(journey, end);
            const row = (
              <View
                style={[
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border },
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, { color: surfaces.text }]}>{journey.name}</Text>
                  <Text style={[styles.rowMeta, { color: surfaces.textSecondary }]}>
                    {`${dateRange(journey.startDate, end)} · ${dayCount(days)}`}
                  </Text>
                </View>
                {onOpenPast ? <Ionicons name="chevron-forward" size={18} color={surfaces.textTertiary} /> : null}
              </View>
            );
            const label = `${journey.name}, completed. ${spokenCalendarDay(journey.startDate)} to ${spokenCalendarDay(end)}, ${dayCount(days)}`;
            return onOpenPast ? (
              <PressableScale
                key={journey.id}
                onPress={() => onOpenPast(journey)}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityHint="Opens this Journey's summary"
              >
                {row}
              </PressableScale>
            ) : (
              <View key={journey.id} accessible accessibilityLabel={label}>
                {row}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const DOT = 12;

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxxl,
  },
  hero: {
    gap: spacing.m,
    paddingTop: spacing.l,
  },
  path: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
    width: 140,
  },
  start: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  line: {
    flex: 1,
    height: 1.5,
    opacity: 0.55,
  },
  end: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
  },
  title: {
    ...typography.title,
  },
  body: {
    ...typography.body,
    lineHeight: 21,
  },
  cta: {
    marginTop: spacing.m,
  },
  past: {
    gap: spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    ...typography.bodyMedium,
  },
  rowMeta: {
    ...typography.caption,
  },
});
