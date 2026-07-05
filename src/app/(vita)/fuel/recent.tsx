import { Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { getRecentFoods } from '../../../features/fuel/api';

export default function RecentFoods() {
  const foods = getRecentFoods();

  return (
    <Screen>
      <ScreenHeader title="Recent Foods" back />
      <SectionHeader title="Recently logged" />
      {foods.map((food) => (
        <FoodRow key={food.id} food={food} heart />
      ))}
    </Screen>
  );
}
