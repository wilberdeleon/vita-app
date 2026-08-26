import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionHeader,
  useToast,
} from '../../../../components/ui';
import { LogRow } from '../../../../features/peptides/components/LogRow';
import { RoutineDayStrip } from '../../../../features/peptides/components/RoutineDayStrip';
import { TakenSheet } from '../../../../features/peptides/components/TakenSheet';
import { formatClockTime } from '../../../../lib/daily';
import {
  formatMass,
  routineDayMark,
  routineStateLabel,
  usePeptideContext,
  useResolvedSetup,
  useRoutineHistory,
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

  const [taking, setTaking] = useState(false);
  const strip = useRoutineHistory(resolved?.setup, 7);

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

            {mark === 'unconfirmed' ? (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => setTaking(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Record ${name} as taken`}
                  style={[styles.action, { backgroundColor: palette.peptide }]}
                >
                  <Text style={styles.primaryLabel}>Taken</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await markSkipped(setup.id, today);
                    showToast({ message: 'Skipped today' });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Record ${name} as skipped`}
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

      <SectionHeader title="Routine" />
      <Card style={styles.panel}>
        <SummaryRow label="Schedule" value={scheduleLabel ?? 'Not set'} />
        {setup.startDate ? <SummaryRow label="Started" value={setup.startDate} /> : null}
        {/* Seven days, shape and text — never colour alone. */}
        {setup.schedule ? (
          <View style={styles.stripWrap}>
            <RoutineDayStrip days={strip} />
          </View>
        ) : null}
      </Card>

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

      <SectionHeader title="Setup" />
      <Card style={styles.panel}>
        <SummaryRow label="Vial" value={vialSummary} />
        <SummaryRow label="Preferred unit" value={setup.preferredDoseUnit} />
      </Card>

      <Button
        label="Edit Setup"
        color={palette.peptide}
        onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}`)}
      />

      <SectionHeader title="Actions" />
      <Card style={styles.panel}>
        <Pressable
          onPress={async () => {
            const next = setup.routineState === 'active' ? 'inactive' : 'active';
            await setRoutineState(setup.id, next);
            showToast({ message: next === 'inactive' ? 'Routine paused' : 'Routine resumed' });
          }}
          accessibilityRole="button"
          accessibilityLabel={setup.routineState === 'active' ? 'Pause routine' : 'Resume routine'}
          style={styles.actionRow}
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

      {taking ? (
        <TakenSheet
          visible
          name={name}
          setup={setup}
          history={logs}
          onCancel={() => setTaking(false)}
          onConfirm={async (draft) => {
            setTaking(false);
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
  primaryLabel: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
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
