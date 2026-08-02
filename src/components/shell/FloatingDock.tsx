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
  /** Active tint — Atlas owns purple, everything else is VITA orange. */
  color: string;
};

// Active tints follow the permanent domain hierarchy: Home is navigation
// (neutral ink), Fuel orange, Journey green, Atlas purple.
const DOCK_ITEMS: DockItem[] = [
  { route: 'dashboard', label: 'Home', icon: 'home-outline', activeIcon: 'home', color: palette.ink },
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
  const { scheme } = useTheme();
  const inactiveColor = scheme === 'dark' ? 'rgba(255,255,255,0.65)' : palette.textSecondary;

  const items = DOCK_ITEMS.map((item) => {
    const routeIndex = state.routes.findIndex((route) => route.name === item.route);
    const active = state.index === routeIndex;
    return (
      <Pressable
        key={item.route}
        style={styles.item}
        onPress={() => navigation.navigate(item.route)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.label}
      >
        <Ionicons name={active ? item.activeIcon : item.icon} size={22} color={active ? item.color : inactiveColor} />
        <Text style={[styles.label, { color: inactiveColor }, active && { color: item.color, fontWeight: '600' }]}>
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
    color: palette.textTertiary,
  },
});
