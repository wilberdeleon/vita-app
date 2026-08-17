import { router } from 'expo-router';
import { ListRow } from '../../../components/ui';
import { formatCalories, type VitaFood } from '../../../lib/nutrition';

type Props = {
  food: VitaFood;
};

/**
 * One food in a list — search results, Recent, Favorites.
 *
 * Consumes the normalized model, so the same row renders a custom food, a
 * fixture food, or (later) a USDA or FatSecret result with no per-source
 * branching.
 *
 * The heart that used to sit here was removed in slice 2.3: it had no
 * `onPress` and toggled nothing, which is the same deceptive-control problem
 * as the gallery button on the barcode mock. It returns as a working control
 * when Favorites becomes real (slice 2.7).
 */
export function FoodRow({ food }: Props) {
  const serving = food.servings[food.defaultServingIndex] ?? food.servings[0];
  const detail = [food.brand, serving?.label].filter(Boolean).join(' · ');

  return (
    <ListRow
      icon="fast-food-outline"
      title={food.name}
      subtitle={detail || undefined}
      value={serving ? `${formatCalories(serving.nutrition.calories)} kcal` : undefined}
      chevron
      onPress={() => router.push(`/fuel/food/${encodeURIComponent(food.vitaId)}`)}
    />
  );
}
