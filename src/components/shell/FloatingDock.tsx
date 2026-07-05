import { Ionicons } from '@expo/vector-icons';
// SDK 57: expo-router vendors react-navigation and re-exports its types.
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';

type DockItem = {
  route: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  /** Active tint — Atlas owns purple, everything else is VITA orange. */
  color: string;
};

const DOCK_ITEMS: DockItem[] = [
  { route: 'dashboard', label: 'Home', icon: 'home-outline', activeIcon: 'home', color: palette.primary },
  { route: 'fuel', label: 'Fuel', icon: 'flame-outline', activeIcon: 'flame', color: palette.primary },
  { route: 'journey', label: 'Journey', icon: 'trending-up-outline', activeIcon: 'trending-up', color: palette.primary },
  { route: 'atlas', label: 'Atlas', icon: 'planet-outline', activeIcon: 'planet', color: palette.peptide },
];

/** The VITA floating dock — custom tab bar for the four core destinations. */
export function FloatingDock({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, spacing.m) }]} pointerEvents="box-none">
      <View style={styles.dock}>
        {DOCK_ITEMS.map((item) => {
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
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={22}
                color={active ? item.color : palette.textTertiary}
              />
              <Text style={[styles.label, active && { color: item.color, fontWeight: '600' }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  dock: {
    flexDirection: 'row',
    backgroundColor: palette.card,
    borderRadius: radii.pill,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    marginHorizontal: spacing.xxl,
    alignSelf: 'stretch',
    ...shadows.dock,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    ...typography.micro,
    color: palette.textTertiary,
  },
});
