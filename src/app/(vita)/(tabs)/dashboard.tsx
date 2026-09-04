import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../../components/ui';
import { DashboardHeader } from '../../../features/dashboard/components/DashboardHeader';
import { FuelStrip } from '../../../features/dashboard/components/FuelStrip';
import { PeptidesModule } from '../../../features/dashboard/components/PeptidesModule';
import { ToolsRow } from '../../../features/dashboard/components/ToolsRow';
import { WaterModule } from '../../../features/dashboard/components/WaterModule';
import { useGreeting } from '../../../features/dashboard/greeting';
import { useAuth } from '../../../features/auth/AuthProvider';
import { formatLogDateLong } from '../../../lib/daily';
import { useDailyNutrition } from '../../../lib/nutrition';
import { usePeptides } from '../../../lib/peptides';
import { useWaterToday } from '../../../lib/water';
import { spacing } from '../../../theme/tokens';

/**
 * Home — a daily control surface, not a report.
 *
 * ## What this replaced, and why so little survived
 *
 * The Dashboard before slice 5.3 was six stacked frosted cards: a greeting
 * with two slogans, a goals summary, a Journey card, a macros card, five
 * metric tiles, and four meal rows. It read as an analytics page, it had **no
 * action affordance above the fold**, and more than half of what it showed
 * was invented — steps, sleep, workouts, a streak, a Journey stage, and two
 * of four "goal pillars" all came from `DASHBOARD_FIXTURE`. The founder
 * ruling was unambiguous: *if real data exists, use it; if it doesn't, don't
 * fabricate activity to make a module look populated.* That deleted the
 * fixture file, and with it most of the old screen.
 *
 * ## Every number here comes from a feature's own engine
 *
 * `useWaterToday()`, `useDailyNutrition()` and `usePeptides()` — the same
 * hooks Water, Fuel and Peptides read. Home derives nothing and stores
 * nothing; there is no dashboard state, no aggregate cache, and no second
 * copy of a total that could drift from the screen it came from. Because
 * these are the live providers, logging a drink or marking a dose taken is
 * reflected here the moment you come back, with no refresh and no polling.
 *
 * The name comes from `useAuth()` — the app's identity boundary — rather than
 * from a screen-owned constant.
 *
 * ## The composition, and why it is fixed rather than adaptive
 *
 * Water and Peptides sit side by side because both are *today* state you can
 * act on; Fuel is a full-width strip below them; Tools is a quiet row at the
 * foot. Mixed shapes, deliberately: a ring, a tally, a bar. Nothing here is a
 * grid of equal destinations, which is what would make Home a launcher.
 *
 * **The order does not change with the data.** Ranking the domains by
 * urgency was considered and rejected: to decide that a scheduled dose
 * outranks hydration today, VITA would have to hold an opinion about which
 * matters more — which is the first step toward the compliance and urgency
 * semantics this product explicitly refuses. A fixed order is also simply
 * better to live with: the thing you reach for is where it was yesterday.
 * The modules change; their places do not.
 *
 * ## Home surfaces actions; features own them
 *
 * *Add* opens Water with its sheet already up, via a query param Water reads
 * — Water keeps sole ownership of logging, including the goal-reached
 * detection and the failure handling that go with it. Rebuilding that here
 * would be the duplication the architecture rules forbid, for one saved tap.
 * Fuel and Peptides likewise get a door, not a copy of their flows.
 */
export default function Dashboard() {
  const greeting = useGreeting();
  const { user } = useAuth();
  const water = useWaterToday();
  const fuel = useDailyNutrition();
  const peptides = usePeptides();

  return (
    <Screen dockClearance contentGap={spacing.xxl} topInset={false}>
      <DashboardHeader
        greeting={greeting}
        firstName={user?.firstName ?? 'there'}
        dateLabel={formatLogDateLong(fuel.logDate)}
      />

      {/*
        * Each module is wrapped, because `PressableScale` applies its `style`
        * to an inner animated view — a `flex: 1` handed to it never reaches
        * this row, and the pair renders at two different widths. Third time
        * this trap has been hit (`MetricTile`, the 5.1A quick-adds, here);
        * 5.7 should fix the primitive rather than the callers.
        */}
      <View style={styles.pair}>
        <View style={styles.half}>
          <WaterModule
            today={water}
            onAdd={() => router.push('/water?add=1')}
            onOpen={() => router.push('/water')}
          />
        </View>
        <View style={styles.half}>
          <PeptidesModule
            today={peptides.today}
            isEmpty={peptides.isEmpty}
            isLoading={peptides.isLoading}
            onOpen={() => router.push('/peptides')}
          />
        </View>
      </View>

      <FuelStrip
        today={fuel}
        onOpen={() => router.push('/fuel')}
        onLog={() => router.push('/fuel/add')}
      />

      <ToolsRow onOpen={() => router.push('/tools')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pair: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.m,
  },
  half: {
    flex: 1,
  },
});
