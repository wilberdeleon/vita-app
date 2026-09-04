/**
 * Which utilities Quick Tools offers, in what order, and how a stored
 * preference is made safe.
 *
 * Pure and presentation-only, exactly like `modules.ts` — the registry knows
 * a label, an icon, a colour and a route, and nothing about what any of them
 * do.
 */

import { palette } from '../../theme/tokens';

export const QUICK_TOOLS = ['calculator', 'sites', 'scanner'] as const;

export type QuickToolId = (typeof QUICK_TOOLS)[number];

type QuickToolMeta = {
  /** On the tile. Short, because the tile is small. */
  label: string;
  /** In the customization sheet and to a screen reader. */
  name: string;
  /** What the tool actually does, spoken. Never a claim it does more. */
  hint: string;
  icon: 'calculator-outline' | 'body-outline' | 'barcode-outline';
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
};

export const DEFAULT_TOOL_ORDER: readonly QuickToolId[] = ['calculator', 'sites', 'scanner'];

export type QuickToolsPrefs = {
  order: QuickToolId[];
  hidden: QuickToolId[];
};

/** All three on, in registry order. */
export const DEFAULT_QUICK_TOOLS: QuickToolsPrefs = {
  order: [...DEFAULT_TOOL_ORDER],
  hidden: [],
};

function isToolId(value: unknown): value is QuickToolId {
  return typeof value === 'string' && (QUICK_TOOLS as readonly string[]).includes(value);
}

/**
 * The same untrusted-input treatment the Dashboard layout gets, for the same
 * reasons: unknown ids dropped, duplicates collapsed, tools missing from a
 * stored order appended so a **newly shipped tool appears** rather than
 * vanishing, and an unusable record falling back to the default.
 *
 * A user who has hidden every tool gets an empty section rather than a broken
 * one — see `QuickTools`, which renders nothing at all in that case rather
 * than a heading over a void.
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
  for (const id of DEFAULT_TOOL_ORDER) {
    if (!seen.has(id)) order.push(id);
  }

  const rawHidden = Array.isArray(record.hidden) ? record.hidden : [];
  return { order, hidden: [...new Set(rawHidden.filter(isToolId))] };
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
