import { StyleSheet, Text, View } from 'react-native';
import { latestEntry, type Journey } from '../../../lib/journey';
import { SectionHeader } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import {
  calendarDay,
  elapsed,
  firstEntry,
  journeyWeightStats,
  longDate,
  shortDate,
  signedChange,
  spokenChange,
  spokenWeight,
  weightNumber,
  weightOnDay,
} from '../format';
import type { JourneyViewData } from '../types';
import { JourneySpine, type SpineItem } from './JourneySpine';
import { PhotoFrame } from './PhotoFrame';
import { WeightTrend } from './WeightTrend';

/** How many recent records the preview's records spine lists. */
const RECENT = 5;

type Props = {
  data: JourneyViewData;
  /** The Journey this Overview is the home of (6.5). */
  journey: Journey;
  /** `__DEV__` preview only: the 6.6/6.7 vision (trend line, records spine). */
  showFuture?: boolean;
};

/**
 * Overview — the home of **this** Journey (6.5).
 *
 * The Journey's identity and time already sit above the pillars, so Overview
 * starts with what was recorded in it: a compact set of facts — starting
 * weight (its first weigh-in), current weight (its latest), the change
 * between them once there are two, and how many weigh-ins — then the
 * Journey's spine from the day it began to its planned end. Progress photos
 * and the timeline stay hollow until 6.6 and 6.7 make them real.
 *
 * No hero number, no grid of cards, no goal, no BMI: weight is one signal in
 * the Journey, and the Weight pillar is where it gets the screen.
 */
export function OverviewPillar({ data, journey, showFuture = false }: Props) {
  const { weights, photos, unit } = data;
  const stats = journeyWeightStats(weights);

  const items: SpineItem[] = [
    {
      key: 'began',
      label: 'Began',
      body: calendarDay(journey.startDate, true),
      recorded: true,
    },
    photos.length
      ? {
          key: 'photos',
          label: 'Progress photos',
          body: photos.length === 1 ? '1 progress photo' : `${photos.length} progress photos`,
          note: `Latest ${shortDate(photos[0].takenAt)}`,
          recorded: true,
        }
      : { key: 'photos', label: 'Progress photos', body: 'No progress photos yet.', recorded: false },
    {
      key: 'timeline',
      label: 'Timeline',
      body: 'What you record in this Journey will appear here, in the order it happened.',
      recorded: false,
    },
    {
      key: 'end',
      label: 'Planned end',
      body: calendarDay(journey.plannedEndDate, true),
      recorded: false,
    },
  ];

  return (
    <View style={styles.container}>
      {stats ? <JourneyStats stats={stats} unit={unit} /> : null}
      <JourneySpine items={items} />
      {showFuture && (weights.length > 0 || photos.length > 0) ? <OverviewFuture data={data} /> : null}
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

/** The 6.3 preview vision — `__DEV__` preview only, never release. */
function OverviewFuture({ data }: { data: JourneyViewData }) {
  const { surfaces } = useTheme();
  const { weights, photos, unit } = data;
  const latest = latestEntry(weights);
  const first = firstEntry(weights);
  const latestPhoto = photos[0] ?? null;

  type Record = { at: string; item: SpineItem };
  const records: Record[] = [
    ...weights.map((entry) => ({
      at: entry.loggedAt,
      item: {
        key: entry.id,
        label: shortDate(entry.loggedAt),
        body: 'Weigh-in',
        detail: `${weightNumber(entry.weightKg, unit)} ${unit}`,
        recorded: true,
      },
    })),
    ...photos.map((photo) => ({
      at: photo.takenAt,
      item: { key: photo.id, label: shortDate(photo.takenAt), body: 'Progress photo', recorded: true },
    })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const earliest = records[records.length - 1];
  const spine: SpineItem[] = records.slice(0, RECENT).map((record) => record.item);
  if (records.length > RECENT) {
    spine.push({
      key: 'began',
      label: shortDate(earliest.at),
      body: 'First record',
      detail: elapsed(earliest.at, records[0].at) + ' ago',
      recorded: true,
    });
  }

  return (
    <View style={styles.future}>
      {latest && first && first !== latest ? (
        <View style={styles.trendBlock}>
          <Text
            style={[styles.change, { color: surfaces.text }]}
            accessibilityLabel={`${spokenChange(first.weightKg, latest.weightKg, unit)} since ${longDate(first.loggedAt)}`}
          >
            {signedChange(first.weightKg, latest.weightKg, unit)}
            <Text style={{ color: surfaces.textSecondary }}>{`  since ${shortDate(first.loggedAt)} · ${elapsed(first.loggedAt, latest.loggedAt)}`}</Text>
          </Text>
          <WeightTrend weights={weights} unit={unit} height={64} labels={false} />
        </View>
      ) : null}

      {latestPhoto ? (
        <View style={styles.section}>
          <SectionHeader title="Latest photo" />
          <View style={styles.photoRow}>
            <PhotoFrame width={84} accessibilityLabel={`Development progress photo placeholder, ${shortDate(latestPhoto.takenAt)}`} />
            <View style={styles.photoMeta}>
              <Text style={[styles.body, { color: surfaces.text }]}>{longDate(latestPhoto.takenAt)}</Text>
              {weightOnDay(weights, latestPhoto.takenAt) ? (
                <Text style={[styles.meta, { color: surfaces.textSecondary }]}>
                  {`${weightNumber(weightOnDay(weights, latestPhoto.takenAt)!.weightKg, unit)} ${unit} recorded that day`}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Journey" />
        <JourneySpine items={spine} />
        <Text style={[styles.meta, { color: surfaces.textTertiary }]}>
          {`${records.length} records since ${longDate(earliest.at)}`}
        </Text>
      </View>
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
  future: {
    gap: spacing.xxl,
  },
  meta: {
    ...typography.caption,
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
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  photoMeta: {
    flex: 1,
    gap: 2,
  },
  body: {
    ...typography.bodyMedium,
  },
});
