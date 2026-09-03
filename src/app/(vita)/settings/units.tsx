import { StyleSheet, Text } from 'react-native';
import { Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { UnitSelector } from '../../../features/water/components/UnitSelector';
import { useWater } from '../../../lib/water';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Units — the real destination behind what used to be a false claim.
 *
 * The row this replaces read `Imperial (lb, oz)`. VITA has never had pounds
 * or mass ounces anywhere, and the assertion contradicted the one volume
 * preference that genuinely exists: a user who had set Water to millilitres
 * was told by Settings that they were on imperial units.
 *
 * **This screen owns no storage.** It writes through `useWater().setUnit`,
 * the same call the Water goal screen makes, into the same
 * `vita:v1:water:prefs` record — the founder ruling on Open Question #16
 * (closed 2026-08-21): Settings reads and writes Water's source rather than
 * creating a second one that can disagree with it. Nothing about Water's
 * storage was rewritten to give Settings a tidier shape to talk to.
 *
 * **Only preferences that already change something appear here.** Body
 * weight and height belong to the BMI calculator in slice 5.8 and are not
 * listed in advance — a preference the user can set and never observe is
 * the same dishonesty as a row that navigates nowhere. The extension point
 * is documented in `src/lib/preferences/model/types.ts`.
 */
export default function Units() {
  const { preferences, setUnit } = useWater();
  const { surfaces } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Units" back />

      <Text style={[styles.intro, { color: surfaces.textSecondary }]}>
        How amounts are shown across VITA.
      </Text>

      <SectionHeader title="Water" />
      <UnitSelector
        value={preferences.unit}
        onChange={(unit) => {
          void setUnit(unit);
        }}
        groupLabel="Water display unit"
      />
      {/*
        * The one thing a user genuinely needs to know here, and the Water
        * domain's central rule: entries store the amount and unit they were
        * logged with. Switching to millilitres re-reads a drink recorded as
        * 16 fl oz; it does not rewrite it.
        */}
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Changing this never changes what you have already logged.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  note: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
});
