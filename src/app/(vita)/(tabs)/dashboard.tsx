import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View, type LayoutRectangle } from 'react-native';
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
  DASHBOARD_MODULES,
  MODULE_REGISTRY,
  buildGrid,
  sizeOf,
  toggleModule,
  type DashboardLayout,
  type DashboardModuleId,
} from '../../../features/dashboard/modules';
import {
  candidateLayout,
  computeSlots,
  draggedCentre,
  measureFrame,
  reflowOffsets,
  type GridFrame,
  type RectMap,
  type SlotMap,
} from '../../../features/dashboard/dragLayout';
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
import { useReducedMotion } from '../../../theme/useReducedMotion';

/**
 * Home — a widget dashboard the user arranges.
 *
 * ## What 5.3D changed
 *
 * The drag became live. A widget lifts, follows the finger, and the widgets
 * around it glide toward the positions the candidate order would give them
 * **before** the finger lifts, so the landing place is visible while there is
 * still time to change it. Nothing about the layout changes during the
 * gesture: the rendered order is frozen and every widget is translated
 * instead, because re-rendering the grid would move the dragged widget's own
 * cell out from under the gesture. On release the dragged widget settles into
 * the slot it is already over, and *then* the order commits — at which point
 * every widget is already at the pixel the new layout renders it at, so the
 * commit itself is invisible.
 *
 * All of the geometry is in `dragLayout.ts`, pure and tested; this route owns
 * only the orchestration.
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
  const reducedMotion = useReducedMotion();

  const [customizing, setCustomizing] = useState(false);
  const [editing, setEditing] = useState(false);
  /* Only the identity of the carried widget is state — it changes a shadow
     and a z-index, never a position. */
  const [draggingId, setDraggingId] = useState<DashboardModuleId | null>(null);

  /**
   * One translation per module, for the life of the screen.
   *
   * Every widget is rendered where its *current* order puts it and moved from
   * there by its offset. During a drag the carried widget's offset follows
   * the finger and the others are animated to the candidate order's slots;
   * at rest they are all zero.
   */
  const offsets = useRef(
    Object.fromEntries(
      DASHBOARD_MODULES.map((id) => [id, new Animated.ValueXY({ x: 0, y: 0 })]),
    ) as Record<DashboardModuleId, Animated.ValueXY>,
  ).current;

  /*
   * Everything a drag reads is a ref, never state: a re-render mid-gesture
   * would move the dragged widget's own cell out from under the finger.
   */
  const rects = useRef<RectMap>({});
  const frame = useRef<GridFrame | null>(null);
  const candidate = useRef<DashboardLayout | null>(null);

  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const handleMeasure = useCallback((id: DashboardModuleId, rect: LayoutRectangle) => {
    rects.current[id] = rect;
  }, []);

  /** Where each widget is actually rendered — the frame every offset is from. */
  const homeSlots = useCallback((): SlotMap => {
    const slots: SlotMap = {};
    for (const key of Object.keys(rects.current) as DashboardModuleId[]) {
      const rect = rects.current[key];
      if (rect) slots[key] = { x: rect.x, y: rect.y };
    }
    return slots;
  }, []);

  /** Move every widget except the carried one toward the candidate slots. */
  const applyReflow = useCallback(
    (next: DashboardLayout, exclude: DashboardModuleId | null) => {
      const activeFrame = frame.current;
      if (!activeFrame) return;

      const target = computeSlots(next, rects.current, activeFrame);
      const deltas = reflowOffsets(homeSlots(), target, exclude);

      for (const key of Object.keys(deltas) as DashboardModuleId[]) {
        const delta = deltas[key];
        const value = offsets[key];
        if (!delta || !value) continue;

        if (reducedMotionRef.current) {
          value.setValue(delta);
          continue;
        }
        Animated.spring(value, {
          toValue: delta,
          useNativeDriver: false,
          speed: 18,
          bounciness: 4,
        }).start();
      }
    },
    [homeSlots, offsets],
  );

  const settleAll = useCallback(() => {
    for (const id of DASHBOARD_MODULES) offsets[id].setValue({ x: 0, y: 0 });
  }, [offsets]);

  /** Glide everything back to where it is rendered, committing nothing. */
  const returnHome = useCallback(() => {
    if (reducedMotionRef.current) {
      settleAll();
      return;
    }
    for (const id of DASHBOARD_MODULES) {
      Animated.spring(offsets[id], {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        speed: 20,
        bounciness: 4,
      }).start();
    }
  }, [offsets, settleAll]);

  const handleDragStart = useCallback((id: DashboardModuleId) => {
    frame.current = measureFrame(rects.current, spacing.m);
    candidate.current = layoutRef.current;
    setDraggingId(id);
    vitaHaptic('selection');
  }, []);

  const handleDragMove = useCallback(
    (id: DashboardModuleId, dx: number, dy: number) => {
      const activeFrame = frame.current;
      const rect = rects.current[id];
      const base = candidate.current;
      if (!activeFrame || !rect || !base) return;

      const next = candidateLayout(base, rects.current, activeFrame, id, draggedCentre(rect, dx, dy));
      /* `null` means the finger has not meaningfully entered another slot —
         leave the animations running rather than restarting them. */
      if (!next) return;

      candidate.current = next;
      applyReflow(next, id);
      vitaHaptic('selection');
    },
    [applyReflow],
  );

  /**
   * Release: commit the proposed order, then glide the carried widget into
   * the slot it is already over.
   *
   * **The commit happens first, and it is invisible.** Every other widget is
   * already sitting at its new slot, so zeroing its offset changes nothing on
   * screen — it simply stops being translated and starts being placed. The
   * carried widget is the only one still somewhere else, so its offset is
   * re-expressed against its *new* slot: same pixel, different frame of
   * reference. Animating that to zero is the settle.
   *
   * Committing before the animation rather than in its completion callback
   * means an interrupted or dropped frame can never leave Home showing one
   * order and remembering another.
   */
  const handleDragEnd = useCallback(
    (id: DashboardModuleId, dx: number, dy: number) => {
      const activeFrame = frame.current;
      const next = candidate.current;
      const home = rects.current[id];
      const value = offsets[id];
      const changed = Boolean(next) && next!.order.join() !== layoutRef.current.order.join();

      candidate.current = null;
      frame.current = null;
      setDraggingId(null);

      if (!changed || !next || !activeFrame || !home || !value) {
        returnHome();
        return;
      }

      const target = computeSlots(next, rects.current, activeFrame)[id];

      setLayout(next);
      for (const key of DASHBOARD_MODULES) {
        if (key !== id) offsets[key].setValue({ x: 0, y: 0 });
      }
      if (target) {
        value.setValue({ x: home.x + dx - target.x, y: home.y + dy - target.y });
      }
      vitaHaptic('confirm');

      if (reducedMotion) {
        value.setValue({ x: 0, y: 0 });
        return;
      }
      Animated.spring(value, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        speed: 20,
        bounciness: 6,
      }).start();
    },
    [offsets, reducedMotion, returnHome, setLayout],
  );

  /** A cancelled gesture returns everything home; nothing is committed. */
  const handleDragCancel = useCallback(() => {
    candidate.current = null;
    frame.current = null;
    setDraggingId(null);
    returnHome();
  }, [returnHome]);

  const enterEditing = useCallback(() => {
    vitaHaptic('selection');
    setEditing(true);
  }, []);

  const exitEditing = useCallback(() => {
    setEditing(false);
    setDraggingId(null);
    settleAll();
  }, [settleAll]);

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
        onDoneEditing={exitEditing}
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
          /* The carried widget's whole row is raised, so it passes over the
             rows above and below rather than under them. */
          <View
            key={row.join('-')}
            style={[styles.row, draggingId && row.includes(draggingId) ? styles.activeRow : null]}
          >
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
                  offset={offsets[id]}
                  dragging={draggingId === id}
                  onLongPress={enterEditing}
                  onRemove={() => {
                    settleAll();
                    setLayout((current) => toggleModule(current, id));
                  }}
                  onMeasure={handleMeasure}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
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
  activeRow: {
    zIndex: 5,
  },
});
