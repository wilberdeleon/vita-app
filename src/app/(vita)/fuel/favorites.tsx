import { Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { getFavoriteFoods } from '../../../features/fuel/api';

export default function FavoriteFoods() {
  const foods = getFavoriteFoods();

  return (
    <Screen>
      <ScreenHeader title="Favorites" back />
      <SectionHeader title="Your favorites" />
      {foods.map((food) => (
        <FoodRow key={food.id} food={food} heart />
      ))}
    </Screen>
  );
}
