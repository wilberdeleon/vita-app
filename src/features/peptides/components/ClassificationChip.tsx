import { StyleSheet, Text, View } from 'react-native';
import { classificationLabel, classificationSpoken, type PeptideClassification } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  classification: PeptideClassification;
};

/**
 * What a compound's regulatory standing is, stated plainly.
 *
 * **Research is not styled as a warning.** It is a factual category, not an
 * error, and dressing it in alarm red would both misrepresent it and train
 * users to ignore the colour. Equally, the distinction is not hidden or
 * softened away — approved and research read differently at a glance, and the
 * label is spelled out rather than encoded in colour alone, so it survives
 * greyscale and a screen reader.
 */
export function ClassificationChip({ classification }: Props) {
  const { surfaces } = useTheme();

  const tint =
    classification === 'approved-medication'
      ? palette.success
      : classification === 'research-compound'
        ? palette.peptide
        : surfaces.textTertiary;

  return (
    <View
      style={[styles.chip, { borderColor: tint }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={classificationSpoken(classification)}
    >
      <Text style={[styles.label, { color: tint }]}>{classificationLabel(classification)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.micro,
    fontWeight: '600',
  },
});
