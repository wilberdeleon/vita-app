import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionHeader,
  useToast,
} from '../../../components/ui';
import { TakenSheet } from '../../../features/peptides/components/TakenSheet';
import { TodayRoutineCard } from '../../../features/peptides/components/TodayRoutineCard';
import {
  usePeptideContext,
  usePeptides,
  type ResolvedSetup,
  type TodayRoutine,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Peptides — the user's routines.
 *
 * **Rebuilt around routine states** (slice 3.9). The screen used to be two
 * lists, Active and Inactive, and the daily question — *am I doing this
 * today?* — could only be answered by opening a setup and reading a schedule.
 * Now the top of the screen is today, and everything else is ordered by how
 * much attention it wants: unfinished setup, running routines, paused ones.
 *
 * **Sections vanish when empty** rather than sitting there as headings over
 * nothing. A screen of empty labels reads as broken; a screen that shows only
 * what exists reads as calm.
 *
 * **Nothing is scored.** No adherence, no streak, no percentage, no "missed".
 * A scheduled day the user has not answered says exactly that.
 */
export default function Peptides() {
  const peptides = usePeptides();
  const { today, markTaken, markSkipped, clearRoutineDay, restoreRoutineDay, logsForSetup } =
    usePeptideContext();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [taking, setTaking] = useState<TodayRoutine | null>(null);

  const openRoutine = (item: ResolvedSetup) =>
    router.push(`/peptides/routine/${encodeURIComponent(item.setup.id)}`);

  const skip = async (item: TodayRoutine) => {
    await markSkipped(item.setup.id, today);
    showToast({ message: `${item.name} · skipped today` });
  };

  /**
   * Undoing a day's answer.
   *
   * Offers Undo rather than asking first: the action is one tap, so a
   * confirmation would cost more than the mistake. `clearRoutineDay` hands
   * back what it removed — including the administration a *Taken* created —
   * so restoring puts the whole thing back exactly as it was.
   */
  const change = async (item: TodayRoutine) => {
    const removed = await clearRoutineDay(item.setup.id, today);
    if (!removed) return;
    showToast({
      message: `${item.name} · today cleared`,
      actionLabel: 'Undo',
      onAction: () => void restoreRoutineDay(removed.status, removed.log),
    });
  };

  const hasAnything = !peptides.isEmpty && !peptides.isLoading;

  return (
    <Screen>
      <ScreenHeader title="Peptides" back />

      {peptides.error ? (
        <Text style={[styles.error, { color: palette.fat }]}>{peptides.error}</Text>
      ) : null}

      {peptides.isEmpty && !peptides.isLoading ? (
        <EmptyState
          icon="flask-outline"
          title="No peptides in your routine"
          body="Add one to start tracking it."
        />
      ) : null}

      {peptides.today.length > 0 ? (
        <>
          <SectionHeader title="Today" />
          <View style={styles.stack}>
            {peptides.today.map((item) => (
              <TodayRoutineCard
                key={item.setup.id}
                routine={item}
                takenAt={
                  item.status?.linkedLogId
                    ? logsForSetup(item.setup.id).find(
                        (entry) => entry.id === item.status?.linkedLogId,
                      )?.loggedAt
                    : undefined
                }
                onTaken={() => setTaking(item)}
                onSkipped={() => void skip(item)}
                onChange={() => void change(item)}
                onOpen={() => openRoutine(item)}
              />
            ))}
          </View>
        </>
      ) : null}

      {peptides.needsSetup.length > 0 ? (
        <>
          <SectionHeader title="Needs setup" />
          <Card style={styles.panel}>
            {peptides.needsSetup.map((item, index) => (
              <Pressable
                key={item.setup.id}
                onPress={() => router.push(`/peptides/setup/${encodeURIComponent(item.setup.id)}`)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}. Setup needed. Opens setup`}
                style={[
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border },
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, { color: surfaces.text }]}>{item.name}</Text>
                  {/* Unfinished, not wrong — stated plainly rather than as a
                      warning, because nothing has gone bad here. */}
                  <Text style={[styles.rowMeta, { color: surfaces.textTertiary }]}>Setup needed</Text>
                </View>
                <Text style={[styles.rowAction, { color: palette.peptide }]}>Finish Setup</Text>
                <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
              </Pressable>
            ))}
          </Card>
        </>
      ) : null}

      {peptides.active.length > 0 ? (
        <>
          <SectionHeader title="Active" />
          <Card style={styles.panel}>
            {peptides.active.map((item, index) => (
              <Pressable
                key={item.setup.id}
                onPress={() => openRoutine(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}. ${item.scheduleLabel ?? 'No schedule set'}. Opens the routine`}
                style={[
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border },
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, { color: surfaces.text }]}>{item.name}</Text>
                  <Text style={[styles.rowMeta, { color: surfaces.textTertiary }]}>
                    {item.scheduleLabel ?? 'No schedule set'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
              </Pressable>
            ))}
          </Card>
        </>
      ) : null}

      {hasAnything && peptides.active.length === 0 && peptides.needsSetup.length === 0 ? (
        <EmptyState
          icon="flask-outline"
          title="Nothing active right now"
          body="Your paused routines are below, ready when you are."
        />
      ) : null}

      {/* Secondary by design: a long list of paused routines should never be
          the thing this screen is mostly about. */}
      {peptides.inactive.length > 0 ? (
        <>
          <SectionHeader title="Inactive" />
          <Card style={styles.panel}>
            {peptides.inactive.map((item, index) => (
              <Pressable
                key={item.setup.id}
                onPress={() => openRoutine(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}. Paused. Opens the routine`}
                style={[
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border },
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, { color: surfaces.textSecondary }]}>{item.name}</Text>
                  <Text style={[styles.rowMeta, { color: surfaces.textTertiary }]}>Paused</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
              </Pressable>
            ))}
          </Card>
        </>
      ) : null}

      {/* After the lists, not between them. A full-width button wedged
          between Active and Inactive broke the scan down the routines. */}
      <Button
        label="Add Peptide"
        icon="add"
        color={palette.peptide}
        onPress={() => router.push('/peptides/catalog')}
      />

      <Text style={[styles.footer, { color: surfaces.textTertiary }]}>
        For tracking what you choose to record. VITA doesn't provide dosing or treatment
        recommendations.
      </Text>

      {taking ? (
        <TakenSheet
          visible
          name={taking.name}
          setup={taking.setup}
          history={logsForSetup(taking.setup.id)}
          onCancel={() => setTaking(null)}
          onConfirm={async (draft) => {
            const routine = taking;
            setTaking(null);
            const entry = await markTaken(routine.setup.id, draft);
            showToast({
              message: entry
                ? `${routine.name} · recorded`
                : "We couldn't save that. Nothing was recorded.",
            });
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.s,
  },
  panel: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    ...typography.bodyMedium,
  },
  rowMeta: {
    ...typography.caption,
  },
  rowAction: {
    ...typography.caption,
  },
  error: {
    ...typography.caption,
  },
  footer: {
    ...typography.caption,
    marginTop: spacing.s,
  },
});
