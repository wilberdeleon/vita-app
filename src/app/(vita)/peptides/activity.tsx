import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { EmptyState, PressableScale, Screen, ScreenHeader } from '../../../components/ui';
import { MonthSummary } from '../../../features/peptides/components/MonthSummary';
import {
  countAllRoutines,
  monthActivityByDay,
  spokenDayActivity,
  type DayActivity,
  type RoutineEvent,
} from '../../../features/peptides/allRoutines';
import {
  compareMonths,
  monthGrid,
  monthLabel,
  monthOf,
  shiftMonth,
  type MonthKey,
} from '../../../features/peptides/month';
import { useMonthHistory } from '../../../features/peptides/useMonthActivity';
import {
  formatClockTime,
  formatLogDateLong,
  fromLogDate,
  type LogDate,
} from '../../../lib/daily';
import {
  formatMcg,
  formatSyringeUnits,
  routineDayMarkLabel,
  usePeptideContext,
  usePeptides,
  type PeptideLogEntry,
  type ResolvedSetup,
} from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

const WEEKDAY_HEADINGS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/** How many marks a cell draws before it stops drawing them individually. */
const MAX_MARKS = 4;

/**
 * Every routine, one month — *what did I log across all of this?*
 *
 * ## Why this exists alongside the per-routine calendar
 *
 * A routine's own month answers "how has this one gone". With two or three
 * running, nobody wants to visit three calendars to answer "what did I
 * actually do in July". This is the same month, read once, with every
 * routine's answers on it.
 *
 * The header says **All routines** so the two are never confused, and the
 * per-routine view keeps its routine's name in the same place.
 *
 * ## A day is not reduced to one state
 *
 * Two taken and one skipped draws three marks, not one blended square and
 * certainly not a pie chart. The founder's §38 warning is the whole design
 * constraint: picking a "dominant" state for a day would be VITA inventing a
 * summary its data does not support. Selecting the day lists what actually
 * happened, by routine, from the stored records.
 *
 * ## Schedule semantics are the domain's, unchanged
 *
 * Every mark comes from `markForDay` — the same function the week strip and
 * the single-routine month use. As-needed stays blank without a log, start
 * dates are honoured, paused routines keep their real history, and nothing in
 * `src/lib/peptides/` was touched to build this.
 *
 * ## Loading is 5.5B's, reused
 *
 * One month, one range read, cached per month, cleared on any write. There is
 * no second historical store and no preload: this screen asks the same
 * question of storage that the routine calendar does, through the same hook.
 */
