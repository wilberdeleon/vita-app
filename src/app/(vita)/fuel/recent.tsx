import { EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { getFixtureRecents } from '../../../features/fuel/fixtureCatalog';

/**
 * Interim list from the placeholder catalog. Recents driven by real logging
 * history ship in slice 2.7.
 */
export default function RecentFoods() {
  const foods = getFixtureRecents();

  return (
    <Screen>
      <ScreenHeader title="Recent Foods" back />
      {foods.length > 0 ? (
        <>
          <SectionHeader title="Recently logged" />
          {foods.map((food) => (
            <FoodRow key={food.vitaId} food={food} />
          ))}
        </>
      ) : (
        <EmptyState icon="time-outline" title="Nothing logged yet" body="Foods you log will show up here for quick re-logging." />
      )}
    </Screen>
  );
}
