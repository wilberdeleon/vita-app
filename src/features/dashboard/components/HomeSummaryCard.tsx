import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { CalorieSummary, GoalPillar } from '../types';

type Props = {
  calories: CalorieSummary;
  goals: GoalPillar[];
  streakDays: number;
};

type StatCell = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
};

/**
 * Today's Summary (founders, 2026-07-20 — pixel-accurate reference pass).
 * One unified card, no boxed sub-widgets: a full-width goals row (icon /
 * label / status dot per pillar, no chip or background) under a plain
 * completion count, then a full-width three-metric stats row (Calories
 * Consumed, Calories Remaining, Day Streak — Goals Hit and the percentage
 * badge are gone; the completion count above already covers that). Both
 * rows use equal flex columns with no fixed widths so they scale across
 * iPhone sizes without truncation.
 */
export function HomeSummaryCard({ calories, goals, streakDays }: Props) {
  const { surfaces } = useTheme();
  const remaining = Math.max(0, calories.goal - calories.current);
  const completeCount = goals.filter((goal) => goal.complete).length;

  const stats: StatCell[] = [
    { key: 'consumed', icon: 'flame', value: calories.current.toLocaleString(), label: 'Calories Consumed', color: palette.fat },
    { key: 'remaining', icon: 'restaurant', value: remaining.toLocaleString(), label: 'Calories Remaining', color: palette.primary },
    { key: 'streak', icon: 'calendar-outline', value: `${streakDays}`, label: 'Day Streak', color: palette.peptide },
  ];

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

      <View style={[styles.horizontalDivider, { backgroundColor: surfaces.border }]} />

      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={stat.key} style={styles.statCellWrap}>
            {index > 0 ? <View style={[styles.verticalDivider, { backgroundColor: surfaces.border }]} /> : null}
            <View style={styles.statCell}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: surfaces.text }]} numberOfLines={1}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: surfaces.textTertiary }]}>{stat.label.toUpperCase()}</Text>
            </View>
          </View>
        ))}
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
  horizontalDivider: {
    height: 1,
    marginVertical: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statCellWrap: {
    flex: 1,
    flexDirection: 'row',
  },
  verticalDivider: {
    width: 1,
    marginRight: spacing.l,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.title,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.micro,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
