import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ListRow } from '../../../components/ui';
import { formatCalories, type MealSlot, type VitaFood } from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { FavoriteButton } from './FavoriteButton';
import { FoodAvatar } from './FoodAvatar';

type Props = {
  food: VitaFood;
  /** Hidden on the Favorites screen itself, where every row is favorited. */
  showFavorite?: boolean;
  /**
   * Carried through to Food Detail so a food opened from a meal-specific
   * flow lands in that meal. Unset, Food Detail seeds the meal from the
   * time of day exactly as before.
   */
  meal?: MealSlot;
};

/**
 * One food in a list — search results, Recents, Favorites.
 *
 * Consumes the normalized model, so the same row renders a custom food, a
 * USDA food, or an Open Food Facts food with no per-source branching.
 *
 * The heart returned in slice 2.7 now that it toggles real persisted state;
 * it was removed in 2.3 precisely because it did nothing. No chevron
 * alongside it — the row body is the tap target, same as the log rows.
 *
 * The leading visual goes through the shared resolver rather than a fixed
 * glyph, so a search result with a product photograph shows it and one
 * without falls back to its category — the same answer this food gets on
 * every other surface.
 */
export function FoodRow({ food, showFavorite = true, meal }: Props) {
  const { surfaces } = useTheme();
  const serving = food.servings[food.defaultServingIndex] ?? food.servings[0];
  const detail = [food.brand, serving?.label].filter(Boolean).join(' · ');

  return (
    <ListRow
      leading={<FoodAvatar food={food} size={36} />}
      title={food.name}
      subtitle={detail || undefined}
      onPress={() =>
        router.push(
          `/fuel/food/${encodeURIComponent(food.vitaId)}${meal ? `?meal=${encodeURIComponent(meal)}` : ''}`,
        )
      }
      trailing={
        <View style={styles.trailing}>
          {serving ? (
            <Text style={[styles.calories, { color: surfaces.textSecondary }]}>
              {formatCalories(serving.nutrition.calories)} cal
            </Text>
          ) : null}
          {showFavorite ? <FavoriteButton food={food} size={19} withSurface /> : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  calories: {
    ...typography.caption,
  },
});
