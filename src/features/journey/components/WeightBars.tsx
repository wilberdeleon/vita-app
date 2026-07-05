import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { palette, spacing, typography } from '../../../theme/tokens';
import type { WeightPoint } from '../types';

type Props = {
  points: WeightPoint[];
  height?: number;
};

const VIEW_W = 320;
const PAD_Y = 12;
const BAR_W = 10;

/** Vertical weight bars — the Weight tab trend chart. */
export function WeightBars({ points, height = 140 }: Props) {
  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights) - 0.6;
  const max = Math.max(...weights) + 0.6;
  const span = max - min || 1;

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${VIEW_W} ${height}`}>
        {points.map((point, index) => {
          const x = 24 + (index / Math.max(points.length - 1, 1)) * (VIEW_W - 60);
          const barTop = PAD_Y + (1 - (point.weight - min) / span) * (height - PAD_Y * 2);
          return (
            <Rect
              key={point.label}
              x={x - BAR_W / 2}
              y={barTop}
              width={BAR_W}
              height={height - PAD_Y - barTop}
              rx={BAR_W / 2}
              fill={palette.primary}
              opacity={index === points.length - 1 ? 1 : 0.55}
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {points.map((point) => (
          <Text key={point.label} style={styles.label}>
            {point.label}
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
