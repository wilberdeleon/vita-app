import { useWindowDimensions } from 'react-native';
import { Screen, Section, SectionHeader } from '../../../components/ui';
import { HomeHeader } from '../../../features/dashboard/components/HomeHeader';
import { HomeSummaryCard } from '../../../features/dashboard/components/HomeSummaryCard';
import { JourneyCard } from '../../../features/dashboard/components/JourneyCard';
import { MacrosCard } from '../../../features/dashboard/components/MacrosCard';
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
    <Screen dockClearance contentGap={spacing.xxxl} topInset={false} horizontalInset={horizontalInset} themed>
      <HomeHeader greeting={greeting} firstName={data.firstName} />

      <HomeSummaryCard calories={data.calories} goals={data.goals} />

      <JourneyCard journey={data.journey} />

      <MacrosCard macros={data.calories.macros} />

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
