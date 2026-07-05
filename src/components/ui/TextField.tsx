import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, style, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={palette.textTertiary}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.captionMedium,
    color: palette.textSecondary,
  },
  input: {
    ...typography.body,
    color: palette.text,
    backgroundColor: palette.card,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: palette.hairline,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
  },
});
