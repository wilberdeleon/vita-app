import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../../../components/ui';
import { JOURNEY_STAGES, getJourneyStage } from '../../../lib/journeyStages';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { JourneySnapshot } from '../types';

type Props = {
  journey: JourneySnapshot;
};

/**
 * Current Journey content — stage/next-stage lookup via the shared
 * JOURNEY_STAGES catalog, timeline, week/percent labels, progress bar.
 * Rendered without its own card wrapper so JourneyCard can wrap it alone
 * (founders, 2026-07-22 — Macros split into its own MacrosCard). The
 * "NEXT: X" label
 * uses adjustsFontSizeToFit (founders, 2026-07-20) since stage names vary
 * in length (Foundation vs. Focus) and the reference screenshot's fixed
 * badge width isn't a pixel spec to copy literally.
 */
export function JourneySection({ journey }: Props) {
  const { surfaces } = useTheme();
  const stage = getJourneyStage(journey.stageId);
  const nextStage = getJourneyStage(journey.nextStageId);

  return (
    <View>
      <Text style={[styles.kicker, { color: surfaces.textTertiary }]}>CURRENT JOURNEY</Text>

      <View style={styles.headerRow}>
        <View style={styles.stageBadge}>
          <Ionicons name={stage.icon} size={22} color={palette.gold} />
        </View>
        <View style={styles.stageText}>
          <Text style={[styles.stageName, { color: surfaces.text }]}>{stage.name}</Text>
          <Text style={styles.stageLevel}>
            LEVEL {stage.order} OF {JOURNEY_STAGES.length}
          </Text>
        </View>
        <View style={styles.nextStage}>
          <Text
            style={[styles.nextLabel, { color: surfaces.textTertiary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            NEXT: {nextStage.name.toUpperCase()}
          </Text>
          <View style={[styles.nextBadge, { borderColor: surfaces.border }]}>
            <Ionicons name={nextStage.icon} size={16} color={surfaces.textTertiary} />
          </View>
        </View>
      </View>

      <View style={styles.timeline}>
        {JOURNEY_STAGES.map((timelineStage, index) => {
          const isCurrent = timelineStage.id === stage.id;
          const isPast = timelineStage.order < stage.order;
          return (
            <View key={timelineStage.id} style={styles.timelineStep}>
              <View
                style={[
                  styles.timelineDot,
                  isCurrent && styles.timelineDotCurrent,
                  isPast && { backgroundColor: palette.gold },
                  !isCurrent && !isPast && { borderWidth: 1, borderColor: surfaces.border },
                ]}
              />
              {index < JOURNEY_STAGES.length - 1 ? (
                <View style={[styles.timelineLine, { backgroundColor: surfaces.border }]} />
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.weekRow}>
        <Text style={[styles.weekLabel, { color: surfaces.textTertiary }]}>
          Week {journey.week} of {journey.totalWeeks}
        </Text>
        <Text style={[styles.weekLabel, { color: surfaces.textTertiary }]}>
          {Math.round(journey.stagePercent * 100)}% through {stage.name}
        </Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <ProgressBar progress={journey.overallPercent} color={palette.gold} height={6} />
        </View>
        <Text style={[styles.progressPercent, { color: surfaces.textTertiary }]}>
          {Math.round(journey.overallPercent * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginBottom: spacing.l,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  stageBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${palette.gold}55`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageText: {
    flex: 1,
    gap: 2,
  },
  stageName: {
    ...typography.heading,
    fontWeight: '700',
  },
  stageLevel: {
    ...typography.captionMedium,
    color: palette.gold,
  },
  nextStage: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    maxWidth: 110,
  },
  nextLabel: {
    ...typography.micro,
  },
  nextBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  timelineStep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineDotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.gold,
  },
  timelineLine: {
    flex: 1,
    height: 1,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  weekLabel: {
    ...typography.caption,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  progressTrack: {
    flex: 1,
  },
  progressPercent: {
    ...typography.captionMedium,
    width: 34,
    textAlign: 'right',
  },
});
