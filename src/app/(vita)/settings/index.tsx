import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ListRow, Screen, ScreenHeader, SectionHeader, SegmentedTabs } from '../../../components/ui';
import { THEME_MODES } from '../../../lib/preferences';
import { palette, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** Title case for the segmented control, in the order `THEME_MODES` declares. */
const APPEARANCE_LABELS = THEME_MODES.map((mode) => mode[0].toUpperCase() + mode.slice(1));

/**
 * The app version, as a user should see it.
 *
 * Read from the Expo config rather than typed in, which is how it came to
 * say `0.1.0 (Sprint 0)` three sprints after Sprint 0 — a hardcoded version
 * only stays true until someone forgets it. The build number is appended
 * only when one is configured; `app.json` sets no `ios.buildNumber` today,
 * and `1.0.0 (undefined)` would be worse than `1.0.0`.
 *
 * **No sprint names.** Internal milestones are not something a user has any
 * way to interpret.
 */
function appVersion(): string {
  const version = Constants.expoConfig?.version;
  if (!version) return 'Unknown';
  const build = Constants.expoConfig?.ios?.buildNumber;
  return build ? `${version} (${build})` : version;
}

/**
 * Settings — everything here is real (slice 4.1).
 *
 * **The rule this screen is built on:** a row that shows a chevron opens
 * something, or it is not on the screen. Before this slice, five of eight
 * rows drew a chevron and had no destination — Profile rendered mock auth
 * data, Notifications named infrastructure that does not exist, Units
 * asserted a preference (`Imperial (lb, oz)`) that VITA has never had and
 * that contradicted the real one Water stores, Privacy & Data went nowhere,
 * and Sign Out was styled destructive-red over a no-op mock.
 *
 * They were removed rather than filled in. A placeholder that promises
 * navigation is worse than an absent row, and building a profile system, an
 * auth session, or a notifications surface to justify a row would be letting
 * Settings' layout dictate the product roadmap. Each returns when the
 * feature behind it is real.
 *
 * Every row is a shared primitive, so the screen follows the active theme
 * through those rather than styling anything itself.
 */
export default function Settings() {
  const { mode, setMode } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Settings" back />

      <SectionHeader title="Preferences" />
      <ListRow icon="contrast-outline" title="Appearance" />
      <View style={styles.appearancePicker}>
        {/* No activeColor: the selector takes the theme's neutral structural
            fill, so the current choice stays legible in both themes — brand
            ink disappears against a near-black track. */}
        <SegmentedTabs
          options={APPEARANCE_LABELS}
          selectedIndex={THEME_MODES.indexOf(mode)}
          onChange={(index) => setMode(THEME_MODES[index])}
          groupLabel="Appearance"
        />
      </View>
      <ListRow
        icon="swap-horizontal-outline"
        title="Units"
        chevron
        accessibilityHint="Opens unit preferences"
        onPress={() => router.push('/settings/units')}
      />

      {/*
        * Settings is the way in, not the home (slice 4.2). Tools moved out to
        * `/tools` because a calculator is not a preference — but the founders
        * kept Settings as the discovery path, so this row stays and simply
        * points somewhere honest.
        *
        * The subtitle names the two tools that exist rather than promising
        * the destination's full identity. "Calculators and reference" would
        * be advertising a Reference section that arrives in slice 4.5.
        */}
      <SectionHeader title="Tools & Reference" />
      <ListRow
        icon="construct-outline"
        title="Tools & Reference"
        subtitle="Peptide calculator and injection sites"
        chevron
        accessibilityHint="Opens tools and reference"
        onPress={() => router.push('/tools')}
      />

      {/* One real fact. No Terms, Privacy, or support rows — those routes do
          not exist, and a dead link in an About section is the same defect
          this slice just removed from the rest of the screen. */}
      <SectionHeader title="About" />
      <ListRow icon="information-circle-outline" title="Version" value={appVersion()} />

      {/*
        * TEMPORARY — Sprint 5 slice 5.1. Remove in slice 5.9.
        *
        * The only way the founders can reach the identity prototype on a real
        * iPhone in Expo Go. `__DEV__` means it cannot exist in a release
        * build, so this is not a permanent "Design Playground" row — the
        * standing rule that VITA does not grow launcher entries still holds,
        * and the row is deleted with the prototype at the end of the sprint.
        */}
      {__DEV__ ? (
        <>
          <SectionHeader title="Development" />
          <ListRow
            icon="color-palette-outline"
            iconColor={palette.gold}
            title="Identity Prototype"
            subtitle="Slice 5.1 — temporary, removed in 5.9"
            chevron
            accessibilityHint="Opens the Sprint 5 identity prototype"
            onPress={() => router.push('/identity')}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  appearancePicker: {
    marginTop: -spacing.s,
  },
});
