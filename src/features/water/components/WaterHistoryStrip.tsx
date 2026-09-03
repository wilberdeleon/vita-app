import { StyleSheet, Text, View } from 'react-native';
import { formatVolume, type VolumeUnit, type WaterDay } from '../../../lib/water';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  days: readonly WaterDay[];
  unit: VolumeUnit;
};

/** Tall enough to show a difference between days, short enough to stay a strip. */
const COLUMN_HEIGHT = 44;
/** A day with nothing logged still occupies the axis, as a flat trace. */
const EMPTY_HEIGHT = 3;
/** `palette.water` at 40% — clearly present, clearly not today. */
const PAST_DAY_COLOR = 'rgba(47,128,237,0.40)';

/**
 * The last seven days, direct on the background.
 *
 * **Volume, not goal attainment — and that remains a data-integrity decision,
 * not a design one.** VITA stores one *current* goal and does not snapshot
 * what it was on any past day, so "you hit your goal on Tuesday" would be a
 * claim the app cannot actually support. Columns are scaled against the
 * week's own biggest day, and nothing here marks a day as met or missed.
 *
 * Slice 5.2 was asked to consider showing goal progress per day and
 * deliberately did not: the underlying data has not changed since slice 3.4,
 * so the reason not to has not changed either. What changed is presentation —
 * the strip lost its `Card`, which was spending a border, a shadow and 16pt
 * of padding on seven thin bars.
 *
 * **No score, no streak, no average, no trend, no interpretation.** Seven
 * columns answering "how does today compare to my week", and nothing further.
 * Empty days keep their column as a flat trace rather than disappearing — a
 * gap is information, and dropping it would silently compress the axis.
 */
export function WaterHistoryStrip({ days, unit }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.row}>
      {days.map((day) => {
        const filled = day.share > 0;
        const height = filled ? Math.max(EMPTY_HEIGHT, day.share * COLUMN_HEIGHT) : EMPTY_HEIGHT;
        /*
         * Past days are the water colour at reduced alpha rather than
         * `palette.waterSoft`: that token is nearly invisible on a light
         * background and *brighter* than today's column on a dark one,
         * inverting the hierarchy in exactly one theme.
         */
        const color = day.isToday ? palette.water : filled ? PAST_DAY_COLOR : surfaces.track;

        return (
          <View
            key={day.logDate}
            style={styles.day}
            accessible
            accessibilityRole="text"
            /*
             * The single letter is ambiguous alone — Tuesday and Thursday are
             * both "T" — so the spoken form always carries the full weekday
             * and the real amount. Seven unlabelled bars would be meaningless
             * without sight, and the colour difference marking today is not
             * information a screen reader can see either.
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
    width: 8,
    borderRadius: radii.pill,
  },
  label: {
    ...typography.micro,
  },
  labelToday: {
    fontWeight: '700',
  },
});
