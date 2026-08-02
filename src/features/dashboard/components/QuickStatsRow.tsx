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
 *
 * Any additional tiles beyond the first four (currently just Streak;
 * founders, 2026-07-22) render in their own row below, centered rather
 * than left-aligned — `justifyContent: 'space-between'` on a single-item
 * row has no second item to space against, so it falls back to the start
 * of the row. Same tileBasis width, same MetricTile, no stretching — only
 * the row's alignment differs.
 */
export function QuickStatsRow({ stats }: Props) {
  const { width } = useWindowDimensions();
  const twoColumns = width < NARROW_WIDTH_BREAKPOINT;
  const tileBasis = twoColumns ? '48%' : '23%';
  const primaryStats = stats.slice(0, 4);
  const extraStats = stats.slice(4);

  return (
    <View>
      <View style={styles.grid}>
        {primaryStats.map((stat) => (
          <MetricTile key={stat.id} stat={stat} style={{ flexBasis: tileBasis }} />
        ))}
      </View>
      {extraStats.length > 0 ? (
        <View style={styles.extraRow}>
          {extraStats.map((stat) => (
            <MetricTile key={stat.id} stat={stat} style={{ flexBasis: tileBasis }} />
          ))}
        </View>
      ) : null}
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
  extraRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.m,
  },
});
