import AddFood from './add';

/**
 * `/fuel/search` — the same screen as `/fuel/add`.
 *
 * ## Why this file is one line
 *
 * The two routes grew apart. `/fuel/search` was Sprint 2's dedicated search
 * screen; `/fuel/add` was the menu that pointed at it. 5.6C put the search
 * field on `/fuel/add` itself, which would have left VITA shipping **two
 * search experiences** — the exact divergence the founder's visual-consistency
 * contract exists to prevent, and one that would drift the first time either
 * was touched.
 *
 * So there is one implementation and this route renders it. The path stays
 * because it is already reachable — from the old Add Food menu's own history,
 * from `Search foods` actions, and from any deep link — and a working route
 * that quietly disappears is worse than one that resolves somewhere sensible.
 *
 * `useLocalSearchParams` reads from the router rather than from props, so
 * `?meal=` arrives here exactly as it does on `/fuel/add`.
 */
export default function SearchFood() {
  return <AddFood />;
}
