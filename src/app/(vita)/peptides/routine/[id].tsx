import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { EmptyState, PressableScale, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { Disclosure } from '../../../../features/peptides/components/Disclosure';
import { RecentActivity } from '../../../../features/peptides/components/RecentActivity';
import { RoutineDaySheet } from '../../../../features/peptides/components/RoutineDaySheet';
import { RoutineDayStrip, type StripDay } from '../../../../features/peptides/components/RoutineDayStrip';
import { RoutineSiteContext } from '../../../../features/peptides/components/RoutineSiteContext';
import { RoutineToday } from '../../../../features/peptides/components/RoutineToday';
import { TakenSheet } from '../../../../features/peptides/components/TakenSheet';
import { WeekSelector } from '../../../../features/peptides/components/WeekSelector';
import { siteLogsForWeek, weekOf } from '../../../../features/peptides/week';
import {
  formatLogDateWithYear,
  formatTimeOfDay,
  type LogDate,
} from '../../../../lib/daily';
import { vitaHaptic } from '../../../../lib/haptics';
import {
  formatMass,
  formatMcg,
  routineDayMark,
  routineStateLabel,
  usePeptideContext,
  useResolvedSetup,
  useRoutineWeek,
} from '../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * One routine — what happened today, what it looks like, and what comes next.
 *
 * ## Slice 5.5: hierarchy, not features
 *
 * **Nothing was removed.** Taken, Skipped, Change, week navigation, history,
 * Add Log, View All History, preparation values, Edit, Pause, Resume and
 * Remove are all still here and still reach the same provider operations.
 * Nothing under `src/lib/peptides/` changed.
 *
 * ## What it replaced
 *
 * Six blocks at equal weight — Today, Routine, This Week, Recent History,
 * Preparation, Actions — each behind its own uppercase `SectionHeader`, four
 * of them inside identical `Card` panels. The founders' review was that the
 * screen read as administrative, and the structure is why: a page where
 * everything is a heading has no answer to *what do I do now?*
 *
 * ## The hierarchy now
 *
 * **Today is the screen.** State, amount, and one decision, directly on the
 * background. Under it the week strip, then the last one or two
 * administrations, then — only when this routine has site-tagged logs — where
 * they landed. Everything after that is disclosed: *Routine details* and
 * *Preparation* each summarise themselves in one line, and *Manage routine*
 * holds Edit, Pause and Remove where they cannot compete with daily tracking.
 *
 * ## What this screen will not do
 *
 * No recommended dose, no protocol, no next-injection suggestion, no
 * adherence score, no site recommendation. *Scheduled today*, never *due*. An
 * unanswered day stays unanswered.
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

  const weekDays = useMemo(() => weekOf(today, weekOffset), [today, weekOffset]);

  const logs = resolved ? logsForSetup(resolved.setup.id) : [];

  /**
   * Where this routine's injections landed in the selected week.
   *
   * Read from each log's stored snapshot, never inferred from the routine's
   * current configuration — a site recorded in March stays where it was
   * recorded even if the vial or the schedule changed since.
   */
  const sitesThisWeek = useMemo(
    () =>
      siteLogsForWeek(logs, weekDays, (entry) => ({
        name: resolved?.name ?? 'Peptide',
        amount: formatMcg(entry.amount.amountMcg, entry.amount.authoredUnit),
      })),
    [logs, weekDays, resolved?.name],
  );
  const siteLogs = useMemo(() => [...sitesThisWeek.values()].flat(), [sitesThisWeek]);

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

  const amountLabel = setup.routineAmount
    ? `${setup.routineAmount.authored.amount} ${setup.routineAmount.authored.unit}`
    : null;

  /** `1 mg · Daily` — enough that most visits never open the section. */
  const routineSummary = [amountLabel, scheduleLabel].filter(Boolean).join(' · ') || 'Not set';

  const vialLabel = setup.vial
    ? formatMass(setup.vial.authored.amount, setup.vial.authored.unit)
    : null;
  const preparationSummary = vialLabel
    ? `${vialLabel} vial${setup.reconstitutionMl ? ` · ${setup.reconstitutionMl} mL` : ''}`
    : 'Not recorded';

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

  const paused = setup.routineState !== 'active';

  return (
    <Screen contentGap={spacing.xl}>
      <ScreenHeader title="Routine" back />

      <View style={styles.header}>
        <Text style={[styles.name, { color: surfaces.text }]}>{name}</Text>
        {/*
          * "Paused", matching Peptides Home and the Pause and Resume controls
          * below. The domain's own label is `Inactive`, which is the state's
          * name in the model rather than the word the product uses — and two
          * words for one state across two screens is how a user learns to
          * distrust both.
          */}
        <Text style={[styles.state, { color: paused ? palette.routineSkipped : surfaces.textSecondary }]}>
          {setup.routineState === 'inactive' ? 'Paused' : routineStateLabel(setup.routineState)}
        </Text>
      </View>

      {setup.routineState === 'active' && mark !== 'not-scheduled' ? (
        <RoutineToday
          name={name}
          mark={mark}
          amountLabel={amountLabel}
          takenAt={linked?.loggedAt}
          onTaken={() => setTaking(today)}
          onSkipped={async () => {
            await markSkipped(setup.id, today);
            vitaHaptic('confirm');
            showToast({ message: 'Skipped today' });
          }}
          onChange={() => void change()}
        />
      ) : null}

      {/*
        * A real Monday-to-Sunday week, direct on the background rather than
        * in a card. The strip is a control surface over the same routine-day
        * state Today writes — not a second source of truth.
        */}
      {setup.schedule ? (
        <View style={styles.week}>
          <WeekSelector days={weekDays} offset={weekOffset} onChange={setWeekOffset} />
          <RoutineDayStrip
            days={strip}
            selected={openDay?.logDate}
            today={today}
            onSelectDay={setOpenDay}
          />
        </View>
      ) : null}

      <RecentActivity
        entries={logs}
        onOpenEntry={(entryId) => router.push(`/peptides/log/${encodeURIComponent(entryId)}`)}
        onViewAll={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/history`)}
        onAdd={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/log`)}
      />

      <RoutineSiteContext logs={siteLogs} onOpenTool={() => router.push('/tools/injection-sites')} />

      {/*
        * What the routine *is*. Two values do not need a permanent panel —
        * the summary line answers the question and the section opens for the
        * rest.
        */}
      <Disclosure title="Routine details" summary={routineSummary}>
        <SummaryRow label="Amount" value={amountLabel ?? 'Not set'} />
        <SummaryRow label="Schedule" value={scheduleLabel ?? 'Not set'} />
        {/* Read back the way the rest of the app speaks, rather than as the
            `09:00` / `2026-08-24` strings they are stored as. */}
        {setup.reminder?.enabled && setup.reminder.timeLocal ? (
          <SummaryRow label="Reminder" value={formatTimeOfDay(setup.reminder.timeLocal)} />
        ) : null}
        {setup.startDate ? (
          <SummaryRow label="Started" value={formatLogDateWithYear(setup.startDate)} />
        ) : null}
      </Disclosure>

      {/*
        * "Preparation", not "Setup" — the vial and water describe how the
        * thing was made up, which is a different question from what the
        * routine is. Collapsed, because it is reference for the rare visit.
        */}
      <Disclosure title="Preparation" summary={preparationSummary}>
        <SummaryRow label="Vial" value={vialLabel ?? 'Not recorded'} />
        <SummaryRow
          label="Reconstitution"
          value={setup.reconstitutionMl ? `${setup.reconstitutionMl} mL` : 'Not recorded'}
        />
      </Disclosure>

      {/*
        * Management, folded away. Editing a vial is occasional; answering
        * today is the daily act, and a full-width purple button here competed
        * with Taken and Skipped for the eye.
        */}
      <Disclosure title="Manage routine">
        <ManageRow
          icon="create-outline"
          label="Edit Routine"
          onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}`)}
        />
        <ManageRow
          icon={paused ? 'play-circle-outline' : 'pause-circle-outline'}
          label={paused ? 'Resume Routine' : 'Pause Routine'}
          onPress={async () => {
            const next = paused ? 'active' : 'inactive';
            await setRoutineState(setup.id, next);
            showToast({ message: next === 'inactive' ? 'Routine paused' : 'Routine resumed' });
          }}
        />
        {/* Destructive, and coloured as such — but at the bottom of a
            collapsed section, where it cannot be reached by accident. */}
        <ManageRow
          icon="trash-outline"
          label="Remove from Routine"
          tone={palette.fat}
          onPress={confirmRemove}
        />
      </Disclosure>

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
            vitaHaptic('confirm');
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
            // Only on a write that landed.
            vitaHaptic(entry ? 'confirm' : 'warn');
            showToast({
              message: entry ? 'Recorded' : "We couldn't save that. Nothing was recorded.",
            });
          }}
        />
      ) : null}
    </Screen>
  );
}

/** One label-and-value line. Configuration reads as facts here, not as a form. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  const { surfaces } = useTheme();
  return (
    <View
      style={styles.summaryRow}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}. ${value}`}
    >
      <Text style={[styles.summaryLabel, { color: surfaces.textTertiary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: surfaces.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function ManageRow({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: string;
  onPress: () => void;
}) {
  const { surfaces } = useTheme();
  const color = tone ?? surfaces.text;
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} style={styles.manageRow}>
      <Ionicons name={icon} size={18} color={tone ?? surfaces.textSecondary} />
      <Text style={[styles.manageLabel, { color }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 2,
  },
  name: {
    ...typography.title,
    fontSize: 26,
  },
  state: {
    ...typography.caption,
    fontSize: 14,
  },
  week: {
    gap: spacing.m,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    fontSize: 14,
  },
  summaryValue: {
    ...typography.body,
    fontSize: 15.5,
    flexShrink: 1,
    textAlign: 'right',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
    minHeight: 44,
  },
  manageLabel: {
    ...typography.body,
    fontSize: 15.5,
  },
});
