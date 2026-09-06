import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { EmptyState, Screen, ScreenHeader } from '../../../../../components/ui';
import {
  compareMonths,
  countMonth,
  earliestKnownMonth,
  markForDay,
  monthGrid,
  monthLabel,
  monthOf,
  shiftMonth,
} from '../../../../../features/peptides/month';
import { formatLogDateLong, fromLogDate, type LogDate } from '../../../../../lib/daily';
import {
  routineDayMarkLabel,
  routineDayMarkSymbol,
  usePeptideContext,
  useResolvedSetup,
  type RoutineDayMark,
} from '../../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../../theme/tokens';
import { useTheme } from '../../../../../theme/ThemeProvider';

const WEEKDAY_HEADINGS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/**
 * One routine, one month — what actually happened, and nothing about whether
 * that was good.
 *
 * ## Historical visibility, not grading
 *
 * There is no percentage here, no denominator, no streak, no average, no best
 * or worst week, no score and no encouragement. The summary is three counts.
 * The founders' framing: someone should be able to look at July and think
 * *I only skipped twice* — VITA does not need to tell them whether twice is a
 * lot.
 *
 * ## Every state comes from the same function the week strip uses
 *
 * `markForDay` is the single source for both, so a day that reads *Taken* in
 * the week cannot read anything else here. Nothing under `src/lib/peptides/`
 * changed; the schedule question is still `isScheduledOn`'s and the day
 * question still `routineDayMark`'s.
 *
 * ## An unscheduled day is blank, and that is the important distinction
 *
 * *No response* means the routine asked and was not answered. A day the
 * schedule never covered asked nothing. They must never look alike — which
 * matters most for an **as-needed** routine, where every day with no log is
 * simply blank. An as-needed routine has nothing to fail to answer.
 *
 * A day before the routine's start date is blank for the same reason.
 *
 * ## How far back it goes
 *
 * The provider keeps a bounded window of recent history warm, and everything
 * from the oldest record it holds is complete. **Before that, nothing is
 * known** — so navigation stops there rather than drawing empty circles that
 * would read as unanswered days. See `earliestKnownMonth`.
 */
export default function MonthlyActivity() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const resolved = useResolvedSetup(setupId);
  const { today, routineStatuses, logs, logsForSetup } = usePeptideContext();
  const { surfaces } = useTheme();

  const [month, setMonth] = useState(() => monthOf(today));

  const currentMonth = monthOf(today);
  const earliest = useMemo(
    () => earliestKnownMonth(routineStatuses, logs, setupId, today),
    [routineStatuses, logs, setupId, today],
  );

  const rows = useMemo(() => monthGrid(month), [month]);
  const counts = useMemo(
    () => (resolved ? countMonth(resolved.setup, routineStatuses, month, today) : null),
    [resolved, routineStatuses, month, today],
  );

  if (!resolved) {
    return (
      <Screen>
        <ScreenHeader title="Monthly activity" back />
        <EmptyState
          icon="help-circle-outline"
          title="This routine is no longer available"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  const { setup, name } = resolved;
  const routineLogs = logsForSetup(setup.id);

  const atEarliest = compareMonths(month, earliest) <= 0;
  const atCurrent = compareMonths(month, currentMonth) >= 0;

  const total = counts ? counts.taken + counts.skipped + counts.noResponse : 0;

  /**
   * Opening a day.
   *
   * One log goes straight to it. Several go to the routine's history, which
   * already lists every entry — building a day sheet for a case the domain
   * allows but rarely produces would be a screen to maintain for nothing.
   * A day with no log opens nothing.
   */
  const openDay = (logDate: LogDate) => {
    const entries = routineLogs.filter((entry) => entry.logDate === logDate);
    if (entries.length === 1) {
      router.push(`/peptides/log/${encodeURIComponent(entries[0].id)}`);
      return;
    }
    if (entries.length > 1) {
      router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/history`);
    }
  };

  return (
    <Screen contentGap={spacing.xl}>
      <ScreenHeader title="Monthly activity" back />

      <Text style={[styles.name, { color: surfaces.textSecondary }]} numberOfLines={2}>
        {name}
      </Text>

      <View style={styles.monthNav}>
        <Pressable
          onPress={() => setMonth((current) => shiftMonth(current, -1))}
          disabled={atEarliest}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={[styles.arrow, atEarliest && styles.disabled]}
        >
          <Ionicons name="chevron-back" size={20} color={surfaces.textSecondary} />
        </Pressable>

        <Text style={[styles.monthLabel, { color: surfaces.text }]}>{monthLabel(month)}</Text>

        <Pressable
          onPress={() => setMonth((current) => shiftMonth(current, 1))}
          disabled={atCurrent}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          style={[styles.arrow, atCurrent && styles.disabled]}
        >
          <Ionicons name="chevron-forward" size={20} color={surfaces.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.calendar}>
        <View style={styles.headingRow}>
          {WEEKDAY_HEADINGS.map((initial, index) => (
            <View key={`${initial}-${index}`} style={styles.headingCell}>
              <Text
                style={[styles.heading, { color: surfaces.textTertiary }]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                {initial}
              </Text>
            </View>
          ))}
        </View>

        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.weekRow}>
            {row.map((logDate, cellIndex) => {
              if (!logDate) return <View key={`blank-${cellIndex}`} style={styles.cell} />;

              const mark = markForDay(setup, routineStatuses, logDate);
              const isToday = logDate === today;
              const hasLog = routineLogs.some((entry) => entry.logDate === logDate);

              return (
                <DayCell
                  key={logDate}
                  logDate={logDate}
                  mark={mark}
                  isToday={isToday}
                  onPress={hasLog ? () => openDay(logDate) : undefined}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/*
        * Three counts, secondary to the calendar. No total, no percentage, no
        * streak, and unscheduled days counted as nothing — they are not a
        * denominator, and there is deliberately nothing to be a fraction of.
        */}
      {counts ? (
        <View
          style={styles.summary}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${monthLabel(month)}: ${counts.taken} taken, ${counts.skipped} skipped, ${counts.noResponse} no response`}
        >
          <SummaryItem label="Taken" value={counts.taken} tone={palette.peptide} />
          <SummaryItem label="Skipped" value={counts.skipped} tone={palette.routineSkipped} />
          <SummaryItem label="No response" value={counts.noResponse} tone={surfaces.textTertiary} />
        </View>
      ) : null}

      {total === 0 ? (
        <Text style={[styles.quiet, { color: surfaces.textTertiary }]}>
          No routine activity this month.
        </Text>
      ) : null}

      {atEarliest ? (
        <Text style={[styles.quiet, { color: surfaces.textTertiary }]}>
          {/* Said out loud rather than implied by a dead arrow — a calendar
              that simply stopped would look broken. */}
          Earlier months aren’t available.
        </Text>
      ) : null}
    </Screen>
  );
}

