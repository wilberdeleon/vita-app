import { Pressable, StyleSheet, Text, View } from 'react-native';
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
 */
export function RoutineDayStrip({ days, selected, today, onSelectDay }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.row}>
      {days.map((day) => {
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
            <Text
              style={[
                isToday ? styles.dateToday : styles.date,
                { color: isToday ? surfaces.text : surfaces.textSecondary },
              ]}
            >
              {date.getDate()}
            </Text>
            <View
              style={[
                styles.dot,
                {
                  borderColor: scheduled ? ring : 'transparent',
                  backgroundColor: fill,
                },
              ]}
            >
              <Text style={[styles.glyph, { color: glyphColor }]}>
                {routineDayMarkSymbol(day.mark)}
              </Text>
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
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: spacing.s,
    minHeight: 72,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: 'transparent',
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
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    ...typography.caption,
  },
});
