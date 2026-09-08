/**
 * Fuel Home's section model: which sections exist, what each one is allowed to
 * do, how a stored layout is made safe, and how an ordered list becomes rows.
 *
 * ## Order, selective visibility, contextual size — and nothing else
 *
 * 5.6B.1 offered ordering alone, on the reasoning that Fuel is one workflow
 * with a canonical hierarchy. The founder's device review kept the hierarchy
 * argument and rejected the conclusion: **the default should be right, and the
 * user should still be able to put their own screen together.** So this slice
 * adds two powers and deliberately stops there.
 *
 * - **Hiding** is offered only where the section is context rather than the
 *   feature. Nutrition and Meals *are* Fuel; a screen you can empty out until
 *   it no longer logs food is a screen that can be broken by accident.
 * - **Size** is offered only where two genuine designs exist. Water and
 *   Peptides are single readings that work as a square module or a wide strip.
 *   Nutrition, the Day Strip and Meals are wide by nature — a squared calorie
 *   figure or a squared list of four meals is a stretched layout nobody drew,
 *   which is exactly the novelty §56 rules out.
 *
 * The header, the date, the scanner, settings, the Customize entry and the Add
 * Food action are not sections. They never move, never hide and never resize.
 *
 * **Pure, and presentation only.** Nothing here knows a calorie from a
 * millilitre; persistence lives in `useFuelLayout`.
 *
 * ## Why this is Fuel's own model and not Home's
 *
 * Home's `modules.ts` carries a registry, a normalizer, reorder helpers and a
 * two-column grid whose *shapes* are nearly identical to these. They are not
 * the same model: Home has no concept of a section that cannot be hidden, its
 * sizes belong to different widgets, and its grid is the whole screen rather
 * than a pair inside a column of full-width sections. Extracting a shared
 * framework would mean editing a locked feature to add a flag it does not
 * need, to save a hundred lines that say what Fuel means by them. The
 * *vocabulary* is shared on purpose — order, hidden, sizes, square, wide — so
 * the two customisation surfaces feel like one app.
 */

/** In the founder-approved default order (5.6B.2): nutrition leads. */
export const FUEL_SECTIONS = ['nutrition', 'dayStrip', 'meals', 'water', 'peptides'] as const;

export type FuelSection = (typeof FUEL_SECTIONS)[number];

/** A section is a full-width band or one half of a pair. Nothing else. */
export type FuelSectionSize = 'square' | 'wide';

type SectionMeta = {
  /** What it is called in the sheet, in arrange mode, and to assistive tech. */
  label: string;
  /** Sizes this section has a real design for — never a stretched one. */
  sizes: readonly FuelSectionSize[];
  defaultSize: FuelSectionSize;
  /** False for the two sections that define the feature. */
  hideable: boolean;
};

export const FUEL_SECTION_REGISTRY: Record<FuelSection, SectionMeta> = {
  nutrition: { label: 'Nutrition', sizes: ['wide'], defaultSize: 'wide', hideable: false },
  dayStrip: { label: 'Day Strip', sizes: ['wide'], defaultSize: 'wide', hideable: true },
  meals: { label: 'Meals', sizes: ['wide'], defaultSize: 'wide', hideable: false },
  water: { label: 'Water', sizes: ['square', 'wide'], defaultSize: 'square', hideable: true },
  peptides: { label: 'Peptides', sizes: ['square', 'wide'], defaultSize: 'square', hideable: true },
};

/**
 * Nutrition, then the strip, then the meals, then the pair.
 *
 * **The hierarchy correction this slice exists for.** 5.6B.1 opened with the
 * Day Strip, which is the most distinctive thing on the screen and the wrong
 * thing to lead with: Fuel's first practical question is *where am I today*,
 * and the answer to it was below the fold. The strip is personality and
 * context; it now sits directly under the answer rather than in front of it.
 */
export const DEFAULT_FUEL_ORDER: readonly FuelSection[] = FUEL_SECTIONS;

