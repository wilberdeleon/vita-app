/**
 * The geometry behind Home's live drag reflow.
 *
 * This is the part of the interaction a device could tell us about and this
 * environment cannot: the simulator integration refuses, so nothing here can
 * be dragged by hand. Keeping the arithmetic pure is what makes it checkable
 * at all — where each widget would sit under a candidate order, which slot a
 * finger has meaningfully entered, and how far every other widget has to
 * move as a result.
 *
 * The fixture below is a real iPhone frame: a 390pt screen with 20pt gutters,
 * `spacing.m` between cells, and the shipped default order.
 */

import {
  candidateLayout,
  computeSlots,
  draggedCentre,
  hasCompleteRects,
  measureFrame,
  reflowOffsets,
  slotUnderPoint,
  type RectMap,
} from '../dragLayout';
import { DEFAULT_LAYOUT, setModuleSize, toggleModule, type DashboardLayout } from '../modules';

const GAP = 12;

/** Fuel wide · Water | Peptides square · Quick Tools · Today's Schedule. */
const RECTS: RectMap = {
  fuel: { x: 20, y: 200, width: 350, height: 64 },
  water: { x: 20, y: 276, width: 169, height: 208 },
  peptides: { x: 201, y: 276, width: 169, height: 208 },
  quickTools: { x: 20, y: 496, width: 350, height: 100 },
  schedule: { x: 20, y: 608, width: 350, height: 90 },
};

const frame = () => measureFrame(RECTS, GAP)!;

describe('measuring the grid', () => {
  it('reads the frame from the widgets rather than assuming it', () => {
    const f = frame();
    expect(f.originX).toBe(20);
    expect(f.originY).toBe(200);
    expect(f.width).toBe(350);
    // Two columns and one gap inside the full width.
    expect(f.columnWidth).toBe(169);
  });

  it('has nothing to say before anything has been measured', () => {
    expect(measureFrame({}, GAP)).toBeNull();
    expect(hasCompleteRects(DEFAULT_LAYOUT, {})).toBe(false);
    expect(hasCompleteRects(DEFAULT_LAYOUT, RECTS)).toBe(true);
  });

  it('does not require a hidden module to have been measured', () => {
    const withoutSchedule = toggleModule(DEFAULT_LAYOUT, 'schedule');
    const partial: RectMap = { ...RECTS, schedule: undefined };
    expect(hasCompleteRects(withoutSchedule, partial)).toBe(true);
  });
});

describe('where a candidate order would put things', () => {
  it('reproduces the rendered positions for the order already on screen', () => {
    // The whole scheme depends on this: an offset is the difference between
    // two of these, so the identity case has to come out at zero.
    const slots = computeSlots(DEFAULT_LAYOUT, RECTS, frame());
    for (const id of ['fuel', 'water', 'peptides', 'quickTools', 'schedule'] as const) {
      expect(slots[id]).toEqual({ x: RECTS[id]!.x, y: RECTS[id]!.y });
    }
  });

  it('swaps two squares within their row and moves nothing else', () => {
    const swapped: DashboardLayout = {
      ...DEFAULT_LAYOUT,
      order: ['fuel', 'peptides', 'water', 'quickTools', 'schedule'],
    };
    const slots = computeSlots(swapped, RECTS, frame());

    expect(slots.peptides).toEqual({ x: 20, y: 276 });
    expect(slots.water).toEqual({ x: 201, y: 276 });
    expect(slots.fuel).toEqual({ x: 20, y: 200 });
    expect(slots.quickTools).toEqual({ x: 20, y: 496 });
  });

  it('re-stacks the rows when a wide module moves below a pair', () => {
    /*
     * The case the brief calls out. Fuel is 64 tall and the squares 208, so
     * the rows do not simply exchange positions — everything above the moved
     * module shifts up by its height and it lands below them.
     */
    const moved: DashboardLayout = {
      ...DEFAULT_LAYOUT,
      order: ['water', 'peptides', 'fuel', 'quickTools', 'schedule'],
    };
    const slots = computeSlots(moved, RECTS, frame());

    expect(slots.water).toEqual({ x: 20, y: 200 });
    expect(slots.peptides).toEqual({ x: 201, y: 200 });
    expect(slots.fuel).toEqual({ x: 20, y: 420 });
    expect(slots.quickTools).toEqual({ x: 20, y: 496 });
    expect(slots.schedule).toEqual({ x: 20, y: 608 });
  });

  it('keeps a lone square in its own column rather than stretching it', () => {
    const hidden = toggleModule(DEFAULT_LAYOUT, 'peptides');
    const slots = computeSlots(hidden, RECTS, frame());
    expect(slots.water).toEqual({ x: 20, y: 276 });
    expect(slots.peptides).toBeUndefined();
  });

  it('places a module made wide at the full width', () => {
    const wide = setModuleSize(DEFAULT_LAYOUT, 'water', 'wide');
    const slots = computeSlots(wide, RECTS, frame());
    expect(slots.water!.x).toBe(20);
    expect(slots.peptides!.x).toBe(20);
    expect(slots.peptides!.y).toBeGreaterThan(slots.water!.y);
  });
});

