import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { restaurantIconFor } from '../../../features/dashboard/mealIcons';
import { Button, Card, DailyProgressCard, ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { getFuelToday } from '../../../features/fuel/api';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

export default function FoodLog() {
  const today = getFuelToday();
  const { surfaces } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Log Food" back />

      <Card>
        <Text style={[styles.count, { color: surfaces.text }]}>
          {today.mealsLogged} / {today.mealSlots} logged
        </Text>
        <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
          Track your meals and stay on top of your nutrition.
        </Text>
      </Card>

      <SectionHeader title="Today's Goal" />
      <DailyProgressCard
        headline={`${today.kcal.current.toLocaleString()} / ${today.kcal.goal.toLocaleString()} kcal`}
        percentLabel={`${Math.round((today.kcal.current / today.kcal.goal) * 100)}%`}
        progress={today.kcal.current / today.kcal.goal}
        bars={today.macros.map((macro) => ({
          label: macro.label,
          valueLabel: `${macro.current} / ${macro.goal}${macro.unit}`,
          progress: macro.current / macro.goal,
          color: macro.color,
        }))}
      />

      <SectionHeader title="Today's Meals" />
      {today.meals.map((meal) => (
        <ListRow
          key={meal.id}
          icon={restaurantIconFor(meal.slot)}
          title={meal.name}
          subtitle={meal.slot}
          value={`${meal.kcal} kcal`}
        />
      ))}

      <Button label="+ Log Food" onPress={() => router.push('/fuel/add')} />
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
});
