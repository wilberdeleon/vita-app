import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Chip, IconBadge, SectionHeader } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import { getJourney, getStage } from '../api';
import { TIME_RANGES } from '../mock';
import { LineChart } from './LineChart';

export function OverviewTab() {
  const journey = getJourney();
  const stage = getStage(journey.stageId);
  const [rangeIndex, setRangeIndex] = useState(1); // 1M

  return (
    <View style={styles.container}>
      <SectionHeader title="Your Journey Stage" />
      <Card style={styles.stageCard}>
        <IconBadge icon={stage.icon} color={palette.journey} size={44} />
        <View style={styles.stageText}>
          <Text style={styles.stageName}>{stage.name}</Text>
          <Text style={styles.stageTagline}>{stage.tagline}</Text>
          <Text style={styles.stageWeek}>
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
            { points: journey.previousTrend, color: palette.textTertiary },
          ]}
        />
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: palette.journey }]} />
          <Text style={styles.legendLabel}>You</Text>
          <View style={[styles.legendDot, { backgroundColor: palette.textTertiary }]} />
          <Text style={styles.legendLabel}>Last 4 Weeks</Text>
        </View>
      </Card>

      <SectionHeader title="Weekly Milestones" actionLabel="View all" />
      {journey.milestones.map((milestone) => (
        <Card key={milestone.id} style={styles.milestone}>
          <Text style={styles.milestoneLabel}>{milestone.label}</Text>
          <Text style={styles.milestoneProgress}>{milestone.progressLabel}</Text>
          <Ionicons
            name={milestone.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={milestone.done ? palette.success : palette.textTertiary}
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
    color: palette.text,
  },
  stageTagline: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  stageWeek: {
    ...typography.micro,
    color: palette.textTertiary,
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
    color: palette.textSecondary,
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
    color: palette.text,
    flex: 1,
  },
  milestoneProgress: {
    ...typography.caption,
    color: palette.textTertiary,
  },
});
