import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, ScreenHeader, useToast } from '../../../components/ui';
import { NeedsSetupNotice } from '../../../features/peptides/components/NeedsSetupNotice';
import { RoutineList } from '../../../features/peptides/components/RoutineList';
import { TakenSheet } from '../../../features/peptides/components/TakenSheet';
import { TodayRoutine } from '../../../features/peptides/components/TodayRoutine';
import { vitaHaptic } from '../../../lib/haptics';
import {
  usePeptideContext,
  usePeptides,
  type ResolvedSetup,
  type TodayRoutine as TodayRoutineModel,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Peptides — what is scheduled today, and what you can do about it.
 *
 * ## Slice 5.4: a presentation and hierarchy redesign
 *
 * **Nothing under `src/lib/peptides/` changed.** Every group on this screen
 * still comes from `usePeptides()` — `today`, `needsSetup`, `active`,
 * `inactive` — and every write still goes through `markTaken`,
 * `markSkipped`, `clearRoutineDay` and `restoreRoutineDay`. This slice
 * regroups what the hook already returns.
 *
 * ## What it replaced
 *
 * Four uppercase section headers over three visually identical card panels.
 * `TODAY`, `NEEDS SETUP`, `ACTIVE` and `INACTIVE` all carried the same
 * weight, so the one region you can *act* in looked exactly like the two you
 * can only browse — the "card soup" the sprint exists to remove, and the
 * reason the screen read as routine-management software.
 *
 * ## The hierarchy now
 *
 * **Today dominates.** Each routine scheduled today sits directly on the
 * background with its name, the user's own amount, its state and — when
 * unanswered — Taken and Skipped, both reachable without navigating anywhere.
 * Unfinished setups collapse to a single notice. Everything else folds into
 * one quieter *Your routines* region, with paused routines behind a count.
 *
 * ## Identity
 *
 * Peptides is not Water in purple. Water is a vessel because hydration is a
 * continuous quantity; Peptides is **discrete scheduled events with a state
 * each**, so its motif is the state mark itself — the tick, dash and open
 * ring the domain settled on in 3.9. Violet marks state and action; the
 * screen is not painted in it, and there is no hero illustration, because
 * Today is the hero.
 *
 * ## What this screen will not do
 *
 * No recommended dose, no protocol, no next-injection suggestion, no
 * adherence percentage, no compliance score, no site recommendation, no
 * urgency. **Nothing is scored.** VITA reflects the routine its user
 * authored; it does not choose treatment. *Scheduled today* — never *due*.
 */
export default function Peptides() {
  const peptides = usePeptides();
  const { today, markTaken, markSkipped, clearRoutineDay, restoreRoutineDay, logsForSetup } =
    usePeptideContext();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [taking, setTaking] = useState<TodayRoutineModel | null>(null);

  const openRoutine = (item: ResolvedSetup) =>
    router.push(`/peptides/routine/${encodeURIComponent(item.setup.id)}`);

  const skip = async (item: TodayRoutineModel) => {
    await markSkipped(item.setup.id, today);
    // One haptic per completed state change. Peptides had none before 5.4;
    // `TakenSheet` fires nothing of its own, so nothing double-fires.
    vitaHaptic('confirm');
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
  const change = async (item: TodayRoutineModel) => {
    const removed = await clearRoutineDay(item.setup.id, today);
    if (!removed) return;
    showToast({
      message: `${item.name} · today cleared`,
      actionLabel: 'Undo',
      onAction: () => void restoreRoutineDay(removed.status, removed.log),
    });
  };

  const scheduled = peptides.today;
  const unanswered = scheduled.filter((item) => item.mark === 'unconfirmed').length;
  const answered = scheduled.length - unanswered;

  /**
   * The header's one factual line.
   *
   * Counts of things that exist, in the sprint's approved vocabulary. No
   * score, no streak, no percentage, and nothing that reads as pressure.
   */
  const summary = peptides.isLoading
    ? null
    : scheduled.length === 0
      ? 'Nothing scheduled today'
      : unanswered === 0
        ? 'All answered'
        : answered > 0
          ? `${unanswered} scheduled today · ${answered} answered`
          : `${unanswered} scheduled today`;

  const hasRoutines = !peptides.isEmpty && !peptides.isLoading;

  return (
    <Screen contentGap={spacing.xl}>
      {/*
        * One way in, in the place the platform puts it. A second `Add`
        * control lower down would be the same action under the same name
        * twice — redundant to read and ambiguous to hear.
        */}
      <ScreenHeader
        title="Peptides"
        back
        action={
          hasRoutines ? (
            <PressableScale
              onPress={() => router.push('/peptides/catalog')}
              hitSlop={10}
              accessibilityLabel="Add to Routine"
              accessibilityHint="Opens the peptide catalog"
            >
              <Ionicons name="add" size={24} color={surfaces.text} />
            </PressableScale>
          ) : undefined
        }
      />

      {peptides.error ? (
        <Text style={[styles.error, { color: palette.fat }]}>{peptides.error}</Text>
      ) : null}

      {/*
        * No routines at all. Purposeful and short — this is not the place to
        * teach the catalog, which is one tap away and explains itself.
        */}
      {peptides.isEmpty && !peptides.isLoading ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: surfaces.text }]}>No routines yet</Text>
          <Text style={[styles.emptyBody, { color: surfaces.textTertiary }]}>
            Add a peptide to start tracking it.
          </Text>
          {/*
            * A filled CTA rather than the shared `Button`, for one reason:
            * `Button` takes no `accessibilityLabel`, and an empty state's
            * single action is the last place to leave a control unnamed.
            * Changing that primitive belongs to a slice that owns it.
            */}
          <PressableScale
            onPress={() => router.push('/peptides/catalog')}
            haptic="selection"
            style={[styles.cta, { backgroundColor: palette.peptide }]}
            accessibilityLabel="Add to Routine"
            accessibilityHint="Opens the peptide catalog"
          >
            <Ionicons name="add" size={18} color={palette.textOnColor} />
            <Text style={[styles.ctaLabel, { color: palette.textOnColor }]}>Add to Routine</Text>
          </PressableScale>
        </View>
      ) : null}

      {hasRoutines && summary ? (
        <Text style={[styles.summary, { color: surfaces.textSecondary }]}>{summary}</Text>
      ) : null}

      {/*
        * Today — the hero region, and the only place a day gets answered.
        * Every scheduled routine renders in full: collapsing three routines
        * into "3 scheduled today" would take away the actions that are the
        * whole point of the screen.
        */}
      {scheduled.length > 0 ? (
        <View style={styles.today}>
          {scheduled.map((item) => (
            <TodayRoutine
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
      ) : null}

      <NeedsSetupNotice
        pending={peptides.needsSetup}
        onOpen={(item) => router.push(`/peptides/setup/${encodeURIComponent(item.setup.id)}`)}
      />

      <RoutineList active={peptides.active} inactive={peptides.inactive} onOpen={openRoutine} />

      {taking ? (
        <TakenSheet
          visible
          name={taking.name}
          setup={taking.setup}
          logDate={today}
          isToday
          history={logsForSetup(taking.setup.id)}
          onCancel={() => setTaking(null)}
          onConfirm={async (draft) => {
            const routine = taking;
            setTaking(null);
            const entry = await markTaken(routine.setup.id, draft);
            // Only on a write that landed — a vibration saying "recorded"
            // over a failed save is worse than none.
            vitaHaptic(entry ? 'confirm' : 'warn');
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
  summary: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    marginTop: -spacing.s,
  },
  today: {
    gap: spacing.xl,
  },
  empty: {
    gap: spacing.m,
    alignItems: 'flex-start',
    paddingTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 20,
    fontWeight: '600',
  },
  emptyBody: {
    ...typography.caption,
    fontSize: 14.5,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    minHeight: 48,
    marginTop: spacing.xs,
  },
  ctaLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    ...typography.caption,
  },
});
