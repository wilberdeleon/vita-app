import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ListRow, Screen, ScreenHeader, SectionHeader, SegmentedTabs } from '../../../components/ui';
import { useAuth } from '../../../features/auth/AuthProvider';
import { palette, spacing } from '../../../theme/tokens';
import { useTheme, type ThemeMode } from '../../../theme/ThemeProvider';

const APPEARANCE_OPTIONS: readonly ThemeMode[] = ['light', 'dark', 'system'];
const APPEARANCE_LABELS = ['Light', 'Dark', 'System'];

/**
 * Settings shell — structure only, except Appearance (founders, 2026-07-18
 * clean redesign): the first functional preference, wired straight to
 * ThemeProvider so it takes effect app-wide with no restart/refresh. Every
 * row here is a shared primitive, so the screen follows the active theme
 * through those rather than styling anything itself.
 */
export default function Settings() {
  const { user, signOut } = useAuth();
  const { mode, setMode } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Settings" back />

      <SectionHeader title="Profile" />
      <ListRow icon="person-outline" title={user?.firstName ?? 'Profile'} subtitle={user?.email} chevron />

      <SectionHeader title="Preferences" />
      <ListRow icon="notifications-outline" title="Notifications" chevron />
      <ListRow icon="scale-outline" title="Units" subtitle="Imperial (lb, oz)" chevron />
      <ListRow icon="contrast-outline" title="Appearance" />
      <View style={styles.appearancePicker}>
        {/* No activeColor: the selector takes the theme's neutral structural
            fill, so the current choice stays legible in both themes — brand
            ink disappears against a near-black track. */}
        <SegmentedTabs
          options={APPEARANCE_LABELS}
          selectedIndex={APPEARANCE_OPTIONS.indexOf(mode)}
          onChange={(index) => setMode(APPEARANCE_OPTIONS[index])}
        />
      </View>

      <SectionHeader title="Tools" />
      <ListRow
        icon="construct-outline"
        title="Tools"
        subtitle="Peptide calculator and other utilities"
        chevron
        accessibilityHint="Opens the tools list"
        onPress={() => router.push('/settings/tools')}
      />

      <SectionHeader title="Privacy" />
      <ListRow icon="lock-closed-outline" title="Privacy & Data" chevron />

      <SectionHeader title="About" />
      <ListRow icon="information-circle-outline" title="Version" value="0.1.0 (Sprint 0)" />
      <ListRow
        icon="log-out-outline"
        iconColor={palette.fat}
        title="Sign Out"
        onPress={() => {
          void signOut();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  appearancePicker: {
    marginTop: -spacing.s,
  },
});
