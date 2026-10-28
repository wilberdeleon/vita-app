import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { journeyProgress, type Journey } from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { dateRange, dayCount, spokenCalendarDay } from '../format';
import { useJourneyAccent } from './useJourneyAccent';

type Props = {
  journey: Journey;
  /** Local calendar day, injected so the preview and tests control time. */
  today: string;
  /** Opens Manage Journey. Omitted in the read-only preview. */
  onManage?: () => void;
  /** Offered on and after the planned end: the user decides, VITA does not. */
  onExtend?: () => void;
  onFinish?: () => void;
};

/**
 * The active Journey's identity — the subject of the screen (slice 6.5).
 *
 * The user's own name for this chapter, then where they are in it **in
 * time**: Day X of Y, the date range, a thin gold rail, and the days left.
 * Progress through the calendar, never through a body: no percentage of a
 * goal, no "on track". The rail is never the only source — every fact it
 * draws is also written and spoken.
 *
 * On and after the planned end the Journey stays active — VITA never ends a
 * chapter for the user — and the line says so plainly.
 */
export function JourneyHeader({ journey, today, onManage, onExtend, onFinish }: Props) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  const progress = journeyProgress(journey, today);
  const range = dateRange(journey.startDate, journey.plannedEndDate);

  const dayLine = progress.endReached
    ? `DAY ${progress.day} · PLANNED ${progress.totalDays}`
    : `DAY ${progress.day} OF ${progress.totalDays}`;
  const spoken =
    `${journey.name}. Day ${progress.day} of ${progress.totalDays}. ` +
    `Journey runs ${spokenCalendarDay(journey.startDate)} through ${spokenCalendarDay(journey.plannedEndDate)}. ` +
    (progress.endReached ? 'Journey end date reached.' : `${dayCount(progress.remainingDays)} remaining.`);

  return (
    <View style={styles.root}>
      <View style={styles.titleRow}>
        <View style={styles.titleText} accessible accessibilityLabel={spoken}>
          <Text style={[styles.day, { color: accent }]}>{dayLine}</Text>
          <Text style={[styles.name, { color: surfaces.text }]} accessibilityRole="header">
            {journey.name}
          </Text>
          <Text style={[styles.range, { color: surfaces.textSecondary }]}>{range}</Text>
        </View>
        {onManage ? (
          <PressableScale
            onPress={onManage}
            style={styles.manage}
            accessibilityRole="button"
            accessibilityLabel="Manage Journey"
            accessibilityHint="Extend or finish this Journey"
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={surfaces.textSecondary} />
          </PressableScale>
        ) : null}
      </View>

      <View
        style={[styles.track, { backgroundColor: surfaces.track }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.fill, { backgroundColor: accent, width: `${Math.round(progress.fraction * 1000) / 10}%` }]} />
      </View>

      <Text style={[styles.meta, { color: surfaces.textTertiary }]} importantForAccessibility="no" accessibilityElementsHidden>
        {progress.endReached ? 'Journey end date reached' : `${dayCount(progress.remainingDays)} remaining`}
      </Text>

      {progress.endReached && onExtend && onFinish ? (
        <View style={styles.endActions}>
          <Text style={[styles.endText, { color: surfaces.textSecondary }]}>
            This Journey stays active until you decide.
          </Text>
          <View style={styles.endButtons}>
            <PressableScale style={[styles.endButton, { borderColor: surfaces.border }]} onPress={onExtend} accessibilityRole="button" accessibilityLabel="Extend Journey">
              <Text style={[styles.endButtonLabel, { color: surfaces.text }]}>Extend</Text>
            </PressableScale>
            <PressableScale style={[styles.endButton, { borderColor: surfaces.border }]} onPress={onFinish} accessibilityRole="button" accessibilityLabel="Finish Journey">
              <Text style={[styles.endButtonLabel, { color: surfaces.text }]}>Finish</Text>
            </PressableScale>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.s,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.m,
  },
  titleText: {
    flex: 1,
    gap: 2,
  },
  day: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  name: {
    ...typography.title,
  },
  range: {
    ...typography.caption,
  },
  manage: {
    padding: spacing.xs,
    marginTop: spacing.m,
  },
  track: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: 3,
    borderRadius: 2,
  },
  meta: {
    ...typography.caption,
  },
  endActions: {
    gap: spacing.s,
    marginTop: spacing.xs,
  },
  endText: {
    ...typography.caption,
  },
  endButtons: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  endButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  endButtonLabel: {
    ...typography.bodyMedium,
  },
});
