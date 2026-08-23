import { Pressable, StyleSheet, Text } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /**
   * Selected fill color. Defaults to the theme's neutral structural color —
   * brand ink in light, white in dark, since ink is invisible on a near-black
   * card. Pass a domain color for domain flows.
   */
  color?: string;
};

/** Small selectable pill — time ranges (7D/1M/…), bottle sizes, quick amounts. */
export function Chip({ label, selected = false, onPress, color }: Props) {
  const { scheme, surfaces } = useTheme();
  // The one case needing a dark label is the neutral default in dark mode,
  // where the fill is white. Every domain color is dark enough for white.
  const neutralDarkFill = !color && scheme === 'dark';
  const fill = color ?? (neutralDarkFill ? surfaces.text : palette.ink);
  const selectedLabelColor = neutralDarkFill ? surfaces.background : palette.textOnColor;

  return (
    <Pressable
      onPress={onPress}
      // Selection is signalled by fill color alone, which a screen reader
      // cannot see. `selected` state makes the same information audible.
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      style={[
        styles.chip,
        { backgroundColor: surfaces.card, borderColor: surfaces.border },
        selected && { backgroundColor: fill, borderColor: fill },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? selectedLabelColor : surfaces.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: radii.chip,
    borderWidth: 1,
  },
  label: {
    ...typography.captionMedium,
  },
});