describe('how far everything else must move', () => {
  it('describes a square swap as two equal and opposite nudges', () => {
    const home = computeSlots(DEFAULT_LAYOUT, RECTS, frame());
    const swapped = computeSlots(
      { ...DEFAULT_LAYOUT, order: ['fuel', 'peptides', 'water', 'quickTools', 'schedule'] },
      RECTS,
      frame(),
    );

    const offsets = reflowOffsets(home, swapped, 'peptides');
    expect(offsets.water).toEqual({ x: 181, y: 0 });
    // The carried widget is following a finger; writing to it here would
    // fight the gesture.
    expect(offsets.peptides).toBeUndefined();
    expect(offsets.fuel).toEqual({ x: 0, y: 0 });
  });

  it('returns everything to zero when the candidate is the current order', () => {
    const home = computeSlots(DEFAULT_LAYOUT, RECTS, frame());
    const offsets = reflowOffsets(home, home, null);
    for (const value of Object.values(offsets)) expect(value).toEqual({ x: 0, y: 0 });
  });
});

describe('deciding what the finger is over', () => {
  const slots = () => computeSlots(DEFAULT_LAYOUT, RECTS, frame());

  it('ignores a point that has only grazed the edge of a slot', () => {
    // Water spans x 20–189. Two points just inside it, both short of the
    // inset, are what a resting hand produces.
    expect(slotUnderPoint(slots(), RECTS, { x: 25, y: 380 }, 'peptides')).toBeNull();
    expect(slotUnderPoint(slots(), RECTS, { x: 184, y: 380 }, 'peptides')).toBeNull();
  });

  it('answers once the point is meaningfully inside', () => {
    expect(slotUnderPoint(slots(), RECTS, { x: 100, y: 380 }, 'peptides')).toBe('water');
  });

  it('never reports the widget being carried', () => {
    const centre = { x: 285, y: 380 };
    expect(slotUnderPoint(slots(), RECTS, centre, 'peptides')).toBeNull();
  });

  it('tracks the widget by its centre, not by where the finger landed on it', () => {
    expect(draggedCentre(RECTS.peptides!, 0, 0)).toEqual({ x: 285.5, y: 380 });
    expect(draggedCentre(RECTS.peptides!, -186, 0)).toEqual({ x: 99.5, y: 380 });
  });
});

describe('the candidate order', () => {
  it('proposes a swap once the carried square crosses into its neighbour', () => {
    const next = candidateLayout(DEFAULT_LAYOUT, RECTS, frame(), 'peptides', {
      x: 99.5,
      y: 380,
    });
    expect(next!.order).toEqual(['fuel', 'peptides', 'water', 'quickTools', 'schedule']);
  });

  it('proposes nothing for a jitter that stays inside its own slot', () => {
    for (const dx of [-4, 0, 4]) {
      const centre = draggedCentre(RECTS.peptides!, dx, 0);
      expect(candidateLayout(DEFAULT_LAYOUT, RECTS, frame(), 'peptides', centre)).toBeNull();
    }
  });

  it('stops proposing once the swap has happened — the order settles', () => {
    /*
     * Where the hysteresis comes from. After the swap the carried module owns
     * the slot the finger is over, so holding still proposes nothing and the
     * screen stops shuffling. Reversing means actually moving back.
     */
    const swapped = candidateLayout(DEFAULT_LAYOUT, RECTS, frame(), 'peptides', {
      x: 99.5,
      y: 380,
    })!;
    expect(candidateLayout(swapped, RECTS, frame(), 'peptides', { x: 99.5, y: 380 })).toBeNull();

    // And moving back across proposes the original order again.
    const back = candidateLayout(swapped, RECTS, frame(), 'peptides', { x: 285, y: 380 });
    expect(back!.order).toEqual(DEFAULT_LAYOUT.order);
  });

  it('moves a wide module below the pair when it is carried down over them', () => {
    const next = candidateLayout(DEFAULT_LAYOUT, RECTS, frame(), 'fuel', { x: 100, y: 380 });
    expect(next!.order).toEqual(['water', 'fuel', 'peptides', 'quickTools', 'schedule']);
  });

  it('proposes nothing over empty space', () => {
    expect(
      candidateLayout(DEFAULT_LAYOUT, RECTS, frame(), 'peptides', { x: 300, y: 1200 }),
    ).toBeNull();
  });
});
