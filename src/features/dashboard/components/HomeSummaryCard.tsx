import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { CalorieSummary, GoalPillar } from '../types';

type Props = {
  calories: CalorieSummary;
  goals: GoalPillar[];
};

/**
 * Today's Summary (founders, 2026-07-22 — final Sprint 1 density pass).
 * One unified card: a full-width goals row (icon / label / status dot per
 * pillar, no chip or background) under the completion count, then a single
 * primary metric — calories remaining — as the card's clear secondary
 * focus. The earlier three-metric row (consumed/remaining/streak) is gone;
 * Day Streak moved to Health Metrics, and Calories Consumed simply isn't
 * shown here anymore — the founder called the three-way split "too many
 * things competing for attention." One number reads at a glance.
 */
export function HomeSummaryCard({ calories, goals }: Props) {
  const { surfaces } = useTheme();
  const remaining = Math.max(0, calories.goal - calories.current);
  const completeCount = goals.filter((goal) => goal.complete).length;

  return (
    <GlassSurface variant="card" radius={radii.glassLarge} padding={spacing.xxl}>
      <View style={styles.kickerRow}>
        <Text style={[styles.kicker, { color: surfaces.textTertiary }]}>TODAY'S SUMMARY</Text>
        <View style={[styles.rule, { backgroundColor: surfaces.border }]} />
      </View>

      <Text style={[styles.completeLabel, { color: surfaces.text }]}>
        {completeCount} OF {goals.length} GOALS COMPLETE
      </Text>

      <View style={styles.goalsRow}>
        {goals.map((goal) => {
          const tint = goal.complete ? goal.color : surfaces.textTertiary;
          return (
            <View key={goal.id} style={styles.goalColumn}>
              <Ionicons name={goal.icon} size={22} color={tint} />
              <Text style={[styles.goalLabel, { color: surfaces.text }]}>{goal.label}</Text>
              <View
                style={[
                  styles.goalDot,
                  goal.complete ? { backgroundColor: goal.color } : { borderWidth: 1, borderColor: surfaces.textTertiary },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.primaryMetric}>
        <Text style={[styles.primaryValue, { color: palette.primary }]} numberOfLines={1}>
          {remaining.toLocaleString()}
        </Text>
        <Text style={[styles.primaryLabel, { color: surfaces.textTertiary }]}>CALORIES REMAINING</Text>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  kicker: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  rule: {
    flex: 1,
    height: 1,
  },
  completeLabel: {
    ...typography.micro,
    letterSpacing: 0.6,
    marginBottom: spacing.l,
  },
  goalsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xxl,
  },
  goalColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.s,
  },
  goalLabel: {
    ...typography.caption,
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  primaryMetric: {
    alignItems: 'center',
  },
  primaryValue: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  primaryLabel: {
    ...typography.micro,
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
});
