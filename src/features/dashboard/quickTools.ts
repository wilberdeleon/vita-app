/**
 * Which utilities Quick Tools offers, in what order, and how a stored
 * preference is made safe.
 *
 * Pure and presentation-only, exactly like `modules.ts` — the registry knows
 * a label, an icon, a colour and a route, and nothing about what any of them
 * do.
 */

import { palette } from '../../theme/tokens';

/**
 * Every tool a user *may* choose. **Available is not selected** — see
 * {@link DEFAULT_QUICK_TOOLS} and {@link normalizeQuickTools}.
 */
export const QUICK_TOOLS = ['calculator', 'sites', 'scanner', 'bmi'] as const;

export type QuickToolId = (typeof QUICK_TOOLS)[number];

type QuickToolMeta = {
  /** On the tile. Short, because the tile is small. */
  label: string;
  /** In the customization sheet and to a screen reader. */
  name: string;
  /** What the tool actually does, spoken. Never a claim it does more. */
  hint: string;
  icon: 'calculator-outline' | 'body-outline' | 'barcode-outline' | 'scale-outline';
  color: string;
  route: string;
};

/**
 * **The Food Scanner routes to the existing Fuel barcode scanner** (founder
 * ruling, slice 5.3C, reversing the omission in 5.3B).
 *
 * The rule that survives the reversal is the one about *claims*: this opens
 * the scanner that looks a product up so it can be logged, and its spoken
 * hint says exactly that. It does not evaluate, grade or score anything, and
 * nothing in the label or the hint suggests it does — the evaluating scanner
 * and its methodology remain unbuilt and unauthorised. A shortcut may be a
 * navigation convenience; it may not overstate where it goes.
 */
export const QUICK_TOOL_REGISTRY: Record<QuickToolId, QuickToolMeta> = {
  calculator: {
    label: 'Calculator',
    name: 'Peptide Calculator',
    hint: 'Opens the peptide calculator',
    icon: 'calculator-outline',
    color: palette.peptide,
    route: '/tools/peptide-calculator',
  },
  sites: {
    label: 'Sites',
    name: 'Injection Sites',
    hint: 'Opens your injection site history',
    icon: 'body-outline',
    color: palette.peptide,
    route: '/tools/injection-sites',
  },
  scanner: {
    label: 'Scan',
    name: 'Food Scanner',
    hint: 'Opens the food barcode scanner',
    icon: 'barcode-outline',
    color: palette.primary,
    route: '/fuel/scan',
  },
  /**
   * Available from slice 5.9B.1, and **not selected by default** — the
   * founder's ruling is that BMI is offered, not imposed.
   *
   * The identity is the one Tools Hub draws: the same name, the same
   * `scale-outline` glyph and the same gold, because a tool must not look
   * like two different things depending on where it is launched from. Gold
   * rather than a feature colour because BMI belongs to no feature. A test
   * holds the two surfaces together, since features do not import routes.
   *
   * **No BMI category colour appears here.** Those belong to the result,
   * not to the thing you press to get one.
   */
  bmi: {
    label: 'BMI',
    name: 'BMI Calculator',
    hint: 'Opens the BMI calculator',
    icon: 'scale-outline',
    color: palette.gold,
    route: '/tools/bmi-calculator',
  },
};

/** The catalog's own order, which a user's stored order may differ from. */
export const DEFAULT_TOOL_ORDER: readonly QuickToolId[] = [
  'calculator',
  'sites',
  'scanner',
  'bmi',
];

/**
 * What a brand-new install shows. **Not the same as the catalog** — BMI is
 * available from the start and selected by nobody until they say so.
 */
export const DEFAULT_SELECTED_TOOLS: readonly QuickToolId[] = ['calculator', 'sites', 'scanner'];

/**
 * ## Available, selected, and the difference between them
 *
 * `order` is **the catalog in the user's preferred order** — every tool they
 * may choose from, which is what the customization sheet lists. `hidden` is
 * the set they have deselected. The **selection** is `order` minus `hidden`,
 * which {@link visibleTools} computes and the Dashboard renders.
 *
 * Keeping both means a deselected tool is still listed in customization with
 * its box unchecked, so turning it back on is one tap — and it means a tool
 * can be *offered* without being *imposed*.
 */
export type QuickToolsPrefs = {
  order: QuickToolId[];
  hidden: QuickToolId[];
};

