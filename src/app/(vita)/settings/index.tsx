import { ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { useAuth } from '../../../features/auth/AuthProvider';
import { palette } from '../../../theme/tokens';

/**
 * Settings shell — structure only for Sprint 0. Each row gains its real
 * screen in Sprint 7 (Settings). Not part of the UI reference; kept
 * deliberately minimal and consistent with the Design System primitives.
 */
export default function Settings() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <ScreenHeader title="Settings" back />

      <SectionHeader title="Profile" />
      <ListRow icon="person-outline" title={user?.firstName ?? 'Profile'} subtitle={user?.email} chevron />

      <SectionHeader title="Preferences" />
      <ListRow icon="notifications-outline" title="Notifications" chevron />
      <ListRow icon="scale-outline" title="Units" subtitle="Imperial (lb, oz)" chevron />
      <ListRow icon="contrast-outline" title="Appearance" subtitle="Light" chevron />

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
