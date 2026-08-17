import { EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { getFixtureFavorites } from '../../../features/fuel/fixtureCatalog';

/**
 * Interim list from the placeholder catalog. Real favoriting — a persisted
 * store keyed by `vitaId`, working across every source — ships in slice 2.7.
 */
export default function FavoriteFoods() {
  const foods = getFixtureFavorites();

  return (
    <Screen>
      <ScreenHeader title="Favorites" back />
      {foods.length > 0 ? (
        <>
          <SectionHeader title="Your favorites" />
          {foods.map((food) => (
            <FoodRow key={food.vitaId} food={food} />
          ))}
        </>
      ) : (
        <EmptyState icon="heart-outline" title="No favorites yet" body="Favorite a food to keep it one tap away." />
      )}
    </Screen>
  );
}
