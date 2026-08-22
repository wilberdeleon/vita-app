import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, ScreenHeader, Section, SectionHeader } from '../../../components/ui';
import { FuelQuickActions } from '../../../features/fuel/components/FuelQuickActions';
import { FuelSummaryCard } from '../../../features/fuel/components/FuelSummaryCard';
import { FuelTrackerCard } from '../../../features/fuel/components/FuelTrackerCard';
import { TodayMealsPanel } from '../../../features/fuel/components/TodayMealsPanel';
import { getPeptideToday } from '../../../features/peptides/api';
import { formatLogDateLong, progress, useDailyNutrition } from '../../../lib/nutrition';
import { useWaterToday } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';

/**
 * Fuel — a compact daily nutrition command centre, not a menu of cards.
 *
 * The screen answers, in order and without navigating anywhere: how much
 * have I eaten and how much is left · how do I log something right now ·
 * what have I actually eaten today, by meal · how are hydration and
 * peptides doing.
 *
 * What changed in the redesign is the *shape* of the screen, not the data
 * behind it. Every figure below comes from a shared domain —
 * `useDailyNutrition()` derives totals from the same entry array Home reads,
 * and since slice 3.2 `useWaterToday()` reads the same hydration state the
 * Water screen does, so the two can never disagree. Peptides is still its own
 * Sprint 0 fixture until slice 3.5. Nothing on this screen is a fixture
 * invented for the layout, and no provider, search, logging, favorite, or
 * barcode behaviour was touched.
 *
 * Fuel scrolls, deliberately. Trying to fit meals, macros, actions, and two
 * secondary trackers into one viewport is what produced the oversized,
 * information-free cards this redesign replaces.
 */
export default function Fuel() {
  const today = useDailyNutrition();
  const water = useWaterToday();
  const peptides = getPeptideToday();

  return (
    <Screen dockClearance contentGap={spacing.xl}>
      <ScreenHeader title="Fuel" subtitle={formatLogDateLong(today.logDate)} settings />

      <FuelSummaryCard today={today} />

      {today.error ? <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text> : null}

      <FuelQuickActions />

      <Section
        header={
          <SectionHeader title="Today's Meals" actionLabel="View all" onAction={() => router.push('/fuel/log')} />
        }
      >
        <TodayMealsPanel meals={today.meals} isLoading={today.isLoading} />
      </Section>

      <View style={styles.trackers}>
        {/*
          * Honest about what it knows. With a goal set this reads as progress;
          * without one it states the day's total and nothing more, because
          * inventing a target to divide by is how the old fixture came to
          * claim `5 of 8 cups · 63%` to every user forever. The percent label
          * is optional on this component precisely so it can be absent.
          */}
        <FuelTrackerCard
          icon="water"
          color={palette.water}
          title="Hydration"
          value={water.isEmpty ? 'None logged' : water.totalLabel}
          progress={water.progress}
          percentLabel={water.percent === null ? undefined : `${water.percent}%`}
          actionLabel="+ Add Water"
          onAction={() => router.push('/water')}
        />
        <FuelTrackerCard
          icon="medical-outline"
          color={palette.peptide}
          title="Peptides"
          value={peptides.logged === 1 ? '1 logged today' : `${peptides.logged} logged today`}
          progress={progress(peptides.logged, peptides.goal)}
          actionLabel="View Peptides"
          onAction={() => router.push('/peptides')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
  },
  trackers: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.m,
  },
});
