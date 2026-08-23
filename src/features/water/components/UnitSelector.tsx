import { SegmentedTabs } from '../../../components/ui';
import { VOLUME_UNITS, unitName, type VolumeUnit } from '../../../lib/water';
import { palette } from '../../../theme/tokens';

type Props = {
  value: VolumeUnit;
  onChange: (unit: VolumeUnit) => void;
};

/**
 * The four supported volume units as a segmented control.
 *
 * Exists so the index-based `SegmentedTabs` API is translated to and from
 * `VolumeUnit` in exactly one place. Two screens pick a unit — Add Water and
 * the goal screen — and having each map indices itself is how "index 2 means
 * mL" ends up meaning something different on one of them.
 */
export function UnitSelector({ value, onChange }: Props) {
  const index = Math.max(0, VOLUME_UNITS.indexOf(value));

  return (
    <SegmentedTabs
      options={VOLUME_UNITS.map(unitName)}
      selectedIndex={index}
      onChange={(next) => onChange(VOLUME_UNITS[next])}
      activeColor={palette.water}
    />
  );
}
