import { StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from './PressableScale';

type Props = {
  options: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  /**
   * Active segment color. Defaults to the theme's neutral structural color —
   * brand ink in light, white in dark, since ink is invisible on a near-black
   * track. Pass a domain color for domain flows.
   */
  activeColor?: string;
  /**
   * What this control is *for*, spoken before the option.
   *
   * A screen with three identical mg/mcg toggles — vial, calculator amount,
   * display preference — gives a screen-reader user three indistinguishable
   * "mg" buttons. Naming the group turns them into "Vial unit, mg" and
   * "Amount unit, mg". Optional: single-toggle screens read fine without it.
   */
  groupLabel?: string;
};

/**
 * ## Motion (slice 5.8B)
 *
 * **This was the only shared control in VITA that answered a press with
 * nothing at all.** Every other one — `Button`, `ListRow`, `Chip`, every
 * tile and row — goes through `PressableScale`, so it compresses slightly,
 * fades instead of moving under Reduced Motion, and can carry a haptic. A
 * segmented tab did none of that: a bare `Pressable` whose fill jumped to
 * the new segment with no acknowledgement that the finger had landed.
 *
 * It uses the same primitive now, so the press feels like every other press
 * in the app **by construction rather than by coincidence** — which is the
 * whole point of the slice.
 *
 * **The haptic is the vocabulary catching up with itself.** `src/lib/haptics`
 * has named *"a segmented tab"* as a `selection` event since 5.1, and about
 * twenty call sites fire `selection` for exactly this kind of discrete
 * choice — quick-add amounts, units, body-map zones. Segmented tabs were the
 * documented example that never called it. It fires **only when the press
 * actually changes the selection**: re-tapping the segment you are already
 * on has changed nothing, and a buzz for nothing is the noise §9 warns about.
 */
export function SegmentedTabs({ options, selectedIndex, onChange, activeColor, groupLabel }: Props) {
  const { scheme, surfaces } = useTheme();
  // The one case needing a dark label is the neutral default in dark mode,
  // where the active segment is white. Every domain color is dark enough for white.
  const neutralDarkFill = !activeColor && scheme === 'dark';
  const fill = activeColor ?? (neutralDarkFill ? surfaces.text : palette.ink);
  const activeLabelColor = neutralDarkFill ? surfaces.background : palette.textOnColor;

  return (
    <View style={[styles.track, { backgroundColor: surfaces.track }]}>
      {options.map((option, index) => {
        const active = index === selectedIndex;
        return (
          // Wrapped: `PressableScale` puts its style on an inner view, so a
          // `flex` handed to it never reaches this row. The known trap, worked
          // around the way every other caller does rather than repaired here.
          <View key={option} style={styles.slot}>
            <PressableScale
              onPress={() => onChange(index)}
              haptic={active ? undefined : 'selection'}
              // Same reasoning as `Chip`: the active segment is distinguished
              // only by fill, so the selected state has to be announced.
              accessibilityRole="button"
              accessibilityLabel={groupLabel ? `${groupLabel}, ${option}` : option}
              accessibilityState={{ selected: active }}
              style={[styles.segment, active && { backgroundColor: fill }]}
            >
              <Text
                style={[
                  styles.label,
                  { color: active ? activeLabelColor : surfaces.textSecondary },
                  active && styles.activeLabel,
                ]}
              >
                {option}
              </Text>
            </PressableScale>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    padding: 3,
  },
  /* The flex lives here so the segments still divide the track evenly. */
  slot: {
    flex: 1,
  },
  segment: {
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    alignItems: 'center',
  },
  label: {
    ...typography.captionMedium,
  },
  activeLabel: {
    fontWeight: '600',
  },
});
