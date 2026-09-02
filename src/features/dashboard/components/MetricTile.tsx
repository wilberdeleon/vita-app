import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassSurface, ProgressBar } from '../../../components/ui';
import { radii, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { QuickStat } from '../types';

type Props = {
  stat: QuickStat;
  style?: StyleProp<ViewStyle>;
};

/**
 * One Health Metrics tile — icon, value, label, and a thin progress accent
 * (founders, 2026-07-19 mockup v2).
 *
 * Tappable only when its stat carries an `onPress`. Wrapping every tile would
 * promise navigation that three of the five cannot deliver; wrapping only the
 * ones with a destination keeps the promise honest, and press feedback is the
 * affordance rather than a chevron that would crowd a quarter-width tile.
 * Visually identical either way.
 */
export function MetricTile({ stat, style }: Props) {
  const { surfaces } = useTheme();

  const content = (
    <View style={styles.content}>
      <Ionicons name={stat.icon} size={22} color={stat.color} />
      <Text style={[styles.value, { color: surfaces.text }]}>{stat.value}</Text>
      <Text style={[styles.label, { color: surfaces.textTertiary }]}>{stat.label.toUpperCase()}</Text>
      <View style={styles.track}>
        <ProgressBar progress={stat.progress} color={stat.color} height={3} />
      </View>
    </View>
  );

  if (!stat.onPress) {
    return (
      <GlassSurface variant="card" radius={radii.glassTile} padding={spacing.m} style={style}>
        {content}
      </GlassSurface>
    );
  }

  /**
   * `style` carries the tile's `flexBasis`, so it has to stay on the element
   * the row lays out — the `Pressable` — with the surface filling it. Putting
   * it on an inner wrapper instead would leave the flex item with no basis and
   * collapse the grid, which is also why this is a plain `Pressable` rather
   * than `PressableScale` (that component applies `style` to an inner view).
   */
  return (
    <Pressable
      onPress={stat.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${stat.label}, ${stat.value}`}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      <GlassSurface variant="card" radius={radii.glassTile} padding={spacing.m}>
        {content}
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  track: {
    alignSelf: 'stretch',
    marginTop: 2,
  },
});
