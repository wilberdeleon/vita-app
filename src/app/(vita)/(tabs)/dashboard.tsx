import { useMemo } from 'react';
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
import type { CalorieSummary, GoalPillar, MealSlotSummary } from '../../../features/dashboard/types';
import { MACROS, roundForDisplay, useDailyNutrition } from '../../../lib/nutrition';
import { palette, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** Narrower iPhones (SE-class) get a slightly tighter outer margin than the rest of the 24–30px directional range. */
const NARROW_WIDTH_BREAKPOINT = 380;

/**
 * Home reads nutrition from the same engine as Fuel (slice 2.5).
 *
 * Everything nutrition-related below is *derived* here into the view models
 * Home's approved components already expect — no second set of totals is
 * calculated, and no Dashboard component changed. `getDashboard()` still
 * supplies the domains Sprint 2 doesn't cover: the greeting name, Journey,
 * quick stats, and the non-nutrition goal pillars.
 */
export default function Dashboard() {
  const data = getDashboard();
  const today = useDailyNutrition();
  const greeting = useGreeting();
  const { width } = useWindowDimensions();
  const { scheme } = useTheme();
  const horizontalInset = width < NARROW_WIDTH_BREAKPOINT ? 24 : 28;
  const tone = scheme === 'dark' ? 'light' : 'dark';

  const consumed = roundForDisplay(today.nutrition);

  const calories = useMemo<CalorieSummary>(
    () => ({
      current: consumed.calories,
      goal: today.targets.calories,
      macros: MACROS.map((macro) => ({
        label: macro.label,
        current: consumed[macro.key],
        goal: today.targets[macro.key],
        unit: macro.unit,
        color: palette[macro.key],
      })),
    }),
    [consumed, today.targets],
  );

  /**
   * Only the nutrition pillar is recomputed. Water, Movement, and Recovery
   * have no feature behind them yet, so they keep their fixture values
   * rather than being silently redefined as nutrition-derived — the
   * "N of 4 goals complete" count must stay honest about what it knows.
   *
   * Nutrition counts as complete once the day's calorie target is reached.
   * That is a product-semantics choice, not a derived fact — flagged for
   * founder confirmation.
   */
  const goals = useMemo<GoalPillar[]>(
    () =>
      data.goals.map((goal) =>
        goal.id === 'nutrition'
          ? { ...goal, complete: today.targets.calories > 0 && consumed.calories >= today.targets.calories }
          : goal,
      ),
    [data.goals, consumed.calories, today.targets.calories],
  );

  /**
   * All four slots always render, empty ones included — that is Home's
   * approved presentation, and an empty day simply reads as four zeroed
   * rows rather than needing a new empty state. Fuel's Food Log is where
   * per-entry detail lives; Home aggregates each meal to a total and a
   * count.
   */
  const mealSlots = useMemo<MealSlotSummary[]>(
    () =>
      today.meals.map((meal) => ({
        slot: meal.slot,
        kcal: Math.round(meal.nutrition.calories),
        itemCount: meal.itemCount,
      })),
    [today.meals],
  );

  return (
    <Screen dockClearance contentGap={spacing.xxxl} topInset={false} horizontalInset={horizontalInset}>
      <HomeHeader greeting={greeting} firstName={data.firstName} />

      <HomeSummaryCard calories={calories} goals={goals} />

      <JourneyCard journey={data.journey} />

      <MacrosCard macros={calories.macros} />

      <Section header={<SectionHeader title="Health Metrics" tone={tone} />}>
        <QuickStatsRow stats={data.quickStats} />
      </Section>

      <Section header={<SectionHeader title="Today's Meals" tone={tone} />}>
        {mealSlots.map((meal) => (
          <MealRow key={meal.slot} meal={meal} />
        ))}
      </Section>
    </Screen>
  );
}
