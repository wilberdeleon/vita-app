import type { TodayRoutine } from './usePeptides';

/**
 * Everything a compact Peptides module needs to draw itself.
 *
 * Two strings, a spoken summary and two booleans — no routines, no setups, no
 * logs. The shared component cannot reach peptide data, which is what keeps
 * "read-only" a property of the architecture rather than of good intentions.
 */
export type CompactPeptidesView = {
  /** `4 scheduled`, `All answered`, `Nothing scheduled`, `No routines`, `—`. */
  value: string;
  /** `4 today`, `Semaglutide · 0.25 mg`, `Add one to start`, or `null`. */
  detail: string | null;
  spoken: string;
  /** True when something is still unanswered. The words say so too. */
  outstanding: boolean;
  /** No routines at all — the action becomes *Add* rather than *View*. */
  isEmpty: boolean;
};

/**
 * The one derivation behind Home's and Fuel's Peptides modules.
 *
 * ## Why it is a function
 *
 * The founder's 5.6B.3 device comparison found Home saying `4 scheduled` above
 * `4 today` while Fuel said `None logged` for the same day — Fuel had been
 * built on a different selector, and the two answered different questions. One
 * function, one set of words, both screens.
 *
 * **Home's wording is the source.** It is founder-approved from 5.3 and every
 * rule in it is deliberate.
 *
 * ## Sprint 3's wording rules, in full
 *
 * - **"Scheduled", never "due"** as an obligation. A schedule is what the user
 *   planned, not something VITA enforces.
 * - **An unanswered day stays unanswered** — never *missed*, *late* or
 *   *overdue*, and never silently converted to *skipped*.
 * - **Nothing is scored.** No adherence, no streak, no percentage.
 * - **The amount is the user's own configured routine amount**, read back. It
 *   is not a recommendation; VITA has none.
 *
 * The routine is named only when exactly one thing is outstanding — the common
 * case, and the one where a name saves a tap.
 */
export function compactPeptidesView(
  today: readonly TodayRoutine[],
  isEmpty: boolean,
  isLoading: boolean,
): CompactPeptidesView {
  const unanswered = today.filter((item) => item.mark === 'unconfirmed');
  const only = unanswered.length === 1 ? unanswered[0] : null;

  const value = isLoading
    ? '—'
    : today.length === 0
      ? isEmpty
        ? 'No routines'
        : 'Nothing scheduled'
      : unanswered.length === 0
        ? 'All answered'
        : `${unanswered.length} scheduled`;

  const amount = only?.setup.routineAmount
    ? `${only.setup.routineAmount.authored.amount} ${only.setup.routineAmount.authored.unit}`
    : null;

  const detail =
    isLoading || today.length === 0
      ? isEmpty && !isLoading
        ? 'Add one to start'
        : null
      : only
        ? [only.name, amount].filter(Boolean).join(' · ')
        : `${today.length} today`;

  return {
    value,
    detail,
    spoken: `Peptides. ${value}${detail ? `. ${detail}` : ''}.`,
    outstanding: unanswered.length > 0,
    isEmpty: isEmpty && !isLoading,
  };
}
