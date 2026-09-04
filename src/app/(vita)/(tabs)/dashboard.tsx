import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../../components/ui';
import { CustomizeHomeSheet } from '../../../features/dashboard/components/CustomizeHomeSheet';
import { DashboardHeader } from '../../../features/dashboard/components/DashboardHeader';
import { FuelStrip } from '../../../features/dashboard/components/FuelStrip';
import { PeptidesModule } from '../../../features/dashboard/components/PeptidesModule';
import { QuickTools } from '../../../features/dashboard/components/QuickTools';
import { TodaySchedule } from '../../../features/dashboard/components/TodaySchedule';
import { WaterModule } from '../../../features/dashboard/components/WaterModule';
import { buildDailySummary } from '../../../features/dashboard/dailySummary';
import { useGreeting } from '../../../features/dashboard/greeting';
import { visibleModules, type DashboardModuleId } from '../../../features/dashboard/modules';
import { useDashboardLayout } from '../../../features/dashboard/useDashboardLayout';
import { useAuth } from '../../../features/auth/AuthProvider';
import { formatLogDateShort } from '../../../lib/daily';
import { useDailyNutrition } from '../../../lib/nutrition';
import { usePeptides } from '../../../lib/peptides';
import { useWaterToday } from '../../../lib/water';
import { spacing } from '../../../theme/tokens';

/**
 * Home — a daily control surface.
 *
 * ## What the 5.3A review changed
 *
 * The composition, not the data. Slice 5.3's fixture removal stands entirely:
 * nothing here is invented, and the modules still read the features' own
 * engines. What the founders rejected was the *shape* — a 26px greeting over
 * two tall boxes and a strip, with a screen of air beneath it.
 *
 * So the greeting became an eyebrow, three domains became horizontal strips
 * at a third of the height, and the space that bought went to two sections
 * that carry real information: the three utilities people actually reach for,
 * and the day's actual schedule. Density came from **showing more of what is
 * true**, never from padding.
 *
 * ## Home is the user's, within limits
 *
 * Every content module can be hidden or reordered, and the choice persists.
 * Someone who does not take peptides can switch that module and the schedule
 * off, and Home stops mentioning them — which no amount of tuning defaults
 * could have achieved for everyone.
 *
 * The header is not customisable: branding, greeting, date and Settings
 * orient the screen, and one of them is the way out of it. `visibleModules`
 * decides the rest, so this file has no opinion about order.
 *
 * ## Still true from 5.3
 *
 * Every figure comes from `useWaterToday()`, `useDailyNutrition()` or
 * `usePeptides()` — Home stores nothing and derives nothing, so it cannot
 * drift from the features and needs no refresh. Actions open the feature that
 * owns them; `/water?add=1` opens Water ready to log rather than rebuilding
 * logging here. **Movement is still absent, because no movement domain
 * exists** — it is not a hidden module and not a disabled row, because
 * offering to show something VITA cannot produce is the tease the founders
 * ruled out.
 */
export default function Dashboard() {
  const greeting = useGreeting();
  const { user } = useAuth();
  const water = useWaterToday();
  const fuel = useDailyNutrition();
  const peptides = usePeptides();
  const { layout, setLayout } = useDashboardLayout();

  const [customizing, setCustomizing] = useState(false);

  const summary = buildDailySummary({
    peptidesUnanswered: peptides.today.filter((item) => item.mark === 'unconfirmed').length,
    peptidesScheduled: peptides.today.length,
    hasWaterGoal: water.hasGoal,
    isWaterGoalMet: water.isGoalMet,
    waterRemainingLabel: water.remainingLabel,
    mealsLogged: fuel.mealsLoggedCount,
  });

  const render = (id: DashboardModuleId) => {
    switch (id) {
      case 'water':
        return (
          <WaterModule
            key={id}
            today={water}
            onAdd={() => router.push('/water?add=1')}
            onOpen={() => router.push('/water')}
          />
        );
      case 'peptides':
        return (
          <PeptidesModule
            key={id}
            today={peptides.today}
            isEmpty={peptides.isEmpty}
            isLoading={peptides.isLoading}
            onOpen={() => router.push('/peptides')}
          />
        );
      case 'fuel':
        return (
          <FuelStrip
            key={id}
            today={fuel}
            onOpen={() => router.push('/fuel')}
            onLog={() => router.push('/fuel/add')}
          />
        );
      case 'quickTools':
        return <QuickTools key={id} />;
      case 'schedule':
        return <TodaySchedule key={id} today={peptides.today} isLoading={peptides.isLoading} />;
    }
  };

  return (
    <Screen dockClearance contentGap={spacing.xl} topInset={false}>
      <DashboardHeader
        greeting={greeting}
        firstName={user?.firstName ?? 'there'}
        dateLabel={formatLogDateShort(fuel.logDate)}
        summary={summary}
        onCustomize={() => setCustomizing(true)}
      />

      {/*
        * Rendered in exactly the saved order, with *consecutive* strips
        * grouped so they sit tighter to each other than to the sections
        * around them — spacing says "these belong together" without drawing
        * a container around them.
        *
        * Grouping only runs, never all strips: filtering strips into one
        * block would silently ignore a reorder that moved a section between
        * them, so what the user arranged and what Home renders could differ.
        */}
      {groupStrips(visibleModules(layout)).map((group, index) =>
        group.length > 1 ? (
          <View key={`group-${index}`} style={styles.strips}>
            {group.map(render)}
          </View>
        ) : (
          render(group[0])
        ),
      )}

      <CustomizeHomeSheet
        visible={customizing}
        layout={layout}
        onChange={setLayout}
        onClose={() => setCustomizing(false)}
      />
    </Screen>
  );
}

/** The three domain strips, which share a rhythm. Sections do not. */
function isStrip(id: DashboardModuleId): boolean {
  return id === 'water' || id === 'peptides' || id === 'fuel';
}

/**
 * Splits the visible modules into runs, so adjacent strips can share a
 * tighter gap while the saved order is preserved exactly.
 */
function groupStrips(ids: DashboardModuleId[]): DashboardModuleId[][] {
  const groups: DashboardModuleId[][] = [];

  for (const id of ids) {
    const current = groups[groups.length - 1];
    if (current && isStrip(id) && isStrip(current[0])) current.push(id);
    else groups.push([id]);
  }

  return groups;
}

const styles = StyleSheet.create({
  strips: {
    gap: spacing.s,
  },
});
