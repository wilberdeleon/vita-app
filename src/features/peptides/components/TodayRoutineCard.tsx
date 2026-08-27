import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { formatClockTime } from '../../../lib/daily';
import { routineDayMarkLabel, type TodayRoutine } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  routine: TodayRoutine;
  /** When the linked administration was recorded, if there is one. */
  takenAt?: string;
  onTaken: () => void;
  onSkipped: () => void;
  onChange: () => void;
  onOpen: () => void;
};

/**
 * One scheduled routine, today.
 *
 * **"Scheduled today", never "due today".** The founders set that rule for
 * the whole sprint and it is load-bearing here: a schedule is what the user
 * planned, not an obligation VITA is enforcing. Nothing on this card says
 * missed, late, or overdue, and an unanswered day is simply unanswered.
 *
 * **The buttons disappear once answered.** Leaving Taken and Skipped sitting
 * there after one was tapped makes it ambiguous whether the tap registered —
 * exactly the doubt the injection-site work had to design out. Answered days
 * show what was recorded and a single Change control.
 */
export function TodayRoutineCard({
  routine,
  takenAt,
  onTaken,
  onSkipped,
  onChange,
  onOpen,
}: Props) {
  const { surfaces } = useTheme();
  const answered = routine.mark === 'taken' || routine.mark === 'skipped';

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${routine.name}. ${routineDayMarkLabel(routine.mark)}. Opens the routine`}
        style={styles.head}
      >
        <View style={styles.headText}>
          <Text style={[styles.name, { color: surfaces.text }]}>{routine.name}</Text>
          <Text style={[styles.meta, { color: surfaces.textTertiary }]}>
            {routine.mark === 'taken'
              ? `Taken${takenAt ? ` · ${formatClockTime(takenAt)}` : ''}`
              : routine.mark === 'skipped'
                ? 'Skipped'
                : 'Scheduled today'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
      </Pressable>

      {answered ? (
        <Pressable
          onPress={onChange}
          accessibilityRole="button"
          accessibilityLabel={`Change today's status for ${routine.name}`}
          hitSlop={8}
          style={styles.change}
        >
          <Text style={[styles.changeLabel, { color: palette.peptide }]}>Change</Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          {/*
           * Two available actions, neither pre-selected.
           *
           * A filled Taken button read as *already taken* before anyone
           * touched it — the most consequential possible misreading on this
           * screen. Both are outlined until the user answers; the accent is
           * carried by Taken's label alone, which marks it as the likely
           * choice without asserting it is the current state.
           */}
          <Pressable
            onPress={onTaken}
            accessibilityRole="button"
            accessibilityLabel={`Record ${routine.name} as taken`}
            accessibilityState={{ selected: false }}
            style={[styles.action, { borderColor: palette.peptide, borderWidth: 1 }]}
          >
            <Text style={[styles.actionLabel, { color: palette.peptide }]}>Taken</Text>
          </Pressable>
          <Pressable
            onPress={onSkipped}
            accessibilityRole="button"
            accessibilityLabel={`Record ${routine.name} as skipped`}
            accessibilityState={{ selected: false }}
            style={[styles.action, { borderColor: surfaces.border, borderWidth: StyleSheet.hairlineWidth }]}
          >
            <Text style={[styles.actionLabel, { color: surfaces.textSecondary }]}>Skipped</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyMedium,
  },
  meta: {
    ...typography.caption,
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
  actionLabel: {
    ...typography.bodyMedium,
  },
  change: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  changeLabel: {
    ...typography.caption,
  },
});
