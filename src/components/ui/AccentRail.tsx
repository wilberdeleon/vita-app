import { View } from 'react-native';
import { ProgressBar } from './ProgressBar';

/**
 * A slim rail beneath a figure that already states the same fraction in words.
 *
 * ## Why this exists
 *
 * Fuel Home's calorie rail and Home's Fuel widget drew it separately —
 * `<ProgressBar height={3} color={over ? amber : orange} />` inside an
 * `accessibilityElementsHidden` wrapper, twice, in two files. Identical by
 * hand rather than by construction, which is how two surfaces drift.
 *
 * The 2026-09-15 founder correction asked for the rail to be refined and said
 * plainly: *do not create Dashboard-only progress styling — audit the Fuel
 * Home rail and reuse the same visual language* (§13). One definition is the
 * only way to keep that true, so the two call sites became this.
 *
 * ## What the refinement actually changed
 *
 * **The track is a tint of the fill, not neutral grey.** The founder's word
 * for `surfaces.track` under an orange fill was *dead-looking* — on the
 * near-black page it is `rgba(255,255,255,0.12)`, a grey sliver that belongs
 * to steppers and segmented controls rather than to Fuel. It is now the fill
 * colour at low opacity, which is the tint VITA already uses for the flame's
 * orb and the Peptides mark. The rail reads as one orange object at two
 * intensities instead of an orange bar sitting in a grey one, and the seam
 * where fill meets track disappears because both are the same hue.
 *
 * **3pt became 4pt.** Still thin — a quarter of `ProgressBar`'s own default —
 * but a 1.5pt corner radius on a 3pt bar anti-aliases into a hairline, and
 * the founder asked for a *cleaner rounded track*. At 4pt the capsule is
 * legible as a capsule. No glow, no gradient, no shadow: §13 rules out all
 * three, and `ProgressBar` has never had any of them.
 *
 * ## Decorative, deliberately
 *
 * Both callers state the figures and the goal in words directly above, and
 * both carry the whole module's spoken label. A rail announcing the same
 * fraction a third time is noise, so it is hidden from accessibility here
 * rather than at each call site — one less thing a future surface can forget.
 *
 * Presentation only. It is handed a fraction and a colour and derives
 * nothing; the fraction comes from `calorieSummary`, which is where every
 * calorie number in VITA is decided.
 */
export function AccentRail({ progress, color }: { progress: number; color: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <ProgressBar progress={progress} color={color} height={RAIL_HEIGHT} track={`${color}24`} />
    </View>
  );
}

/**
 * Thin, and shared so the two rails cannot be thin by different amounts.
 *
 * Exported for the tests that assert Fuel Home and Home draw the same rail.
 */
export const RAIL_HEIGHT = 4;
