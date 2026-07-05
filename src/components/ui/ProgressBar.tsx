import { StyleSheet, View } from 'react-native';
import { palette, radii } from '../../theme/tokens';

type Props = {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
};

export function ProgressBar({ progress, color = palette.primary, height = 8 }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: palette.track,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
