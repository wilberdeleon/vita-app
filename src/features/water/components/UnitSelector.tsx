import { SegmentedTabs } from '../../../components/ui';
import { VOLUME_UNITS, unitName, type VolumeUnit } from '../../../lib/water';
import { palette } from '../../../theme/tokens';

type Props = {
  value: VolumeUnit;
  onChange: (unit: VolumeUnit) => void;
  /**
   * What this control is *for*, spoken before the option — passed straight
   * through to `SegmentedTabs`.
   *
   * Optional, and unset on the two Water screens where the surrounding
   * labels already make it obvious. Settings → Units sets it, because there
   * a screen reader would otherwise announce four bare unit names with
   * nothing saying what they measure.
   */
  groupLabel?: string;
};

/**
 * The four supported volume units as a segmented control.
 *
 * Exists so the index-based `SegmentedTabs` API is translated to and from
 * `VolumeUnit` in exactly one place. Three screens pick a unit — Add Water,
 * the goal screen, and Settings → Units — and having each map indices itself
 * is how "index 2 means mL" ends up meaning something different on one of
 * them.
 */
export function UnitSelector({ value, onChange, groupLabel }: Props) {
  const index = Math.max(0, VOLUME_UNITS.indexOf(value));

  return (
    <SegmentedTabs
      options={VOLUME_UNITS.map(unitName)}
      selectedIndex={index}
      onChange={(next) => onChange(VOLUME_UNITS[next])}
      activeColor={palette.water}
      groupLabel={groupLabel}
    />
  );
}
