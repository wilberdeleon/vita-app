import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { deriveJourneyTimeline, latestEntry, type Journey } from '../../../lib/journey';
import { SectionHeader } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import {
  firstEntry,
  journeyWeightStats,
  longDate,
  shortDate,
  signedChange,
  spokenChange,
  spokenWeight,
  weightNumber,
} from '../format';
import type { JourneyPhotoView, JourneyViewData } from '../types';
import { JourneyTimeline } from './JourneyTimeline';
import { WeightTrend } from './WeightTrend';

type Props = {
  data: JourneyViewData;
  /** The Journey this Overview is the home of (6.5). */
  journey: Journey;
  /** Local calendar today — whether the Journey has reached Day 30. */
  today: string;
  /** Opens a real photo's detail from its timeline item. */
  onOpenPhoto?: (photo: JourneyPhotoView) => void;
  /** `__DEV__` preview only: the 6.8 vision (trend line, latest photo). */
  showFuture?: boolean;
};

/**
 * Overview — the home of **this** Journey (6.5), and since 6.7 its history.
 *
 * One continuous hierarchy: the Journey's identity sits above the pillars;
 * Overview gives its compact facts — starting weight (its first weigh-in),
 * current weight (its latest), the change once there are two, how many
 * weigh-ins — and then the **Timeline**: everything that has happened in
 * this Journey, newest first, on the gold spine. The 6.3–6.6 placeholder
 * spine (Began · Progress photos · Timeline · Planned end) is gone — the
 * Timeline now carries the beginning and the photos, and the planned end is
 * a plan, which the header already shows.
 *
 * No hero number, no grid of cards, no goal, no BMI, no chart.
 */
export function OverviewPillar({ data, journey, today, onOpenPhoto, showFuture = false }: Props) {
  const { weights, photos, unit } = data;
  const stats = journeyWeightStats(weights);
  const timeline = useMemo(
    () => deriveJourneyTimeline({ journey, weights, photos, today }),
    [journey, weights, photos, today],
  );

  return (
    <View style={styles.container}>
      {stats ? <JourneyStats stats={stats} unit={unit} /> : null}
      {showFuture && weights.length > 1 ? <OverviewFuture data={data} /> : null}
      <View style={styles.section}>
        <SectionHeader title="Timeline" />
        <JourneyTimeline items={timeline} unit={unit} photos={photos} onOpenPhoto={onOpenPhoto} />
      </View>
    </View>
  );
}

/** Starting · Current · Change · Weigh-ins — facts, two to a row, no cards. */
export function JourneyStats({
  stats,
  unit,
  currentLabel = 'Current',
}: {
  stats: NonNullable<ReturnType<typeof journeyWeightStats>>;
  unit: JourneyViewData['unit'];
  currentLabel?: string;
}) {
  const { surfaces } = useTheme();
  const cells: { key: string; label: string; value: string; spoken: string }[] = [
    {
      key: 'starting',
      label: 'Starting',
      value: `${weightNumber(stats.starting.weightKg, unit)} ${unit}`,
      spoken: `Starting weight ${spokenWeight(stats.starting.weightKg, unit)}`,
    },
    {
      key: 'current',
      label: currentLabel,
      value: `${weightNumber(stats.current.weightKg, unit)} ${unit}`,
      spoken: `${currentLabel} weight ${spokenWeight(stats.current.weightKg, unit)}`,
    },
  ];
  if (stats.count > 1) {
    cells.push({
      key: 'change',
      label: 'Change',
      value: signedChange(stats.starting.weightKg, stats.current.weightKg, unit),
      spoken: `Change ${spokenChange(stats.starting.weightKg, stats.current.weightKg, unit)}`,
    });
  }
  cells.push({
    key: 'count',
    label: 'Weigh-ins',
    value: String(stats.count),
    spoken: `${stats.count} ${stats.count === 1 ? 'weigh-in' : 'weigh-ins'}`,
  });

  return (
    <View style={styles.stats}>
      {cells.map((cell) => (
        <View key={cell.key} style={styles.stat} accessible accessibilityLabel={cell.spoken}>
          <Text style={[styles.statLabel, { color: surfaces.textTertiary }]}>{cell.label.toUpperCase()}</Text>
          <Text style={[styles.statValue, { color: surfaces.text }]}>{cell.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** The 6.8 trend vision — `__DEV__` preview only, never release. */
function OverviewFuture({ data }: { data: JourneyViewData }) {
  const { surfaces } = useTheme();
  const { weights, unit } = data;
  const latest = latestEntry(weights);
  const first = firstEntry(weights);
  if (!latest || !first || first === latest) return null;

  return (
    <View style={styles.trendBlock}>
      <Text
        style={[styles.change, { color: surfaces.text }]}
        accessibilityLabel={`${spokenChange(first.weightKg, latest.weightKg, unit)} since ${longDate(first.loggedAt)}`}
      >
        {signedChange(first.weightKg, latest.weightKg, unit)}
        <Text style={{ color: surfaces.textSecondary }}>{`  since ${shortDate(first.loggedAt)}`}</Text>
      </Text>
      <WeightTrend weights={weights} unit={unit} height={64} labels={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.l,
  },
  stat: {
    width: '50%',
    gap: 2,
  },
  statLabel: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  statValue: {
    ...typography.heading,
    fontVariant: ['tabular-nums'],
  },
  trendBlock: {
    gap: spacing.m,
  },
  change: {
    ...typography.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
  section: {
    gap: spacing.m,
  },
});
