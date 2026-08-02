import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassSurface, ProgressBar } from '../../../components/ui';
import { radii, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { QuickStat } from '../types';

type Props = {
  stat: QuickStat;
  style?: StyleProp<ViewStyle>;
};

/** One Health Metrics tile — icon, value, label, and a thin progress accent (founders, 2026-07-19 mockup v2). */
export function MetricTile({ stat, style }: Props) {
  const { surfaces } = useTheme();

  return (
    <GlassSurface variant="card" radius={radii.glassTile} padding={spacing.m} style={style}>
      <View style={styles.content}>
        <Ionicons name={stat.icon} size={22} color={stat.color} />
        <Text style={[styles.value, { color: surfaces.text }]}>{stat.value}</Text>
        <Text style={[styles.label, { color: surfaces.textTertiary }]}>{stat.label.toUpperCase()}</Text>
        <View style={styles.track}>
          <ProgressBar progress={stat.progress} color={stat.color} height={3} />
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
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
