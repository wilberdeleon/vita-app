import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutRectangle } from 'react-native';
import { Screen } from '../../../components/ui';
import { CustomizeHomeSheet } from '../../../features/dashboard/components/CustomizeHomeSheet';
import { DashboardHeader } from '../../../features/dashboard/components/DashboardHeader';
import { EditableWidget } from '../../../features/dashboard/components/EditableWidget';
import { FuelStrip } from '../../../features/dashboard/components/FuelStrip';
import { PeptidesModule } from '../../../features/dashboard/components/PeptidesModule';
import { QuickTools } from '../../../features/dashboard/components/QuickTools';
import {
  TodaySchedule,
  scheduleItemsFromRoutines,
} from '../../../features/dashboard/components/TodaySchedule';
import { WaterModule } from '../../../features/dashboard/components/WaterModule';
import { useGreeting } from '../../../features/dashboard/greeting';
import {
  MODULE_REGISTRY,
  buildGrid,
  reorderModule,
  sizeOf,
  toggleModule,
  type DashboardModuleId,
} from '../../../features/dashboard/modules';
import { currentQuote } from '../../../features/dashboard/quote';
import {
  useDashboardLayout,
  useQuickTools,
} from '../../../features/dashboard/useDashboardLayout';
import { useAuth } from '../../../features/auth/AuthProvider';
import { formatLogDateShort } from '../../../lib/daily';
import { useDailyNutrition } from '../../../lib/nutrition';
import { usePeptides } from '../../../lib/peptides';
import { useWaterToday } from '../../../lib/water';
import { vitaHaptic } from '../../../lib/haptics';
import { spacing } from '../../../theme/tokens';

/**
 * Home — a widget dashboard the user arranges.
 *
 * ## What 5.3C changed
 *
 * Home is now arranged **on Home**. Hold any widget and the grid enters edit
 * mode: widgets jiggle, each grows a remove control, and one can be dragged
 * onto another to trade places. `Done` in the header leaves. Customize Home
 * stays and is still the complete, accessible surface — it is the only way to
 * bring a hidden widget back, to change a size, or to reorder without a
 * pointer — but the common rearrangement no longer requires finding a sheet.
 *
 * ## What 5.3B changed
 *
 * The composition again, and only the composition. Slice 5.3's fixture
 * removal and 5.3A's real-data wiring both stand untouched: nothing here is
 * invented. What the founders rejected in 5.3A was that every module was the
 * same long horizontal strip, that Home was still sparse, and that the
 * arrangement was fixed by us rather than chosen by them.
 *
 * So modules now have **two designed shapes** and sit in a **two-column
 * grid**. Water and Peptides ship as squares side by side under a wide Fuel,
 * and any of the three can be switched, reordered or hidden — with the choice
 * persisted. A quote gives the header some character, which is also why
 * nothing else on the screen tries to.
 *
 * ## Placement follows order, never stored coordinates
 *
 * `buildGrid` derives rows from the visible modules and their spans: a wide
 * module takes a row, two squares share one, and a square with no partner
 * keeps its column rather than being stretched into a layout nobody designed.
 * Hiding a module simply removes it and the grid reflows — hide Peptides and
 * the next square pairs with Water, with no placeholder and no gap.
 *
 * Because nothing stores a position, what the user arranged and what Home
 * renders cannot disagree.
 *
 * ## Still true, and non-negotiable
 *
 * Every figure comes from `useWaterToday()`, `useDailyNutrition()` or
 * `usePeptides()` — Home stores nothing and derives nothing, so it cannot
 * drift from the features and needs no refresh. Actions open the feature that
 * owns them. **Movement is absent because no movement domain exists**, and it
 * is not offered as a disabled widget: advertising what the app cannot do is
 * the tease the founders ruled out.
 */
