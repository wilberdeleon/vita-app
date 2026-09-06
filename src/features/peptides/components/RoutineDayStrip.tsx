import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import {
  routineDayMarkLabel,
  routineDayMarkSymbol,
  type RoutineDayMark,
} from '../../../lib/peptides';
import { formatLogDateLong, fromLogDate, type LogDate } from '../../../lib/daily';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

export type StripDay = { logDate: LogDate; mark: RoutineDayMark };

type Props = {
  days: readonly StripDay[];
  /** The day whose detail is open, if any. Styled apart from any status. */
  selected?: LogDate;
  /** Today, so it can be marked without implying anything was recorded. */
  today: LogDate;
  onSelectDay: (day: StripDay) => void;
};

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/**
 * A week of a routine — readable at a glance, and a control surface.
 *
 * **A real week, Monday to Sunday.** The first version showed a rolling
 * seven days ending today, which produced orders like *Friday → Saturday →
 * Sunday → Monday*: chronologically correct, and unreadable as a calendar,
 * because no week starts on Friday.
 *
 * **A strip, not a calendar application.** It answers "how has this week
 * gone?" and lets you correct a day. A month grid would be a second screen
 * pretending to be a component.
 *
 * **Every cell is a real button** (slice 3.9A). Founder QA read the first
 * version as decoration, which it was. The whole cell is the target — weekday,
 * date and glyph together — rather than a 30pt circle nobody should have to
 * aim at.
 *
 * **Dates, not just letters.** `F S S M T W T` could describe any week in
 * history. The number under each initial says which one.
 *
 * **Colour is added, and carries nothing on its own.** Taken is peptide
 * purple with a tick; skipped is amber with a dash; nothing recorded is a
 * grey outline. The glyph and the accessible sentence say the same thing, so
 * the row survives being unreadable as colour.
 *
 * **Amber for skipped, never red.** Skipping on purpose is a choice, not a
 * failure, and red is the colour this app uses for nothing else here.
 *
 * **Selection and status are styled apart.** The day whose detail is open is
 * marked by its ring; whether it was taken is carried by the glyph and fill.
 * One control, two independent facts — sharing a treatment would make a
 * selected day look taken.
 *
 * **Nothing here is scored.** No percentage, no streak, no good week. A day
 * the user did not answer says *No response*, which is the whole truth.
 *
 * ## The rail (slice 5.5A)
 *
 * The founders' review was that the strip read as sparse rather than
 * deliberately minimal. A hairline rail now runs behind the nodes, joining
 * them into one timeline instead of seven loose circles.
 *
 * **It is calendar structure, not progress.** It is one neutral weight from
 * end to end: it does not fill as days are taken, it does not stop at today,
 * and it carries no proportion of anything. The nodes remain the only thing
 * that means a state. Each node paints over the rail with the screen's own
 * background so the line is interrupted rather than drawn through an open
 * circle.
 *
 * **Today is marked, and marked apart from status.** A short violet underline
 * sits beneath the date — never a ring, and never on the node. A ring was
 * tried first and failed on device for the case that matters: on a day the
 * schedule does not cover there is no node to encircle, so the halo became
 * the only circle in the cell and read as a state of its own. An underline
 * cannot be mistaken for a node, works identically whether or not the day is
 * scheduled, and leaves *today* and *what happened* as the two separate facts
 * they are.
 */
export function RoutineDayStrip({ days, selected, today, onSelectDay }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();

  /* Grows with the text so the mark inside is never cropped — see the month
     grid, where a fixed node clipped its own glyph at an accessibility size. */
  const nodeSize = Math.round(30 * Math.min(Math.max(fontScale, 1), 2));

  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const date = fromLogDate(day.logDate);
        const weekday = WEEKDAY_INITIALS[date.getDay()];
        const taken = day.mark === 'taken';
        const skipped = day.mark === 'skipped';
        const scheduled = day.mark !== 'not-scheduled';
        const isSelected = selected === day.logDate;
        const isToday = day.logDate === today;

        const ring = taken ? palette.peptide : skipped ? palette.routineSkipped : surfaces.border;
        const fill = taken
          ? `${palette.peptide}26`
          : skipped
            ? `${palette.routineSkipped}1F`
            : 'transparent';
        const glyphColor = taken
          ? palette.peptide
          : skipped
            ? palette.routineSkipped
            : surfaces.textTertiary;

        const firstCell = index === 0;
        const lastCell = index === days.length - 1;

        return (
          <Pressable
            key={day.logDate}
            onPress={() => onSelectDay(day)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${formatLogDateLong(day.logDate)}${
              isToday ? ', today' : ''
            }, ${scheduled ? 'scheduled' : 'not scheduled'}, ${routineDayMarkLabel(
              day.mark,
            ).toLowerCase()}`}
            style={[
              styles.cell,
              isSelected && {
                backgroundColor: surfaces.card,
                borderColor: palette.peptide,
              },
            ]}
          >
            <Text style={[styles.weekday, { color: surfaces.textTertiary }]}>{weekday}</Text>
            {/* Today is marked by weight, not by the status palette — using
                the taken colour here would say something was recorded. */}
            <View style={styles.dateBlock}>
              <Text
                style={[
                  isToday ? styles.dateToday : styles.date,
                  { color: isToday ? surfaces.text : surfaces.textSecondary },
                ]}
              >
                {date.getDate()}
              </Text>
              {isToday ? (
                <View style={[styles.todayRule, { backgroundColor: palette.peptide }]} />
              ) : null}
            </View>
            {/*
              * The rail passes through this cell behind the node. Two halves
              * rather than one line across the strip, so it needs no
              * measurement and survives any text size — the outer halves are
              * dropped on the first and last cells so the timeline starts and
              * ends at a node.
              */}
            <View style={styles.nodeRow}>
              <View
                style={[
                  styles.rail,
                  { backgroundColor: firstCell ? 'transparent' : surfaces.border },
                ]}
              />

              <View style={styles.nodeSlot}>
                <View
                  style={[
                    styles.dot,
                    {
                      width: nodeSize,
                      height: nodeSize,
                      borderRadius: nodeSize / 2,
                      borderColor: scheduled ? ring : 'transparent',
                      // Opaque, so the rail is interrupted by the node rather
                      // than drawn through it.
                      backgroundColor: surfaces.background,
                    },
                  ]}
                >
                  {fill !== 'transparent' ? (
                    <View style={[styles.dotFill, { backgroundColor: fill }]} />
                  ) : null}
                  <Text style={[styles.glyph, { color: glyphColor }]}>
                    {routineDayMarkSymbol(day.mark)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.rail,
                  { backgroundColor: lastCell ? 'transparent' : surfaces.border },
                ]}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    /* No gap: the rail halves in adjacent cells have to meet, or the
       timeline reads as seven dashes. The cells carry their own breathing
       room instead. */
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    // A minimum, never a height — the labels grow with the system text size.
    minHeight: 64,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 1,
  },
  rail: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  nodeSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBlock: {
    alignItems: 'center',
    gap: 2,
  },
  todayRule: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  weekday: {
    ...typography.micro,
  },
  date: {
    ...typography.captionMedium,
  },
  dateToday: {
    ...typography.captionMedium,
    fontWeight: '700',
  },
  dot: {
    // +4 on 5.5's 26 — more presence and an easier target, still a node
    // rather than a button. Size is applied inline: it tracks the text scale.
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dotFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glyph: {
    ...typography.caption,
  },
});
