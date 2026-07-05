import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';

type Props = {
  options: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  /** Active segment color; defaults to VITA orange. */
  activeColor?: string;
};

export function SegmentedTabs({ options, selectedIndex, onChange, activeColor = palette.primary }: Props) {
  return (
    <View style={styles.track}>
      {options.map((option, index) => {
        const active = index === selectedIndex;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(index)}
            style={[styles.segment, active && { backgroundColor: activeColor }]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: palette.track,
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
    color: palette.textSecondary,
  },
  activeLabel: {
    color: palette.textOnColor,
    fontWeight: '600',
  },
});
