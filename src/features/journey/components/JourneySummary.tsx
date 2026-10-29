import { StyleSheet, Text, View } from 'react-native';
import { toLogDate } from '../../../lib/daily';
import { elapsedDays, type Journey, type WeightEntry, type WeightUnit } from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { calendarDay, dayCount, journeyWeightStats, spokenCalendarDay } from '../format';
import { JourneyStats } from './OverviewPillar';
import { PhotosPillar } from './PhotosPillar';
import { WeightPillar } from './WeightPillar';
import type { JourneyPhotoView } from '../types';
import { useJourneyAccent } from './useJourneyAccent';

type Props = {
  /** A completed Journey. */
  journey: Journey;
  /** That Journey's own weigh-ins, newest first. */
  weights: readonly WeightEntry[];
  unit: WeightUnit;
  /** That Journey's own progress photos, newest first (6.6). Read-only. */
  photos?: readonly JourneyPhotoView[];
  /** Opens a photo's read-only detail. */
  onOpenPhoto?: (photo: JourneyPhotoView) => void;
};

/**
 * A finished Journey — read-only (slice 6.5).
 *
 * The facts of the chapter and nothing invented about it: its name, when it
 * began and when the user finished it, how long it ran, its starting and
 * final weight, the change between them, and how many weigh-ins it holds.
 * No praise, no score. Its progress photos (6.6) are shown read-only — no
 * add, re-date or delete — and open their own read-only detail.
 *
 * The weight history is shown without edit or delete: a finished Journey is
 * history, and this slice keeps it exactly as it was recorded. The domain
 * APIs still exist; they are simply not offered here.
 */
export function JourneySummary({ journey, weights, unit, photos = [], onOpenPhoto }: Props) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  const end = toLogDate(new Date(journey.completedAt!));
  const days = elapsedDays(journey, end);
  const stats = journeyWeightStats(weights);

  return (
    <View style={styles.root}>
      <View
        accessible
        accessibilityLabel={`${journey.name}, completed. Began ${spokenCalendarDay(journey.startDate)}, finished ${spokenCalendarDay(end)}, ${dayCount(days)}.`}
        style={styles.head}
      >
        <Text style={[styles.status, { color: accent }]}>COMPLETED</Text>
        <Text style={[styles.name, { color: surfaces.text }]} accessibilityRole="header">
          {journey.name}
        </Text>
        <Text style={[styles.meta, { color: surfaces.textSecondary }]}>
          {`${calendarDay(journey.startDate, true)} – ${calendarDay(end, true)} · ${dayCount(days)}`}
        </Text>
      </View>

      {stats ? <JourneyStats stats={stats} unit={unit} currentLabel="Final" /> : null}

      {photos.length > 0 ? (
        <PhotosPillar data={{ status: 'ready', weights, photos, unit }} onOpen={onOpenPhoto} />
      ) : null}

      {weights.length > 0 ? (
        <WeightPillar data={{ status: 'ready', weights, photos: [], unit }} historyOnly />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxl,
  },
  head: {
    gap: 2,
  },
  status: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  name: {
    ...typography.title,
  },
  meta: {
    ...typography.caption,
  },
});
