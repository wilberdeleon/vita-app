import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  DailyProgressCard,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionHeader,
  useToast,
} from '../../../components/ui';
import { LoggedEntryRow } from '../../../features/fuel/components/LoggedEntryRow';
import {
  MACROS,
  macroHasGoal,
  progress,
  roundForDisplay,
  useDailyNutrition,
  useNutrition,
  type FoodEntry,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

const PENDING = '—';

export default function FoodLog() {
  const today = useDailyNutrition();
  const { removeEntry, restoreEntry } = useNutrition();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const consumed = roundForDisplay(today.nutrition);
  const pending = today.isLoading;
  /** `undefined` when the user has authored no calorie goal. */
  const goal = today.targets?.calories;

  const handleDelete = (entry: FoodEntry) => {
    // Captured before removal so Undo restores the entry to where it was,
    // not to the end of the list.
    const index = today.entries.findIndex((candidate) => candidate.id === entry.id);
    void removeEntry(entry.id);
    showToast({
      message: `Removed · ${entry.name}`,
      actionLabel: 'Undo',
      onAction: () => {
        void restoreEntry(entry, index);
      },
    });
  };

  return (
    <Screen>
      <ScreenHeader title="Food Log" back />

      <Card>
        <Text style={[styles.count, { color: surfaces.text }]}>
          {pending ? PENDING : `${today.mealsLoggedCount} / ${today.totalMealSlots} logged`}
        </Text>
        <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
          Track your meals and stay on top of your nutrition.
        </Text>
      </Card>

      {today.error ? <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text> : null}

      {/*
        * Goal-relative only when there is a goal (slice 5.6A).
        *
        * A denominator the user never chose is not a goal, so with none set
        * this states the day's totals and stops. The visual treatment is
        * 5.6B's; all that changed here is that it no longer claims a target.
        */}
      <SectionHeader title={goal === undefined ? "Today's Total" : "Today's Goal"} />
      <DailyProgressCard
        headline={
          goal === undefined
            ? `${pending ? PENDING : consumed.calories.toLocaleString()} Calories`
            : pending
              ? `${PENDING} / ${goal.toLocaleString()} Calories`
              : `${consumed.calories.toLocaleString()} / ${goal.toLocaleString()} Calories`
        }
        percentLabel={
          today.caloriePercent === null ? undefined : pending ? PENDING : `${today.caloriePercent}%`
        }
        progress={pending ? 0 : (today.calorieProgress ?? 0)}
        bars={MACROS.map((macro) => {
          // A macro with no goal shows what was eaten, with no denominator
          // appended. Protein reads as a goal to reach only when one exists.
          // Only protein can carry a goal (5.6A.1). Carbs and fat are
          // totals, so they never gain a denominator.
          const macroGoal = macroHasGoal(macro.key) ? today.targets?.protein : undefined;
          const eaten = pending ? PENDING : String(consumed[macro.key]);
          return {
            label: macroGoal === undefined || macro.key !== 'protein' ? macro.label : `${macro.label} Goal`,
            valueLabel:
              macroGoal === undefined
                ? `${eaten} ${macro.unit}`
                : `${eaten} / ${macroGoal} ${macro.unit}`,
            progress: pending || macroGoal === undefined ? 0 : progress(consumed[macro.key], macroGoal),
            color: palette[macro.key],
          };
        })}
      />

      {pending ? null : today.isEmpty ? (
        <>
          <SectionHeader title="Today's Meals" />
          <EmptyState
            icon="restaurant-outline"
            title="No food logged yet"
            body="Tap Log Food to add your first meal of the day."
          />
        </>
      ) : (
        /**
         * Grouped by meal, and only meals with something in them. Rendering
         * all four with three empty headings turns a short log into a mostly
         * blank screen; the meal a food belongs to is chosen when it's added,
         * so an empty slot here isn't a control, just noise.
         */
        today.meals
          .filter((meal) => meal.itemCount > 0)
          .map((meal) => (
            <View key={meal.slot} style={styles.mealGroup}>
              <SectionHeader title={`${meal.slot} · ${Math.round(meal.nutrition.calories)} Calories`} />
              {meal.entries.map((entry) => (
                <LoggedEntryRow key={entry.id} entry={entry} onDelete={() => handleDelete(entry)} />
              ))}
            </View>
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
  mealGroup: {
    gap: spacing.s,
  },
});
