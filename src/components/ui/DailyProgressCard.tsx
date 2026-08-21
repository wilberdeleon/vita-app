import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { StatBar } from './StatBar';

type Bar = {
  label: string;
  valueLabel: string;
  progress: number;
  color: string;
};

type Props = {
  /** Headline, e.g. "1,267 / 2,000 Calories". */
  headline: string;
  /** Right-aligned percent label, e.g. "63%". */
  percentLabel: string;
  progress: number;
  color?: string;
  bars?: Bar[];
};

/** Headline progress + sub-bars — the Today's Goal card on Fuel. */
export function DailyProgressCard({ headline, percentLabel, progress, color = palette.primary, bars }: Props) {
  const { surfaces } = useTheme();

  return (
    <Card>
      <View style={styles.headlineRow}>
        <Text style={[styles.headline, { color: surfaces.text }]}>{headline}</Text>
        <Text style={[styles.percent, { color: surfaces.textSecondary }]}>{percentLabel}</Text>
      </View>
      <ProgressBar progress={progress} color={color} />
      {bars && bars.length > 0 ? (
        <View style={styles.bars}>
          {bars.map((bar) => (
            <StatBar key={bar.label} {...bar} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.s,
  },
  headline: {
    ...typography.heading,
  },
  percent: {
    ...typography.captionMedium,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.l,
  },
});
