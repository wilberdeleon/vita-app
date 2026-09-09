import { CompactWaterModule } from '../../../components/modules';
import { compactWaterView, type WaterToday } from '../../../lib/water';
import type { ModuleSize } from '../modules';

type Props = {
  today: WaterToday;
  size: ModuleSize;
  /** Opens Water with the Add Water sheet already up. */
  onAdd: () => void;
  onOpen: () => void;
  /** Enters Home's edit mode. */
  onLongPress?: () => void;
};

/**
 * Hydration on Home — Home's data, meeting the shared presentation.
 *
 * ## What this file is now
 *
 * Until 5.6B.3 it drew the module itself. The founder compared Home and Fuel
 * on device and found the same feature rendered two ways, and ruled that they
 * must match rather than resemble — so the drawing moved to
 * `components/modules/CompactWaterModule` and the copy rules to
 * `compactWaterView` in Water's own domain. **Home's design is the source**:
 * the shared component is what this file used to contain, with one deliberate
 * change the founder asked for — the generic progress ring became Water's own
 * fillable vessel.
 *
 * What is left here is the seam: Home's `WaterToday`, Home's routes, Home's
 * edit mode. **Home's layout preference stays Home's** — making Water wide on
 * Fuel does not touch this screen.
 */
export function WaterModule({ today, size, onAdd, onOpen, onLongPress }: Props) {
  return (
    <CompactWaterModule
      view={compactWaterView(today)}
      size={size}
      onAdd={onAdd}
      onOpen={onOpen}
      onLongPress={onLongPress}
    />
  );
}
