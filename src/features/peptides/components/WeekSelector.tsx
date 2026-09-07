import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import type { LogDate } from '../../../lib/daily';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { dateRangeLabel } from '../month';
import { weekLabel } from '../week';

type Props = {
  days: readonly LogDate[];
  offset: number;
  onChange: (offset: number) => void;
  /** Whether stepping forward past this week is allowed. */
  allowFuture?: boolean;
  /**
   * A quiet control on the right of the header — the routine's *Month* link.
   * Deliberately a slot rather than a built-in: the Injection Sites tool uses
   * this same selector and has no month view to offer.
   */
  action?: ReactNode;
};

/**
 * Two arrows and a label — Monday to Sunday, one week at a time.
 *
 * Shared by the routine's week strip and the Injection Sites history so the
 * two cannot disagree about which seven days they are showing, and so
 * "previous week" means the same gesture in both places.
 *
 * **No calendar.** Seeing last week is a normal thing to want; building a
 * month grid to answer it is not, and no date-picker dependency is worth
 * seven days of context.
 *
 * Forward is disabled at the present by default: a routine has no future to
 * report, and a disabled arrow says that more honestly than an empty week.
 *
 * **The dates sit under the label** (slice 5.5A→B). *This week* answers which
 * week relative to now; `Aug 31 – Sep 6` answers which week on a calendar,
 * and someone stepping back three weeks needs the second. It is deliberately
 * quieter than the label above it — context, not the subject.
 */
export function WeekSelector({ days, offset, onChange, allowFuture = false, action }: Props) {
  const { surfaces } = useTheme();
  const atEnd = !allowFuture && offset >= 0;

  return (
    <View style={styles.row}>
      <PressableScale
        onPress={() => onChange(offset - 1)}
        hitSlop={10}
        accessibilityLabel="Previous week"
        style={styles.arrow}
      >
        <Ionicons name="chevron-back" size={18} color={surfaces.textSecondary} />
      </PressableScale>

      {/*
        * Steppable without sight, and without the swipe (slice 5.5D §48).
        *
        * The strip now supports a horizontal drag, which VoiceOver users
        * cannot perform — so the week is *also* an adjustable value here:
        * flick up for the next week, down for the previous, on the element
        * that already announces which week is showing. The arrows either side
        * remain, so there are three ways to move and none of them is the only
        * one.
        */}
      <View
        style={styles.labels}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${weekLabel(days, offset)}, ${dateRangeLabel(days)}`}
        accessibilityActions={[
          { name: 'increment', label: 'Next week' },
          { name: 'decrement', label: 'Previous week' },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'decrement') onChange(offset - 1);
          if (event.nativeEvent.actionName === 'increment' && !atEnd) {
            onChange(allowFuture ? offset + 1 : Math.min(0, offset + 1));
          }
        }}
      >
        <Text style={[styles.label, { color: surfaces.text }]} numberOfLines={1}>
          {weekLabel(days, offset)}
        </Text>
        <Text style={[styles.range, { color: surfaces.textTertiary }]} numberOfLines={1}>
          {dateRangeLabel(days)}
        </Text>
      </View>

      <PressableScale
        onPress={() => onChange(allowFuture ? offset + 1 : Math.min(0, offset + 1))}
        disabled={atEnd}
        hitSlop={10}
        accessibilityLabel="Next week"
        style={[styles.arrow, atEnd && styles.disabled]}
      >
        <Ionicons name="chevron-forward" size={18} color={surfaces.textSecondary} />
      </PressableScale>

      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  arrow: {
    padding: spacing.xs,
    minWidth: 32,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  labels: {
    alignItems: 'center',
    gap: 1,
    flexShrink: 1,
  },
  label: {
    ...typography.captionMedium,
    fontSize: 14.5,
    fontWeight: '600',
  },
  range: {
    ...typography.micro,
    fontSize: 12,
  },
});
