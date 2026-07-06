import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress?: () => void;
  /** Fill color — orange by default, blue for water, purple for peptides. */
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'filled' | 'soft';
};

export function Button({ label, onPress, color = palette.primary, icon, variant = 'filled' }: Props) {
  const filled = variant === 'filled';
  return (
    <PressableScale onPress={onPress} style={[styles.button, { backgroundColor: filled ? color : `${color}1A` }]}>
      {icon ? <Ionicons name={icon} size={18} color={filled ? palette.textOnColor : color} /> : null}
      <Text style={[styles.label, { color: filled ? palette.textOnColor : color }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    borderRadius: radii.control,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
});
