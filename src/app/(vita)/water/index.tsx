import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Button, Card, ProgressBar, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { CupsRow } from '../../../features/water/components/CupsRow';
import { getWaterToday } from '../../../features/water/api';
import { palette, spacing, typography } from '../../../theme/tokens';

export default function WaterLog() {
  const water = getWaterToday();
  const progress = water.cups / water.goalCups;

  return (
    <Screen>
      <ScreenHeader title="Water Log" back />

      <Card>
        <Text style={styles.count}>
          {water.cups} / {water.goalCups} cups
        </Text>
        <Text style={styles.hint}>Stay hydrated, feel better, perform better.</Text>
      </Card>

      <SectionHeader title="Today's Goal" />
      <Card style={styles.goalCard}>
        <CupsRow filled={water.cups} total={water.goalCups} />
        <ProgressBar progress={progress} color={palette.water} />
        <Text style={styles.percent}>{Math.round(progress * 100)}% of your daily goal</Text>
      </Card>

      <Button label="+ Add Water" color={palette.water} onPress={() => router.push('/water/add')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    ...typography.heading,
    color: palette.text,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: palette.textTertiary,
  },
  goalCard: {
    gap: spacing.l,
  },
  percent: {
    ...typography.caption,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});
