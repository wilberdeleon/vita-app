import { router } from 'expo-router';
import { DailyProgressCard, EmptyState, ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { getPeptideToday } from '../../../features/peptides/api';
import { getWaterToday } from '../../../features/water/api';
import { MACROS } from '../../../lib/nutrition/model/macros';
import { mealSlotIcon, progress, roundForDisplay, useDailyNutrition } from '../../../lib/nutrition';
import { palette } from '../../../theme/tokens';

/** Stand-in for a number that hasn't been read from storage yet (see below). */
const PENDING = '—';

export default function Fuel() {
  const today = useDailyNutrition();
  const water = getWaterToday();
  const peptides = getPeptideToday();

  // Stored exactly, rounded only here at the display edge, so a half-serving
  // never accumulates rounding error across a day's totals.
  const consumed = roundForDisplay(today.nutrition);

  /**
   * Hydration from AsyncStorage is fast but not instant. Showing a real "0"
   * that jumps to "1,267" a frame later would read as data loss, so numbers
   * hold an em dash until the day is actually loaded — the layout never
   * shifts, and nothing false is ever on screen.
   */
  const pending = today.isLoading;

  const loggedMeals = today.meals.filter((meal) => meal.itemCount > 0);

  return (
    <Screen dockClearance>
      <ScreenHeader title="Fuel" settings />

      <SectionHeader title="Today's Summary" />
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

      <SectionHeader title="Today's Meals" actionLabel="View all" onAction={() => router.push('/fuel/log')} />
      {pending ? null : loggedMeals.length > 0 ? (
        /**
         * One row per meal slot that has something in it, rather than one row
         * per food. With real logging a day can hold a dozen entries, and the
         * hub is a glance surface — the full per-entry list is what Food Log
         * is for. Previously this listed individual foods because the fixture
         * happened to contain exactly one food per meal.
         */
        loggedMeals.map((meal) => (
          <ListRow
            key={meal.slot}
            icon={mealSlotIcon(meal.slot)}
            title={meal.slot}
            subtitle={meal.itemCount === 1 ? '1 item' : `${meal.itemCount} items`}
            value={`${Math.round(meal.nutrition.calories)} kcal`}
          />
        ))
      ) : (
        <EmptyState icon="restaurant-outline" title="No food logged yet" body="Anything you log today shows up here." />
      )}

      <SectionHeader title="Logs" />
      <ListRow
        icon="restaurant-outline"
        title="Food Log"
        value={pending ? PENDING : `${today.mealsLoggedCount} / ${today.totalMealSlots} logged`}
        chevron
        onPress={() => router.push('/fuel/log')}
      />
      <ListRow
        icon="water-outline"
        iconColor={palette.water}
        title="Water Log"
        value={`${water.cups} / ${water.goalCups} cups`}
        chevron
        onPress={() => router.push('/water')}
      />
      <ListRow
        icon="medical-outline"
        iconColor={palette.peptide}
        title="Peptide Log"
        value={`${peptides.logged} / ${peptides.goal} logged`}
        chevron
        onPress={() => router.push('/peptides')}
      />
    </Screen>
  );
}