/** First run: the three the founder approved, with BMI available but off. */
export const DEFAULT_QUICK_TOOLS: QuickToolsPrefs = {
  order: [...DEFAULT_TOOL_ORDER],
  hidden: QUICK_TOOLS.filter((id) => !DEFAULT_SELECTED_TOOLS.includes(id)),
};

function isToolId(value: unknown): value is QuickToolId {
  return typeof value === 'string' && (QUICK_TOOLS as readonly string[]).includes(value);
}

/**
 * The same untrusted-input treatment the Dashboard layout gets: unknown ids
 * dropped, duplicates collapsed, the user's order preserved, and an unusable
 * record producing something renderable rather than a crash.
 *
 * ## A newly shipped tool becomes available, never selected
 *
 * This is the contract corrected in 5.9B.1, and it is **generic — no tool is
 * special-cased**. A tool the stored order predates is appended to `order`,
 * so it appears in customization and can be turned on; and it is added to
 * `hidden`, so **it does not appear on anyone's Home until they choose it**.
 *
 * It used to be appended to `order` alone, which meant every release silently
 * added its new tools to every existing user's Dashboard. That was found when
 * BMI was built: shipping it would have put a fourth tile on a Home nobody
 * asked to change. Growing someone's Home is their decision, not a release's.
 *
 * ## Defaults are a first-run concern, and they live elsewhere
 *
 * Nothing here substitutes {@link DEFAULT_QUICK_TOOLS} for a stored record.
 * `usePersistedPrefs` calls this **only when something was actually stored**
 * — a missing key never reaches it and takes the default instead. So the two
 * states stay distinct: *never customised* gets the default selection, while
 * *deliberately emptied* stays empty, because a record that hides everything
 * is a record, not an absence.
 */
export function normalizeQuickTools(stored: unknown): QuickToolsPrefs {
  const record = typeof stored === 'object' && stored !== null ? (stored as Record<string, unknown>) : {};

  const rawOrder = Array.isArray(record.order) ? record.order : [];
  const seen = new Set<QuickToolId>();
  const order: QuickToolId[] = [];

  for (const value of rawOrder) {
    if (!isToolId(value) || seen.has(value)) continue;
    seen.add(value);
    order.push(value);
  }

  const rawHidden = Array.isArray(record.hidden) ? record.hidden : [];
  const hidden = new Set<QuickToolId>(rawHidden.filter(isToolId));

  /*
   * Nothing recognisable in either list means a corrupt or foreign record,
   * not a choice — so it takes the default rather than leaving someone with
   * a silently empty Home they never asked for.
   *
   * **A deliberate empty selection is a different shape and survives**: it
   * names its tools in `hidden`, so there *is* something recognisable here
   * and the branch below never runs. That is the whole distinction §18 asks
   * for, and it falls out of the record rather than needing a flag.
   */
  if (order.length === 0 && hidden.size === 0) return { ...DEFAULT_QUICK_TOOLS };

  // Tools this record predates: listed, and off until chosen.
  for (const id of DEFAULT_TOOL_ORDER) {
    if (seen.has(id)) continue;
    order.push(id);
    hidden.add(id);
  }

  return { order, hidden: [...hidden] };
}

export function visibleTools(prefs: QuickToolsPrefs): QuickToolId[] {
  return prefs.order.filter((id) => !prefs.hidden.includes(id));
}

export function isToolHidden(prefs: QuickToolsPrefs, id: QuickToolId): boolean {
  return prefs.hidden.includes(id);
}

export function toggleTool(prefs: QuickToolsPrefs, id: QuickToolId): QuickToolsPrefs {
  return {
    order: prefs.order,
    hidden: isToolHidden(prefs, id)
      ? prefs.hidden.filter((hiddenId) => hiddenId !== id)
      : [...prefs.hidden, id],
  };
}

/** One place at a time; a move at either end is a no-op rather than a wrap. */
export function moveTool(
  prefs: QuickToolsPrefs,
  id: QuickToolId,
  direction: 'up' | 'down',
): QuickToolsPrefs {
  const index = prefs.order.indexOf(id);
  if (index === -1) return prefs;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= prefs.order.length) return prefs;

  const order = [...prefs.order];
  [order[index], order[target]] = [order[target], order[index]];
  return { order, hidden: prefs.hidden };
}
