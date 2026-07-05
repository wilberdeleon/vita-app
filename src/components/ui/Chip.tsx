import { Pressable, StyleSheet, Text } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Selected fill color; defaults to VITA orange. */
  color?: string;
};

/** Small selectable pill — time ranges (7D/1M/…), bottle sizes, quick amounts. */
export function Chip({ label, selected = false, onPress, color = palette.primary }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: radii.chip,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  label: {
    ...typography.captionMedium,
    color: palette.textSecondary,
  },
  selectedLabel: {
    color: palette.textOnColor,
  },
});