export type FuelLayout = {
  order: FuelSection[];
  hidden: FuelSection[];
  sizes: Record<FuelSection, FuelSectionSize>;
};

const DEFAULT_FUEL_SIZES: Record<FuelSection, FuelSectionSize> = {
  nutrition: FUEL_SECTION_REGISTRY.nutrition.defaultSize,
  dayStrip: FUEL_SECTION_REGISTRY.dayStrip.defaultSize,
  meals: FUEL_SECTION_REGISTRY.meals.defaultSize,
  water: FUEL_SECTION_REGISTRY.water.defaultSize,
  peptides: FUEL_SECTION_REGISTRY.peptides.defaultSize,
};

/** What *Reset Layout* restores, and what a user with no record gets. */
export const DEFAULT_FUEL_LAYOUT: FuelLayout = {
  order: [...DEFAULT_FUEL_ORDER],
  hidden: [],
  sizes: { ...DEFAULT_FUEL_SIZES },
};

/** A fresh copy, so a caller cannot write through the shared default. */
export function defaultFuelLayout(): FuelLayout {
  return {
    order: [...DEFAULT_FUEL_ORDER],
    hidden: [],
    sizes: { ...DEFAULT_FUEL_SIZES },
  };
}

function isSection(value: unknown): value is FuelSection {
  return typeof value === 'string' && (FUEL_SECTIONS as readonly string[]).includes(value);
}

/**
 * Turns whatever storage returns into a layout Fuel can render.
 *
 * A stored layout is untrusted input written by a build that no longer exists,
 * and its failure modes are severe — a Fuel with no Nutrition, a section drawn
 * twice, or a section added later that never appears. Every case is handled
 * rather than assumed away:
 *
 * - **the whole 5.6B.1 shape — a bare array of ids — read as an order**, with
 *   the new visibility and size defaults applied around it. That is the
 *   migration, and it is silent by design: someone who arranged Fuel last week
 *   keeps their arrangement and gains square Water and Peptides;
 * - unknown ids dropped, so a section removed in a later build cannot linger;
 * - duplicates collapsed to their first appearance;
 * - sections missing from a stored order appended in default order, which is
 *   what makes a section added in a later slice show up for existing users;
 * - **a section hidden that has no business being hidden — Nutrition, Meals —
 *   dropped from `hidden`**, because a record hand-edited or written by a
 *   future build must not be able to empty the feature out;
 * - **a size the section has no design for corrected to its default**, so a
 *   stale record cannot produce a squeezed layout.
 *
 * There is no destructive migration and no reset: nothing a user chose is
 * discarded to make a newer schema fit.
 */
export function normalizeFuelLayout(stored: unknown): FuelLayout {
  /*
   * 5.6B.1 stored the order as a bare array. Reading it as `{ order }` is the
   * entire backward-compatibility story — everything below is the same code
   * path for both shapes.
   */
  const record: Record<string, unknown> = Array.isArray(stored)
    ? { order: stored }
    : typeof stored === 'object' && stored !== null
      ? (stored as Record<string, unknown>)
      : {};

  const rawOrder = Array.isArray(record.order) ? record.order : [];
  const seen = new Set<FuelSection>();
  const order: FuelSection[] = [];

  for (const value of rawOrder) {
    if (!isSection(value) || seen.has(value)) continue;
    seen.add(value);
    order.push(value);
  }
  for (const id of DEFAULT_FUEL_ORDER) {
    if (!seen.has(id)) order.push(id);
  }

  const rawHidden = Array.isArray(record.hidden) ? record.hidden : [];
  const hidden = [
    ...new Set(rawHidden.filter(isSection).filter((id) => FUEL_SECTION_REGISTRY[id].hideable)),
  ];

  const rawSizes =
    typeof record.sizes === 'object' && record.sizes !== null
      ? (record.sizes as Record<string, unknown>)
      : {};

  const sizes = { ...DEFAULT_FUEL_SIZES };
  for (const id of FUEL_SECTIONS) {
    const value = rawSizes[id];
    // Only a size this section actually has a design for survives.
    if (
      typeof value === 'string' &&
      (FUEL_SECTION_REGISTRY[id].sizes as readonly string[]).includes(value)
    ) {
      sizes[id] = value as FuelSectionSize;
    }
  }

  return { order, hidden, sizes };
}

