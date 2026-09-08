import { singletonKey } from '../../lib/daily/keys';
import { usePersistedPrefs } from '../../lib/preferences/usePersistedPrefs';

/** `vita:v1:fuel:setup` — its own record, separate from the layout order. */
export const FUEL_SETUP_KEY = singletonKey('fuel', 'setup');

type SetupPrefs = { dismissed: boolean };

const DEFAULT: SetupPrefs = { dismissed: false };

function normalize(stored: unknown): SetupPrefs {
  if (typeof stored !== 'object' || stored === null) return DEFAULT;
  const dismissed = (stored as { dismissed?: unknown }).dismissed;
  return { dismissed: dismissed === true };
}

export type FuelSetupState = {
  /** True once the user has chosen *Skip for now*. */
  dismissed: boolean;
  isLoading: boolean;
  dismiss: () => void;
};

/**
 * Whether the first-use setup invitation has been waved away.
 *
 * **Configuration is derived, not flagged** — whether someone *has* goals is
 * answered by the goals themselves, in nutrition and in Water. The one thing
 * that cannot be derived is *"I saw the offer and I do not want it"*, and
 * without recording that the invitation would return on every launch for
 * anyone who declined it. That is the nagging the authorization rules out,
 * so this stores exactly one boolean and nothing else.
 *
 * Setting any goal removes the invitation on its own; this only covers the
 * user who set none on purpose.
 */
export function useFuelSetup(): FuelSetupState {
  const { value, isLoading, setValue } = usePersistedPrefs<SetupPrefs>(
    FUEL_SETUP_KEY,
    normalize,
    DEFAULT,
  );

  return {
    dismissed: value.dismissed,
    isLoading,
    dismiss: () => setValue({ dismissed: true }),
  };
}
