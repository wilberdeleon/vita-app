import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Chip, ListRow, SectionHeader } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import { getJourney } from '../api';
import { TIME_RANGES } from '../mock';
import { LineChart } from './LineChart';
import { WeightBars } from './WeightBars';

export function WeightTab() {
  const journey = getJourney();
  const [rangeIndex, setRangeIndex] = useState(1); // 1M

  return (
    <View style={styles.container}>
      <SectionHeader title="Weight Trend" />
      <Card style={styles.trendCard}>
        <View style={styles.headline}>
          <Text style={styles.weight}>{journey.currentWeight.toFixed(1)} lb</Text>
          <Text style={styles.delta}>
            {journey.deltaLbs} lbs in the last {journey.deltaWeeks} weeks
          </Text>
        </View>
        <View style={styles.chips}>
          {TIME_RANGES.map((range, index) => (
            <Chip key={range} label={range} selected={index === rangeIndex} onPress={() => setRangeIndex(index)} />
          ))}
        </View>
        <WeightBars points={journey.trend} />
      </Card>

      <SectionHeader title="You vs Last 4 Weeks" />
      <Card style={styles.compareCard}>
        <LineChart
          series={[{ points: journey.trend, color: palette.journey, dots: true }]}
          height={110}
        />
        <Text style={styles.encouragement}>
          You dropped {Math.abs(journey.deltaLbs)} lbs. Keep the momentum.
        </Text>
      </Card>

      <SectionHeader title="Stats" />
      <ListRow
        icon="analytics-outline"
        title="Average Weight"
        subtitle={`${journey.stats.average.toFixed(1)} lb`}
        trailing={<DeltaBadge delta={journey.stats.deltaLbs} />}
      />
      <ListRow icon="arrow-down-outline" iconColor={palette.success} title="Lowest Weight" subtitle={`${journey.stats.lowest.toFixed(1)} lb`} chevron />
      <ListRow icon="arrow-up-outline" iconColor={palette.fat} title="Highest Weight" subtitle={`${journey.stats.highest.toFixed(1)} lb`} chevron />
      <ListRow icon="flag-outline" title="Goal Weight" subtitle={`${journey.stats.goal.toFixed(1)} lb`} chevron />
    </View>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const losing = delta < 0;
  return (
    <View style={[styles.badge, { backgroundColor: losing ? palette.journeySoft : palette.track }]}>
      <Ionicons
        name={losing ? 'trending-down' : 'trending-up'}
        size={12}
        color={losing ? palette.journey : palette.textSecondary}
      />
      <Text style={[styles.badgeLabel, { color: losing ? palette.journey : palette.textSecondary }]}>
        {delta} lb
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.l,
  },
  trendCard: {
    gap: spacing.l,
  },
  headline: {
    gap: 2,
  },
  weight: {
    ...typography.title,
    color: palette.text,
  },
  delta: {
    ...typography.captionMedium,
    color: palette.journey,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  compareCard: {
    gap: spacing.m,
  },
  encouragement: {
    ...typography.captionMedium,
    color: palette.journey,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeLabel: {
    ...typography.micro,
  },
});