export function visibleFuelSections(layout: FuelLayout): FuelSection[] {
  return layout.order.filter((id) => !layout.hidden.includes(id));
}

export function isSectionHidden(layout: FuelLayout, id: FuelSection): boolean {
  return layout.hidden.includes(id);
}

export function sectionSize(layout: FuelLayout, id: FuelSection): FuelSectionSize {
  return layout.sizes[id] ?? DEFAULT_FUEL_SIZES[id];
}

/** Ignores a request to hide a section that defines the feature. */
export function toggleSection(layout: FuelLayout, id: FuelSection): FuelLayout {
  if (!FUEL_SECTION_REGISTRY[id].hideable) return layout;
  return {
    ...layout,
    hidden: isSectionHidden(layout, id)
      ? layout.hidden.filter((hiddenId) => hiddenId !== id)
      : [...layout.hidden, id],
  };
}

/** Ignores a size the section has no design for, rather than storing it. */
export function setSectionSize(
  layout: FuelLayout,
  id: FuelSection,
  size: FuelSectionSize,
): FuelLayout {
  if (!FUEL_SECTION_REGISTRY[id].sizes.includes(size)) return layout;
  return { ...layout, sizes: { ...layout.sizes, [id]: size } };
}

/**
 * Lift one item out of a list and drop it back in at `to`.
 *
 * **The single definition of what moving a section means.** Every path — the
 * sheet's arrows, the sheet's drag handle, the in-page arrows, the in-page
 * drag — resolves through this, so none of them can develop its own idea of
 * where a section lands. Returns `null` when nothing would change, which is
 * what lets the callers avoid writing an identical layout back to storage.
 */
function spliceTo<T>(list: readonly T[], from: number, to: number): T[] | null {
  if (from < 0 || from >= list.length) return null;
  const clamped = Math.max(0, Math.min(list.length - 1, to));
  if (clamped === from) return null;

  const next = [...list];
  next.splice(from, 1);
  next.splice(clamped, 0, list[from]);
  return next;
}

/**
 * Moves one section by one place **in the full order**, hidden sections
 * included — what the Customize sheet does, because the sheet lists them all.
 *
 * A move at either end is a no-op rather than a wrap: wrapping sends a section
 * the length of the list on one tap too many.
 */
export function moveSection(
  layout: FuelLayout,
  id: FuelSection,
  direction: -1 | 1,
): FuelLayout {
  const from = layout.order.indexOf(id);
  if (from === -1) return layout;
  const to = from + direction;
  // An explicit bounds check, so a step off the end is a no-op rather than
  // being clamped back onto the section it started on.
  if (to < 0 || to >= layout.order.length) return layout;

  const order = spliceTo(layout.order, from, to);
  return order ? { ...layout, order } : layout;
}

/** Drops a dragged section at an absolute index in the full order. */
export function reorderSection(
  layout: FuelLayout,
  id: FuelSection,
  toIndex: number,
): FuelLayout {
  const order = spliceTo(layout.order, layout.order.indexOf(id), toIndex);
  return order ? { ...layout, order } : layout;
}

/**
 * Re-seats a permuted list of visible sections into the full order.
 *
 * Hidden sections keep the absolute positions they already held; the visible
 * ones are dealt back into the slots between them, in their new sequence. So
 * unhiding a section returns it to where it was rather than to the bottom of
 * the list, and moving a visible section never has to step over something the
 * user cannot see.
 */
function withVisibleOrder(layout: FuelLayout, nextVisible: readonly FuelSection[]): FuelLayout {
  let taken = 0;
  const order = layout.order.map((id) =>
    layout.hidden.includes(id) ? id : (nextVisible[taken++] ?? id),
  );
  return { ...layout, order };
}

