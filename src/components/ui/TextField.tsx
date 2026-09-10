import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = TextInputProps & {
  label?: string;
  /**
   * Colours the label only — never the value or the box.
   *
   * Added in 5.6D for Manual Entry, where the four nutrition fields carry
   * Fuel's macro category identity (`macroAccent`) so Protein reads as the
   * same violet it is on Fuel Home and Food Detail. Unset everywhere else,
   * which is every existing caller, and unset renders exactly as before.
   *
   * The **value stays neutral and high-contrast** in every case — the same
   * limit Fuel Home sets on how far a category colour may go before it starts
   * reading as a status.
   */
  labelColor?: string;
  /**
   * A unit shown at the trailing edge of the field — `g`, `mg`.
   *
   * A suffix, deliberately, rather than a placeholder like `e.g. 20 g`: an
   * example value in a nutrition box reads as a suggestion, and VITA does not
   * suggest what anyone's numbers should be. It is decorative to assistive
   * technology, because the field's accessible name already says the unit.
   */
  suffix?: string;
};

/**
 * VITA's text input.
 *
 * ## The label is the accessible name
 *
 * A field with a visible `label` announces itself by that label unless the
 * caller says otherwise. Before 5.6D it did not: the label was drawn as
 * ordinary text with no relationship to the input, so **every labelled field
 * in the app was an anonymous text box to VoiceOver** — found by the 5.6D
 * characterization pass, which could not locate a single field on Manual Entry
 * by name. An explicit `accessibilityLabel` still wins, for the cases where
 * the spoken name should carry more than the visible word ("Brand, optional").
 *
 * Additive and invisible: nothing about the rendering changed, and no caller
 * had to be edited for it to take effect.
 */
export function TextField({ label, labelColor, suffix, style, ...inputProps }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: labelColor ?? surfaces.textSecondary }]}>{label}</Text>
      ) : null}

      <View style={styles.field}>
        <TextInput
          placeholderTextColor={surfaces.textTertiary}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          style={[
            styles.input,
            { color: surfaces.text, backgroundColor: surfaces.card, borderColor: surfaces.border },
            suffix ? styles.inputWithSuffix : null,
            style,
          ]}
          {...inputProps}
        />
        {suffix ? (
          <Text
            style={[styles.suffix, { color: surfaces.textTertiary }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
          >
            {suffix}
          </Text>
        ) : null}
      </View>
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
  field: {
    justifyContent: 'center',
  },
  input: {
    ...typography.body,
    borderRadius: radii.control,
    borderWidth: 1,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
  },
  inputWithSuffix: {
    // Room for the unit, so a long number never runs under it.
    paddingRight: spacing.xxl,
  },
  suffix: {
    ...typography.caption,
    position: 'absolute',
    right: spacing.l,
  },
});
