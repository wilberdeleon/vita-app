import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import {
  Button,
  Card,
  DailyProgressCard,
  EmptyState,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '../../../components/ui';
import { MACROS } from '../../../lib/nutrition/model/macros';
import { mealSlotIcon, progress, roundForDisplay, useDailyNutrition } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

const PENDING = '—';

export default function FoodLog() {
  const today = useDailyNutrition();
  const { surfaces } = useTheme();

  const consumed = roundForDisplay(today.nutrition);
  const pending = today.isLoading;

  return (
    <Screen>
      <ScreenHeader title="Log Food" back />

      <Card>
        <Text style={[styles.count, { color: surfaces.text }]}>
          {pending ? PENDING : `${today.mealsLoggedCount} / ${today.totalMealSlots} logged`}
        </Text>
        <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
          Track your meals and stay on top of your nutrition.
        </Text>
      </Card>

      {today.error ? <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text> : null}

      <SectionHeader title="Today's Goal" />
      <DailyProgressCard
        headline={
          pending
            ? `${PENDING} / ${today.targets.calories.toLocaleString()} kcal`
            : `${consumed.calories.toLocaleString()} / ${today.targets.calories.toLocaleString()} kcal`
        }
        percentLabel={pending ? PENDING : `${today.caloriePercent}%`}
        progress={pending ? 0 : today.calorieProgress}
        bars={MACROS.map((macro) => ({
          label: macro.label,
          valueLabel: `${pending ? PENDING : consumed[macro.key]} / ${today.targets[macro.key]}${macro.unit}`,
          progress: pending ? 0 : progress(consumed[macro.key], today.targets[macro.key]),
          color: palette[macro.key],
        }))}
      />

      <SectionHeader title="Today's Meals" />
      {pending ? null : today.isEmpty ? (
        <EmptyState
          icon="restaurant-outline"
          title="No food logged yet"
          body="Tap Log Food to add your first meal of the day."
        />
      ) : (
        /**
         * Every slot shows, including empty ones — unlike the Fuel hub,
         * which lists only what's been logged. This screen is where the day
         * gets filled in, so a slot with nothing in it is information.
         * Per-entry rows and tap-to-edit arrive with the Core Logging slice.
         */
        today.meals.map((meal) => (
          <ListRow
            key={meal.slot}
            icon={mealSlotIcon(meal.slot)}
            title={meal.slot}
            subtitle={meal.itemCount === 0 ? 'Nothing logged' : meal.itemCount === 1 ? '1 item' : `${meal.itemCount} items`}
            value={`${Math.round(meal.nutrition.calories)} kcal`}
          />
        ))
      )}

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
  error: {
    ...typography.caption,
  },
});
