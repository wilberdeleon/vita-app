import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress?: () => void;
  /** Fill color — orange by default, blue for water, purple for peptides. */
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * `'neutral'` is **VITA's primary action** — the theme's own high-contrast
   * fill, white on the near-black page and brand ink on the cream one, with
   * the label in the background colour.
   *
   * The Design System's rule since 5.1: *the primary action is neutral, and it
   * does not change hue by section.* A blue button on Water beside a purple one
   * on Peptides is precisely what made two unrelated screens read as one
   * template in two colours — the diagnosis the whole sprint rests on. Feature
   * colour belongs to the objects and states around the action, not to the
   * rectangle.
   *
   * Water's custom-amount `Log` has been drawn this way since 5.2 and Fuel
   * Home's `Add food` since 5.6B; it lives here from 5.6D so the screens that
   * commit a food stop each re-implementing it. `'filled'` stays the default,
   * so no existing caller changes.
   */
  variant?: 'filled' | 'soft' | 'neutral';
  /** Dims the button and ignores presses — for forms that aren't valid yet. */
  disabled?: boolean;
  /**
   * Spoken instead of `label`, for the cases where the visible word is not a
   * sentence on its own — a bare "Done" says nothing about what it finishes.
   * Defaults to `label`, so every existing caller is unchanged.
   */
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  color = palette.primary,
  icon,
  variant = 'filled',
  disabled = false,
  accessibilityLabel,
}: Props) {
  const { surfaces } = useTheme();
  const neutral = variant === 'neutral';
  const filled = variant === 'filled';

  const background = neutral ? surfaces.text : filled ? color : `${color}1A`;
  const foreground = neutral ? surfaces.background : filled ? palette.textOnColor : color;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.button, { backgroundColor: background }, disabled && styles.disabled]}
    >
      {icon ? <Ionicons name={icon} size={18} color={foreground} /> : null}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
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
  disabled: {
    opacity: 0.4,
  },
});
