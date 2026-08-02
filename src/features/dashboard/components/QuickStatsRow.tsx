import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { spacing } from '../../../theme/tokens';
import { MetricTile } from './MetricTile';
import type { QuickStat } from '../types';

type Props = {
  stats: QuickStat[];
};

/** Below this width, tiles wrap to a 2×2 grid instead of one row of 4 — matches the horizontal-inset breakpoint used elsewhere on Home. */
const NARROW_WIDTH_BREAKPOINT = 380;

/**
 * Health Metrics — four floating MetricTiles (Steps, Water, Workouts,
 * Sleep). One row of 4 at normal widths, 2×2 wrap on narrow phones so
 * nothing gets squeezed.
 */
export function QuickStatsRow({ stats }: Props) {
  const { width } = useWindowDimensions();
  const twoColumns = width < NARROW_WIDTH_BREAKPOINT;
  const tileBasis = twoColumns ? '48%' : '23%';

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <MetricTile key={stat.id} stat={stat} style={{ flexBasis: tileBasis }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.m,
  },
});
