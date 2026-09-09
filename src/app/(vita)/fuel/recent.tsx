import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { EmptyState, Screen, ScreenHeader } from '../../../components/ui';
import { FoodListRow } from '../../../features/fuel/components/FoodListRow';
import { MealContext } from '../../../features/fuel/components/MealContext';
import { parseMealSlot, useRecentFoods } from '../../../lib/nutrition';
import { palette, spacing } from '../../../theme/tokens';

/**
 * Every food the user has actually logged, most recent first.
 *
 * Derived from the log itself rather than a parallel list — see
 * `useRecentFoods` — so it cannot disagree with what was eaten.
 *
 * **The same rows Add Food shows**, at full length. Add Food carries the first
 * few and links here; this is the rest of them. One row family, so a food
 * looks identical in both places, and the card-per-row treatment this screen
 * used until 5.6C is gone along with the rest of Sprint 2's list language.
 */
export default function RecentFoods() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const meal = parseMealSlot(params.meal);
  const { recents, isLoading } = useRecentFoods();

  return (
    <Screen>
      <ScreenHeader title="Recent foods" back />
      {meal ? <MealContext meal={meal} /> : null}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
        </View>
      ) : recents.length > 0 ? (
        <View>
          {recents.map((recent, index) => (
            <FoodListRow
              key={recent.food.vitaId}
              food={recent.food}
              meal={meal}
              divided={index > 0}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="time-outline"
          title="No recent foods yet"
          body="Foods you log show up here, so you can log them again in seconds."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
});
