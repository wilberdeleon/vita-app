import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionHeader,
  useToast,
} from '../../../../components/ui';
import { LogRow } from '../../../../features/peptides/components/LogRow';
import { RoutineDaySheet } from '../../../../features/peptides/components/RoutineDaySheet';
import { RoutineDayStrip, type StripDay } from '../../../../features/peptides/components/RoutineDayStrip';
import { TakenSheet } from '../../../../features/peptides/components/TakenSheet';
import { formatClockTime, fromLogDate, type LogDate } from '../../../../lib/daily';
import {
  formatMass,
  routineDayMark,
  routineStateLabel,
  usePeptideContext,
  useResolvedSetup,
  useRoutineWeek,
} from '../../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/** How many recent administrations the detail screen lists before deferring. */
const RECENT_LIMIT = 3;

/**
 * One routine — what it is, what happened today, and what has been recorded.
 *
 * **Opening a routine no longer opens a form** (slice 3.9). It used to land
 * directly inside the full editable Setup screen, which meant the most common
 * reason to tap a peptide — checking on it — was served by the surface
 * designed for the rarest one. Configuration now lives behind *Edit Setup*,
 * and this screen answers the questions people actually arrive with.
 *
 * **Setup is shown as values, not inputs.** `20 mg vial · 2 mL` is what
 * someone wants to confirm at a glance; a column of text fields is what they
 * want only when they are changing something.
 *
 * **Pause and Remove are different actions and are worded as such.** Pausing
 * is reversible and keeps everything. Removing takes the routine out of the
 * lists and keeps every administration ever recorded — which the confirmation
 * says out loud, because that is the fear it has to answer.
 */
