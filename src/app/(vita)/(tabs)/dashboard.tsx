import { useWindowDimensions } from 'react-native';
import { Screen, Section, SectionHeader } from '../../../components/ui';
import { HomeHeader } from '../../../features/dashboard/components/HomeHeader';
import { HomeSummaryCard } from '../../../features/dashboard/components/HomeSummaryCard';
import { JourneyProgressCard } from '../../../features/dashboard/components/JourneyProgressCard';
import { MealRow } from '../../../features/dashboard/components/MealRow';
import { QuickStatsRow } from '../../../features/dashboard/components/QuickStatsRow';
import { getDashboard } from '../../../features/dashboard/api';
import { useGreeting } from '../../../features/dashboard/greeting';
import { spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** Narrower iPhones (SE-class) get a slightly tighter outer margin than the rest of the 24–30px directional range. */
const NARROW_WIDTH_BREAKPOINT = 380;

export default function Dashboard() {
  const data = getDashboard();
  const greeting = useGreeting();
  const { width } = useWindowDimensions();
  const { scheme } = useTheme();
  const horizontalInset = width < NARROW_WIDTH_BREAKPOINT ? 24 : 28;
  const tone = scheme === 'dark' ? 'light' : 'dark';

  return (
    <Screen dockClearance contentGap={spacing.xxl} topInset={false} horizontalInset={horizontalInset} themed>
      <HomeHeader greeting={greeting} firstName={data.firstName} />

      <HomeSummaryCard calories={data.calories} goals={data.goals} streakDays={data.streakDays} />

      <JourneyProgressCard journey={data.journey} macros={data.calories.macros} />

      <Section header={<SectionHeader title="Health Metrics" tone={tone} />}>
        <QuickStatsRow stats={data.quickStats} />
      </Section>

      <Section header={<SectionHeader title="Today's Meals" tone={tone} />}>
        {data.mealSlots.map((meal) => (
          <MealRow key={meal.slot} meal={meal} />
        ))}
      </Section>
    </Screen>
  );
}
