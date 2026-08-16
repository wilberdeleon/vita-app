import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { ProgressBar } from './ProgressBar';

type Props = {
  label: string;
  /** e.g. "107 / 160g" */
  valueLabel: string;
  progress: number;
  color: string;
};

/** Labeled progress bar — the macro rows on Fuel. */
export function StatBar({ label, valueLabel, progress, color }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: surfaces.textTertiary }]}>{valueLabel}</Text>
      </View>
      <ProgressBar progress={progress} color={color} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xs,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  label: {
    ...typography.micro,
  },
  value: {
    ...typography.micro,
  },
});