export default function RoutineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const resolved = useResolvedSetup(setupId);
  const {
    today,
    logsForSetup,
    markTaken,
    markSkipped,
    clearRoutineDay,
    restoreRoutineDay,
    routineStatusFor,
    setRoutineState,
    removeRoutine,
  } = usePeptideContext();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  /** The day being recorded, when the Taken sheet is open. */
  const [taking, setTaking] = useState<LogDate | null>(null);
  const [openDay, setOpenDay] = useState<StripDay | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const strip = useRoutineWeek(resolved?.setup, weekOffset);

  if (!resolved) {
    return (
      <Screen>
        <ScreenHeader title="Routine" back />
        <EmptyState
          icon="help-circle-outline"
          title="This routine is no longer available"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  const { setup, name, scheduleLabel } = resolved;
  const logs = logsForSetup(setup.id);
  const status = routineStatusFor(setup.id, today);
  const mark = routineDayMark({
    schedule: setup.schedule,
    startDate: setup.startDate,
    logDate: today,
    status,
  });
  const linked = status?.linkedLogId
    ? logs.find((entry) => entry.id === status.linkedLogId)
    : undefined;

  const vialSummary = setup.vial
    ? `${formatMass(setup.vial.authored.amount, setup.vial.authored.unit)} vial${
        setup.reconstitutionMl ? ` · ${setup.reconstitutionMl} mL reconstitution` : ''
      }`
    : 'No vial recorded';

  const change = async () => {
    const removed = await clearRoutineDay(setup.id, today);
    if (!removed) return;
    showToast({
      message: "Today's status cleared",
      actionLabel: 'Undo',
      onAction: () => void restoreRoutineDay(removed.status, removed.log),
    });
  };

  /**
   * Removing asks first, and says what it keeps.
   *
   * The confirmation names the history explicitly because "remove" in a
   * health app reads as "delete my records", and someone who believes that is
   * someone who will keep a routine they no longer want just to be safe.
   */
  const confirmRemove = () => {
    Alert.alert(
      `Remove ${name}?`,
      'This will remove the routine from your tracked peptides. Existing log history will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeRoutine(setup.id);
            showToast({ message: `${name} removed from your routine` });
            router.back();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Routine" back />

      <View style={styles.header}>
        <Text style={[styles.name, { color: surfaces.text }]}>{name}</Text>
        <Text style={[styles.state, { color: surfaces.textSecondary }]}>
          {routineStateLabel(setup.routineState)}
        </Text>
      </View>

      {setup.routineState === 'active' && mark !== 'not-scheduled' ? (
        <>
          <SectionHeader title="Today" />
          <Card style={styles.today}>
            <Text style={[styles.todayState, { color: surfaces.text }]}>
              {mark === 'taken'
                ? `Taken${linked ? ` · ${formatClockTime(linked.loggedAt)}` : ''}`
                : mark === 'skipped'
                  ? 'Skipped'
                  : 'Scheduled today'}
            </Text>

            {/*
              * Two available actions, neither pre-selected — the same rule the
              * Today card follows. A filled Taken button read as *already
              * taken* before anyone touched it.
              */}
            {mark === 'unconfirmed' ? (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => setTaking(today)}
                  accessibilityRole="button"
                  accessibilityLabel={`Record ${name} as taken`}
                  accessibilityState={{ selected: false }}
                  style={[styles.action, { borderColor: palette.peptide, borderWidth: 1 }]}
                >
                  <Text style={[styles.secondaryLabel, { color: palette.peptide }]}>Taken</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await markSkipped(setup.id, today);
                    showToast({ message: 'Skipped today' });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Record ${name} as skipped`}
                  accessibilityState={{ selected: false }}
                  style={[
                    styles.action,
                    { borderColor: surfaces.border, borderWidth: StyleSheet.hairlineWidth },
                  ]}
                >
                  <Text style={[styles.secondaryLabel, { color: surfaces.textSecondary }]}>
                    Skipped
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => void change()}
                accessibilityRole="button"
                accessibilityLabel="Change today's status"
                hitSlop={8}
                style={styles.change}
              >
                <Text style={[styles.changeLabel, { color: palette.peptide }]}>Change</Text>
              </Pressable>
            )}
          </Card>
        </>
      ) : null}

      {/*
        * What the routine *is*, in the order someone asks it: how much, how
        * often, and whether they asked to be reminded. Vial preparation is
        * real but secondary — it belongs with editing, not with the daily
        * question.
        */}
      <SectionHeader title="Routine" />
      <Card style={styles.panel}>
        {setup.routineAmount ? (
          <SummaryRow
            label="Amount"
            value={`${setup.routineAmount.authored.amount} ${setup.routineAmount.authored.unit}`}
          />
        ) : null}
        <SummaryRow label="Schedule" value={scheduleLabel ?? 'Not set'} />
        {setup.reminder?.enabled && setup.reminder.timeLocal ? (
          <SummaryRow label="Reminder" value={setup.reminder.timeLocal} />
        ) : null}
        {setup.startDate ? <SummaryRow label="Started" value={setup.startDate} /> : null}
        {/* Seven days, shape and text — never colour alone. */}
      </Card>

      {/*
        * A real Monday-to-Sunday week, with a way to step through weeks.
        *
        * The rolling window it replaces was chronologically correct and
        * unreadable — no week starts on Friday. Navigation is two arrows and
        * a label rather than a calendar screen; seeing last week is a normal
        * thing to want, and building a month grid to answer it is not.
        */}
      {setup.schedule ? (
        <>
          <SectionHeader title="This week" />
          <Card style={styles.weekCard}>
            <View style={styles.weekNav}>
              <Pressable
                onPress={() => setWeekOffset((n) => n - 1)}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
                hitSlop={10}
                style={styles.weekArrow}
              >
                <Ionicons name="chevron-back" size={18} color={surfaces.textSecondary} />
              </Pressable>
              <Text style={[styles.weekLabel, { color: surfaces.text }]}>
                {weekOffset === 0
                  ? 'This week'
                  : weekOffset === -1
                    ? 'Last week'
                    : weekRangeLabel(strip)}
              </Text>
              <Pressable
                onPress={() => setWeekOffset((n) => Math.min(0, n + 1))}
                accessibilityRole="button"
                accessibilityLabel="Next week"
                disabled={weekOffset >= 0}
                hitSlop={10}
                style={[styles.weekArrow, weekOffset >= 0 && styles.weekArrowDisabled]}
              >
                <Ionicons name="chevron-forward" size={18} color={surfaces.textSecondary} />
              </Pressable>
            </View>
            <RoutineDayStrip
              days={strip}
              selected={openDay?.logDate}
              today={today}
              onSelectDay={setOpenDay}
            />
          </Card>
        </>
      ) : null}

      <SectionHeader title="Recent history" />
      {logs.length === 0 ? (
        <Text style={[styles.empty, { color: surfaces.textTertiary }]}>
          Nothing recorded yet.
        </Text>
      ) : (
        <View style={styles.stack}>
          {logs.slice(0, RECENT_LIMIT).map((entry) => (
            <LogRow
              key={entry.id}
              entry={entry}
              showDate
              onPress={() => router.push(`/peptides/log/${encodeURIComponent(entry.id)}`)}
            />
          ))}
        </View>
      )}

      <View style={styles.linkRow}>
        <Pressable
          onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/history`)}
          accessibilityRole="button"
          accessibilityLabel="View all history"
          hitSlop={8}
        >
          <Text style={[styles.link, { color: palette.peptide }]}>View All History</Text>
        </Pressable>
        {/* Manual logging stays: backdated entries, unscheduled doses, and
            As Needed routines all need it, and none of them fit Today. */}
        <Pressable
          onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/log`)}
          accessibilityRole="button"
          accessibilityLabel="Add log"
          hitSlop={8}
        >
          <Text style={[styles.link, { color: palette.peptide }]}>Add Log</Text>
        </Pressable>
      </View>

      {/*
        * Setup reads as reference, and its edit affordance is a row.
        *
        * A full-width purple button here competed with Taken and Skipped for
        * the eye, which inverted the hierarchy: changing a vial is occasional,
        * answering today is the daily act. Preferred unit is gone from the
        * summary along with its control.
        */}
      {/*
        * "Preparation", not "Setup" — the vial and water describe how the
        * thing was made up, which is a different question from what the
        * routine is. Editing everything lives under Edit Routine below.
        */}
      <SectionHeader title="Preparation" />
      <Card style={styles.panel}>
        <SummaryRow label="Vial" value={vialSummary} />
      </Card>

      <SectionHeader title="Actions" />
      <Card style={styles.panel}>
        <Pressable
          onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}`)}
          accessibilityRole="button"
          accessibilityLabel="Edit routine"
          style={styles.actionRow}
        >
          <Ionicons name="create-outline" size={18} color={surfaces.textSecondary} />
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>Edit Routine</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            const next = setup.routineState === 'active' ? 'inactive' : 'active';
            await setRoutineState(setup.id, next);
            showToast({ message: next === 'inactive' ? 'Routine paused' : 'Routine resumed' });
          }}
          accessibilityRole="button"
          accessibilityLabel={setup.routineState === 'active' ? 'Pause routine' : 'Resume routine'}
          style={[styles.actionRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border }]}
        >
          <Ionicons
            name={setup.routineState === 'active' ? 'pause-circle-outline' : 'play-circle-outline'}
            size={18}
            color={surfaces.textSecondary}
          />
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>
            {setup.routineState === 'active' ? 'Pause Routine' : 'Resume Routine'}
          </Text>
        </Pressable>

        <Pressable
          onPress={confirmRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name} from your routine`}
          style={[styles.actionRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border }]}
        >
          <Ionicons name="trash-outline" size={18} color={palette.fat} />
          <Text style={[styles.actionLabel, { color: palette.fat }]}>Remove from Routine</Text>
        </Pressable>
      </Card>

      {/*
       * The strip is a control surface over the same routine-day state the
       * Today card writes — not a second source of truth. Every action here
       * calls the same provider operations.
       */}
      {openDay ? (
        <RoutineDaySheet
          visible
          logDate={openDay.logDate}
          mark={openDay.mark}
          when={openDay.logDate === today ? 'today' : openDay.logDate < today ? 'past' : 'future'}
          logs={logs.filter((entry) => entry.logDate === openDay.logDate)}
          onClose={() => setOpenDay(null)}
          onTaken={() => {
            const day = openDay.logDate;
            setOpenDay(null);
            setTaking(day);
          }}
          onSkipped={async () => {
            await markSkipped(setup.id, openDay.logDate);
            setOpenDay(null);
            showToast({ message: 'Marked skipped' });
          }}
          onClear={async () => {
            const removed = await clearRoutineDay(setup.id, openDay.logDate);
            setOpenDay(null);
            if (!removed) return;
            showToast({
              message: 'Status cleared',
              actionLabel: 'Undo',
              onAction: () => void restoreRoutineDay(removed.status, removed.log),
            });
          }}
          onOpenLog={(entryId) => {
            setOpenDay(null);
            router.push(`/peptides/log/${encodeURIComponent(entryId)}`);
          }}
        />
      ) : null}

      {taking ? (
        <TakenSheet
          visible
          name={name}
          setup={setup}
          logDate={taking}
          isToday={taking === today}
          history={logs}
          onCancel={() => setTaking(null)}
          onConfirm={async (draft) => {
            setTaking(null);
            const entry = await markTaken(setup.id, draft);
            showToast({
              message: entry ? 'Recorded' : "We couldn't save that. Nothing was recorded.",
            });
          }}
        />
      ) : null}
    </Screen>
  );
}

/** "12 – 18 May", for a week that is neither this one nor last. */
function weekRangeLabel(days: readonly { logDate: string }[]): string {
  if (days.length === 0) return '';
  const short = (value: string) => {
    const date = fromLogDate(value as never);
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
  };
  return `${short(days[0].logDate)} – ${short(days[days.length - 1].logDate)}`;
}

/** One label-and-value line. Setup reads as facts here, not as a form. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  const { surfaces } = useTheme();
  return (
    <View style={styles.summaryRow} accessible accessibilityRole="text" accessibilityLabel={`${label}. ${value}`}>
      <Text style={[styles.summaryLabel, { color: surfaces.textTertiary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: surfaces.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 2,
  },
  name: {
    ...typography.title,
  },
  state: {
    ...typography.caption,
  },
  today: {
    gap: spacing.m,
  },
  todayState: {
    ...typography.bodyMedium,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.control,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  secondaryLabel: {
    ...typography.bodyMedium,
  },
  change: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  changeLabel: {
    ...typography.caption,
  },
  panel: {
    paddingVertical: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingVertical: spacing.s,
  },
  summaryLabel: {
    ...typography.caption,
  },
  summaryValue: {
    ...typography.body,
    flexShrink: 1,
    textAlign: 'right',
  },
  weekCard: {
    gap: spacing.m,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekArrow: {
    padding: spacing.xs,
  },
  weekArrowDisabled: {
    opacity: 0.3,
  },
  weekLabel: {
    ...typography.captionMedium,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  editLabel: {
    ...typography.body,
  },
  stripWrap: {
    paddingTop: spacing.s,
    paddingBottom: spacing.xs,
  },
  stack: {
    gap: spacing.s,
  },
  empty: {
    ...typography.caption,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    ...typography.caption,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  actionLabel: {
    ...typography.body,
  },
});
