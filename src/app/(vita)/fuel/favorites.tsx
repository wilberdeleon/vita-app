import { EmptyState, Screen, ScreenHeader } from '../../../components/ui';

/**
 * Real favoriting — a persisted store keyed by `vitaId`, working across
 * every source — ships in slice 2.7, alongside the heart control that was
 * removed from `FoodRow` for toggling nothing.
 */
export default function FavoriteFoods() {
  return (
    <Screen>
      <ScreenHeader title="Favorites" back />
      <EmptyState icon="heart-outline" title="No favorites yet" body="Favorite a food to keep it one tap away." />
    </Screen>
  );
}
