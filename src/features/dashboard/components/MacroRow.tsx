import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { MacroSummary } from '../types';

type Props = {
  macro: MacroSummary;
};

/** One macro line inside the Macros card — label, bar, value, percent. No cards, no pills, just a clean row. */
export function MacroRow({ macro }: Props) {
  const { surfaces } = useTheme();
  const progress = macro.current / macro.goal;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: surfaces.textSecondary }]}>{macro.label}</Text>
      <View style={styles.track}>
        <ProgressBar progress={progress} color={macro.color} height={5} />
      </View>
      <Text style={[styles.value, { color: surfaces.textTertiary }]}>
        {macro.current} / {macro.goal}
        {macro.unit}
      </Text>
      <Text style={[styles.percent, { color: macro.color }]}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  label: {
    ...typography.captionMedium,
    width: 56,
  },
  track: {
    flex: 1,
  },
  value: {
    ...typography.caption,
    width: 72,
    textAlign: 'right',
  },
  percent: {
    ...typography.captionMedium,
    width: 34,
    textAlign: 'right',
  },
});
