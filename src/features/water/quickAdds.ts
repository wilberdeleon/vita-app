/**
 * Quick-add amounts, per logging unit.
 *
 * **Presentation config, not domain rules.** These are four convenient
 * shortcuts, not recommendations and not anything the repository knows about
 * — which is why they live in the feature and not in `src/lib/water`. Custom
 * amount is always available, so this list only has to cover the ordinary
 * cases rather than everyone's.
 *
 * **Each unit gets amounts a person would actually say in that unit.**
 * Converting the ounce set into every other unit is the obvious
 * implementation and the wrong one: it produces `0.35 cups` and `709 mL`,
 * numbers nobody thinks in and nobody would tap. A cup user wants a half, a
 * cup, a cup and a half; a metric user wants 250 and 500.
 *
 * Nothing here is a target. VITA has no opinion about how much anyone should
 * drink, and four buttons in ascending order must not read as a scale.
 */

import { formatEntered, type VolumeUnit } from '../../lib/water';

export const QUICK_ADDS: Record<VolumeUnit, readonly number[]> = {
  /** A small glass, a large glass, a bottle, a large bottle. */
  floz: [8, 12, 16, 24],
  /** Founder direction, slice 5.2: half, one, one and a half, two. */
  cup: [0.5, 1, 1.5, 2],
  /** The sizes bottles and glasses actually come in. */
  ml: [250, 500, 750, 1000],
  /** Fractions rather than the long decimals a converted ounce set would give. */
  l: [0.25, 0.5, 1, 1.5],
};

/**
 * Vulgar fractions for the halves and quarters, plain digits for everything
 * else.
 *
 * `½ cup` is how the amount is said out loud; `0.5 cup` is how a database
 * says it. Only the three fractions that actually occur in the tables above
 * are mapped — this is a lookup, not a general rational formatter, and a
 * value it does not recognise falls back to its digits rather than guessing.
 */
const FRACTIONS: Record<string, string> = {
  '0.25': '¼',
  '0.5': '½',
  '0.75': '¾',
  '1.5': '1½',
};

/** The number as it appears on a quick-add control, e.g. `½` · `12` · `250`. */
export function quickAddValueLabel(amount: number): string {
  return FRACTIONS[String(amount)] ?? String(amount);
}

/**
 * The unit as it appears on a quick-add control.
 *
 * **Compact on purpose, and only here.** `fl oz` beside a 24 does not fit
 * four controls across a 320pt screen, and shrinking the number to make room
 * would undo the thing that makes the control readable. Every *recorded*
 * amount — the day's total, an entry in the log, the goal — still renders
 * through the domain's own `formatEntered`, so what VITA says you drank is
 * always in the domain's words. This is a label on a button offering a
 * choice, not a statement about a drink.
 */
export function quickAddUnitLabel(unit: VolumeUnit, amount: number): string {
  switch (unit) {
    case 'floz':
      return 'oz';
    case 'cup':
      // Singular through one: "½ cup", "1 cup", then "1½ cups". Matching how
      // the amount is said rather than how a plural rule would compute it.
      return amount <= 1 ? 'cup' : 'cups';
    case 'ml':
      return 'mL';
    case 'l':
      return 'L';
  }
}

/**
 * What a screen reader says for a quick-add control.
 *
 * Deliberately built from `formatEntered` rather than from the compact visual
 * label: `½` is ambiguous read aloud in a way `0.5 cup` is not, and the
 * spoken form should name the unit the way the rest of the app does.
 */
export function quickAddAccessibilityLabel(amount: number, unit: VolumeUnit): string {
  return `Add ${formatEntered(amount, unit)}`;
}
