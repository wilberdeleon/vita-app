import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { FavoriteButton } from '../../../features/fuel/components/FavoriteButton';
import { foodFromEntry, parseMealSlot, useNutrition, type VitaFood } from '../../../lib/nutrition';
import { palette, spacing } from '../../../theme/tokens';

/**
 * Favorited foods, newest first.
 *
 * A favorite stores its own normalized definition where the provider's
 * terms allow it, so this screen works offline and long after any search
 * cache has expired. Where storage isn't permitted, the identity is kept
 * and the definition resolves from elsewhere — the row renders the same
 * either way.
 */
export default function FavoriteFoods() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const meal = parseMealSlot(params.meal);
  const suffix = meal ? `?meal=${encodeURIComponent(meal)}` : '';
  const { status, favorites, findFood, entries } = useNutrition();

  const resolve = (vitaId: string): VitaFood | undefined => {
    const stored = findFood(vitaId);
    if (stored) return stored;
    // Last resort for a favorite whose definition can't be persisted:
    // rebuild it from the user's own logging history.
    const entry = entries.find((candidate) => candidate.foodRef.vitaFoodId === vitaId);
    return entry ? foodFromEntry(entry) : undefined;
  };

  const rows = favorites
    .map((favorite) => resolve(favorite.vitaId))
    .filter((food): food is VitaFood => Boolean(food));

  return (
    <Screen>
      <ScreenHeader title="Favorites" subtitle={meal ? `Adding to ${meal}` : undefined} back />

      {/*
        Favorites are empty until storage hydrates, so rendering the empty
        state immediately would tell a user with saved favorites that they
        have none — the same false-zero problem the Fuel summary and Food
        Log already guard against, and Recents solves with its own loading
        flag. A spinner for the frame or two it takes, then the truth.
      */}
      {status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
        </View>
      ) : rows.length > 0 ? (
        <>
          <SectionHeader title="Your favorites" />
          {rows.map((food) => (
            <View key={food.vitaId} style={styles.row}>
              <View style={styles.grow}>
                <FoodRow food={food} showFavorite={false} meal={meal} />
              </View>
              <FavoriteButton food={food} withSurface />
            </View>
          ))}
        </>
      ) : (
        <View style={styles.emptyBlock}>
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            body="Tap the heart on any food to keep it one tap away."
          />
          <Button label="Search foods" variant="soft" onPress={() => router.push(`/fuel/search${suffix}`)} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  grow: {
    flex: 1,
  },
  emptyBlock: {
    gap: spacing.m,
  },
  centered: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
});
