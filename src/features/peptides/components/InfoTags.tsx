import { StyleSheet, Text, View } from 'react-native';
import { formatLabels } from '../../../lib/peptides';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  values: readonly string[];
  /** Spoken prefix, e.g. "Studied for" — so the group reads as one thought. */
  label: string;
};

/**
 * Short informational values as compact tags.
 *
 * Replaces the dot-separated run — `obesity and weight management · type 2
 * diabetes · other cardiometabolic conditions` — which read as a raw database
 * string rather than considered content.
 *
 * **Deliberately not buttons.** These are facts, not actions, and exposing
 * five static values as five buttons would make a screen reader announce a
 * control that does nothing five times over. The whole group is one accessible
 * element carrying its heading and its values as a sentence, so it reads
 * naturally instead of as a list of orphaned fragments.
 *
 * Quiet by design: a hairline border and a surface fill rather than a filled
 * pill. Filled pills would give informational content the visual weight of
 * primary actions, and a page with fifteen of them stops having a hierarchy.
 */
export function InfoTags({ values, label }: Props) {
  const { surfaces } = useTheme();
  const formatted = formatLabels(values);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${formatted.join(', ')}`}
    >
      {formatted.map((value) => (
        <View
          key={value}
          style={[styles.tag, { backgroundColor: surfaces.track, borderColor: surfaces.border }]}
        >
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: -spacing.xs,
  },
  tag: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.control,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
  },
  label: {
    ...typography.caption,
  },
});
