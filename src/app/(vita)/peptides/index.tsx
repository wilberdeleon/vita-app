import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, PressableScale, Screen, ScreenHeader, useToast } from '../../../components/ui';
import { ActivityLink } from '../../../features/peptides/components/ActivityLink';
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
          {/*
            * The feature's own mark, and the reason this screen reads as
            * Peptides before a single word is read.
            *
            * It is the **same glyph in the same tinted orb** the approved
            * compact module draws on Home and Fuel — `medical` in
            * `palette.peptide` on a 10% violet ground — at 72pt rather than
            * 40. Larger than an inline icon, deliberately not a hero
            * illustration, and not a new logo: §7 asks for the mark that
            * already exists, and inventing a second one is how a feature ends
            * up with two identities.
            *
            * Decorative: the word `Peptides` is in the header directly above,
            * so announcing this would say it twice.
            */}
          <View
            style={[styles.mark, { backgroundColor: `${palette.peptide}1A` }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons name="medical" size={32} color={palette.peptide} />
          </View>

          <View style={styles.emptyText}>
            <Text style={[styles.emptyTitle, { color: surfaces.text }]}>No routines yet</Text>
            <Text style={[styles.emptyBody, { color: surfaces.textTertiary }]}>
              Add a routine to start tracking your schedule and activity.
            </Text>
          </View>

          {/*
            * The shared action, one step quieter — and the third treatment
            * this button has worn.
            *
            * It began as a full-width saturated violet pill: the largest
            * colour block in the app, on the emptiest screen in it. The
            * 2026-09-13 correction made it `variant="neutral"`, the shared
            * primary that Food Detail's `Add to Dinner` uses. That fixed the
            * violet and traded it for the opposite fault, which the founder
            * named on device: a solid high-contrast fill is the right weight
            * at the end of a flow and far too loud as the only object on a
            * near-black page. A white slab for a violet one.
            *
            * `variant="outline"` is the ruling (§24) — a hairline border, the
            * card colour inside it, the label at full contrast and the violet
            * spent on the plus glyph alone. The same treatment Fuel Home's
            * `Add food` has used since 5.6B, promoted to the shared `Button`
            * so this screen reuses it rather than redrawing it.
            *
            * The wrapper holds `alignSelf`, so the button sizes to its label
            * instead of spanning a screen that has nothing else on it.
            */}
          <View style={styles.ctaCell}>
            <Button
              label="Add to Routine"
              icon="add"
              variant="outline"
              color={palette.peptide}
              onPress={() => {
                vitaHaptic('selection');
                router.push('/peptides/catalog');
              }}
              accessibilityLabel="Add to Routine"
            />
          </View>

          {/*
            * **Before you begin** — the one thing this screen can usefully
            * say that is not a fabricated routine.
            *
            * ## Why it is here and nowhere else
            *
            * Founder direction, §25: on the zero-routine state only. It is
            * first-use context, not a disclaimer to repeat — a note that
            * reappeared above every routine and every dose log would be
            * furniture within a week, and furniture is not read. The
            * condition is `peptides.isEmpty`, the same one that draws this
            * whole block, so it cannot leak into the populated screen.
            *
            * ## What it says, and what it refuses to
            *
            * The copy is the founder's, unchanged. It states two things: VITA
            * is a tracking tool, and a professional should be consulted
            * before starting or changing a routine.
            *
            * It does **not** say *VITA recommends*, does not ask the reader to
            * find out what dose to take, and does not imply that any clinical
            * supervision is built into this app — all three named in §25, and
            * all three would be the app quietly positioning itself as a
            * source of medical advice. VITA records what the user decided
            * with someone qualified. That is the whole claim.
            *
            * ## Why it is not a warning
            *
            * Violet and a hairline, not red and a card. Red is the colour
            * this app uses for genuine errors and nothing else, and a banner
            * would read as *danger* where the intent is *context* (§26). The
            * rule above it groups the note without boxing it.
            */}
          <View style={[styles.note, { borderTopColor: surfaces.border }]}>
            <View style={styles.noteHead}>
              {/* Decorative: the eyebrow beside it says the same thing in
                  words, and an icon announced as "information circle" adds
                  nothing a screen reader needs. */}
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={palette.peptide}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={[styles.noteEyebrow, { color: palette.peptide }]}>Before you begin</Text>
            </View>
            <Text style={[styles.noteBody, { color: surfaces.textTertiary }]}>
              VITA is for tracking. Consult a qualified healthcare professional before starting or
              changing a routine.
            </Text>
          </View>
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

      {/*
        * One destination, added in 5.5C — the month across every routine.
        *
        * Home answers "what is scheduled today, and what can I do about it".
        * It had no answer at all to "what did I actually do in July", which
        * with two routines meant visiting two calendars. Today stays the
        * hero; this sits after the routines, as a row rather than a card.
        */}
      {hasRoutines ? <ActivityLink onPress={() => router.push('/peptides/activity')} /> : null}

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
    /*
     * The upper-middle of the screen, occupied on purpose.
     *
     * Left-aligned, like every other VITA screen, rather than centred: a
     * stack floating in the middle of a black page is the onboarding-splash
     * composition §11 rules out. But it does not sit directly under the
     * header either — that was the "hugs the top-left with the rest of the
     * screen abandoned" half of the same rule, and it is what the founder saw.
     *
     * So the group is dropped a deliberate distance, and given real internal
     * air, so the space that remains below reads as margin rather than as the
     * screen having run out of things to say.
     */
    gap: spacing.xl,
    alignItems: 'flex-start',
    /*
     * 24pt, down from 64.
     *
     * The doubled `xxxl` was there to push a three-element block off the
     * header when there was nothing under it; with the first-use note the
     * composition now reaches down the page on its own, and §23 asks for
     * deliberate rhythm rather than a splash that begins halfway down. The
     * gaps between the pieces are unchanged — mark, moderate, title, small,
     * copy, moderate, action, moderate, note.
     */
    paddingTop: spacing.xxl,
  },
  mark: {
    /*
     * 72pt — the compact module's 40pt mark, scaled for a screen where it is
     * the only object. Large enough to carry the feature's identity on its
     * own, well short of a hero illustration.
     */
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    gap: spacing.xs,
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
  ctaCell: {
    // The button sizes to its label rather than to the empty screen.
    alignSelf: 'flex-start',
  },
  note: {
    /*
     * A rule and some space, not a card.
     *
     * §26 rules out a giant bounded block, and the hairline is what VITA
     * already uses everywhere it groups without enclosing — the macro row on
     * Fuel Home, a section's top edge. Full width because the copy is a
     * sentence and a sentence should not be narrower than the screen it is
     * on.
     */
    alignSelf: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.l,
    gap: spacing.xs,
  },
  noteHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noteEyebrow: {
    ...typography.micro,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  noteBody: {
    ...typography.caption,
    fontSize: 14.5,
  },
  error: {
    ...typography.caption,
  },
});
