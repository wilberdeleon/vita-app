import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import type { QuickStat } from '../types';

type Props = {
  stats: QuickStat[];
};

export function QuickStatsRow({ stats }: Props) {
  return (
    <Card style={styles.card}>
      {stats.map((stat) => (
        <View key={stat.id} style={styles.stat}>
          <Ionicons name={stat.icon} size={18} color={stat.color} />
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    ...typography.captionMedium,
    color: palette.text,
  },
  label: {
    ...typography.micro,
    color: palette.textTertiary,
  },
});
