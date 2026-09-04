/**
 * The Dashboard's widget model: which modules exist, what shapes each may
 * take, how a stored layout is made safe, and how an ordered list becomes a
 * two-column grid.
 *
 * **Pure, and presentation only.** Nothing here knows what a peptide is or
 * how much water anyone drank — the registry carries shapes and defaults, the
 * modules carry data, and the two meet in the screen. Persistence lives in
 * `useDashboardLayout`.
 */

export const DASHBOARD_MODULES = ['fuel', 'water', 'peptides', 'quickTools', 'schedule'] as const;

export type DashboardModuleId = (typeof DASHBOARD_MODULES)[number];

/**
 * A widget is one column or two. Nothing else.
 *
 * Named for the shape a person sees rather than for the mechanism — a user
 * choosing between `Square` and `Wide` is choosing a look, not a column span,
 * and `1-column` in a settings sheet is the implementation leaking out.
 */
export type ModuleSize = 'square' | 'wide';

type ModuleMeta = {
  label: string;
  defaultSize: ModuleSize;
  /** Sizes this module has a real design for — never a stretched one. */
  sizes: readonly ModuleSize[];
};

/**
 * Presentation metadata, and deliberately nothing more.
 *
 * `sizes` lists what a module was actually *designed* for. Quick Tools and
 * Today's Schedule are wide-only because both are lists that need the width:
 * offering a square form would mean shipping a squeezed layout nobody
 * designed, which is the "just stretch the same component" failure this
 * slice was told to avoid.
 *
 * Fuel defaults to wide (founder direction) and Water and Peptides to
 * square, so the shipped composition is one prominent module above a pair.
 */
export const MODULE_REGISTRY: Record<DashboardModuleId, ModuleMeta> = {
  fuel: { label: 'Fuel', defaultSize: 'wide', sizes: ['square', 'wide'] },
  water: { label: 'Water', defaultSize: 'square', sizes: ['square', 'wide'] },
  peptides: { label: 'Peptides', defaultSize: 'square', sizes: ['square', 'wide'] },
  quickTools: { label: 'Quick Tools', defaultSize: 'wide', sizes: ['wide'] },
  schedule: { label: "Today's Schedule", defaultSize: 'wide', sizes: ['wide'] },
};

/** The order Home ships with: Fuel, then the pair, then the two lists. */
export const DEFAULT_MODULE_ORDER: readonly DashboardModuleId[] = [
  'fuel',
  'water',
  'peptides',
  'quickTools',
  'schedule',
];

export type DashboardLayout = {
  order: DashboardModuleId[];
  hidden: DashboardModuleId[];
  sizes: Record<DashboardModuleId, ModuleSize>;
};

export const DEFAULT_SIZES: Record<DashboardModuleId, ModuleSize> = {
  fuel: MODULE_REGISTRY.fuel.defaultSize,
  water: MODULE_REGISTRY.water.defaultSize,
  peptides: MODULE_REGISTRY.peptides.defaultSize,
  quickTools: MODULE_REGISTRY.quickTools.defaultSize,
  schedule: MODULE_REGISTRY.schedule.defaultSize,
};

export const DEFAULT_LAYOUT: DashboardLayout = {
  order: [...DEFAULT_MODULE_ORDER],
  hidden: [],
  sizes: { ...DEFAULT_SIZES },
};

function isModuleId(value: unknown): value is DashboardModuleId {
  return typeof value === 'string' && (DASHBOARD_MODULES as readonly string[]).includes(value);
}

