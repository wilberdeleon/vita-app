/**
 * The order Fuel Home's major sections appear in — the user's to choose.
 *
 * ## Only ordering
 *
 * Dashboard lets someone resize widgets, hide them and pick quick tools,
 * because Home is a collection of independent domains and there is no single
 * right arrangement of them. **Fuel is one workflow**, so it has a canonical
 * hierarchy that should be right by default — the founder's ruling was that
 * users should not have to design the page for us. What varies between
 * people is which part they look at first, and that is exactly what this
 * covers: order, and nothing else. No sizes, no hiding, no modes.
 *
 * The header, the date, the scanner, settings and the Add Food action are
 * not sections and never move.
 */

/** In the founder-approved default order. */
export const FUEL_SECTIONS = ['dayStrip', 'nutrition', 'meals', 'water', 'peptides'] as const;

export type FuelSection = (typeof FUEL_SECTIONS)[number];

export const DEFAULT_FUEL_ORDER: readonly FuelSection[] = FUEL_SECTIONS;

/**
 * Repairs whatever came back from storage.
 *
 * A stored order is a list of names written by an older build, so it can be
 * wrong in four ways and all four are normal: it can be missing a section
 * added since, contain one that has been removed, repeat one, or not be a
 * list at all. **Every case resolves to a complete, duplicate-free order**
 * rather than to a fallback that would silently discard what the user
 * arranged — the same rule `normalizeLayout` follows for Home.
 *
 * Unknown names are dropped, missing ones are appended in default order, so
 * a section added in a later slice appears at the bottom for existing users
 * instead of vanishing.
 */
export function normalizeFuelOrder(stored: unknown): FuelSection[] {
  if (!Array.isArray(stored)) return [...DEFAULT_FUEL_ORDER];

  const seen = new Set<FuelSection>();
  const order: FuelSection[] = [];

  for (const candidate of stored) {
    if (typeof candidate !== 'string') continue;
    const section = candidate as FuelSection;
    if (!FUEL_SECTIONS.includes(section) || seen.has(section)) continue;
    seen.add(section);
    order.push(section);
  }

  for (const section of DEFAULT_FUEL_ORDER) {
    if (!seen.has(section)) order.push(section);
  }

  return order;
}

/**
 * Moves one section by one place, or returns the order unchanged at an edge.
 *
 * Used by both the drag and the accessible Move up / Move down actions, so
 * the two cannot disagree about what a step means.
 */
export function moveSection(
  order: readonly FuelSection[],
  section: FuelSection,
  direction: -1 | 1,
): FuelSection[] {
  const from = order.indexOf(section);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= order.length) return [...order];

  const next = [...order];
  next.splice(from, 1);
  next.splice(to, 0, section);
  return next;
}

/** Moves a section to an absolute index — what a drag resolves to. */
export function reorderSection(
  order: readonly FuelSection[],
  section: FuelSection,
  toIndex: number,
): FuelSection[] {
  const from = order.indexOf(section);
  if (from === -1) return [...order];

  const clamped = Math.max(0, Math.min(order.length - 1, toIndex));
  if (clamped === from) return [...order];

  const next = [...order];
  next.splice(from, 1);
  next.splice(clamped, 0, section);
  return next;
}

/** What each section is called in Arrange mode and to assistive technology. */
export const SECTION_LABELS: Record<FuelSection, string> = {
  dayStrip: 'Today',
  nutrition: 'Nutrition',
  meals: 'Meals',
  water: 'Water',
  peptides: 'Peptides',
};

/**
 * Which slot a dragged section has been carried into.
 *
 * **One dimension, so no geometry engine.** Home's drag solves a grid and
 * needs measured rectangles and candidate layouts; a vertical list only
 * needs to know how far the finger has travelled past the neighbouring
 * sections' heights. Kept pure for the same reason `dragLayout.ts` is: a
 * `PanResponder`'s handlers are only reachable through React Native's
 * responder negotiation, and a test that drove them would be testing the
 * framework.
 *
 * A section swaps with a neighbour once the finger has crossed **half** of
 * that neighbour's height — the midpoint, so a section settles where it
 * visually appears to be rather than where it was dropped from.
 */
export function targetIndexFor(
  heights: readonly number[],
  fromIndex: number,
  dy: number,
): number {
  if (fromIndex < 0 || fromIndex >= heights.length) return fromIndex;

  let index = fromIndex;
  let travelled = 0;

  if (dy > 0) {
    while (index + 1 < heights.length) {
      const next = heights[index + 1] ?? 0;
      if (dy - travelled < next / 2) break;
      travelled += next;
      index += 1;
    }
  } else if (dy < 0) {
    while (index - 1 >= 0) {
      const previous = heights[index - 1] ?? 0;
      if (-dy - travelled < previous / 2) break;
      travelled += previous;
      index -= 1;
    }
  }

  return index;
}
