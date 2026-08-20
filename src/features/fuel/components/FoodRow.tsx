import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ListRow } from '../../../components/ui';
import { formatCalories, type VitaFood } from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  food: VitaFood;
  /** Hidden on the Favorites screen itself, where every row is favorited. */
  showFavorite?: boolean;
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
 */
export function FoodRow({ food, showFavorite = true }: Props) {
  const { surfaces } = useTheme();
  const serving = food.servings[food.defaultServingIndex] ?? food.servings[0];
  const detail = [food.brand, serving?.label].filter(Boolean).join(' · ');

  return (
    <ListRow
      icon="fast-food-outline"
      title={food.name}
      subtitle={detail || undefined}
      onPress={() => router.push(`/fuel/food/${encodeURIComponent(food.vitaId)}`)}
      trailing={
        <View style={styles.trailing}>
          {serving ? (
            <Text style={[styles.kcal, { color: surfaces.textSecondary }]}>
              {formatCalories(serving.nutrition.calories)} kcal
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
  kcal: {
    ...typography.caption,
  },
});
