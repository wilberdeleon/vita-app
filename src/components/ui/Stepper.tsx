import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Text after the number, e.g. "serving". */
  suffix?: string;
};

export function Stepper({ value, onChange, min = 1, max = 99, suffix }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.max(min, value - 1))}
        hitSlop={8}
      >
        <Ionicons name="remove" size={18} color={palette.text} />
      </Pressable>
      <Text style={styles.value}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.min(max, value + 1))}
        hitSlop={8}
      >
        <Ionicons name="add" size={18} color={palette.text} />
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
    backgroundColor: palette.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.bodyMedium,
    color: palette.text,
    minWidth: 80,
    textAlign: 'center',
  },
});
