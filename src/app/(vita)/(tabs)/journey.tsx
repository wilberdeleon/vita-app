import { Screen, ScreenHeader } from '../../../components/ui';
import { JourneyView } from '../../../features/journey/components/JourneyView';
import type { JourneyPhotoView } from '../../../features/journey/types';
import { WeightProvider, useWeight } from '../../../lib/journey';

/**
 * Release has no photo domain until slice 6.5, so Photos always receives
 * this. Named and frozen so no code path can hand release a photo.
 */
const NO_PHOTOS: readonly JourneyPhotoView[] = Object.freeze([]);

/**
 * My Journey — Overview · Weight · Photos (slice 6.3).
 *
 * **Real data only.** Weight comes from the real `WeightProvider`, mounted
 * here at the narrowest boundary that needs it rather than app-wide; it reads
 * `vita:v1:journey:*` and writes nothing on view. Photos are always empty in
 * release. There is no fixture and no fallback to one: an empty history
 * renders the empty pillars, never an example. The populated layouts are
 * reviewed through the `__DEV__`-only preview route, which never mounts this
 * provider and never touches storage.
 *
 * Slice 6.4 hands the Weight pillar the provider's own functions — log, edit,
 * delete, undo, display unit — so every change goes through the 6.2 domain
 * and storage, and nothing is shown that was not saved. There is still no Add
 * Photo action: photo capture is 6.5, and a button into an unbuilt flow would
 * be its own small lie.
 */
export default function Journey() {
  return (
    <WeightProvider>
      <JourneyScreen />
    </WeightProvider>
  );
}

function JourneyScreen() {
  const { status, entries, unit, addEntry, updateEntry, removeEntry, restoreEntry, setUnit } = useWeight();
  return (
    <Screen dockClearance>
      <ScreenHeader title="My Journey" settings />
      <JourneyView
        data={{ status, weights: entries, photos: NO_PHOTOS, unit }}
        actions={{ addEntry, updateEntry, removeEntry, restoreEntry, setUnit }}
      />
    </Screen>
  );
}
