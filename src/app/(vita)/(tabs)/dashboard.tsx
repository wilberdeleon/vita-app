import { restaurantIconFor } from '../../../features/dashboard/mealIcons';
import { DailyProgressCard, ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { GreetingCard } from '../../../features/dashboard/components/GreetingCard';
import { JourneyCard } from '../../../features/dashboard/components/JourneyCard';
import { QuickStatsRow } from '../../../features/dashboard/components/QuickStatsRow';
import { getDashboard } from '../../../features/dashboard/api';
import { greetingForHour } from '../../../features/dashboard/greeting';

export default function Dashboard() {
  const data = getDashboard();
  const { calories } = data;
  const greeting = greetingForHour(new Date().getHours());

  return (
    <Screen dockClearance>
      <ScreenHeader title="VITA" brand settings />
      <GreetingCard greeting={greeting} firstName={data.firstName} headline={data.headline} subline={data.subline} />

      <SectionHeader title="Today's Summary" />
      <DailyProgressCard
        headline={`${calories.current.toLocaleString()} / ${calories.goal.toLocaleString()} kcal`}
        percentLabel={`${Math.round((calories.current / calories.goal) * 100)}%`}
        progress={calories.current / calories.goal}
        bars={calories.macros.map((macro) => ({
          label: macro.label,
          valueLabel: `${macro.current} / ${macro.goal}${macro.unit}`,
          progress: macro.current / macro.goal,
          color: macro.color,
        }))}
      />

      <QuickStatsRow stats={data.quickStats} />

      <SectionHeader title="Current Journey" />
      <JourneyCard journey={data.journey} />

      <SectionHeader title="Today's Meals" />
      {data.meals.map((meal) => (
        <ListRow
          key={meal.id}
          icon={restaurantIconFor(meal.slot)}
          title={meal.name}
          subtitle={meal.slot}
          value={`${meal.kcal} kcal`}
        />
      ))}
    </Screen>
  );
}