export default function Dashboard() {
  const greeting = useGreeting();
  const { user } = useAuth();
  const water = useWaterToday();
  const fuel = useDailyNutrition();
  const peptides = usePeptides();
  const { layout, setLayout } = useDashboardLayout();
  const { tools, setTools } = useQuickTools();

  const [customizing, setCustomizing] = useState(false);
  const [editing, setEditing] = useState(false);

  /*
   * Where each widget sits on screen, captured when edit mode is entered.
   * A ref, not state: it is read once at the end of a gesture and must never
   * cause a render — re-rendering the grid mid-drag is what would make the
   * drag fight itself.
   */
  const rects = useRef<Partial<Record<DashboardModuleId, LayoutRectangle>>>({});

  const handleMeasure = useCallback((id: DashboardModuleId, rect: LayoutRectangle) => {
    rects.current[id] = rect;
  }, []);

  /**
   * Resolve a drop: whichever widget the dragged one's centre finished over
   * trades places with it. Landing on nothing — a gap, the header, its own
   * cell — leaves the order alone, which is what makes a small accidental
   * movement harmless.
   */
  const handleDrop = useCallback(
    (id: DashboardModuleId, dx: number, dy: number) => {
      const from = rects.current[id];
      if (!from) return;

      const x = from.x + from.width / 2 + dx;
      const y = from.y + from.height / 2 + dy;

      const target = (Object.keys(rects.current) as DashboardModuleId[]).find((other) => {
        if (other === id) return false;
        const rect = rects.current[other];
        if (!rect) return false;
        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
      });
      if (!target) return;

      setLayout((current) => {
        const fromIndex = current.order.indexOf(id);
        const toIndex = current.order.indexOf(target);
        if (fromIndex === -1 || toIndex === -1) return current;
        return reorderModule(current, fromIndex, toIndex);
      });
      vitaHaptic('confirm');
    },
    [setLayout],
  );

  const enterEditing = useCallback(() => {
    vitaHaptic('selection');
    setEditing(true);
  }, []);

  const scheduleItems = useMemo(
    () => scheduleItemsFromRoutines(peptides.today),
    [peptides.today],
  );

  const rows = buildGrid(layout);

  const render = (id: DashboardModuleId) => {
    const size = sizeOf(layout, id);

    switch (id) {
      case 'water':
        return (
          <WaterModule
            today={water}
            size={size}
            onAdd={() => router.push('/water?add=1')}
            onOpen={() => router.push('/water')}
            onLongPress={enterEditing}
          />
        );
      case 'peptides':
        return (
          <PeptidesModule
            today={peptides.today}
            isEmpty={peptides.isEmpty}
            isLoading={peptides.isLoading}
            size={size}
            onOpen={() => router.push('/peptides')}
            onLongPress={enterEditing}
          />
        );
      case 'fuel':
        return (
          <FuelStrip
            today={fuel}
            size={size}
            onOpen={() => router.push('/fuel')}
            onLog={() => router.push('/fuel/add')}
            onLongPress={enterEditing}
          />
        );
      case 'quickTools':
        return <QuickTools tools={tools} />;
      case 'schedule':
        return <TodaySchedule items={scheduleItems} isLoading={peptides.isLoading} />;
    }
  };

  return (
    <Screen dockClearance contentGap={spacing.m} topInset={false}>
      <DashboardHeader
        greeting={greeting}
        firstName={user?.firstName ?? 'there'}
        dateLabel={formatLogDateShort(fuel.logDate)}
        quote={currentQuote()}
        editing={editing}
        onCustomize={() => setCustomizing(true)}
        onDoneEditing={() => setEditing(false)}
      />

      {rows.map((row) => {
        /*
         * A square with no partner keeps its own column and leaves the other
         * empty, rather than being stretched across the row. Stretching it
         * would render the square design at wide proportions — a layout
         * nobody drew and the user did not ask for.
         */
        const lonelySquare = row.length === 1 && sizeOf(layout, row[0]) === 'square';

        return (
          <View key={row.join('-')} style={styles.row}>
            {row.map((id) => (
              /*
               * Each cell carries the flex, because `PressableScale` applies
               * its style to an inner animated view — a span handed to a
               * module directly never reaches this row. A cell is the natural
               * structure for a grid anyway; the primitive fix stays 5.7's.
               */
              <View key={id} style={styles.cell}>
                <EditableWidget
                  id={id}
                  label={MODULE_REGISTRY[id].label}
                  editing={editing}
                  onLongPress={enterEditing}
                  onRemove={() => {
                    setLayout((current) => toggleModule(current, id));
                  }}
                  onMeasure={handleMeasure}
                  onDrop={handleDrop}
                >
                  {render(id)}
                </EditableWidget>
              </View>
            ))}
            {lonelySquare ? <View style={styles.cell} /> : null}
          </View>
        );
      })}

      <CustomizeHomeSheet
        visible={customizing}
        layout={layout}
        onChange={setLayout}
        tools={tools}
        onToolsChange={setTools}
        onClose={() => setCustomizing(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.m,
  },
  cell: {
    flex: 1,
  },
});
