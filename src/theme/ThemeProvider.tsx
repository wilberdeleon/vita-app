import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import {
  DEFAULT_THEME_MODE,
  asyncStoragePreferencesRepository,
  type PreferencesRepository,
  type ThemeMode,
} from '../lib/preferences';
import { darkSurfaces, lightSurfaces, palette, radii, shadows, spacing, typography, type Surfaces } from './tokens';

/**
 * Re-exported under its original name so every existing
 * `import { type ThemeMode } from '.../ThemeProvider'` keeps working. The
 * type is defined in `src/lib/preferences` because that is what persists
 * and validates it, and a stored value needs one definition, not two.
 */
export type { ThemeMode };

export type ColorScheme = 'light' | 'dark';

/**
 * Real Light/Dark/System theme support (founders, 2026-07-18 clean
 * redesign). `mode` is what the user picked in Settings → Appearance;
 * `scheme` is the resolved light/dark value actually driving colors —
 * when mode is 'system' this tracks the device's live appearance via
 * `Appearance.addChangeListener`, so switching iOS appearance updates the
 * whole app immediately with no restart or navigation reset.
 *
 * **The choice persists** (slice 4.1). Until then `mode` lived in component
 * state and every relaunch silently discarded it — the only functioning
 * preference in Settings did not survive being closed.
 *
 * `theme.palette` stays the original flat light-mode object unchanged —
 * every existing non-Home screen keeps reading it directly and is
 * unaffected. `theme.surfaces` is the new theme-aware background/card/
 * text/border set; only components built for this redesign read it.
 */
type Theme = {
  mode: ThemeMode;
  scheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  palette: typeof palette;
  surfaces: Surfaces;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
};

function resolveScheme(mode: ThemeMode, systemScheme: ColorSchemeName): ColorScheme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

const defaultTheme: Theme = {
  mode: DEFAULT_THEME_MODE,
  scheme: 'light',
  setMode: () => {},
  palette,
  surfaces: lightSurfaces,
  spacing,
  radii,
  typography,
  shadows,
};

const ThemeContext = createContext<Theme>(defaultTheme);

type Props = PropsWithChildren<{
  /** Injectable so a test — or a later networked implementation — drops in unchanged. */
  repository?: PreferencesRepository;
}>;

export function ThemeProvider({ children, repository = asyncStoragePreferencesRepository }: Props) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  /**
   * False until the stored appearance has been read. Nothing renders before
   * that — see the early return below.
   */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  /**
   * Read the user's stored choice once, at startup.
   *
   * A read that fails leaves the default in place rather than propagating:
   * losing a theme preference is a small, recoverable annoyance, and
   * refusing to start the app over it is not. `hydrated` is set in either
   * case, so a storage failure can never leave the app permanently blank.
   */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await repository.get();
        // A record whose themeMode was unreadable has already been defaulted
        // by the repository, so anything non-null here is safe to apply.
        if (!cancelled && stored) setModeState(stored.themeMode);
      } catch (error) {
        if (__DEV__) console.warn('[theme] could not read the stored appearance', error);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [repository]);

  /**
   * Shadows `mode` so a write always sends the value the user just chose,
   * even if two taps land in the same tick before a re-render — the same
   * reasoning as `WaterProvider`'s refs.
   */
  const modeRef = useRef<ThemeMode>(DEFAULT_THEME_MODE);
  modeRef.current = mode;

  const setMode = useCallback(
    (next: ThemeMode) => {
      // The UI changes immediately and does not wait on storage. A theme that
      // lagged a tap behind a disk write would feel broken for a preference
      // whose whole job is to be instant.
      modeRef.current = next;
      setModeState(next);

      void (async () => {
        try {
          await repository.save({ themeMode: next });
        } catch (error) {
          // Deliberately not surfaced. The choice still applies for this
          // session; a toast about a failed preference write would be more
          // alarming than the loss it describes.
          if (__DEV__) console.warn('[theme] could not save the appearance preference', error);
        }
      })();
    },
    [repository],
  );

  const scheme = resolveScheme(mode, systemScheme);

  const value = useMemo<Theme>(
    () => ({
      mode,
      scheme,
      setMode,
      palette,
      surfaces: scheme === 'dark' ? darkSurfaces : lightSurfaces,
      spacing,
      radii,
      typography,
      shadows,
    }),
    [mode, scheme, setMode],
  );

  /**
   * Nothing renders until the stored appearance is known.
   *
   * The alternative is a visible flash: a user whose choice is Light on a
   * device set to Dark would see the app paint dark, then snap to light one
   * frame later. Holding for a single AsyncStorage read — a few
   * milliseconds, under the splash screen — is the cheaper of the two, and
   * it is bounded: `hydrated` is set even when the read throws.
   */
  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
