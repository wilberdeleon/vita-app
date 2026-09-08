import { singletonKey } from '../../lib/daily/keys';
import { usePersistedPrefs, type PrefsUpdate } from '../../lib/preferences/usePersistedPrefs';
import { DEFAULT_FUEL_ORDER, normalizeFuelOrder, type FuelSection } from './sections';

/** `vita:v1:fuel:layout` — built from the shared helper so the namespace cannot drift. */
export const FUEL_LAYOUT_KEY = singletonKey('fuel', 'layout');

export type FuelLayoutState = {
  order: FuelSection[];
  isLoading: boolean;
  setOrder: (next: PrefsUpdate<FuelSection[]>) => void;
};

/**
 * The user's Fuel section order, persisted.
 *
 * Its own record under its own key: Home's layout and Fuel's are different
 * shapes with different sections, and one key holding both is how a change
 * to either quietly breaks the other.
 */
export function useFuelLayout(): FuelLayoutState {
  const { value, isLoading, setValue } = usePersistedPrefs<FuelSection[]>(
    FUEL_LAYOUT_KEY,
    normalizeFuelOrder,
    [...DEFAULT_FUEL_ORDER],
  );
  return { order: value, isLoading, setOrder: setValue };
}
