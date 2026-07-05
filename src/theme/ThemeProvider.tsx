import { createContext, useContext, type PropsWithChildren } from 'react';
import { palette, radii, shadows, spacing, typography } from './tokens';

/**
 * Light theme only for Sprint 0. The provider exists so screens read colors
 * through useTheme() from day one — adding dark mode later means extending
 * this file, not touching screens.
 */
const lightTheme = { palette, spacing, radii, typography, shadows } as const;

export type Theme = typeof lightTheme;

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
