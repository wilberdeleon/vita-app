import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { formatVolume, type VolumeUnit, type WaterDay } from '../../../lib/water';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  days: readonly WaterDay[];
  unit: VolumeUnit;
};

/** Tall enough to show a difference between days, short enough to stay a strip. */
const COLUMN_HEIGHT = 56;
/** A day with nothing logged still occupies the axis, as a flat trace. */
const EMPTY_HEIGHT = 3;

/** `palette.water` at 45% — clearly present, clearly not today. */
const PAST_DAY_COLOR = 'rgba(47,128,237,0.45)';

/**
 * The last seven days as relative daily volumes.
 *
 * **Volume, not goal attainment — and that is a data-integrity decision, not a
 * design one.** VITA stores one current goal as a preference and does not
 * snapshot what it was on any past day, so "you hit your goal on Tuesday"
 * would be a claim the app cannot actually support. Columns are therefore
 * scaled against the week's own biggest day, and nothing here judges a day as
 * met or missed.
 *
 * That also keeps it context rather than analytics: no average, no streak, no
 * trend line, no interpretation. Seven bars answering "how does today compare
 * to my week" and nothing further.
 *
 * Empty days keep their column as a flat trace instead of disappearing —
 * a gap is information, and dropping it would silently compress the axis.
 */
export function WaterWeekStrip({ days, unit }: Props) {
  const { surfaces } = useTheme();

  return (
    <Card>
      <View style={styles.row}>
        {days.map((day) => {
          const filled = day.share > 0;
          const height = filled ? Math.max(EMPTY_HEIGHT, day.share * COLUMN_HEIGHT) : EMPTY_HEIGHT;
          /*
           * Past days are the water color at reduced alpha rather than
           * `palette.waterSoft`: that token is a very pale blue, which is
           * nearly invisible on a light card and *brighter* than today's
           * column on a dark one — inverting the hierarchy in exactly one
           * theme. An alpha of the same hue subordinates correctly in both.
           */
          const color = day.isToday ? palette.water : filled ? PAST_DAY_COLOR : surfaces.track;

          return (
            <View
              key={day.logDate}
              style={styles.day}
              accessible
              accessibilityRole="text"
              /*
               * The single letter is ambiguous on its own — Tuesday and
               * Thursday are both "T" — so the spoken form always carries the
               * full weekday and the real amount. Seven unlabelled bars would
               * make the strip meaningless without sight.
               */
              accessibilityLabel={`${day.isToday ? 'Today, ' : ''}${day.weekdayName}, ${formatVolume(day.totalMl, unit)}`}
            >
              <View style={styles.track}>
                <View style={[styles.column, { height, backgroundColor: color }]} />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: day.isToday ? surfaces.text : surfaces.textTertiary },
                  day.isToday && styles.labelToday,
                ]}
              >
                {day.initial}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
    gap: spacing.s,
    flex: 1,
  },
  track: {
    height: COLUMN_HEIGHT,
    justifyContent: 'flex-end',
  },
  column: {
    width: 10,
    borderRadius: radii.pill,
  },
  label: {
    ...typography.micro,
  },
  labelToday: {
    fontWeight: '700',
  },
});
