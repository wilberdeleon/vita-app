import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { EmptyState, Screen, ScreenHeader } from '../../../components/ui';
import { FoodListRow } from '../../../features/fuel/components/FoodListRow';
import { MealContext } from '../../../features/fuel/components/MealContext';
import { foodFromEntry, parseMealSlot, useNutrition, type VitaFood } from '../../../lib/nutrition';
import { palette, spacing } from '../../../theme/tokens';

/**
 * Favorited foods, newest first.
 *
 * A favorite stores its own normalized definition where the provider's terms
 * allow it, so this screen works offline and long after any search cache has
 * expired. Where storage isn't permitted, the identity is kept and the
 * definition is rebuilt from the user's own logging history — the row renders
 * the same either way.
 *
 * **The same rows Search and Recents show.** Until 5.6C this screen wrapped
 * `FoodRow` in its own flex layout to hang an external heart beside it — a
 * fourth visual variant of one thing. Favourites are not a different class of
 * food and no longer look like one: no gold cards, no starred tiles, and the
 * heart is simply hidden here, because on this screen every row is favourited
 * and a row of identical filled hearts says nothing.
 */
export default function FavoriteFoods() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const meal = parseMealSlot(params.meal);
  const { status, favorites, findFood, entries } = useNutrition();

  const resolve = (vitaId: string): VitaFood | undefined => {
    const stored = findFood(vitaId);
    if (stored) return stored;
    const entry = entries.find((candidate) => candidate.foodRef.vitaFoodId === vitaId);
    return entry ? foodFromEntry(entry) : undefined;
  };

  const rows = favorites
    .map((favorite) => resolve(favorite.vitaId))
    .filter((food): food is VitaFood => Boolean(food));

  return (
    <Screen>
      <ScreenHeader title="Favorites" back />
      {meal ? <MealContext meal={meal} /> : null}

      {/*
        Favorites are empty until storage hydrates, so rendering the empty
        state immediately would tell a user with saved favorites that they
        have none — the same false-zero problem the Fuel summary and Food Log
        already guard against. A spinner for the frame or two it takes, then
        the truth.
      */}
      {status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
        </View>
      ) : rows.length > 0 ? (
        <View>
          {rows.map((food, index) => (
            <FoodListRow
              key={food.vitaId}
              food={food}
              meal={meal}
              divided={index > 0}
              showFavorite={false}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          body="Tap the heart on any food to keep it one tap away."
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
