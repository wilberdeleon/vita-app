import { router } from 'expo-router';
import { restaurantIconFor } from '../../../features/dashboard/mealIcons';
import { DailyProgressCard, ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { getFuelToday } from '../../../features/fuel/api';
import { palette } from '../../../theme/tokens';

export default function Fuel() {
  const today = getFuelToday();

  return (
    <Screen dockClearance>
      <ScreenHeader title="Fuel" settings />

      <SectionHeader title="Today's Summary" />
      <DailyProgressCard
        headline={`${today.kcal.current.toLocaleString()} / ${today.kcal.goal.toLocaleString()} kcal`}
        percentLabel={`${Math.round((today.kcal.current / today.kcal.goal) * 100)}%`}
        progress={today.kcal.current / today.kcal.goal}
        bars={today.macros.map((macro) => ({
          label: macro.label,
          valueLabel: `${macro.current} / ${macro.goal}${macro.unit}`,
          progress: macro.current / macro.goal,
          color: macro.color,
        }))}
      />

      <SectionHeader title="Today's Meals" actionLabel="View all" onAction={() => router.push('/fuel/log')} />
      {today.meals.map((meal) => (
        <ListRow
          key={meal.id}
          icon={restaurantIconFor(meal.slot)}
          title={meal.name}
          subtitle={meal.slot}
          value={`${meal.kcal} kcal`}
        />
      ))}

      <SectionHeader title="Logs" />
      <ListRow
        icon="restaurant-outline"
        title="Food Log"
        value={`${today.mealsLogged} / ${today.mealSlots} logged`}
        chevron
        onPress={() => router.push('/fuel/log')}
      />
      <ListRow
        icon="water-outline"
        iconColor={palette.water}
        title="Water Log"
        value={`${today.waterCups.current} / ${today.waterCups.goal} cups`}
        chevron
        onPress={() => router.push('/water')}
      />
      <ListRow
        icon="medical-outline"
        iconColor={palette.peptide}
        title="Peptide Log"
        value={`${today.peptides.logged} / ${today.peptides.goal} logged`}
        chevron
        onPress={() => router.push('/peptides')}
      />
    </Screen>
  );
}
