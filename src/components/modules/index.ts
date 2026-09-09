/**
 * Cross-feature compact modules — the shared presentation for a feature
 * reported *inside another feature's screen*.
 *
 * ## Two modules, not a framework
 *
 * There are exactly two things in here, because exactly two features are shown
 * in more than one place: Water and Peptides, on Home and on Fuel. The founder
 * ruling this exists to satisfy is that the same feature in equivalent form
 * must look the *same*, not similar — and the explicit instruction alongside it
 * was **not** to generalise that into a `UniversalFeatureWidget` or another
 * configuration system. If a third feature ever needs this, it gets a third
 * file.
 *
 * ## The contract
 *
 * - **Presentational only.** Each component takes a view model and callbacks.
 *   None imports a domain, reads a provider, or calls a data hook.
 * - **The view model is the domain's job.** `compactWaterView` lives in
 *   `lib/water`, `compactPeptidesView` in `lib/peptides`. That is where the
 *   copy rules belong and where they are tested, and it is what stops Home and
 *   Fuel from wording the same state two ways.
 * - **Presentation is shared; layout preference is not.** Home stores its own
 *   `vita:v1:dashboard:layout` and Fuel its own `vita:v1:fuel:layout`. Making
 *   Water wide on Fuel does not touch Home, and never should.
 * - **Geometry is shared too.** A shared component on two different footprints
 *   would still not match; `geometry.ts` owns the one square height, the two
 *   radii, the Dynamic Type threshold and the module type scale, and
 *   `features/dashboard/widget.ts` re-exports them so Home's own widgets are
 *   unaffected.
 */

export { CompactWaterModule, type CompactModuleSize } from './CompactWaterModule';
export { CompactPeptidesModule } from './CompactPeptidesModule';
export {
  COMPACT_FONT_SCALE,
  MODULE_TYPE,
  SQUARE_HEIGHT,
  SQUARE_RADIUS,
  WIDE_RADIUS,
  isCompactSquare,
  squareHeight,
} from './geometry';
