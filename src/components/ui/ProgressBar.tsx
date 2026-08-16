import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { palette, radii } from '../../theme/tokens';

type Props = {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
};

export function ProgressBar({ progress, color = palette.primary, height = 8 }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animates width
    }).start();
  }, [anim, clamped]);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    /**
     * Deliberately theme-invariant, unlike every other surface in the app.
     * The approved Home dashboard shows this pale track under the gold
     * journey bar and the macro bars in dark mode, so it is the reference
     * treatment, not an oversight — theming it would change Home. Every
     * other screen's progress bars match Home by leaving it alone.
     */
    backgroundColor: palette.track,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
