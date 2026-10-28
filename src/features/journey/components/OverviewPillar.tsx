import { StyleSheet, Text, View } from 'react-native';
import { latestEntry } from '../../../lib/journey';
import { SectionHeader } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import {
  elapsed,
  firstEntry,
  longDate,
  shortDate,
  signedChange,
  spokenChange,
  spokenWeight,
  spokenWhen,
  weightNumber,
  weightOnDay,
  whenLabel,
} from '../format';
import type { JourneyViewData } from '../types';
import { JourneySpine, type SpineItem } from './JourneySpine';
import { PhotoFrame } from './PhotoFrame';
import { WeightTrend } from './WeightTrend';

/** How many recent records the preview's records spine lists. */
const RECENT = 5;

type Props = {
  data: JourneyViewData;
  /**
   * `__DEV__` preview only: the 6.3 vision of what Overview grows into —
   * a trend line, the latest photo, recent records — owned by 6.6 and 6.7.
   * Release never passes it.
   */
  showFuture?: boolean;
};

/**
 * Overview — *where am I in my real Journey?*
 *
 * Always the same three-part spine: Weight, Progress photos, Timeline. Each
 * node is hollow until something real is recorded there. **Since 6.4 the
 * Weight node fills in from real data** — the latest weight and when it was
 * recorded, at body size, not as a hero. Overview is a synthesis; the Weight
 * pillar is where weight gets the screen. Photos stay empty until 6.5, and
 * Timeline until 6.6.
 */
export function OverviewPillar({ data, showFuture = false }: Props) {
  const { surfaces } = useTheme();
  const { weights, photos, unit } = data;
  const latest = latestEntry(weights);

  const items: SpineItem[] = [
    latest
      ? {
          key: 'weight',
          label: 'Weight',
          body: `${weightNumber(latest.weightKg, unit)} ${unit}`,
          note: whenLabel(latest.loggedAt),
          recorded: true,
          accessibilityLabel: `Weight, latest ${spokenWeight(latest.weightKg, unit)}, ${spokenWhen(latest.loggedAt)}`,
        }
      : { key: 'weight', label: 'Weight', body: 'No weight entries yet.', recorded: false },
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
      body: 'Your recorded Journey will appear here, in the order it happened.',
      recorded: false,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.intro, { color: surfaces.textSecondary }]}>
        Journey brings together the weight and progress photos you record, so you can look back on how things have
        changed over time.
      </Text>
      <JourneySpine items={items} />
      {showFuture && (weights.length > 0 || photos.length > 0) ? <OverviewFuture data={data} /> : null}
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
  future: {
    gap: spacing.xxl,
  },
  intro: {
    ...typography.body,
    lineHeight: 21,
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
