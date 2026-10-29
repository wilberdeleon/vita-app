import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionHeader, SegmentedTabs } from '../../../components/ui';
import { toLogDate } from '../../../lib/daily';
import { deriveJourneyTimeline, elapsedDays, type Journey, type WeightEntry, type WeightUnit } from '../../../lib/journey';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { calendarDay, dayCount, journeyWeightStats, spokenCalendarDay } from '../format';
import { JourneyStats } from './OverviewPillar';
import { PhotosPillar } from './PhotosPillar';
import { WeightPillar } from './WeightPillar';
import type { JourneyPhotoView } from '../types';
import { JourneyTimeline } from './JourneyTimeline';
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
 * Since 6.7 a finished Journey opens like an active one — **Overview ·
 * Weight · Photos** — so it can be revisited the same way it was lived:
 * Overview holds its facts and its whole Timeline, from *Journey completed*
 * at the top to *Journey began* at the bottom; Weight its history; Photos its
 * photos. All of it read-only: no Log, edit, delete, add or re-date. The
 * domain APIs still exist; they are simply not offered here.
 */
export function JourneySummary({ journey, weights, unit, photos = [], onOpenPhoto }: Props) {
  const { surfaces, scheme } = useTheme();
  const accent = useJourneyAccent();
  const end = toLogDate(new Date(journey.completedAt!));
  const days = elapsedDays(journey, end);
  const stats = journeyWeightStats(weights);
  const [pillar, setPillar] = useState(0);
  const timeline = useMemo(() => deriveJourneyTimeline({ journey, weights, photos, today: end }), [journey, weights, photos, end]);

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

      <SegmentedTabs
        options={['Overview', 'Weight', 'Photos']}
        selectedIndex={pillar}
        onChange={setPillar}
        groupLabel="Journey"
        activeColor={accent}
        activeLabelColor={scheme === 'dark' ? palette.ink : palette.textOnColor}
        fitLabels
      />

      {pillar === 0 ? (
        <>
          {stats ? <JourneyStats stats={stats} unit={unit} currentLabel="Final" /> : null}
          <View style={styles.section}>
            <SectionHeader title="Timeline" />
            <JourneyTimeline items={timeline} unit={unit} photos={photos} onOpenPhoto={onOpenPhoto} />
          </View>
        </>
      ) : null}
      {pillar === 1 ? <WeightPillar data={{ status: 'ready', weights, photos: [], unit }} historyOnly /> : null}
      {pillar === 2 ? <PhotosPillar data={{ status: 'ready', weights, photos, unit }} onOpen={onOpenPhoto} /> : null}
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
  section: {
    gap: spacing.m,
  },
});
