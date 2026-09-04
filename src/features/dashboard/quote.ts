/**
 * The line of character under the greeting.
 *
 * **Not a motivational slogan, and the difference matters.** `Stay on track`
 * is the app talking to the user about their behaviour — the thing the
 * founders removed twice and do not want back. A quote attributed to someone
 * who said it is content: it carries VITA's register without pretending to
 * know anything about the day. Because the quote provides the personality,
 * nothing else on Home does — the rest stays factual.
 *
 * **One curated quote, shipped as data rather than as a string in a
 * component.** The shape is a list so a curated library can grow into it
 * later, and the accessor is where selection logic would go. There is no
 * network call, no scraping, and no rotation through unverified material:
 * anything VITA attributes to a person is something a person is on record as
 * having said.
 */

export type Quote = {
  text: string;
  attribution: string;
};

/** Founder-approved, slice 5.3B. */
export const QUOTES: readonly Quote[] = [
  { text: 'I came, I saw, I conquered.', attribution: 'Julius Caesar' },
];

/**
 * The quote Home shows.
 *
 * Deliberately stable rather than random: a line that changed on every render
 * would flicker as the screen re-rendered on every logged drink, and one that
 * changed on every visit is a slot machine. When a curated library exists,
 * this is the single place a daily rotation would live.
 */
export function currentQuote(): Quote {
  return QUOTES[0];
}
