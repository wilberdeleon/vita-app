import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, shadows, spacing } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Base card surface — the single source of truth for card background,
 * radius, border, and shadow.
 *
 * **Not the default surface any more** (Sprint 5 slice 5.1, founder ruling).
 * Content sits directly on the background unless it genuinely needs grouping;
 * a card is what you reach for when several related things belong together,
 * not what you reach for because content exists. See `docs/05-Design-System.md`
 * → Surface roles. Existing call sites are unchanged and are migrated by the
 * slice that redesigns their screen, never in bulk.
 *
 * A hook rather than a constant since the app-wide visual consistency pass:
 * the surface follows the active theme, and it carries a hairline border in
 * both themes so it separates from the background the way Home's
 * GlassSurface cards do. In dark mode that border does the separating work —
 * the soft light-mode drop shadow is invisible against near-black.
 */
export function useCardSurfaceStyle(): ViewStyle {
  const { surfaces } = useTheme();
  return {
    backgroundColor: surfaces.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: surfaces.border,
    padding: spacing.l,
    ...shadows.card,
  };
}

export function Card({ children, style }: Props) {
  const surfaceStyle = useCardSurfaceStyle();
  return <View style={[surfaceStyle, style]}>{children}</View>;
}
