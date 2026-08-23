import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

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
};

export function SegmentedTabs({ options, selectedIndex, onChange, activeColor }: Props) {
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
          <Pressable
            key={option}
            onPress={() => onChange(index)}
            // Same reasoning as `Chip`: the active segment is distinguished
            // only by fill, so the selected state has to be announced.
            accessibilityRole="button"
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
          </Pressable>
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
  segment: {
    flex: 1,
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
