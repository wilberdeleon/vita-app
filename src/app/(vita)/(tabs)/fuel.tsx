import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/ui';
import { ArrangeableSection } from '../../../features/fuel/components/ArrangeableSection';
import { AddFoodAction } from '../../../features/fuel/components/FuelActions';
import { CustomizeFuelSheet } from '../../../features/fuel/components/CustomizeFuelSheet';
import { DayStrip } from '../../../features/fuel/components/DayStrip';
import { FuelHeader } from '../../../features/fuel/components/FuelHeader';
import {
  FuelPeptidesModule,
  FuelWaterModule,
} from '../../../features/fuel/components/FuelModules';
import { NutritionContext } from '../../../features/fuel/components/NutritionContext';
import { TodaysMeals } from '../../../features/fuel/components/TodaysMeals';
import {
  SECTION_LABELS,
  buildFuelRows,
  moveVisibleSection,
  reorderVisibleSection,
  sectionSize,
  targetIndexFor,
  visibleFuelSections,
  type FuelLayout,
  type FuelSection,
} from '../../../features/fuel/sections';
import { useFuelLayout } from '../../../features/fuel/useFuelLayout';
import { useFuelSetup } from '../../../features/fuel/useFuelSetup';
import { formatLogDateShort } from '../../../lib/daily';
import { useDailyNutrition, type MealSlot } from '../../../lib/nutrition';
import { usePeptideSummary } from '../../../lib/peptides';
import { useWaterToday } from '../../../lib/water';
import { vitaHaptic } from '../../../lib/haptics';
import { palette, spacing, typography } from '../../../theme/tokens';

type Props = {
  /**
   * A layout to render instead of the user's own — **`fuel-preview` only.**
   *
   * The preview harness gives Fuel in-memory nutrition and water repositories
   * so a review pass leaves no residue; the layout needs the same treatment,
   * or flicking through `water-wide` and `daystrip-hidden` would quietly
   * rewrite the founder's real Fuel. When it is passed, customisation applies
   * for the session and is never written — which is why the persistence steps
   * of the device pass belong on the real `/fuel`.
   */
  layout?: FuelLayout;
};

/**
 * Fuel — **where am I today?**, with the day around it.
 *
 * ## Three corrections, in order
 *
 * 5.6B replaced a calorie ring, two filled CTA cards, a meal mega-card and two
 * cross-feature tiles with the Day Strip and direct-on-background sections.
 * The founder's review kept the visual generation and rejected the
 * subtraction: the screen had become sparse, nutrition had lost its weight,
 * the meal structure people navigate by had gone, and Water and Peptides were
 * wanted here after all.
 *
 * 5.6B.1 put the structure back without the bulk — five sections, no cards.
 * The review of *that* was that the screen had become visually interesting
 * while the information it exists for was no longer leading it.
 *
 * **5.6B.2 is the hierarchy pass.** Nutrition first, the Day Strip second,
 * Meals third, and Water and Peptides as a pair of compact squares at the
 * foot. Nothing was redesigned to get here: the same five sections, in the
 * order that answers the screen's first question first.
 *
 * ## The composition is the user's
 *
 * `•••` opens Customize Fuel — order, which optional sections appear, and
 * square or wide for the two that have both designs. Holding a section on the
 * screen itself still enters arrange mode for direct reordering. Both resolve
 * through the same helpers in `sections.ts`, so the sheet and the gesture
 * cannot disagree.
 *
 * Nutrition and Meals cannot be hidden, because they are the feature. The
 * header, the date, the scanner, `•••`, settings and Add Food are not sections
 * and never move.
 *
 * ## Setup is offered inside Nutrition, never as a gate
 *
 * A user who has configured nothing sees the Nutrition section become the
 * offer rather than a wall of zeroes. Skipping is a real exit and is
 * remembered; setting any goal — calories, protein, or water — removes the
 * invitation on its own. Food logging, calories, macros and the scanner all
 * work with no goals at all.
 *
 * Every figure comes from the domain that owns it — `useDailyNutrition`,
 * `useWaterToday`, `usePeptideSummary` — so Fuel cannot disagree with Water,
 * Peptides or Home. **No domain file changed for this screen**, and nothing
 * here writes to Water or Peptides.
 */
