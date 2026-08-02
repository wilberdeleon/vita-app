import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { darkSurfaces, lightSurfaces, palette, radii, shadows, spacing, typography, type Surfaces } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

/**
 * Real Light/Dark/System theme support (founders, 2026-07-18 clean
 * redesign). `mode` is what the user picked in Settings → Appearance;
 * `scheme` is the resolved light/dark value actually driving colors —
 * when mode is 'system' this tracks the device's live appearance via
 * `Appearance.addChangeListener`, so switching iOS appearance updates the
 * whole app immediately with no restart or navigation reset.
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
  mode: 'light',
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

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

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
    [mode, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
