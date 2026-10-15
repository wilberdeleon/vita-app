import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { fromKg, type WeightEntry, type WeightUnit } from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { shortDate, spokenChange, weightNumber } from '../format';
import { useJourneyAccent } from './useJourneyAccent';

type Props = {
  /** Newest first. Needs at least two to draw anything. */
  weights: readonly WeightEntry[];
  unit: WeightUnit;
  height?: number;
  /** Date labels under the line. Off for the compact Overview line. */
  labels?: boolean;
};

const PAD = 6;

/**
 * The recorded weights as one line — replaces the fixture-era `LineChart`
 * and `WeightBars`, deleted in 6.3.
 *
 * Honest by construction: **x is time, not entry index**, so a three-week gap
 * looks like three weeks; the scale is the data's own range, with no goal
 * line, no target band and no colour change with direction. The line is
 * Journey gold because it is Journey's — not because down is good.
 *
 * Decorative to a screen reader, which hears the same facts as one sentence.
 * 6.7 owns the real trend experience; this is its smallest honest form.
 */
export function WeightTrend({ weights, unit, height = 120, labels = true }: Props) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  const [width, setWidth] = useState(0);

  if (weights.length < 2) return null;

  const chronological = [...weights].reverse();
  const times = chronological.map((entry) => Date.parse(entry.loggedAt));
  const values = chronological.map((entry) => fromKg(entry.weightKg, unit));
  const t0 = times[0];
  const tSpan = times[times.length - 1] - t0 || 1;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const vSpan = max - min || 1;

  const point = (index: number) => ({
    x: PAD + ((times[index] - t0) / tSpan) * (width - PAD * 2),
    y: PAD + (1 - (values[index] - min) / vSpan) * (height - PAD * 2),
  });

  const first = chronological[0];
  const last = chronological[chronological.length - 1];
  const summary =
    `Weight trend, ${weights.length} entries from ${shortDate(first.loggedAt)} to ${shortDate(last.loggedAt)}: ` +
    `${weightNumber(first.weightKg, unit)} to ${weightNumber(last.weightKg, unit)} ${unit}, ` +
    `${spokenChange(first.weightKg, last.weightKg, unit)}.`;

  const start = width ? point(0) : null;
  const end = width ? point(values.length - 1) : null;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary}>
      <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width ? (
          <Svg width={width} height={height}>
            <Polyline
              points={values.map((_, index) => `${point(index).x},${point(index).y}`).join(' ')}
              fill="none"
              stroke={accent}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {start ? (
              <Circle cx={start.x} cy={start.y} r={3.5} fill={surfaces.background} stroke={accent} strokeWidth={1.5} />
            ) : null}
            {end ? <Circle cx={end.x} cy={end.y} r={4} fill={accent} /> : null}
          </Svg>
        ) : null}
      </View>
      {labels ? (
        <View style={styles.labels} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Text style={[styles.label, { color: surfaces.textTertiary }]}>{shortDate(first.loggedAt)}</Text>
          <Text style={[styles.label, { color: surfaces.textTertiary }]}>{shortDate(last.loggedAt)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  label: {
    ...typography.micro,
  },
});