export default function Fuel({ layout: layoutOverride }: Props = {}) {
  const today = useDailyNutrition();
  const water = useWaterToday();
  const peptides = usePeptideSummary();
  const persisted = useFuelLayout();
  const setup = useFuelSetup();

  /** The preview's layout is session-only; everything else persists. */
  const [previewLayout, setPreviewLayout] = useState<FuelLayout | null>(layoutOverride ?? null);
  const layout = previewLayout ?? persisted.layout;
  const setLayout = (next: FuelLayout) =>
    previewLayout ? setPreviewLayout(next) : persisted.setLayout(next);

  const [arranging, setArranging] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  /** Measured section heights, so a drag knows what it is travelling past. */
  const heights = useRef<Partial<Record<FuelSection, number>>>({});

  const addFood = (meal?: MealSlot) =>
    router.push(meal ? `/fuel/add?meal=${encodeURIComponent(meal)}` : '/fuel/add');
  const openEntry = (entryId: string) =>
    router.push(`/fuel/entry/${encodeURIComponent(entryId)}`);
  const openSetup = () => router.push('/fuel/setup');

  const visible = visibleFuelSections(layout);

  const enterArranging = () => {
    if (arranging) return;
    setArranging(true);
    vitaHaptic('selection');
  };

  const commitDrag = (section: FuelSection, dy: number) => {
    const ordered = visible.map((id) => heights.current[id] ?? 0);
    const from = visible.indexOf(section);
    const to = targetIndexFor(ordered, from, dy);
    if (to !== from) {
      setLayout(reorderVisibleSection(layout, section, to));
      vitaHaptic('selection');
    }
  };

  const section = (id: FuelSection) => {
    switch (id) {
      case 'nutrition':
        return (
          <NutritionContext
            today={today}
            waterHasGoal={water.hasGoal}
            setupDismissed={setup.dismissed}
            onSetUp={openSetup}
          />
        );

      case 'dayStrip':
        return <DayStrip entries={today.entries} onOpenEntry={openEntry} />;

      case 'meals':
        return (
          <TodaysMeals entries={today.entries} onOpenEntry={openEntry} onAddToMeal={addFood} />
        );

      case 'water':
        return (
          <FuelWaterModule
            size={sectionSize(layout, 'water')}
            value={water.isEmpty ? 'None logged' : water.totalLabel}
            detail={water.hasGoal && water.goalLabel ? `of ${water.goalLabel}` : 'No goal set'}
            spoken={
              water.hasGoal && water.percent !== null
                ? `Water. ${water.totalLabel} of ${water.goalLabel}. ${water.percent} percent.`
                : `Water. ${water.isEmpty ? 'None logged' : water.totalLabel} today. No daily goal set.`
            }
            /* No goal means nothing to be a fraction of — not a ring at zero. */
            progress={water.hasGoal ? water.progress : null}
            percent={water.hasGoal ? water.percent : null}
            onAdd={() => router.push('/water?add=1')}
          />
        );

      case 'peptides':
        return (
          <FuelPeptidesModule
            size={sectionSize(layout, 'peptides')}
            value={peptides.label}
            /* Only when both numbers exist does a second line say anything the
               first does not. Counts only: no amount, no status, no score. */
            detail={
              peptides.loggedToday > 0 && peptides.scheduledToday > 0
                ? `${peptides.scheduledToday} scheduled`
                : null
            }
            spoken={`Peptides. ${peptides.label}.`}
            outstanding={peptides.scheduledToday > peptides.loggedToday}
            onOpen={() => router.push('/peptides')}
          />
        );
    }
  };

  /**
   * Arrange mode lays every visible section out one per row, whatever their
   * sizes — see `ArrangeableSection`. A vertical drag cannot tell two sections
   * sharing a row apart, and the list being reordered has to be the list on
   * screen. The pair reappears on *Done*.
   */
  const rows = arranging ? visible.map((id) => [id]) : buildFuelRows(layout);

  const arrangeable = (id: FuelSection, cell: boolean) => (
    <ArrangeableSection
      key={id}
      label={SECTION_LABELS[id]}
      testID={`fuel-section-${id}`}
      arranging={arranging}
      index={visible.indexOf(id)}
      total={visible.length}
      cell={cell}
      onLongPress={enterArranging}
      onMove={(direction) => setLayout(moveVisibleSection(layout, id, direction))}
      onMeasure={(height) => {
        heights.current[id] = height;
      }}
      onDragMove={() => undefined}
      onDragEnd={(dy) => commitDrag(id, dy)}
    >
      {section(id)}
    </ArrangeableSection>
  );

  return (
    <Screen dockClearance contentGap={spacing.l} topInset={false}>
      <FuelHeader
        dateLabel={formatLogDateShort(today.logDate)}
        onScan={() => router.push('/fuel/scan')}
        onCustomize={() => setCustomizing(true)}
        onSettings={() => router.push('/settings')}
        arranging={arranging}
        onDoneArranging={() => setArranging(false)}
      />

      {today.error ? (
        <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text>
      ) : null}

      {rows.map((row) => {
        /*
         * A square keeps square width even with no partner.
         *
         * The founder's §15 case, and the one the device pass caught: a lone
         * square rendered into a full-width row *is* a wide module, which is
         * the stretched layout nobody designed. So a row of one square is
         * still a two-column row — the square takes its column and the other
         * is simply left empty. Nothing is drawn in it: a hole is not
         * information, and a placeholder would be worse than the gap.
         */
        const squares = !arranging && row.every((id) => sectionSize(layout, id) === 'square');
        if (!squares) return arrangeable(row[0], false);

        return (
          <View
            key={row.join('+')}
            testID={row.length === 2 ? 'fuel-pair' : 'fuel-square-row'}
            style={styles.squareRow}
          >
            {row.map((id) => arrangeable(id, true))}
            {row.length === 1 ? <View style={styles.emptyColumn} /> : null}
          </View>
        );
      })}

      {/*
        * Fixed: not a section, never reorders, never hides, and always last.
        *
        * No meal shortcut chips beneath it. 5.6B added them because the meals
        * section hid itself on an empty day; with all four slots back and each
        * carrying its own `+`, a second row of the same four names is the
        * duplication this screen keeps being rescued from.
        */}
      {arranging ? null : <AddFoodAction onPress={() => addFood()} />}

      <CustomizeFuelSheet
        visible={customizing}
        layout={layout}
        onChange={setLayout}
        onClose={() => setCustomizing(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
  },
  squareRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.m,
  },
  emptyColumn: {
    // The other half of a row a single square occupies. Deliberately empty:
    // the square holds its shape, and nothing is invented to fill the space.
    flex: 1,
  },
});
