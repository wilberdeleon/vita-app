import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { formatClockTime } from '../../../lib/daily';
import type { RoutineDayMark } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { RoutineMark } from './RoutineMark';

type Props = {
  name: string;
  mark: RoutineDayMark;
  /** The user's own configured amount, read back. Never a recommendation. */
  amountLabel: string | null;
  /** When the linked administration was recorded, if there is one. */
  takenAt?: string;
  onTaken: () => void;
  onSkipped: () => void;
  onChange: () => void;
};

/**
 * Today, on the routine screen — the first thing the eye lands on.
 *
 * **The same grammar as Peptides Home**, deliberately: the mark, the amount,
 * the state, and one decision. Someone who answers today from Home and
 * someone who answers it from here should be doing the recognisably same
 * thing, and 5.4's Home is the version the founders approved.
 *
 * It is not the *same component* because the two carry different jobs around
 * it — Home's item is a link into this screen and needs a name and a chevron;
 * here the name is already the page title, and what matters is the state and
 * the action.
 *
 * **Both actions outlined, neither pre-selected.** The safety rule this
 * feature has held since 3.9: a filled *Taken* read as *already taken* before
 * anyone touched it. No swipe, no one-touch shortcut, no shame language, no
 * urgency, and nothing here is scored.
 */
export function RoutineToday({
  name,
  mark,
  amountLabel,
  takenAt,
  onTaken,
  onSkipped,
  onChange,
}: Props) {
  const { surfaces } = useTheme();
  const answered = mark === 'taken' || mark === 'skipped';

  const state =
    mark === 'taken'
      ? `Taken${takenAt ? ` · ${formatClockTime(takenAt)}` : ''}`
      : mark === 'skipped'
        ? 'Skipped'
        : 'Scheduled today';

  const stateColor =
    mark === 'taken'
      ? palette.peptide
      : mark === 'skipped'
        ? palette.routineSkipped
        : surfaces.text;

  return (
    <View style={styles.region}>
      <View
        style={styles.head}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Today. ${amountLabel ? `${amountLabel}. ` : ''}${state}`}
      >
        <RoutineMark mark={mark} size={28} />
        <View style={styles.headText}>
          <Text style={[styles.label, { color: surfaces.textTertiary }]}>Today</Text>
          <Text style={[styles.state, { color: stateColor }]} numberOfLines={2}>
            {amountLabel ? `${amountLabel} · ` : ''}
            {state}
          </Text>
        </View>
      </View>

      {answered ? (
        <PressableScale
          onPress={onChange}
          hitSlop={8}
          accessibilityLabel={`Change today's status for ${name}`}
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
              accessibilityLabel={`Mark ${name} as taken`}
              accessibilityState={{ selected: false }}
              style={[styles.action, { borderColor: palette.peptide }]}
            >
              <Text style={[styles.actionLabel, { color: palette.peptide }]}>Taken</Text>
            </PressableScale>
          </View>
          <View style={styles.slot}>
            <PressableScale
              onPress={onSkipped}
              accessibilityLabel={`Mark ${name} as skipped`}
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
  region: {
    gap: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  headText: {
    flex: 1,
    gap: 1,
  },
  label: {
    ...typography.micro,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  state: {
    ...typography.heading,
    fontSize: 19,
    fontWeight: '600',
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
    marginLeft: 28 + spacing.m,
  },
  changeLabel: {
    ...typography.captionMedium,
    fontSize: 14.5,
    fontWeight: '600',
  },
});
