import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Chip, IconBadge, SectionHeader } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { getJourney, getStage } from '../api';
import { TIME_RANGES } from '../mock';
import { LineChart } from './LineChart';

export function OverviewTab() {
  const journey = getJourney();
  const stage = getStage(journey.stageId);
  const [rangeIndex, setRangeIndex] = useState(1); // 1M
  const { surfaces } = useTheme();

  return (
    <View style={styles.container}>
      <SectionHeader title="Your Journey Stage" />
      <Card style={styles.stageCard}>
        <IconBadge icon={stage.icon} color={palette.journey} size={44} />
        <View style={styles.stageText}>
          <Text style={[styles.stageName, { color: surfaces.text }]}>{stage.name}</Text>
          <Text style={[styles.stageTagline, { color: surfaces.textSecondary }]}>{stage.tagline}</Text>
          <Text style={[styles.stageWeek, { color: surfaces.textTertiary }]}>
            Week {journey.week} of {journey.totalWeeks}
          </Text>
        </View>
      </Card>

      <SectionHeader title="Progress Overview" />
      <Card style={styles.chartCard}>
        <View style={styles.chips}>
          {TIME_RANGES.map((range, index) => (
            <Chip key={range} label={range} selected={index === rangeIndex} onPress={() => setRangeIndex(index)} />
          ))}
        </View>
        <LineChart
          series={[
            { points: journey.trend, color: palette.journey, dots: true },
            { points: journey.previousTrend, color: surfaces.textTertiary },
          ]}
        />
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: palette.journey }]} />
          <Text style={[styles.legendLabel, { color: surfaces.textSecondary }]}>You</Text>
          <View style={[styles.legendDot, { backgroundColor: surfaces.textTertiary }]} />
          <Text style={[styles.legendLabel, { color: surfaces.textSecondary }]}>Last 4 Weeks</Text>
        </View>
      </Card>

      <SectionHeader title="Weekly Milestones" actionLabel="View all" />
      {journey.milestones.map((milestone) => (
        <Card key={milestone.id} style={styles.milestone}>
          <Text style={[styles.milestoneLabel, { color: surfaces.text }]}>{milestone.label}</Text>
          <Text style={[styles.milestoneProgress, { color: surfaces.textTertiary }]}>{milestone.progressLabel}</Text>
          <Ionicons
            name={milestone.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={milestone.done ? palette.success : surfaces.textTertiary}
          />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.l,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  stageText: {
    flex: 1,
    gap: 2,
  },
  stageName: {
    ...typography.heading,
  },
  stageTagline: {
    ...typography.caption,
  },
  stageWeek: {
    ...typography.micro,
  },
  chartCard: {
    gap: spacing.l,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...typography.micro,
    marginRight: spacing.m,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
  },
  milestoneLabel: {
    ...typography.bodyMedium,
    flex: 1,
  },
  milestoneProgress: {
    ...typography.caption,
  },
});