function DayCell({
  logDate,
  mark,
  isToday,
  onPress,
}: {
  logDate: LogDate;
  mark: RoutineDayMark;
  isToday: boolean;
  onPress?: () => void;
}) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();

  /*
   * The node grows with the text rather than staying 20pt and cropping its
   * own glyph — which is exactly what happened at an accessibility size
   * before this. Scaling the container at the same rate as the type keeps the
   * proportion and needs no `allowFontScaling={false}` on the mark itself.
   */
  const scale = Math.min(Math.max(fontScale, 1), 2);
  const nodeSize = Math.round(20 * scale);

  const scheduled = mark !== 'not-scheduled';
  const taken = mark === 'taken';
  const skipped = mark === 'skipped';

  const ring = taken ? palette.peptide : skipped ? palette.routineSkipped : surfaces.border;
  const fill = taken
    ? `${palette.peptide}26`
    : skipped
      ? `${palette.routineSkipped}1F`
      : 'transparent';
  const glyphColor = taken
    ? palette.peptide
    : skipped
      ? palette.routineSkipped
      : surfaces.textTertiary;

  const spoken = `${formatLogDateLong(logDate)}${isToday ? ', today' : ''}, ${
    scheduled ? routineDayMarkLabel(mark).toLowerCase() : 'not scheduled'
  }`;

  const body = (
    <>
      <View style={styles.dateBlock}>
        <Text
          style={[
            isToday ? styles.dateToday : styles.date,
            {
              color: isToday
                ? surfaces.text
                : scheduled
                  ? surfaces.textSecondary
                  : surfaces.textTertiary,
            },
          ]}
        >
          {fromLogDate(logDate).getDate()}
        </Text>
        {/* Today is an underline, never a ring — the same rule the week strip
            follows, and for the same reason: on an unscheduled day there is
            no node to encircle, and a lone ring reads as a state. */}
        {isToday ? <View style={[styles.todayRule, { backgroundColor: palette.peptide }]} /> : null}
      </View>

      <View style={[styles.nodeSlot, { minHeight: nodeSize + 2 }]}>
        {/* An unscheduled day draws no node at all — a faint circle would
            read as "nothing recorded", which is a different claim. */}
        {scheduled ? (
          <View
            style={[
              styles.node,
              {
                width: nodeSize,
                height: nodeSize,
                borderRadius: nodeSize / 2,
                borderColor: ring,
                backgroundColor: fill,
              },
            ]}
          >
            <Text style={[styles.glyph, { color: glyphColor }]}>{routineDayMarkSymbol(mark)}</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.cell} accessible accessibilityRole="text" accessibilityLabel={spoken}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={styles.cell}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint="Opens what was recorded"
    >
      {body}
    </Pressable>
  );
}

function SummaryItem({ label, value, tone }: { label: string; value: number; tone: string }) {
  const { surfaces } = useTheme();
  return (
    <View
      style={styles.summaryItem}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.summaryValue, { color: surfaces.text }]}>{value}</Text>
      <View style={styles.summaryLabelRow}>
        <View style={[styles.summaryDot, { backgroundColor: tone }]} />
        <Text style={[styles.summaryLabel, { color: surfaces.textTertiary }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  name: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    marginTop: -spacing.s,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  arrow: {
    padding: spacing.xs,
    minWidth: 36,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  monthLabel: {
    ...typography.heading,
    fontSize: 19,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  calendar: {
    gap: spacing.xs,
  },
  headingRow: {
    flexDirection: 'row',
  },
  headingCell: {
    flex: 1,
    alignItems: 'center',
  },
  heading: {
    ...typography.micro,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  weekRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    // A minimum, never a height — a date and a node both grow with the
    // system text size, and the grid has to grow with them.
    minHeight: 46,
    paddingVertical: spacing.xs,
  },
  date: {
    ...typography.caption,
    fontSize: 13,
  },
  dateToday: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '700',
  },
  nodeSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBlock: {
    alignItems: 'center',
    gap: 2,
  },
  todayRule: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  node: {
    // Size is applied inline — it tracks the system text scale.
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    ...typography.micro,
    fontSize: 11,
  },
  summary: {
    flexDirection: 'row',
    gap: spacing.l,
  },
  summaryItem: {
    gap: 2,
  },
  summaryValue: {
    ...typography.heading,
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryLabel: {
    ...typography.caption,
    fontSize: 13.5,
    flexShrink: 1,
  },
  quiet: {
    ...typography.caption,
    fontSize: 14,
  },
});
