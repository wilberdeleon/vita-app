import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /**
   * Increment per press. Defaults to 1 so existing whole-number callers are
   * unaffected; portion controls pass 0.5 for half servings.
   */
  step?: number;
  /** Text after the number, e.g. "serving". */
  suffix?: string;
  /** Overrides the number's rendering, e.g. to drop a trailing ".0". */
  formatValue?: (value: number) => string;
};

/**
 * Floating-point steps accumulate error fast — 0.1 + 0.2 style drift turns
 * 1.5 into 1.4999999999999998 after a few presses, which then renders and,
 * worse, gets stored. Rounding to the step's own precision each time keeps
 * the value exact.
 */
function quantize(value: number, step: number): number {
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(value.toFixed(decimals));
}

export function Stepper({ value, onChange, min = 1, max = 99, step = 1, suffix, formatValue }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.button, { backgroundColor: surfaces.track }]}
        onPress={() => onChange(quantize(Math.max(min, value - step), step))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Ionicons name="remove" size={18} color={surfaces.text} />
      </Pressable>
      <Text style={[styles.value, { color: surfaces.text }]}>
        {formatValue ? formatValue(value) : value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: surfaces.track }]}
        onPress={() => onChange(quantize(Math.min(max, value + step), step))}
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