/**
 * Moves one section one place **among the sections actually on screen**.
 *
 * What Fuel Home's arrange mode uses. Hiding the Day Strip and then tapping
 * *Move Meals up* has to move Meals above Nutrition — under `moveSection` it
 * would swap Meals with the hidden strip and nothing visible would happen,
 * which reads as a broken button. Same `spliceTo`, applied to the list the
 * user can see.
 */
export function moveVisibleSection(
  layout: FuelLayout,
  id: FuelSection,
  direction: -1 | 1,
): FuelLayout {
  const visible = visibleFuelSections(layout);
  const from = visible.indexOf(id);
  if (from === -1) return layout;
  const to = from + direction;
  if (to < 0 || to >= visible.length) return layout;

  const next = spliceTo(visible, from, to);
  return next ? withVisibleOrder(layout, next) : layout;
}

/** Drops a dragged section at an absolute index among the visible sections. */
export function reorderVisibleSection(
  layout: FuelLayout,
  id: FuelSection,
  toIndex: number,
): FuelLayout {
  const visible = visibleFuelSections(layout);
  const next = spliceTo(visible, visible.indexOf(id), toIndex);
  return next ? withVisibleOrder(layout, next) : layout;
}

/** What each section is called. Read from the registry so there is one source. */
export const SECTION_LABELS: Record<FuelSection, string> = {
  nutrition: FUEL_SECTION_REGISTRY.nutrition.label,
  dayStrip: FUEL_SECTION_REGISTRY.dayStrip.label,
  meals: FUEL_SECTION_REGISTRY.meals.label,
  water: FUEL_SECTION_REGISTRY.water.label,
  peptides: FUEL_SECTION_REGISTRY.peptides.label,
};

export type FuelRow = FuelSection[];

/**
 * Lays the visible sections out as rows.
 *
 * Three rules, and deliberately only three — the user arranges an *order*, and
 * placement follows from it rather than from stored coordinates that could
 * disagree with what they see:
 *
 * 1. a **wide** section takes a whole row;
 * 2. two **squares** that are *adjacent in the order* share a row;
 * 3. a square with no square immediately after it keeps its own row at square
 *    width — it is **not** promoted to wide, because a stretched module is a
 *    layout nobody designed and the user did not ask for, and it is not padded
 *    with a placeholder, because a hole is not information.
 *
 * **Adjacency is literal.** Water square, Meals, Peptides square is three
 * rows: nothing is teleported up the page to find a partner. The order the
 * user arranged is the order they see, which is the only version of this that
 * stays predictable once they start moving things.
 *
 * Hiding removes a section from the list, so the rows reflow on their own:
 * hide the Day Strip between two squares and the squares pair.
 */
export function buildFuelRows(layout: FuelLayout): FuelRow[] {
  const ids = visibleFuelSections(layout);
  const rows: FuelRow[] = [];

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    if (sectionSize(layout, id) === 'wide') {
      rows.push([id]);
      continue;
    }

    const next = ids[i + 1];
    if (next && sectionSize(layout, next) === 'square') {
      rows.push([id, next]);
      i += 1;
    } else {
      rows.push([id]);
    }
  }

  return rows;
}

/**
 * Which slot a dragged section has been carried into.
 *
 * **One dimension, so no geometry engine.** Home's drag solves a grid and
 * needs measured rectangles and candidate layouts; a vertical list only needs
 * to know how far the finger has travelled past the neighbouring sections'
 * heights. Kept pure for the same reason `dragLayout.ts` is: a `PanResponder`'s
 * handlers are only reachable through React Native's responder negotiation,
 * and a test that drove them would be testing the framework.
 *
 * A section swaps with a neighbour once the finger has crossed **half** of
 * that neighbour's height — the midpoint, so a section settles where it
 * visually appears to be rather than where it was dropped from.
 *
 * Both drags use it: the in-page arrange gesture, and the Customize sheet's
 * handle. The sheet's rows are not a uniform height once the text scales, so
 * measuring is the only version of this that survives Dynamic Type.
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
