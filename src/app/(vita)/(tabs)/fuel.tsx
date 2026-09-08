import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../../components/ui';
import { AddFoodAction, GoalPrompt, MealShortcuts } from '../../../features/fuel/components/FuelActions';
import { DayStrip } from '../../../features/fuel/components/DayStrip';
import { FuelEmptyDay } from '../../../features/fuel/components/FuelEmptyDay';
import { FuelHeader } from '../../../features/fuel/components/FuelHeader';
import { NutritionContext } from '../../../features/fuel/components/NutritionContext';
import { TodaysMeals } from '../../../features/fuel/components/TodaysMeals';
import { formatLogDateShort } from '../../../lib/daily';
import { hasAnyGoal, useDailyNutrition, type MealSlot } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';

/**
 * Fuel — **what did I eat today?**
 *
 * ## What this replaced (slice 5.6B)
 *
 * The previous screen was a calorie ring in a full-width card, a solid
 * orange *Log Food* card beside a bordered *Scan Barcode* card, four meal
 * rows inside another card — each saying *No foods logged* whether or not
 * anything had happened — and two tiles reporting Hydration and Peptides.
 * Six rounded surfaces before any food appeared. The founder's review on a
 * real device was that it did not look like the same generation of VITA as
 * the locked Dashboard, and the audit's diagnosis was that **the loudest
 * object on the screen was the least Fuel-specific thing it could have
 * drawn**: a calorie ring, which every calorie counter already has.
 *
 * ## The subject is the food
 *
 * `DayStrip` is Fuel's identity object, built from the food artwork VITA
 * already owns. Water fills a vessel, Peptides draws a timeline of states,
 * Fuel shows the things you actually ate, in the order you ate them. The
 * nutrition figures follow it as context rather than leading as a score —
 * which is also why there is no ring: with no goal there is nothing to be a
 * fraction of, and with one a slim rail says it without the ceremony.
 *
 * ## Direct on the background
 *
 * Sprint 5's default. Nothing on this screen is in a card; sections are
 * separated by space and hairlines, which is how the Peptides routine screen
 * and Water's day already read.
 *
 * ## One action
 *
 * `Add food`, neutral, with the meal-aware `+` beside each logged meal as a
 * shortcut and the scanner as one icon in the header. Previously four things
 * competed to start the same task.
 *
 * ## Fuel is Fuel, not a small Dashboard
 *
 * The Hydration and Peptides tiles are gone. Cross-domain overview is what
 * Home is for, and Home is locked and already does it; a feature screen
 * carrying miniature versions of two other features is how Fuel came to feel
 * like a template.
 *
 * Every figure still comes from `useDailyNutrition()`, the same engine Home
 * reads, so the two cannot disagree. No domain file changed for this
 * redesign.
 */
export default function Fuel() {
  const today = useDailyNutrition();

  const addFood = (meal?: MealSlot) =>
    router.push(meal ? `/fuel/add?meal=${encodeURIComponent(meal)}` : '/fuel/add');

  const openEntry = (entryId: string) =>
    router.push(`/fuel/entry/${encodeURIComponent(entryId)}`);

  const noGoals = !today.isLoading && !hasAnyGoal(today.targets);
  const empty = !today.isLoading && today.isEmpty;

  return (
    <Screen dockClearance contentGap={spacing.l} topInset={false}>
      <FuelHeader
        dateLabel={formatLogDateShort(today.logDate)}
        onScan={() => router.push('/fuel/scan')}
        onSettings={() => router.push('/settings')}
      />

      {today.error ? (
        <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text>
      ) : null}

      {/* The hero, in both states — resting when the day is untouched. */}
      <DayStrip entries={today.entries} onOpenEntry={openEntry} />

      {empty ? (
        <>
          <FuelEmptyDay targets={today.targets} />
          <AddFoodAction onPress={() => addFood()} />
          {/* Orientation, not obligation: what a day is made of, each one a
              shortcut that carries its meal through to Food Detail. */}
          <MealShortcuts onAddToMeal={addFood} />
        </>
      ) : (
        <>
          {/*
            * Numbers follow the food. On a day with something in it these
            * are the context for what is above, not the point of the screen.
            */}
          <NutritionContext today={today} />
          <TodaysMeals
            entries={today.entries}
            onOpenEntry={openEntry}
            onAddToMeal={addFood}
          />
          <AddFoodAction onPress={() => addFood()} />
        </>
      )}

      {/* Only while the user has neither goal — see `GoalPrompt`. */}
      {noGoals ? <GoalPrompt onPress={() => router.push('/settings/nutrition-goals')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
  },
});
