import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassSurface } from '../ui/GlassSurface';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type DockItem = {
  route: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  /** Active tint, or `null` to follow the theme's primary text. */
  color: string | null;
};

/**
 * Active tints follow the permanent domain hierarchy: Home is navigation,
 * Fuel orange, Journey green, Atlas purple.
 *
 * **Home's tint is resolved per theme rather than fixed** (slice 5.3A). It
 * was `palette.ink` (`#1C1F1A`), which is the right neutral in Light and
 * very nearly invisible against the near-black dark background — so the one
 * tab that was *selected* was the hardest to see, and Home is the tab a
 * person is on most. `null` here means "the theme's own primary text",
 * resolved below; Light is unchanged in practice, since `surfaces.text`
 * (`#1B1B1B`) is a shade off the ink it replaces.
 *
 * This is the class of defect the Design System warns about directly:
 * a single fixed value that inverts its own hierarchy in one theme.
 */
const DOCK_ITEMS: DockItem[] = [
  { route: 'dashboard', label: 'Home', icon: 'home-outline', activeIcon: 'home', color: null },
  { route: 'fuel', label: 'Fuel', icon: 'flame-outline', activeIcon: 'flame', color: palette.primary },
  { route: 'journey', label: 'Journey', icon: 'trending-up-outline', activeIcon: 'trending-up', color: palette.journey },
  { route: 'atlas', label: 'Atlas', icon: 'planet-outline', activeIcon: 'planet', color: palette.peptide },
];

/**
 * The VITA floating dock — custom tab bar for the four core destinations.
 * Renders as one universal frosted-glass pill on every tab (founders,
 * 2026-07-18 clean redesign) — floating, detached from the edges, soft
 * shadow, generous radius, premium blur, in the style of VisionOS/Apple
 * Music rather than a flat Android-style bar. Previously glass only behind
 * Home's mountain background with a plain solid pill elsewhere; the dock is
 * shared chrome, not per-screen content, so one consistent treatment is
 * correct now that every screen's background can be light or dark.
 */
export function FloatingDock({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { scheme, surfaces } = useTheme();
  const inactiveColor = scheme === 'dark' ? 'rgba(255,255,255,0.65)' : palette.textSecondary;

  const items = DOCK_ITEMS.map((item) => {
    const routeIndex = state.routes.findIndex((route) => route.name === item.route);
    const active = state.index === routeIndex;
    const activeColor = item.color ?? surfaces.text;
    return (
      <Pressable
        key={item.route}
        style={styles.item}
        onPress={() => navigation.navigate(item.route)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.label}
      >
        <Ionicons name={active ? item.activeIcon : item.icon} size={22} color={active ? activeColor : inactiveColor} />
        <Text style={[styles.label, { color: inactiveColor }, active && { color: activeColor, fontWeight: '600' }]}>
          {item.label}
        </Text>
      </Pressable>
    );
  });

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, spacing.m) + spacing.m }]} pointerEvents="box-none">
      <GlassSurface variant="navigation" radius={radii.pill} padding={0} style={styles.dockShape}>
        <View style={styles.dock}>{items}</View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dockShape: {
    marginHorizontal: spacing.xxl + spacing.xs,
    alignSelf: 'stretch',
  },
  dock: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: spacing.m,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...typography.micro,
  },
});
