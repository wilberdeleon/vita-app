/**
 * Which modules Home can show, in what order, and how a stored layout is
 * made safe to use.
 *
 * **Pure, and owned by the Dashboard.** Everything here is a function of its
 * inputs — the persistence around it lives in `useDashboardLayout`, and the
 * meaning of a module id lives here because the Dashboard is the only thing
 * that knows what one is.
 */

export const DASHBOARD_MODULES = ['water', 'peptides', 'fuel', 'quickTools', 'schedule'] as const;

export type DashboardModuleId = (typeof DASHBOARD_MODULES)[number];

/**
 * What a user who has never customised Home sees.
 *
 * Water and Peptides first because they are the two domains with something
 * to answer today; Fuel below them; utilities and the day's list last.
 */
export const DEFAULT_MODULE_ORDER: readonly DashboardModuleId[] = [
  'water',
  'peptides',
  'fuel',
  'quickTools',
  'schedule',
];

/** Human names, used by the customization sheet and by spoken labels. */
export const MODULE_LABELS: Record<DashboardModuleId, string> = {
  water: 'Water',
  peptides: 'Peptides',
  fuel: 'Fuel',
  quickTools: 'Quick Tools',
  schedule: "Today's Schedule",
};

export type DashboardLayout = {
  /** Every known module, in the order Home renders them. */
  order: DashboardModuleId[];
  /** Modules the user has switched off. */
  hidden: DashboardModuleId[];
};

export const DEFAULT_LAYOUT: DashboardLayout = {
  order: [...DEFAULT_MODULE_ORDER],
  hidden: [],
};

function isModuleId(value: unknown): value is DashboardModuleId {
  return typeof value === 'string' && (DASHBOARD_MODULES as readonly string[]).includes(value);
}

/**
 * Turns anything that came back from storage into a layout Home can render.
 *
 * **A stored layout is untrusted input**, and the failure mode if it is not
 * is severe: a Home that renders nothing, or renders a module twice, or
 * silently loses a feature added in a later build. So every case is handled
 * explicitly rather than assumed away:
 *
 * - **unknown ids are dropped** — a module removed in a later version leaves
 *   its id behind in everyone's stored order;
 * - **duplicates collapse to their first appearance** — a bad write must not
 *   render Water twice;
 * - **modules missing from a stored order are appended in default order** —
 *   this is what makes a *new* module appear for existing users instead of
 *   vanishing because their saved layout predates it;
 * - **an empty or unusable order falls back to the default** rather than
 *   producing a blank screen.
 *
 * Hiding everything is allowed and is not corruption: a user may genuinely
 * want only the header. Home still renders, and the customization sheet is
 * still reachable, so the choice is never a trap.
 */
export function normalizeLayout(stored: unknown): DashboardLayout {
  const record = typeof stored === 'object' && stored !== null ? (stored as Record<string, unknown>) : {};

  const rawOrder = Array.isArray(record.order) ? record.order : [];
  const seen = new Set<DashboardModuleId>();
  const order: DashboardModuleId[] = [];

  for (const value of rawOrder) {
    if (!isModuleId(value) || seen.has(value)) continue;
    seen.add(value);
    order.push(value);
  }

  // Anything the stored order never mentioned — a module added since it was
  // written — joins in the order the app ships them.
  for (const id of DEFAULT_MODULE_ORDER) {
    if (!seen.has(id)) order.push(id);
  }

  const rawHidden = Array.isArray(record.hidden) ? record.hidden : [];
  const hidden = [...new Set(rawHidden.filter(isModuleId))];

  return { order, hidden };
}

/** The modules Home actually renders, in order. */
export function visibleModules(layout: DashboardLayout): DashboardModuleId[] {
  return layout.order.filter((id) => !layout.hidden.includes(id));
}

export function isHidden(layout: DashboardLayout, id: DashboardModuleId): boolean {
  return layout.hidden.includes(id);
}

/** Toggles one module's visibility, leaving the order untouched. */
export function toggleModule(layout: DashboardLayout, id: DashboardModuleId): DashboardLayout {
  return {
    order: layout.order,
    hidden: isHidden(layout, id)
      ? layout.hidden.filter((hiddenId) => hiddenId !== id)
      : [...layout.hidden, id],
  };
}

/**
 * Moves one module one place up or down.
 *
 * Chosen over drag-and-drop deliberately: dragging would need
 * `react-native-gesture-handler` and `react-native-reanimated`, two native
 * dependencies, to reorder five rows. Buttons also come out ahead on
 * accessibility — a drag target is pointer-only unless custom actions are
 * added on top of it, whereas a button is reachable by every input method
 * without further work.
 *
 * A move at either end is a no-op rather than a wrap: wrapping would move a
 * row the length of the list when someone taps once too often.
 */
export function moveModule(
  layout: DashboardLayout,
  id: DashboardModuleId,
  direction: 'up' | 'down',
): DashboardLayout {
  const index = layout.order.indexOf(id);
  if (index === -1) return layout;

  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= layout.order.length) return layout;

  const order = [...layout.order];
  [order[index], order[target]] = [order[target], order[index]];
  return { order, hidden: layout.hidden };
}