/**
 * Turns anything storage returns into a layout Home can render.
 *
 * A stored layout is untrusted input and its failure modes are severe — a
 * blank Home, a module rendered twice, or a feature added later that never
 * appears. Each case is handled rather than assumed away:
 *
 * - unknown ids dropped (a module removed in a later build);
 * - duplicates collapsed to their first appearance;
 * - modules missing from a stored order appended in default order, which is
 *   what makes a *new* module show up for existing users;
 * - an unusable order falling back to the default rather than a blank screen;
 * - **a size the module has no design for corrected to its default**, so a
 *   hand-edited or stale record cannot produce a squeezed widget;
 * - **a record with no `sizes` at all — every layout saved by slice 5.3A —
 *   taking the defaults while keeping its visibility and order.** That is the
 *   migration, and it is silent by design: nobody should lose the Home they
 *   arranged because the app learned about widget shapes.
 *
 * Hiding everything is allowed and is not corruption. Home still renders its
 * header, which carries the way back.
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
  for (const id of DEFAULT_MODULE_ORDER) {
    if (!seen.has(id)) order.push(id);
  }

  const rawHidden = Array.isArray(record.hidden) ? record.hidden : [];
  const hidden = [...new Set(rawHidden.filter(isModuleId))];

  const rawSizes =
    typeof record.sizes === 'object' && record.sizes !== null
      ? (record.sizes as Record<string, unknown>)
      : {};

  const sizes = { ...DEFAULT_SIZES };
  for (const id of DASHBOARD_MODULES) {
    const value = rawSizes[id];
    // Only a size this module actually has a design for survives.
    if (typeof value === 'string' && (MODULE_REGISTRY[id].sizes as readonly string[]).includes(value)) {
      sizes[id] = value as ModuleSize;
    }
  }

  return { order, hidden, sizes };
}

export function visibleModules(layout: DashboardLayout): DashboardModuleId[] {
  return layout.order.filter((id) => !layout.hidden.includes(id));
}

export function isHidden(layout: DashboardLayout, id: DashboardModuleId): boolean {
  return layout.hidden.includes(id);
}

export function sizeOf(layout: DashboardLayout, id: DashboardModuleId): ModuleSize {
  return layout.sizes[id] ?? DEFAULT_SIZES[id];
}

export function toggleModule(layout: DashboardLayout, id: DashboardModuleId): DashboardLayout {
  return {
    ...layout,
    hidden: isHidden(layout, id)
      ? layout.hidden.filter((hiddenId) => hiddenId !== id)
      : [...layout.hidden, id],
  };
}

/** Ignores a size the module has no design for, rather than storing it. */
export function setModuleSize(
  layout: DashboardLayout,
  id: DashboardModuleId,
  size: ModuleSize,
): DashboardLayout {
  if (!MODULE_REGISTRY[id].sizes.includes(size)) return layout;
  return { ...layout, sizes: { ...layout.sizes, [id]: size } };
}

/**
 * Moves one module one place. A move at either end is a no-op rather than a
 * wrap — wrapping sends a row the length of the list on one tap too many.
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
  return { ...layout, order };
}

/** Lifts a module out of the order and drops it at `to`. Powers dragging. */
export function reorderModule(
  layout: DashboardLayout,
  from: number,
  to: number,
): DashboardLayout {
  if (from === to) return layout;
  if (from < 0 || from >= layout.order.length) return layout;

  const order = [...layout.order];
  const [moved] = order.splice(from, 1);
  order.splice(Math.max(0, Math.min(order.length, to)), 0, moved);
  return { ...layout, order };
}

export type GridRow = DashboardModuleId[];

/**
 * Lays the visible modules out in two columns.
 *
 * The rules are deterministic and there are only three, which is the point —
 * the user arranges an *order*, and placement follows from it rather than
 * from stored coordinates that could disagree with what they see:
 *
 * 1. a **wide** module takes a whole row;
 * 2. two **squares** in a row share it;
 * 3. a square with no square after it keeps its column and leaves the other
 *    empty — it is **not** silently promoted to wide, because a stretched
 *    widget is a layout nobody designed and the user did not ask for.
 *
 * Hiding a module simply removes it from the list, so the grid reflows on its
 * own: hide Peptides and the square that followed it pairs with Water
 * instead. No placeholders, no gaps to clean up.
 */
export function buildGrid(
  layout: DashboardLayout,
  sizeFor: (id: DashboardModuleId) => ModuleSize = (id) => sizeOf(layout, id),
): GridRow[] {
  const ids = visibleModules(layout);
  const rows: GridRow[] = [];

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    if (sizeFor(id) === 'wide') {
      rows.push([id]);
      continue;
    }

    const next = ids[i + 1];
    if (next && sizeFor(next) === 'square') {
      rows.push([id, next]);
      i += 1;
    } else {
      rows.push([id]);
    }
  }

  return rows;
}
