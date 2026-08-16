import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Text after the number, e.g. "serving". */
  suffix?: string;
};

export function Stepper({ value, onChange, min = 1, max = 99, suffix }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.button, { backgroundColor: surfaces.track }]}
        onPress={() => onChange(Math.max(min, value - 1))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Ionicons name="remove" size={18} color={surfaces.text} />
      </Pressable>
      <Text style={[styles.value, { color: surfaces.text }]}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: surfaces.track }]}
        onPress={() => onChange(Math.min(max, value + 1))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Ionicons name="add" size={18} color={surfaces.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: radii.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.bodyMedium,
    minWidth: 80,
    textAlign: 'center',
  },
});
