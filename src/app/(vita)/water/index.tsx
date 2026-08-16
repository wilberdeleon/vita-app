import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Button, Card, ProgressBar, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { CupsRow } from '../../../features/water/components/CupsRow';
import { getWaterToday } from '../../../features/water/api';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

export default function WaterLog() {
  const water = getWaterToday();
  const progress = water.cups / water.goalCups;
  const { surfaces } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Water Log" back />

      <Card>
        <Text style={[styles.count, { color: surfaces.text }]}>
          {water.cups} / {water.goalCups} cups
        </Text>
        <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
          Stay hydrated, feel better, perform better.
        </Text>
      </Card>

      <SectionHeader title="Today's Goal" />
      <Card style={styles.goalCard}>
        <CupsRow filled={water.cups} total={water.goalCups} />
        <ProgressBar progress={progress} color={palette.water} />
        <Text style={[styles.percent, { color: surfaces.textSecondary }]}>
          {Math.round(progress * 100)}% of your daily goal
        </Text>
      </Card>

      <Button label="+ Add Water" color={palette.water} onPress={() => router.push('/water/add')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
  },
  goalCard: {
    gap: spacing.l,
  },
  percent: {
    ...typography.caption,
    textAlign: 'center',
  },
});
