import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, style, ...inputProps }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: surfaces.textSecondary }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={surfaces.textTertiary}
        style={[
          styles.input,
          { color: surfaces.text, backgroundColor: surfaces.card, borderColor: surfaces.border },
          style,
        ]}
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
  },
  input: {
    ...typography.body,
    borderRadius: radii.control,
    borderWidth: 1,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
  },
});
