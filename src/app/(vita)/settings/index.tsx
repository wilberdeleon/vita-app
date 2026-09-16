import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ListRow, Screen, ScreenHeader, SectionHeader, SegmentedTabs } from '../../../components/ui';
import { THEME_MODES } from '../../../lib/preferences';
import { palette, spacing, typography } from '../../../theme/tokens';
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
 * Settings — everything here is real, and it now looks like the rest of VITA.
 *
 * ## What 4.1 settled, and still holds
 *
 * **A row that shows a chevron opens something, or it is not on the screen.**
 * Before that slice, five of eight rows drew a chevron and had no
 * destination — Profile rendered mock auth data, Notifications named
 * infrastructure that does not exist, Units asserted a preference
 * (`Imperial (lb, oz)`) that VITA has never had and that contradicted the
 * real one Water stores, Privacy & Data went nowhere, and Sign Out was
 * styled destructive-red over a no-op mock.
 *
 * They were removed rather than filled in, and none has come back. A
 * placeholder that promises navigation is worse than an absent row, and
 * building a profile system to justify a row would be letting Settings'
 * layout dictate the product roadmap. Each returns when the feature behind
 * it is real.
 *
 * ## What 5.7B changed: the presentation, and only that
 *
 * **No destination, no preference and no stored value moved.** The screen
 * was honest and looked like the old app, which is the whole of the problem
 * this slice was opened for.
 *
 * **Card soup.** Six rows, six rounded shadowed cards floating on black,
 * carrying six short facts down a whole screen. `ListRow variant="flat"` now
 * draws them direct on the background, separated by hairlines — the row the
 * locked Peptides *Your routines* region and Fuel Home's meals have used
 * since 5.4 and 5.6B. The variant is the one the Migration Guide has had
 * scheduled for this slice since 5.1, not a new invention.
 *
 * **Six Fuel-orange orbs.** `ListRow`'s icon badge defaults to
 * `palette.primary`, so Appearance, Units, Nutrition Goals, Tools and
 * Version all wore a 36pt orange disc — on a screen where nothing belongs to
 * Fuel. Orange is a feature identity in VITA, not decoration. The glyphs are
 * bare and secondary-text now, and **feature colour appears only where a
 * setting genuinely belongs to a feature**: Water blue on Units, Fuel orange
 * on Nutrition Goals. The colour marks the glyph; it never colours a row.
 *
 * **Appearance was a dead row.** A chevron-less card reading `Appearance`
 * with a segmented control floating underneath it, pulled up by a negative
 * margin — two objects for one control, and the row looked exactly like the
 * four beside it that do navigate. It is a label over its control now, which
 * is what it always was.
 *
 * **`Tools & Reference` was the section header and the row title.** The same
 * three words twice, six points apart. The group is `TOOLS`; the row names
 * the destination.
 *
 * ## Grouping
 *
 * `PREFERENCES` — how the app presents itself: Appearance and Units.
 * `TRACKING` — what your data is measured against: Nutrition Goals.
 * `TOOLS`, then `ABOUT`. **No group exists that does not contain a real
 * destination**, and no group was invented to give a row somewhere to live.
 *
 * ## Rhythm
 *
 * `Screen`'s section gap is `spacing.m` rather than the default `spacing.l`.
 * `SectionHeader` already carries `marginTop: spacing.s`, so the default put
 * 28pt plus a row's own slack between groups — around 62pt between the Units
 * row and the `TRACKING` label on device, which is the "giant section
 * whitespace" §15 names. The rows themselves keep the shared 56pt floor: a
 * consistent row height across VITA is worth more than a few points here.
 */
export default function Settings() {
  const { mode, setMode, surfaces } = useTheme();

  return (
    <Screen contentGap={spacing.m}>
      <ScreenHeader title="Settings" back />

      {/*
        * Appearance — a label over its own control.
        *
        * Not a `ListRow`: the row it used to draw had no chevron and no
        * `onPress`, so it was a card that looked identical to the ones that
        * navigate and did nothing when pressed. The control *is* the setting.
        *
        * `SegmentedTabs` with no `activeColor` takes the theme's neutral
        * structural fill — the same treatment locked Water and Peptides setup
        * use, and the reason the current choice stays legible in both themes
        * where brand ink would vanish against near-black.
        */}
      <View style={styles.group}>
        <SectionHeader title="Preferences" />
        <Text style={[styles.label, { color: surfaces.text }]}>Appearance</Text>
        <SegmentedTabs
          options={APPEARANCE_LABELS}
          selectedIndex={THEME_MODES.indexOf(mode)}
          onChange={(index) => setMode(THEME_MODES[index])}
          groupLabel="Appearance"
        />

        {/*
          * Units belongs to this group, not beside it.
          *
          * The first device pass of this screen had it in its own block, so
          * `Screen`'s section gap pushed it 62pt clear of the control above
          * and left it reading as an ungrouped row that happened to sit under
          * someone else's header. It is a preference like Appearance and now
          * sits in the same group.
          *
          * The blue glyph is the §16 case for feature colour in Settings:
          * this is Water's own preference, read and written through Water's
          * store (the founder ruling on Open Question #16), so it carries
          * Water's mark. The glyph only — never the row.
          */}
        <View style={styles.rows}>
          <ListRow
            variant="flat"
            icon="water-outline"
            iconColor={palette.water}
            title="Units"
            chevron
            accessibilityHint="Opens unit preferences"
            onPress={() => router.push('/settings/units')}
          />
        </View>
      </View>

      {/*
        * Where nutrition goals come from (slice 5.6A). Until then VITA
        * displayed goals it had invented and offered no way to author one.
        */}
      <View style={styles.group}>
        <SectionHeader title="Tracking" />
        <View style={styles.rows}>
          <ListRow
            variant="flat"
            icon="flag-outline"
            iconColor={palette.primary}
            title="Nutrition Goals"
            subtitle="Calories and protein — both optional"
            chevron
            accessibilityHint="Opens your daily calorie and protein goals"
            onPress={() => router.push('/settings/nutrition-goals')}
          />
        </View>
      </View>

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
      <View style={styles.group}>
        <SectionHeader title="Tools" />
        <View style={styles.rows}>
          <ListRow
            variant="flat"
            icon="construct-outline"
            title="Tools & Reference"
            subtitle="Peptide calculator and injection sites"
            chevron
            accessibilityHint="Opens tools and reference"
            onPress={() => router.push('/tools')}
          />
        </View>
      </View>

      {/* One real fact. No Terms, Privacy, or support rows — those routes do
          not exist, and a dead link in an About section is the same defect
          4.1 removed from the rest of the screen. */}
      <View style={styles.group}>
        <SectionHeader title="About" />
        <View style={styles.rows}>
          <ListRow variant="flat" title="Version" value={appVersion()} />
        </View>
      </View>

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
        <View style={styles.group}>
          <SectionHeader title="Development" />
          <View style={styles.rows}>
            <ListRow
              variant="flat"
              icon="color-palette-outline"
              iconColor={palette.gold}
              title="Identity Prototype"
              subtitle="Slice 5.1 — temporary, removed in 5.9"
              chevron
              accessibilityHint="Opens the Sprint 5 identity prototype"
              onPress={() => router.push('/identity')}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  /* A group's label sits close to what it labels; `Screen`'s own gap
     separates one group from the next. */
  group: {
    gap: spacing.s,
  },
  /* Rows inside a group are flush — the hairlines separate them, so any gap
     here would break the run into floating pieces again. */
  rows: {
    gap: 0,
  },
  label: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
  },
});
