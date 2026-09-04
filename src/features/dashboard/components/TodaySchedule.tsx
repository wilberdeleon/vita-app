import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { routineDayMarkLabel, type RoutineDayMark, type TodayRoutine } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { TYPE } from '../widget';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * One row, as the section needs it.
 *
 * A small view model rather than the domain type, for two reasons: the
 * component has no business knowing what a `ResolvedSetup` is, and a
 * `__DEV__` preview can construct four of these to show the founders what a
 * populated schedule looks like without going anywhere near real data. There
 * is no `time` field, and that is the point — see below.
 */
export type ScheduleItem = {
  id: string;
  name: string;
  /** The user's own configured amount, e.g. `1 mg`. Never a recommendation. */
  amount: string | null;
  mark: RoutineDayMark;
  onOpen: () => void;
};

/** Maps today's routines into rows. The only production source. */
export function scheduleItemsFromRoutines(today: readonly TodayRoutine[]): ScheduleItem[] {
  return today.map((item) => ({
    id: item.setup.id,
    name: item.name,
    amount: item.setup.routineAmount
      ? `${item.setup.routineAmount.authored.amount} ${item.setup.routineAmount.authored.unit}`
      : null,
    mark: item.mark,
    onOpen: () => router.push(`/peptides/routine/${encodeURIComponent(item.setup.id)}`),
  }));
}

type Props = {
  items: readonly ScheduleItem[];
  isLoading: boolean;
};

/**
 * Today's Schedule — everything VITA actually knows is happening today.
 *
 * ## Its only source is peptide routines, and that is not an oversight
 *
 * A schedule section can only list things that are *scheduled*, and peptide
 * routines are the sole domain in VITA that carries a day. Water has a daily
 * goal, which is a target rather than an appointment — turning it into
 * "drink at 9am" would be inventing a reminder nobody set. Fuel has meal
 * slots, not meal times. Movement has no domain at all. Each of those would
 * have padded this list at the cost of it being true, which is the one thing
 * a schedule cannot afford to lose.
 *
 * ## There are no times, because there are no times
 *
 * Routines schedule **by day**, not by clock. A setup may carry an optional
 * `reminder.timeLocal`, but that is a notification the user asked for — a
 * different concept from when a dose is due, and rendering it in a schedule
 * column would quietly promote it into one. So rows carry no time, and they
 * are ordered the way the domain already orders routines rather than by an
 * invented clock. When a real scheduled time exists, this is where it goes.
 *
 * ## State is stated, never judged
 *
 * `Scheduled`, `Taken`, `Skipped` — read straight from the domain's own
 * `routineDayMarkLabel`, so this cannot drift from what Peptides says. An
 * unanswered routine reads *Scheduled* and nothing else: it is not late, not
 * missed, and not skipped. Colour marks the state but never carries it alone.
 *
 * Tapping a row opens that routine, where the real Taken flow lives. The
 * logging sheet is not rebuilt here.
 */
export function TodaySchedule({ items, isLoading }: Props) {
  const { surfaces } = useTheme();

  if (isLoading) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: surfaces.textTertiary }]}>TODAY'S SCHEDULE</Text>

      {items.length === 0 ? (
        <Text style={[styles.empty, { color: surfaces.textTertiary }]}>Nothing scheduled today</Text>
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => {
            const amount = item.amount;
            const state = routineDayMarkLabel(item.mark);
            const tint =
              item.mark === 'taken'
                ? palette.peptide
                : item.mark === 'skipped'
                  ? palette.routineSkipped
                  : surfaces.textTertiary;

            return (
              <PressableScale
                key={item.id}
                onPress={item.onOpen}
                accessibilityLabel={`${item.name}${amount ? `, ${amount}` : ''}. ${state}. Opens the routine`}
                style={[
                  styles.row,
                  index > 0 && styles.divided,
                  index > 0 && { borderTopColor: surfaces.border },
                ]}
              >
                {/* A rail rather than a bullet — it reads as a timeline
                    without implying a clock the data does not have. */}
                <View style={[styles.rail, { backgroundColor: tint }]} />

                <View style={styles.text}>
                  <Text style={[styles.name, { color: surfaces.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {amount ? (
                    <Text style={[styles.amount, { color: surfaces.textTertiary }]}>{amount}</Text>
                  ) : null}
                </View>

                {/*
                  * Never shrinks. At a large system text size the routine
                  * name truncates — its full wording survives in the spoken
                  * label above — but the state must stay whole, because it is
                  * the only thing on the row that says what happened.
                  */}
                <Text style={[styles.state, { color: tint }]}>{state}</Text>
              </PressableScale>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.s,
  },
  heading: {
    ...typography.micro,
    fontSize: TYPE.sectionHeading,
    letterSpacing: 0.8,
  },
  empty: {
    ...typography.caption,
    fontSize: TYPE.support,
    paddingVertical: spacing.s,
  },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 48,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rail: {
    width: 3,
    height: 26,
    borderRadius: 2,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.bodyMedium,
    fontSize: TYPE.wideValue,
    fontWeight: '600',
  },
  amount: {
    ...typography.caption,
    fontSize: TYPE.support,
  },
  state: {
    ...typography.captionMedium,
    fontSize: TYPE.support,
    flexShrink: 0,
    textAlign: 'right',
  },
});
