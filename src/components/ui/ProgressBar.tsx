import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { palette, radii } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../theme/useReducedMotion';

type Props = {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
  /**
   * Spoken description of what the bar shows, e.g. "24 of 64 fl oz, 38%".
   *
   * Optional and unset everywhere it already existed, so no current bar
   * changes. Where a caller has no *other* text carrying the same figure,
   * passing it is what keeps progress from being visual-only.
   */
  accessibilityLabel?: string;
};

export function ProgressBar({ progress, color = palette.primary, height = 8, accessibilityLabel }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(0)).current;
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Reduced motion lands on the value directly. The bar communicates a
    // number, and that number must never be something the user has to wait
    // through an animation to learn.
    if (reducedMotion) {
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, {
      toValue: clamped,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animates width
    }).start();
  }, [anim, clamped, reducedMotion]);

  return (
    <View
      accessible={accessibilityLabel !== undefined}
      accessibilityRole={accessibilityLabel === undefined ? undefined : 'progressbar'}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={
        accessibilityLabel === undefined ? undefined : { min: 0, max: 100, now: Math.round(clamped * 100) }
      }
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: surfaces.track }]}
    >
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
     * Theme-aware since Sprint 2 slice 2.3 (founder-approved refinement of
     * the 2026-08-16 decision, which had kept this deliberately
     * theme-invariant).
     *
     * The pale track was fine while every bar was fed by a fixture that
     * always showed partial progress. Once real logging arrived, an empty
     * day rendered a near-white bar on a near-black card — which reads as
     * *100% complete* rather than 0%. That is a usability defect, not an
     * aesthetic preference, so the track now resolves through
     * `surfaces.track`.
     *
     * Light mode is byte-identical: `lightSurfaces.track` IS `palette.track`
     * (#EFEDE9), the same value this literal used. Only dark changes, to
     * `rgba(255,255,255,0.12)` — visible enough to read as a track, quiet
     * enough that the filled portion still clearly dominates.
     *
     * `backgroundColor` is applied inline in the component; this rule keeps
     * only the shape.
     */
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
