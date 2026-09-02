import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatClockTime, formatLogDateLong, type LogDate } from '../../../lib/daily';
import {
  routineDayMarkLabel,
  type PeptideLogEntry,
  type RoutineDayMark,
} from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  visible: boolean;
  logDate: LogDate;
  mark: RoutineDayMark;
  /** `past`, `today`, or `future`, decided by the caller against its own today. */
  when: 'past' | 'today' | 'future';
  /** Administrations recorded on this date, scheduled or not. */
  logs: readonly PeptideLogEntry[];
  onClose: () => void;
  onTaken: () => void;
  onSkipped: () => void;
  onClear: () => void;
  onOpenLog: (entryId: string) => void;
};

/**
 * One day of a routine, opened from the week strip.
 *
 * **A read-out first, a control second.** It states what the schedule said and
 * what the user answered, and only then offers to change it. Nothing here
 * infers: a day with no answer says *No response*, because VITA was not told.
 *
 * **Future days are informational.** A schedule is a plan, and letting someone
 * mark tomorrow as taken would let the app hold a confirmed administration
 * that has not happened. Planned days show as planned and offer nothing.
 *
 * **Manual logs are shown as themselves.** An administration recorded on a day
 * the schedule never covered is real history, listed here plainly — but it is
 * never dressed up as a planned event that was completed, because it wasn't
 * one.
 *
 * This owns no state. Every action calls back into the same routine-day
 * persistence the Today card uses; the strip is a view over that model, not a
 * second copy of it.
 */
export function RoutineDaySheet({
  visible,
  logDate,
  mark,
  when,
  logs,
  onClose,
  onTaken,
  onSkipped,
  onClear,
  onOpenLog,
}: Props) {
  const { surfaces } = useTheme();

  const scheduled = mark !== 'not-scheduled';
  const answered = mark === 'taken' || mark === 'skipped';
  const canAnswer = scheduled && when !== 'future';

  const context = !scheduled
    ? 'Not scheduled'
    : when === 'future'
      ? 'Scheduled'
      : routineDayMarkLabel(mark);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: surfaces.background }]}>
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={[styles.title, { color: surfaces.text }]}>
              {formatLogDateLong(logDate)}
            </Text>
            <Text style={[styles.status, { color: surfaces.textSecondary }]}>{context}</Text>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
            <Ionicons name="close" size={22} color={surfaces.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          {canAnswer && !answered ? (
            <View style={styles.actions}>
              <Pressable
                onPress={onTaken}
                accessibilityRole="button"
                accessibilityLabel={`Mark ${formatLogDateLong(logDate)} as taken`}
                style={[styles.action, { borderColor: palette.peptide, borderWidth: 1 }]}
              >
                <Text style={[styles.actionLabel, { color: palette.peptide }]}>Mark Taken</Text>
              </Pressable>
              <Pressable
                onPress={onSkipped}
                accessibilityRole="button"
                accessibilityLabel={`Mark ${formatLogDateLong(logDate)} as skipped`}
                style={[
                  styles.action,
                  { borderColor: surfaces.border, borderWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <Text style={[styles.actionLabel, { color: surfaces.textSecondary }]}>
                  Mark Skipped
                </Text>
              </Pressable>
            </View>
          ) : null}

          {canAnswer && answered ? (
            <Pressable
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel={`Clear the status for ${formatLogDateLong(logDate)}`}
              style={[
                styles.action,
                { borderColor: surfaces.border, borderWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <Text style={[styles.actionLabel, { color: palette.peptide }]}>Clear Status</Text>
            </Pressable>
          ) : null}

          {when === 'future' && scheduled ? (
            <Text style={[styles.note, { color: surfaces.textTertiary }]}>
              You can record this on the day.
            </Text>
          ) : null}

          {logs.length > 0 ? (
            <View style={styles.logs}>
              <Text style={[styles.logsHeading, { color: surfaces.textTertiary }]}>
                {logs.length === 1 ? 'RECORDED THIS DAY' : `RECORDED THIS DAY · ${logs.length}`}
              </Text>
              {logs.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => onOpenLog(entry.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Log at ${formatClockTime(entry.loggedAt)}. Opens the entry`}
                  style={[styles.logRow, { borderColor: surfaces.border }]}
                >
                  <Text style={[styles.logText, { color: surfaces.text }]}>
                    {entry.amount.authoredAmount} {entry.amount.authoredUnit}
                    {entry.site ? ` · ${entry.site.label}` : ''}
                  </Text>
                  <Text style={[styles.logTime, { color: surfaces.textTertiary }]}>
                    {formatClockTime(entry.loggedAt)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {!scheduled && logs.length === 0 ? (
            <Text style={[styles.note, { color: surfaces.textTertiary }]}>
              Nothing recorded on this day.
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingBottom: spacing.xxl,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.s,
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.heading,
  },
  status: {
    ...typography.caption,
  },
  body: {
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.s,
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
  note: {
    ...typography.caption,
  },
  logs: {
    gap: spacing.xs,
  },
  logsHeading: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s,
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  logText: {
    ...typography.body,
  },
  logTime: {
    ...typography.caption,
  },
});
