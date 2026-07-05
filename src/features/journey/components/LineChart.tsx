import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Polyline } from 'react-native-svg';
import { palette, spacing, typography } from '../../../theme/tokens';
import type { WeightPoint } from '../types';

type Series = {
  points: WeightPoint[];
  color: string;
  /** Draw dots on data points. */
  dots?: boolean;
};

type Props = {
  series: Series[];
  height?: number;
};

const VIEW_W = 320;
const PAD_X = 12;
const PAD_Y = 14;

/**
 * Minimal hand-drawn line chart (react-native-svg). Scales all series to the
 * shared min/max so comparisons are honest. X labels come from the first series.
 */
export function LineChart({ series, height = 130 }: Props) {
  const weights = series.flatMap((s) => s.points.map((p) => p.weight));
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;

  const toXY = (index: number, count: number, weight: number): [number, number] => {
    const x = PAD_X + (index / Math.max(count - 1, 1)) * (VIEW_W - PAD_X * 2);
    const y = PAD_Y + (1 - (weight - min) / span) * (height - PAD_Y * 2);
    return [x, y];
  };

  const labels = series[0]?.points.map((p) => p.label) ?? [];

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${VIEW_W} ${height}`}>
        {series.map((s, seriesIndex) => {
          const coords = s.points.map((p, i) => toXY(i, s.points.length, p.weight));
          return (
            <G key={seriesIndex}>
              <Polyline
                points={coords.map(([x, y]) => `${x},${y}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.dots
                ? coords.map(([x, y], i) => (
                    <Circle key={i} cx={x} cy={y} r={4} fill={s.color} />
                  ))
                : null}
            </G>
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {labels.map((label) => (
          <Text key={label} style={styles.label}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
  },
  label: {
    ...typography.micro,
    color: palette.textTertiary,
  },
});
