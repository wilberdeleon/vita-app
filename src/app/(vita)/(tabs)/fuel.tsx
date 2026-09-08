import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/ui';
import { ArrangeableSection } from '../../../features/fuel/components/ArrangeableSection';
import {
  AddFoodAction,
  EditGoalsAction,
  SetUpFuel,
} from '../../../features/fuel/components/FuelActions';
import { DayStrip } from '../../../features/fuel/components/DayStrip';
import { FuelHeader } from '../../../features/fuel/components/FuelHeader';
import { PeptidesSection, WaterSection } from '../../../features/fuel/components/FuelSideSections';
import { NutritionContext } from '../../../features/fuel/components/NutritionContext';
import { TodaysMeals } from '../../../features/fuel/components/TodaysMeals';
import {
  SECTION_LABELS,
  moveSection,
  reorderSection,
  targetIndexFor,
  type FuelSection,
} from '../../../features/fuel/sections';
import { useFuelLayout } from '../../../features/fuel/useFuelLayout';
import { useFuelSetup } from '../../../features/fuel/useFuelSetup';
import { formatLogDateShort } from '../../../lib/daily';
import { hasAnyGoal, useDailyNutrition, type MealSlot } from '../../../lib/nutrition';
import { usePeptideSummary } from '../../../lib/peptides';
import { useWaterToday } from '../../../lib/water';
import { vitaHaptic } from '../../../lib/haptics';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Fuel — **what did I eat today?**, with the day around it.
 *
 * ## Two corrections, in order
 *
 * 5.6B replaced a calorie ring, two filled CTA cards, a meal mega-card and
 * two cross-feature tiles with the Day Strip and direct-on-background
 * sections. The founder's device review kept the visual generation and
 * rejected the subtraction: the screen had become sparse, nutrition had lost
 * its weight, the meal structure people navigate by had gone, and Water and
 * Peptides were wanted here after all.
 *
 * **5.6B.1 puts the structure back without the bulk.** Five sections, all
 * direct on the background: the strip, the nutrition figures, four
 * collapsible meals, water, peptides. No cards, no rings, no filled orange
 * blocks, no mega-container.
 *
 * ## The sections are the user's to order
 *
 * Hold any of them to arrange Fuel. Ordering only — no sizes, no hiding —
 * because Fuel is one workflow with a hierarchy that should be right by
 * default, and the only thing worth varying is which part someone reads
 * first. The header, the date, the scanner, settings and Add Food are not
 * sections and do not move.
 *
 * ## Setup is offered, never required
 *
 * A user who has configured nothing is invited to set up Fuel once. Skipping
 * is a real exit and is remembered; setting any goal removes the invitation
 * on its own. Food logging, calories, macros and the scanner all work with
 * no goals at all.
 *
 * Every figure comes from the domain that owns it — `useDailyNutrition`,
 * `useWaterToday`, `usePeptideSummary` — so Fuel cannot disagree with Water,
 * Peptides or Home. **No domain file changed for this screen.**
 */
