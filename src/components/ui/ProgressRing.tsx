import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { palette } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  /** 0..1, already clamped by the caller's `progress()` helper. */
  progress: number;
  size?: number;
  thickness?: number;
  color?: string;
}>;

/**
 * Circular progress, with whatever the caller wants centered inside it.
 *
 * A ring rather than another bar because Fuel's headline number needs to
 * read as *the* status of the day at a glance, and a bar of the same value
 * sitting above three macro bars reads as a fourth macro. The shape is the
 * hierarchy.
 *
 * Drawn with react-native-svg (already a dependency, already used by the
 * Journey charts) rather than by rotating two half-circle views — the border
 * trick can't do a rounded cap and breaks at progress extremes.
 *
 * Static, not animated: the ring is a status readout, and an elaborate
 * sweep-in on every render of the Fuel tab is motion the founders did not
 * ask for. The track follows the theme for the same reason ProgressBar's
 * does — a pale track on a near-black card reads as *complete*, not empty.
 */
export function ProgressRing({
  progress,
  size = 96,
  thickness = 9,
  color = palette.primary,
  children,
}: Props) {
  const { surfaces } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={surfaces.track}
          strokeWidth={thickness}
          fill="none"
        />
        {clamped > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped)}
            fill="none"
            // Starts the sweep at twelve o'clock instead of three.
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
