import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { formatClockTime } from '../../../lib/daily';
import { routineDayMarkLabel, type TodayRoutine as TodayRoutineModel } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { spokenAmount } from '../spoken';
import { RoutineMark } from './RoutineMark';

type Props = {
  routine: TodayRoutineModel;
  /** When the linked administration was recorded, if there is one. */
  takenAt?: string;
  onTaken: () => void;
  onSkipped: () => void;
  onChange: () => void;
  onOpen: () => void;
};

/**
 * One routine scheduled today — the hero unit of Peptides Home.
 *
 * ## It sits directly on the background, not in a card
 *
 * The 5.3 audit named the problem: Today's card and the management lists
 * below it were the same rounded rectangle, so the one region you can *act*
 * in looked exactly like the two you can only browse. Weight now comes from
 * type size, the mark, and the action pair — not from a container. That is
 * the surface rule this sprint established: a surface has to earn itself.
 *
 * ## "Scheduled today", never "due"
 *
 * A founder rule for the whole sprint, and load-bearing here: a schedule is
 * what the user planned, not an obligation VITA is enforcing. Nothing on this
 * component says missed, late, overdue or behind, nothing is scored, and
 * **an unanswered day is simply unanswered** — never quietly converted to
 * skipped.
 *
 * ## The amount is read back, never recommended
 *
 * `routineAmount` is the user's own configured amount. VITA does not choose
 * doses, suggest protocols or comment on them; it shows what they wrote down
 * so a one-tap confirmation is safe to make.
 *
 * ## Both actions are outlined, and neither is pre-selected
 *
 * **This is a safety decision, not a style one.** A filled *Taken* button
 * read as *already taken* before anyone touched it — the most consequential
 * misreading available on this screen. The feature colour marks *Taken* as
 * the likelier choice without asserting it is the current state, and
 * `accessibilityState.selected` is false on both.
 *
 * Once answered the pair disappears, because leaving them up makes it
 * ambiguous whether the tap registered. What replaces them states what was
 * recorded and offers **Change**, so a mistake is always correctable.
 */
export function TodayRoutine({ routine, takenAt, onTaken, onSkipped, onChange, onOpen }: Props) {
  const { surfaces } = useTheme();
  const answered = routine.mark === 'taken' || routine.mark === 'skipped';

  const amount = routine.setup.routineAmount?.authored;
  const amountLabel = amount ? `${amount.amount} ${amount.unit}` : null;

  const state =
    routine.mark === 'taken'
      ? `Taken${takenAt ? ` · ${formatClockTime(takenAt)}` : ''}`
      : routine.mark === 'skipped'
        ? 'Skipped'
        : 'Scheduled today';

  const stateColor =
    routine.mark === 'taken'
      ? palette.peptide
      : routine.mark === 'skipped'
        ? palette.routineSkipped
        : surfaces.textSecondary;

  /*
   * `5-Amino-1MQ, 1 milligram, scheduled today`. The unit is spelled out
   * because VoiceOver reads `mg` as "em gee", and the state comes from the
   * domain's own label so the spoken and the visible copy cannot drift.
   */
  const spoken = [
    routine.name,
    amount ? spokenAmount(amount.amount, amount.unit) : null,
    routine.mark === 'unconfirmed' ? 'scheduled today' : routineDayMarkLabel(routine.mark),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.item}>
      <PressableScale
        onPress={onOpen}
        accessibilityLabel={spoken}
        accessibilityHint="Opens the routine"
        style={styles.head}
      >
        <RoutineMark mark={routine.mark} size={28} />

        <View style={styles.headText}>
          <Text style={[styles.name, { color: surfaces.text }]} numberOfLines={2}>
            {routine.name}
          </Text>
          <Text style={[styles.state, { color: stateColor }]} numberOfLines={2}>
            {amountLabel ? `${amountLabel} · ` : ''}
            {state}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
      </PressableScale>

      {answered ? (
        <PressableScale
          onPress={onChange}
          hitSlop={8}
          accessibilityLabel={`Change today's status for ${routine.name}`}
          style={styles.change}
        >
          <Text style={[styles.changeLabel, { color: palette.peptide }]}>Change</Text>
        </PressableScale>
      ) : (
        <View style={styles.actions}>
          {/* Wrapped: `PressableScale` applies its style to an inner view, so
              a flex handed to it never reaches this row. Deferred to 5.7. */}
          <View style={styles.slot}>
            <PressableScale
              onPress={onTaken}
              accessibilityLabel={`Mark ${routine.name} as taken`}
              accessibilityState={{ selected: false }}
              style={[styles.action, { borderColor: palette.peptide }]}
            >
              <Text style={[styles.actionLabel, { color: palette.peptide }]}>Taken</Text>
            </PressableScale>
          </View>

          <View style={styles.slot}>
            <PressableScale
              onPress={onSkipped}
              accessibilityLabel={`Mark ${routine.name} as skipped`}
              accessibilityState={{ selected: false }}
              style={[styles.action, { borderColor: surfaces.border }]}
            >
              <Text style={[styles.actionLabel, { color: surfaces.textSecondary }]}>Skipped</Text>
            </PressableScale>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.heading,
    fontSize: 19,
    fontWeight: '600',
  },
  state: {
    ...typography.caption,
    fontSize: 14.5,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  slot: {
    flex: 1,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    paddingVertical: spacing.m,
    // A minimum, never a fixed height — the label has to be able to grow with
    // the system text size.
    minHeight: 46,
  },
  actionLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  change: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    /*
     * Lined up with the routine's name rather than the screen edge — the
     * mark's column plus its gap. At the margin it read as a control
     * belonging to the screen instead of to the routine above it.
     */
    marginLeft: 28 + spacing.m,
  },
  changeLabel: {
    ...typography.captionMedium,
    fontSize: 14.5,
    fontWeight: '600',
  },
});