export default function Fuel() {
  const today = useDailyNutrition();
  const water = useWaterToday();
  const peptides = usePeptideSummary();
  const { order, setOrder } = useFuelLayout();
  const setup = useFuelSetup();
  const { surfaces } = useTheme();

  const [arranging, setArranging] = useState(false);
  /** Measured section heights, so a drag knows what it is travelling past. */
  const heights = useRef<Partial<Record<FuelSection, number>>>({});

  const addFood = (meal?: MealSlot) =>
    router.push(meal ? `/fuel/add?meal=${encodeURIComponent(meal)}` : '/fuel/add');
  const openEntry = (entryId: string) =>
    router.push(`/fuel/entry/${encodeURIComponent(entryId)}`);

  const loading = today.isLoading || water.isLoading;
  const configured = hasAnyGoal(today.targets) || water.hasGoal;
  const offerSetup = !loading && !configured && !setup.dismissed && !setup.isLoading;
  const empty = !today.isLoading && today.isEmpty;

  const enterArranging = () => {
    if (arranging) return;
    setArranging(true);
    vitaHaptic('selection');
  };

  const commitDrag = (section: FuelSection, dy: number) => {
    const ordered = order.map((id) => heights.current[id] ?? 0);
    const from = order.indexOf(section);
    const to = targetIndexFor(ordered, from, dy);
    if (to !== from) {
      setOrder(reorderSection(order, section, to));
      vitaHaptic('selection');
    }
  };

  const section = (id: FuelSection) => {
    switch (id) {
      case 'dayStrip':
        return <DayStrip entries={today.entries} onOpenEntry={openEntry} />;

      case 'nutrition':
        return empty ? (
          <View style={styles.restingNutrition}>
            <Text style={[styles.restingTitle, { color: surfaces.text }]}>No food logged yet</Text>
            {/*
              * Goals the user set are stated, never reported as `0 / 2,000`
              * and `0%` — a progress report on a day that has not started.
              */}
            {hasAnyGoal(today.targets) || water.hasGoal ? (
              <Text style={[styles.restingBody, { color: surfaces.textTertiary }]}>
                {[
                  today.targets?.calories !== undefined
                    ? `${today.targets.calories.toLocaleString()} calorie goal`
                    : null,
                  today.targets?.protein !== undefined
                    ? `${today.targets.protein} g protein goal`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Your goals are set.'}
              </Text>
            ) : null}
            {/*
              * Someone who skipped setup still needs a way back to it, and
              * an untouched day is exactly when they are most likely to
              * want one.
              */}
            {!configured && !offerSetup ? (
              <EditGoalsAction onPress={() => router.push('/fuel/setup')} />
            ) : null}
          </View>
        ) : (
          <>
            <NutritionContext today={today} />
            {/* Once the invitation is gone, this is the way back to setup. */}
            {!configured && !offerSetup ? (
              <EditGoalsAction onPress={() => router.push('/fuel/setup')} />
            ) : null}
          </>
        );

      case 'meals':
        return (
          <TodaysMeals entries={today.entries} onOpenEntry={openEntry} onAddToMeal={addFood} />
        );

      case 'water':
        return (
          <WaterSection
            label={
              water.hasGoal && water.goalLabel
                ? `${water.totalLabel} of ${water.goalLabel}`
                : water.isEmpty
                  ? 'None logged'
                  : `${water.totalLabel} today`
            }
            spoken={
              water.hasGoal && water.percent !== null
                ? `Water. ${water.totalLabel} of ${water.goalLabel}. ${water.percent} percent.`
                : `Water. ${water.isEmpty ? 'None logged' : water.totalLabel} today.`
            }
            progress={water.hasGoal ? water.progress : null}
            onAdd={() => router.push('/water?add=1')}
          />
        );

      case 'peptides':
        return (
          <PeptidesSection
            label={peptides.label}
            spoken={`Peptides. ${peptides.label}.`}
            onOpen={() => router.push('/peptides')}
          />
        );
    }
  };

  return (
    <Screen dockClearance contentGap={spacing.l} topInset={false}>
      <FuelHeader
        dateLabel={formatLogDateShort(today.logDate)}
        onScan={() => router.push('/fuel/scan')}
        onSettings={() => router.push('/settings')}
        arranging={arranging}
        onDoneArranging={() => setArranging(false)}
      />

      {today.error ? (
        <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text>
      ) : null}

      {offerSetup ? <SetUpFuel onPress={() => router.push('/fuel/setup')} /> : null}

      {order.map((id, index) => (
        <ArrangeableSection
          key={id}
          label={SECTION_LABELS[id]}
          arranging={arranging}
          index={index}
          total={order.length}
          onLongPress={enterArranging}
          onMove={(direction) => setOrder(moveSection(order, id, direction))}
          onMeasure={(height) => {
            heights.current[id] = height;
          }}
          onDragMove={() => undefined}
          onDragEnd={(dy) => commitDrag(id, dy)}
        >
          {section(id)}
        </ArrangeableSection>
      ))}

      {/*
        * Fixed: not a section, and never moves.
        *
        * No meal shortcut chips beneath it. 5.6B added them because the
        * meals section hid itself on an empty day; with all four slots back
        * and each carrying its own `+`, a second row of the same four names
        * is the duplication this screen keeps being rescued from.
        */}
      {arranging ? null : <AddFoodAction onPress={() => addFood()} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
  },
  restingNutrition: {
    gap: 2,
  },
  restingTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
  },
  restingBody: {
    ...typography.caption,
  },
});
