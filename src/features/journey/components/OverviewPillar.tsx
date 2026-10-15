import { StyleSheet, Text, View } from 'react-native';
import { latestEntry } from '../../../lib/journey';
import { SectionHeader } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { dateAndTime, elapsed, firstEntry, longDate, shortDate, signedChange, spokenChange, weightNumber, weightOnDay } from '../format';
import type { JourneyViewData } from '../types';
import { JourneySpine, type SpineItem } from './JourneySpine';
import { PhotoFrame } from './PhotoFrame';
import { WeightTrend } from './WeightTrend';

/** How many recent records Overview lists before the "began" anchor. */
const RECENT = 5;

/**
 * Overview — *where am I in my real Journey?*
 *
 * Empty, it states what Journey is made of, on the spine, with hollow nodes:
 * weight, progress photos, and the timeline that will connect them. Nothing
 * is pretended into existence and there is no button.
 *
 * With records it synthesizes only what was recorded: the latest weight, the
 * signed change since the first entry, the line, the latest photo, recent
 * records on the spine, and when the record began.
 */
export function OverviewPillar({ data }: { data: JourneyViewData }) {
  const { weights, photos } = data;
  if (weights.length === 0 && photos.length === 0) return <OverviewEmpty />;
  return <OverviewPopulated data={data} />;
}

function OverviewEmpty() {
  const { surfaces } = useTheme();
  const items: SpineItem[] = [
    { key: 'weight', label: 'Weight', body: 'No weight entries yet.', recorded: false },
    { key: 'photos', label: 'Progress photos', body: 'No progress photos yet.', recorded: false },
    { key: 'timeline', label: 'Timeline', body: 'Your recorded Journey will appear here, in the order it happened.', recorded: false },
  ];
  return (
    <View style={styles.container}>
      <Text style={[styles.intro, { color: surfaces.textSecondary }]}>
        Journey brings together the weight and progress photos you record, so you can look back on how things have
        changed over time.
      </Text>
      <JourneySpine items={items} />
    </View>
  );
}

function OverviewPopulated({ data }: { data: JourneyViewData }) {
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
  const now = records[0].at;
  const spine: SpineItem[] = records.slice(0, RECENT).map((record) => record.item);
  if (records.length > RECENT) {
    spine.push({
      key: 'began',
      label: shortDate(earliest.at),
      body: 'First record',
      detail: elapsed(earliest.at, now) + ' ago',
      recorded: true,
    });
  }

  return (
    <View style={styles.container}>
      {latest ? (
        <View style={styles.hero} accessible accessibilityLabel={`Latest weight ${weightNumber(latest.weightKg, unit)} ${unit === 'lb' ? 'pounds' : 'kilograms'}, ${dateAndTime(latest.loggedAt)}`}>
          <Text style={[styles.caption, { color: surfaces.textTertiary }]}>LATEST WEIGHT</Text>
          <View style={styles.weightRow}>
            <Text style={[styles.weight, { color: surfaces.text }]}>{weightNumber(latest.weightKg, unit)}</Text>
            <Text style={[styles.unit, { color: surfaces.textSecondary }]}>{unit}</Text>
          </View>
          <Text style={[styles.meta, { color: surfaces.textSecondary }]}>{dateAndTime(latest.loggedAt)}</Text>
        </View>
      ) : null}

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
              <Text style={[styles.meta, { color: surfaces.textTertiary }]}>
                {photos.length === 1 ? '1 progress photo' : `${photos.length} progress photos`}
              </Text>
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
  intro: {
    ...typography.body,
    lineHeight: 21,
  },
  hero: {
    gap: 2,
  },
  caption: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  weight: {
    ...typography.display,
    fontSize: 44,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    ...typography.heading,
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
