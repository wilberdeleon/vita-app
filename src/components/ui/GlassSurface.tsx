import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass, glassShadow, radii, spacing } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from './PressableScale';

export type GlassVariant = 'card' | 'navigation';

type Props = PropsWithChildren<{
  /** card = dashboard content surfaces · navigation = the floating dock. */
  variant?: GlassVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Corner radius. Defaults to radii.card — override for shapes like the pill-shaped dock. */
  radius?: number;
  /** Inner content padding. Defaults to spacing.l — override for layouts that manage their own internal spacing (e.g. the dock's row). */
  padding?: number;
  /** Vertical-only padding override. Defaults to `padding` — set lower for dense list panels (e.g. Today's Meals) whose rows carry their own vertical rhythm. */
  paddingVertical?: number;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}>;

/**
 * Frosted-glass surface for Home dashboard cards and the floating dock
 * (founders, 2026-07-18 clean redesign). Real native blur (expo-blur's
 * BlurView) + a tint overlay + a subtle border + a soft shadow, theme-aware
 * via useTheme() — tokens come from theme/tokens.ts `glass[variant][scheme]`.
 * Becomes pressable, with the app's standard press-scale feedback, only when
 * `onPress` is passed — one component rather than a separate static/pressable
 * pair.
 *
 * **A rare role, not a default surface** (Sprint 5 slice 5.1, founder ruling).
 * Glass is for floating navigation, overlays, and genuine layering — the dock
 * is its clearest correct use. It is explicitly not the replacement for the
 * card: the instruction this slice works under is that VITA must not trade
 * card soup for glass soup. See `docs/05-Design-System.md` → Surface roles.
 *
 * Two-layer structure (shadow wrapper + clipped inner) rather than one view:
 * `overflow: hidden` (needed to clip the blur/tint to the rounded corners)
 * and a shadow cancel each other out on the same view in React Native, so
 * the shadow lives on the outer, unclipped wrapper.
 */
export function GlassSurface({
  children,
  variant = 'card',
  onPress,
  style,
  radius = radii.card,
  padding = spacing.l,
  paddingVertical,
  accessibilityLabel,
  accessibilityRole,
}: Props) {
  const { scheme } = useTheme();
  const tokens = glass[variant][scheme];

  const surface = (
    <View style={[styles.shadowWrapper, { borderRadius: radius }, style]}>
      <View style={[styles.clip, { borderRadius: radius, borderColor: tokens.border }]}>
        <BlurView intensity={tokens.blurIntensity} tint={scheme} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tokens.tint }]} />
        <View style={[styles.topHighlight, { backgroundColor: tokens.highlight }]} />
        <View style={[styles.content, { paddingHorizontal: padding, paddingVertical: paddingVertical ?? padding }]}>
          {children}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        pressedScale={0.98}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
      >
        {surface}
      </PressableScale>
    );
  }

  return surface;
}

const styles = StyleSheet.create({
  shadowWrapper: {
    ...glassShadow,
  },
  clip: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: {},
});
