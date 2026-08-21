import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { ProgressBar } from './ProgressBar';

type Props = {
  label: string;
  /** e.g. "107 / 160 g" */
  valueLabel: string;
  progress: number;
  color: string;
};

/**
 * Labeled progress bar — the macro columns on Fuel and the Food Log.
 *
 * Label above value rather than beside it. Side by side, the two shared one
 * ~93pt column on an SE-class screen, which fitted "Protein" but not
 * "Protein Goal"; stacking gives each the full column width, so a clearer
 * label never costs the number its legibility.
 */
export function StatBar({ label, valueLabel, progress, color }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: surfaces.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, { color: surfaces.textTertiary }]} numberOfLines={1}>
        {valueLabel}
      </Text>
      <ProgressBar progress={progress} color={color} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.micro,
  },
  value: {
    ...typography.micro,
    marginBottom: spacing.xs,
  },
});
