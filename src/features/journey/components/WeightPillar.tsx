import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { latestEntry } from '../../../lib/journey';
import { SectionHeader } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { dateAndTime, firstEntry, longDate, shortDate, signedChange, spokenChange, weightNumber } from '../format';
import type { JourneyViewData } from '../types';
import { useJourneyAccent } from './useJourneyAccent';
import { WeightTrend } from './WeightTrend';

/**
 * Weight — the measurable body-weight history.
 *
 * Empty: what belongs here, said once, with no button (logging is 6.4), no
 * chart, no delta and no goal. Populated: the latest weight as the screen's
 * subject, the signed change since the first entry, the line, then every
 * entry — read-only until 6.4 adds editing.
 */
export function WeightPillar({ data }: { data: JourneyViewData }) {
  if (data.weights.length === 0) return <WeightEmpty />;
  return <WeightPopulated data={data} />;
}

function WeightEmpty() {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  return (
    <View style={styles.empty}>
      <Ionicons name="scale-outline" size={26} color={accent} accessibilityElementsHidden importantForAccessibility="no" />
      <Text style={[styles.emptyTitle, { color: surfaces.text }]} accessibilityRole="header">
        No weight entries yet
      </Text>
      <Text style={[styles.emptyBody, { color: surfaces.textSecondary }]}>
        Every weigh-in you record is kept here with its date and time — more than one a day included — so you can
        see your weight across the whole Journey.
      </Text>
    </View>
  );
}

function WeightPopulated({ data }: { data: JourneyViewData }) {
  const { surfaces } = useTheme();
  const { weights, unit } = data;
  const latest = latestEntry(weights)!;
  const first = firstEntry(weights)!;
  const unitWord = unit === 'lb' ? 'pounds' : 'kilograms';

  return (
    <View style={styles.container}>
      <View accessible accessibilityLabel={`Latest weight ${weightNumber(latest.weightKg, unit)} ${unitWord}, ${dateAndTime(latest.loggedAt)}`}>
        <View style={styles.weightRow}>
          <Text style={[styles.weight, { color: surfaces.text }]}>{weightNumber(latest.weightKg, unit)}</Text>
          <Text style={[styles.unit, { color: surfaces.textSecondary }]}>{unit}</Text>
        </View>
        <Text style={[styles.meta, { color: surfaces.textSecondary }]}>{dateAndTime(latest.loggedAt)}</Text>
      </View>

      {first !== latest ? (
        <View style={styles.trendBlock}>
          <Text
            style={[styles.change, { color: surfaces.text }]}
            accessibilityLabel={`${spokenChange(first.weightKg, latest.weightKg, unit)} since your first entry on ${longDate(first.loggedAt)}`}
          >
            {signedChange(first.weightKg, latest.weightKg, unit)}
            <Text style={{ color: surfaces.textSecondary }}>{`  since first entry, ${shortDate(first.loggedAt)}`}</Text>
          </Text>
          <WeightTrend weights={weights} unit={unit} height={132} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={`History · ${weights.length} ${weights.length === 1 ? 'entry' : 'entries'}`} />
        <View>
          {weights.map((entry, index) => (
            <View
              key={entry.id}
              accessible
              accessibilityLabel={`${dateAndTime(entry.loggedAt)}, ${weightNumber(entry.weightKg, unit)} ${unitWord}`}
              style={[
                styles.historyRow,
                index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border },
              ]}
            >
              <Text style={[styles.historyDate, { color: surfaces.textSecondary }]}>{dateAndTime(entry.loggedAt)}</Text>
              <Text style={[styles.historyWeight, { color: surfaces.text }]}>
                {`${weightNumber(entry.weightKg, unit)} ${unit}`}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  empty: {
    gap: spacing.s,
    paddingTop: spacing.s,
  },
  emptyTitle: {
    ...typography.heading,
    marginTop: spacing.xs,
  },
  emptyBody: {
    ...typography.body,
    lineHeight: 21,
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
    gap: spacing.s,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: spacing.m,
    paddingVertical: spacing.m,
  },
  historyDate: {
    ...typography.body,
    flexShrink: 1,
  },
  historyWeight: {
    ...typography.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
});
