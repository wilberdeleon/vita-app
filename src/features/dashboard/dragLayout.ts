/**
 * Where every widget *would* sit under a candidate order — the arithmetic
 * behind Home's live drag reflow.
 *
 * ## Why this exists as pure functions
 *
 * Slice 5.3C reordered on release, because reflowing while a finger is down
 * means recomputing the grid on every crossing and this environment cannot
 * test a gesture by hand. The founders' 5.3D review was that the result felt
 * static: you could not see where a widget would land until you let go.
 *
 * The answer is not to re-render the grid mid-drag — that would move the
 * dragged widget's own cell out from under the gesture. Instead **the
 * rendered order is frozen for the whole drag** and every widget is
 * *translated* to the position it would occupy under the candidate order.
 * Nothing about the layout changes until the finger lifts and everything has
 * already animated into place, so the commit is invisible: the pixels before
 * and after are identical.
 *
 * That makes the whole problem one of geometry, and geometry is testable.
 * Everything here is pure — no components, no animation, no React — so the
 * reflow can be verified without a device that can drag.
 *
 * ## The grid this mirrors
 *
 * `buildGrid` in `modules.ts` is the authority on which modules share a row.
 * This module only answers *where* a row sits, and it derives that from the
 * rectangles the widgets actually reported rather than from any constant:
 * measured origin, measured widths, measured heights. A module's height is
 * its own and does not change with position, so a row is as tall as its
 * tallest member and the next row starts one gap below.
 */

import {
  buildGrid,
  reorderModule,
  sizeOf,
  visibleModules,
  type DashboardLayout,
  type DashboardModuleId,
} from './modules';

export type Rect = { x: number; y: number; width: number; height: number };
export type Point = { x: number; y: number };

export type RectMap = Partial<Record<DashboardModuleId, Rect>>;
export type SlotMap = Partial<Record<DashboardModuleId, Point>>;

/**
 * The measured frame the grid occupies, derived from the widgets themselves.
 *
 * Read rather than assumed: the screen's horizontal padding, the column
 * width and the grid's top all belong to the layout, and hard-coding any of
 * them here would be a second source of truth that could drift from the one
 * doing the rendering.
 */
export type GridFrame = {
  originX: number;
  originY: number;
  /** Full width of a wide module. */
  width: number;
  /** Width of one square column. */
  columnWidth: number;
  gap: number;
};

export function measureFrame(rects: RectMap, gap: number): GridFrame | null {
  const values = Object.values(rects).filter((rect): rect is Rect => Boolean(rect));
  if (values.length === 0) return null;

  const originX = Math.min(...values.map((rect) => rect.x));
  const originY = Math.min(...values.map((rect) => rect.y));
  const width = Math.max(...values.map((rect) => rect.width));

  return { originX, originY, width, columnWidth: (width - gap) / 2, gap };
}

/**
 * The top-left each visible module would occupy under `layout`'s order.
 *
 * Only positions, never sizes: a module keeps its own dimensions wherever it
 * lands, so a translation by the difference between two of these is an exact
 * description of the move.
 *
 * A square with no partner keeps the left column rather than being stretched,
 * which is what the route renders and what `buildGrid` implies.
 */
export function computeSlots(layout: DashboardLayout, rects: RectMap, frame: GridFrame): SlotMap {
  const slots: SlotMap = {};
  let y = frame.originY;

  for (const row of buildGrid(layout)) {
    let rowHeight = 0;

    row.forEach((id, column) => {
      const rect = rects[id];
      if (!rect) return;

      const isWide = sizeOf(layout, id) === 'wide';
      slots[id] = {
        x: isWide || column === 0 ? frame.originX : frame.originX + frame.columnWidth + frame.gap,
        y,
      };
      rowHeight = Math.max(rowHeight, rect.height);
    });

    if (rowHeight > 0) y += rowHeight + frame.gap;
  }

  return slots;
}

/**
 * How far each module must be nudged from where it is *rendered* to where the
 * candidate order would put it.
 *
 * The dragged module is excluded — it is following a finger, not an
 * animation, and writing to its offset here would fight the gesture.
 */
export function reflowOffsets(
  home: SlotMap,
  candidate: SlotMap,
  exclude: DashboardModuleId | null,
): Partial<Record<DashboardModuleId, Point>> {
  const offsets: Partial<Record<DashboardModuleId, Point>> = {};

  for (const key of Object.keys(home) as DashboardModuleId[]) {
    if (key === exclude) continue;
    const from = home[key];
    const to = candidate[key];
    if (!from || !to) continue;
    offsets[key] = { x: to.x - from.x, y: to.y - from.y };
  }

  return offsets;
}

/**
 * The fraction of a slot a finger must be *inside* before it counts as
 * entering it.
 *
 * Without this, the swap fires the instant two rectangles touch, so a hand
 * resting on a boundary reorders Home continuously — the hypersensitivity the
 * brief rules out. A fifth of the cell on every edge is enough that a
 * deliberate move crosses it and a tremor does not.
 */
export const SLOT_INSET_RATIO = 0.2;

/**
 * Which module's slot a point has meaningfully entered, or `null`.
 *
 * Tested against the **candidate** slots — where things currently appear —
 * not their home positions. That is also where the hysteresis comes from: once
 * a swap happens the dragged module owns that slot, so holding still finds
 * nothing new and the order stops changing. Reversing requires actually
 * moving back into the other slot.
 */
export function slotUnderPoint(
  slots: SlotMap,
  rects: RectMap,
  point: Point,
  exclude: DashboardModuleId,
): DashboardModuleId | null {
  for (const key of Object.keys(slots) as DashboardModuleId[]) {
    if (key === exclude) continue;
    const slot = slots[key];
    const rect = rects[key];
    if (!slot || !rect) continue;

    const insetX = rect.width * SLOT_INSET_RATIO;
    const insetY = rect.height * SLOT_INSET_RATIO;

    if (
      point.x >= slot.x + insetX &&
      point.x <= slot.x + rect.width - insetX &&
      point.y >= slot.y + insetY &&
      point.y <= slot.y + rect.height - insetY
    ) {
      return key;
    }
  }

  return null;
}

/**
 * The order the drag is currently proposing.
 *
 * `null` means nothing changed — the caller should leave the animations
 * alone rather than re-running them, which is what keeps a slow drag from
 * restarting the same transition every frame.
 */
export function candidateLayout(
  current: DashboardLayout,
  rects: RectMap,
  frame: GridFrame,
  dragged: DashboardModuleId,
  pointer: Point,
): DashboardLayout | null {
  const slots = computeSlots(current, rects, frame);
  const target = slotUnderPoint(slots, rects, pointer, dragged);
  if (!target) return null;

  const from = current.order.indexOf(dragged);
  const to = current.order.indexOf(target);
  if (from === -1 || to === -1 || from === to) return null;

  const next = reorderModule(current, from, to);
  return next === current ? null : next;
}

/**
 * The centre of the dragged widget at this moment in the gesture.
 *
 * Its *rendered* rectangle never moves during a drag — only its transform
 * does — so the visual centre is the home centre plus the gesture delta.
 */
export function draggedCentre(rect: Rect, dx: number, dy: number): Point {
  return { x: rect.x + rect.width / 2 + dx, y: rect.y + rect.height / 2 + dy };
}

/** True when every visible module has reported a rectangle to work from. */
export function hasCompleteRects(layout: DashboardLayout, rects: RectMap): boolean {
  return visibleModules(layout).every((id) => Boolean(rects[id]));
}
