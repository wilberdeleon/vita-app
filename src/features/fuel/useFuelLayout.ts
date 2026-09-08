import { singletonKey } from '../../lib/daily/keys';
import { usePersistedPrefs, type PrefsUpdate } from '../../lib/preferences/usePersistedPrefs';
import { defaultFuelLayout, normalizeFuelLayout, type FuelLayout } from './sections';

/** `vita:v1:fuel:layout` — built from the shared helper so the namespace cannot drift. */
export const FUEL_LAYOUT_KEY = singletonKey('fuel', 'layout');

export type FuelLayoutState = {
  layout: FuelLayout;
  isLoading: boolean;
  setLayout: (next: PrefsUpdate<FuelLayout>) => void;
};

/**
 * The user's Fuel layout — order, which optional sections show, and the two
 * sizes — persisted.
 *
 * **The same key 5.6B.1 wrote, deliberately.** That slice stored a bare array
 * of section ids; this one stores a record. A second key would have been the
 * easy way out and would have meant a founder who arranged Fuel last week
 * silently losing that arrangement, so `normalizeFuelLayout` reads the old
 * shape as an order and applies the new defaults around it instead. Nothing
 * migrates destructively: the old value is simply understood.
 *
 * Its own record rather than Home's: the two are different shapes with
 * different sections, and one key holding both is how a change to either
 * quietly breaks the other.
 */
export function useFuelLayout(): FuelLayoutState {
  const { value, isLoading, setValue } = usePersistedPrefs<FuelLayout>(
    FUEL_LAYOUT_KEY,
    normalizeFuelLayout,
    defaultFuelLayout(),
  );
  return { layout: value, isLoading, setLayout: setValue };
}