export default function PeptideActivity() {
  const { today } = usePeptideContext();
  const { needsSetup, today: todayRoutines, active, inactive } = usePeptides();
  const { surfaces } = useTheme();

  const [month, setMonth] = useState(() => monthOf(today));
  const [selected, setSelected] = useState<LogDate | null>(null);

  const history = useMonthHistory(month);

  /**
   * Every routine that could have history, paused ones included.
   *
   * A routine someone paused in June was real in June, and dropping it here
   * would quietly rewrite that month. Deduplicated by id because `today` and
   * `active` are two views of one list.
   */
  const routines: ResolvedSetup[] = useMemo(() => {
    const byId = new Map<string, ResolvedSetup>();
    for (const routine of [...todayRoutines, ...active, ...inactive, ...needsSetup]) {
      byId.set(routine.setup.id, routine);
    }
    return [...byId.values()];
  }, [todayRoutines, active, inactive, needsSetup]);

  const rows = useMemo(() => monthGrid(month), [month]);
  const byDay = useMemo(
    () => monthActivityByDay(routines, history.statuses, history.logs, month, today),
    [routines, history.statuses, history.logs, month, today],
  );
  const counts = useMemo(() => countAllRoutines(byDay), [byDay]);

  const currentMonth = monthOf(today);

  /** Switching months clears the selection — see the per-routine view. */
  const goToMonth = (next: MonthKey) => {
    setSelected(null);
    setMonth(next);
  };

  if (routines.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Monthly activity" subtitle="All routines" back />
        <EmptyState
          icon="calendar-outline"
          title="No routines yet"
          body="Once you're tracking something, its history collects here."
        />
      </Screen>
    );
  }

  /*
   * The floor is whatever history exists. Unlike the per-routine view there
   * is no start date to clamp against — the earliest month across *all*
   * routines is exactly the earliest month there is anything to show.
   */
  const floor = history.earliest ?? currentMonth;
  const atEarliest = compareMonths(month, floor) <= 0;
  const atCurrent = compareMonths(month, currentMonth) >= 0;

  const selectedDay = selected ? (byDay.get(selected) ?? null) : null;

  return (
    <Screen contentGap={spacing.xl}>
      <ScreenHeader title="Monthly activity" subtitle="All routines" back />

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
          {history.isLoading ? (
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

              const day = byDay.get(logDate) ?? null;
              return (
                <DayCell
                  key={logDate}
                  logDate={logDate}
                  day={day}
                  isToday={logDate === today}
                  isSelected={selected === logDate}
                  onPress={
                    day
                      ? () => setSelected((current) => (current === logDate ? null : logDate))
                      : undefined
                  }
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* A failed read is not an empty month — see `useMonthActivity`. */}
      {history.error ? (
        <View style={styles.errorRow}>
          <Text style={[styles.quiet, { color: surfaces.textSecondary }]}>{history.error}</Text>
          <PressableScale onPress={history.retry} hitSlop={8} accessibilityLabel="Try again">
            <Text style={[styles.retry, { color: palette.peptide }]}>Try again</Text>
          </PressableScale>
        </View>
      ) : null}

      {selectedDay ? <SelectedDay day={selectedDay} /> : null}

      {!history.error ? (
        <MonthSummary counts={counts} caption="Across all your routines" />
      ) : null}
    </Screen>
  );
}

/**
 * One day, with one small mark per routine event.
 *
 * Marks are drawn in a fixed order — taken, skipped, no response — so the
 * same day always looks the same, and a day with more than four events shows
 * four and a count rather than shrinking them until they are invisible.
 */
function DayCell({
  logDate,
  day,
  isToday,
  isSelected,
  onPress,
}: {
  logDate: LogDate;
  day: DayActivity | null;
  isToday: boolean;
  isSelected: boolean;
  onPress?: () => void;
}) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();

  // Scales with the type, for the same reason the per-routine node does: a
  // fixed 8pt dot beside 30pt text reads as dirt on the screen.
  const scale = Math.min(Math.max(fontScale, 1), 2);
  const dotSize = Math.round(7 * scale);

  const tones = day
    ? [
        ...Array<string>(day.taken).fill(palette.peptide),
        ...Array<string>(day.skipped).fill(palette.routineSkipped),
        ...Array<string>(day.noResponse).fill(surfaces.textTertiary),
      ]
    : [];
  const shown = tones.slice(0, MAX_MARKS);
  const overflow = tones.length - shown.length;

  const spoken = `${formatLogDateLong(logDate)}${isToday ? ', today' : ''}${
    day ? `. ${spokenDayActivity(day)}` : ', no activity'
  }${isSelected ? '. Selected' : ''}`;

  const body = (
    <>
      <View style={styles.dateBlock}>
        <Text
          style={[
            isToday ? styles.dateToday : styles.date,
            { color: isToday ? surfaces.text : day ? surfaces.textSecondary : surfaces.textTertiary },
          ]}
        >
          {fromLogDate(logDate).getDate()}
        </Text>
        {/* Today is an underline, never a ring — the rule the week strip and
            the per-routine month both follow. */}
        {isToday ? <View style={[styles.todayRule, { backgroundColor: palette.peptide }]} /> : null}
      </View>

      <View style={[styles.marks, { minHeight: dotSize + 2 }]}>
        {shown.map((tone, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: tone },
            ]}
          />
        ))}
        {overflow > 0 ? (
          <Text style={[styles.overflow, { color: surfaces.textTertiary }]}>+{overflow}</Text>
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
 * What one day held, routine by routine — from the stored records.
 *
 * **Never reconstructed from a routine as it stands now.** A log carries the
 * amount, the time and the site that were true when it was written; the
 * routine may have changed since, and reading today's configuration back as
 * history would be a quiet lie.
 */
function SelectedDay({ day }: { day: DayActivity }) {
  const { surfaces } = useTheme();

  return (
    <View style={[styles.detail, { borderTopColor: surfaces.border }]}>
      <Text style={[styles.detailDate, { color: surfaces.text }]}>
        {formatLogDateLong(day.logDate)}
      </Text>

      {day.events.map((event) => (
        <EventRow key={event.setupId} event={event} />
      ))}
    </View>
  );
}

function EventRow({ event }: { event: RoutineEvent }) {
  const { surfaces } = useTheme();

  const tone =
    event.mark === 'taken'
      ? palette.peptide
      : event.mark === 'skipped'
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
    <View style={styles.event}>
      <Text style={[styles.eventName, { color: surfaces.text }]} numberOfLines={2}>
        {event.name}
      </Text>

      {/* The state, then whatever was actually recorded under it. A skipped
          or unanswered routine says so and stops — no shame language. */}
      <Text style={[styles.eventState, { color: tone }]}>
        {routineDayMarkLabel(event.mark)}
      </Text>

      {event.logs.map((entry) => (
        <Text
          key={entry.id}
          style={[styles.eventLine, { color: surfaces.textSecondary }]}
          numberOfLines={3}
        >
          {describe(entry)}
        </Text>
      ))}

      <PressableScale
        onPress={() => router.push(`/peptides/routine/${encodeURIComponent(event.setupId)}`)}
        hitSlop={8}
        accessibilityLabel={`Open ${event.name}`}
      >
        <Text style={[styles.eventLink, { color: palette.peptide }]}>Open routine</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  monthTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexShrink: 1,
  },
  monthLabel: {
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: '600',
  },
  arrow: {
    padding: spacing.xs,
  },
  disabled: {
    opacity: 0.25,
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
    ...typography.caption,
  },
  weekRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.6,
  },
  dateBlock: {
    alignItems: 'center',
    gap: 2,
  },
  date: {
    ...typography.caption,
  },
  dateToday: {
    ...typography.captionMedium,
  },
  todayRule: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  marks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  dot: {},
  overflow: {
    ...typography.caption,
    fontSize: 10,
  },
  errorRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  quiet: {
    ...typography.caption,
  },
  retry: {
    ...typography.captionMedium,
  },
  detail: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
    gap: spacing.m,
  },
  detailDate: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  event: {
    gap: 2,
  },
  eventName: {
    ...typography.bodyMedium,
  },
  eventState: {
    ...typography.caption,
  },
  eventLine: {
    ...typography.caption,
  },
  eventLink: {
    ...typography.captionMedium,
    marginTop: spacing.xs,
  },
});
