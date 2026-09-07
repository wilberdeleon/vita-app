import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { EmptyState, PressableScale, Screen, ScreenHeader } from '../../../../../components/ui';
import {
  compareMonths,
  countMonth,
  markForDay,
  monthGrid,
  monthLabel,
  monthOf,
  shiftMonth,
  type MonthKey,
} from '../../../../../features/peptides/month';
import { MonthSummary } from '../../../../../features/peptides/components/MonthSummary';
import { useMonthActivity } from '../../../../../features/peptides/useMonthActivity';
import {
  formatClockTime,
  formatLogDateLong,
  fromLogDate,
  type LogDate,
} from '../../../../../lib/daily';
import {
  formatMcg,
  formatSyringeUnits,
  routineDayMarkLabel,
  routineDayMarkSymbol,
  useResolvedSetup,
  usePeptideContext,
  type PeptideLogEntry,
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
 * ## How far back it goes (slice 5.5B)
 *
 * As far as there is history. 5.5A stopped at the provider's warm window and
 * said so, which was honest but not the product: **every day the user ever
 * recorded is still on disk** — nothing prunes by age, and a day key is only
 * removed when its last record is cleared. The sixty-day limit was always a
 * loading decision.
 *
 * So each month is read on demand for exactly the range it covers, through
 * `useMonthActivity`. Navigation stops at the oldest day any history exists
 * for, which is a fact about the data rather than about what happened to be
 * in memory.
 */
export default function MonthlyActivity() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const resolved = useResolvedSetup(setupId);
  const { today } = usePeptideContext();
  const { surfaces } = useTheme();

  const [month, setMonth] = useState(() => monthOf(today));
  const [selected, setSelected] = useState<LogDate | null>(null);

  const activity = useMonthActivity(setupId, month);

  const currentMonth = monthOf(today);
  const rows = useMemo(() => monthGrid(month), [month]);
  const counts = useMemo(
    () => (resolved ? countMonth(resolved.setup, activity.statuses, month, today) : null),
    [resolved, activity.statuses, month, today],
  );

  /**
   * Switching months clears the selection.
   *
   * Leaving September the 3rd's details showing under August would be a
   * screen describing a day it is no longer about.
   */
  const goToMonth = (next: MonthKey) => {
    setSelected(null);
    setMonth(next);
  };

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
  const routineLogs = activity.logs;

  /*
   * The floor is whatever history actually exists, and the routine's own
   * start month when it is later — there is nothing to see before a routine
   * began. Until the bounds read answers, only the current month is offered.
   */
  const startMonth = setup.startDate ? monthOf(setup.startDate) : null;
  const floor =
    activity.earliest === null
      ? currentMonth
      : startMonth && compareMonths(startMonth, activity.earliest) > 0
        ? startMonth
        : activity.earliest;

  const atEarliest = compareMonths(month, floor) <= 0;
  const atCurrent = compareMonths(month, currentMonth) >= 0;

  const selectedMark = selected ? markForDay(setup, activity.statuses, selected) : null;
  const selectedLogs = selected
    ? routineLogs.filter((entry) => entry.logDate === selected)
    : [];

  /**
   * Tapping a day selects it rather than navigating.
   *
   * 5.5A sent every tap straight to a log, which meant the calendar could
   * only be looked at or left. Selection keeps you on the month and puts the
   * day's facts underneath it; going to the log stays available from there,
   * as a deliberate second step.
   */
  const toggleDay = (logDate: LogDate) =>
    setSelected((current) => (current === logDate ? null : logDate));

  return (
    <Screen contentGap={spacing.xl}>
      <ScreenHeader title="Monthly activity" back />

      <Text style={[styles.name, { color: surfaces.textSecondary }]} numberOfLines={2}>
        {name}
      </Text>

      <View style={styles.monthNav}>
        <Pressable
          onPress={() => goToMonth(shiftMonth(month, -1))}
          disabled={atEarliest}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={[styles.arrow, atEarliest && styles.disabled]}
        >
          <Ionicons name="chevron-back" size={20} color={surfaces.textSecondary} />
        </Pressable>

        <View style={styles.monthTitle}>
          <Text style={[styles.monthLabel, { color: surfaces.text }]}>{monthLabel(month)}</Text>
          {/* Small, beside the title — a month that is still arriving should
              say so without a card or a full-screen spinner. */}
          {activity.isLoading ? (
            <ActivityIndicator size="small" color={surfaces.textTertiary} />
          ) : null}
        </View>

        <Pressable
          onPress={() => goToMonth(shiftMonth(month, 1))}
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

              const mark = markForDay(setup, activity.statuses, logDate);
              const isToday = logDate === today;
              const hasLog = routineLogs.some((entry) => entry.logDate === logDate);
              // A blank day with nothing recorded has nothing to show, so it
              // is not a button — the grid should not feel like 30 controls.
              const selectable = mark !== 'not-scheduled' || hasLog;

              return (
                <DayCell
                  key={logDate}
                  logDate={logDate}
                  mark={mark}
                  isToday={isToday}
                  isSelected={selected === logDate}
                  onPress={selectable ? () => toggleDay(logDate) : undefined}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/*
        * A failed read is not an empty month.
        *
        * Rendering nothing would tell the user this month held nothing, which
        * is a claim about their history that a network of one storage call
        * has not earned.
        */}
      {activity.error ? (
        <View style={styles.errorRow}>
          <Text style={[styles.quiet, { color: surfaces.textSecondary }]}>{activity.error}</Text>
          <PressableScale onPress={activity.retry} hitSlop={8} accessibilityLabel="Try again">
            <Text style={[styles.retry, { color: palette.peptide }]}>Try again</Text>
          </PressableScale>
        </View>
      ) : null}

      {/* Only when a day is chosen — the month opens clean. */}
      {selected && selectedMark ? (
        <SelectedDay
          logDate={selected}
          mark={selectedMark}
          logs={selectedLogs}
          onOpenLog={(entryId) => router.push(`/peptides/log/${encodeURIComponent(entryId)}`)}
          onOpenHistory={() =>
            router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/history`)
          }
        />
      ) : null}

      {/*
        * A section, not three numbers dropped on the page. Three counts and
        * nothing else: no total, no percentage, no streak, and unscheduled
        * days counted as nothing — they are not a denominator, and there is
        * deliberately nothing to be a fraction of.
        */}
      {counts && !activity.error ? <MonthSummary counts={counts} /> : null}
    </Screen>
  );
}

function DayCell({
  logDate,
  mark,
  isToday,
  isSelected,
  onPress,
}: {
  logDate: LogDate;
  mark: RoutineDayMark;
  isToday: boolean;
  isSelected: boolean;
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
  }${isSelected ? ', selected' : ''}`;

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
      /*
       * Selection is its own state, drawn as a ring around the whole cell —
       * never the node's fill or the today underline, both of which already
       * mean something else. A day can be today, taken and selected at once
       * and still read as all three.
       */
      style={({ pressed }) => [
        styles.cell,
        isSelected && { borderColor: surfaces.text },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={spoken}
      accessibilityHint={isSelected ? 'Closes the day' : 'Shows what was recorded'}
    >
      {body}
    </Pressable>
  );
}

/**
 * What one selected day holds — factual, and from the stored snapshot.
 *
 * **Never reconstructed from the routine as it stands now.** A log records
 * the amount, the time and the site that were true when it was written; the
 * routine may have changed a dozen times since, and reading today's
 * configuration back as history would be a quiet lie.
 *
 * No shame language on an unanswered day: it says *No response* and stops.
 */
function SelectedDay({
  logDate,
  mark,
  logs,
  onOpenLog,
  onOpenHistory,
}: {
  logDate: LogDate;
  mark: RoutineDayMark;
  logs: readonly PeptideLogEntry[];
  onOpenLog: (entryId: string) => void;
  onOpenHistory: () => void;
}) {
  const { surfaces } = useTheme();

  const stateLabel = mark === 'not-scheduled' ? 'Not scheduled' : routineDayMarkLabel(mark);
  const tone =
    mark === 'taken'
      ? palette.peptide
      : mark === 'skipped'
        ? palette.routineSkipped
        : surfaces.textSecondary;

  const describe = (entry: PeptideLogEntry) => {
    const amount = formatMcg(entry.amount.amountMcg, entry.amount.authoredUnit);
    const units = entry.calculationSnapshot
      ? formatSyringeUnits(entry.calculationSnapshot.calculatedUnits)
      : null;
    return [amount, units, formatClockTime(entry.loggedAt), entry.site?.label]
      .filter(Boolean)
      .join(' · ');
  };

  return (
    <View style={[styles.detail, { borderTopColor: surfaces.border }]}>
      <Text style={[styles.detailDate, { color: surfaces.text }]}>
        {formatLogDateLong(logDate)}
      </Text>
      <Text style={[styles.detailState, { color: tone }]}>{stateLabel}</Text>

      {logs.length > 1 ? (
        <Text style={[styles.detailCount, { color: surfaces.textTertiary }]}>
          {logs.length} entries
        </Text>
      ) : null}

      {/* Every entry, never just the first — a day with two administrations
          has two, and hiding one would lose real history. */}
      {logs.map((entry) => (
        <Text
          key={entry.id}
          style={[styles.detailLine, { color: surfaces.textSecondary }]}
          numberOfLines={3}
        >
          {describe(entry)}
        </Text>
      ))}

      {logs.length === 1 ? (
        <PressableScale
          onPress={() => onOpenLog(logs[0].id)}
          hitSlop={8}
          accessibilityLabel="View log"
          style={styles.detailLink}
        >
          <Text style={[styles.detailLinkLabel, { color: palette.peptide }]}>View log</Text>
        </PressableScale>
      ) : logs.length > 1 ? (
        <PressableScale
          onPress={onOpenHistory}
          hitSlop={8}
          accessibilityLabel="View history"
          style={styles.detailLink}
        >
          <Text style={[styles.detailLinkLabel, { color: palette.peptide }]}>View history</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

/**
 * One line of the month summary: a coloured marker, a name, a number.
 *
 * Neutral typography dominates — the state colour is a 6pt dot, not a giant
 * tinted figure. Three counts are facts, and facts do not need to shout.
 */
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
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
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
  monthTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  detail: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
    gap: 2,
  },
  detailDate: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  detailState: {
    ...typography.bodyMedium,
    fontSize: 15.5,
  },
  detailCount: {
    ...typography.caption,
    fontSize: 13.5,
  },
  detailLine: {
    ...typography.caption,
    fontSize: 14.5,
  },
  detailLink: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  detailLinkLabel: {
    ...typography.captionMedium,
    fontSize: 14.5,
    fontWeight: '600',
  },
  errorRow: {
    gap: spacing.xs,
  },
  retry: {
    ...typography.captionMedium,
    fontSize: 14.5,
    fontWeight: '600',
  },
  quiet: {
    ...typography.caption,
    fontSize: 14,
  },
});
