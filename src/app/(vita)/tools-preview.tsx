import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ListRow, PressableScale, Screen, ScreenHeader, SectionHeader } from '../../components/ui';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import ToolsAndReference from './tools/index';

/**
 * Tools Hub and the one state it cannot otherwise be seen in — `__DEV__` only.
 *
 * ## Why it exists
 *
 * Tools Hub has no data behind it: two fixed rows, no repository, no stored
 * preference, nothing to seed. So unlike `settings-preview` there is no
 * storage to protect here — **this harness writes nothing anywhere**, and
 * exists for a single reason 5.7C needed and the device could not give:
 * **how the grouped panel behaves when a descriptor is long enough to wrap.**
 *
 * The real screen's two descriptors are one line each at the default text
 * size. At accessibility sizes they wrap, and the only way to see that on a
 * device is to raise the system text size — which is worth doing, and is
 * *not* the same check. A long descriptor at the *default* size proves the
 * row grows from its content rather than from `fontScale`, which is what
 * §25's "no fixed row heights" actually asks.
 *
 * ## What each stage is
 *
 * **`hub`** renders the **real production screen**, not a copy — the same
 * component the route serves, so what is reviewed is what ships.
 *
 * **`wrapping`** is deliberately *not* the screen. It is the shared
 * `ListRow variant="flat"` primitive inside the same `Card` panel, given
 * fixture copy no real tool has, as a probe on the primitive. Saying so
 * matters: a second hand-written copy of the screen would drift from the
 * real one and quietly stop proving anything about it.
 *
 * **Light and Dark are not stages.** There is no theme to fake here and
 * nothing stored to avoid, so both themes are reviewed the honest way —
 * switch the app's appearance in Settings, or the simulator's, and reopen.
 *
 * Reachable at `/tools-preview`, or `/tools-preview?state=wrapping`.
 * Temporary, and removed with the other Sprint 5 scaffolding in 5.9.
 */

type Scenario = { key: string; label: string };

const SCENARIOS: Scenario[] = [
  { key: 'hub', label: 'Tools Hub' },
  { key: 'wrapping', label: 'Long descriptors' },
];

/** Fixture copy — no tool says this. Long enough to wrap at any text size. */
const LONG_DESCRIPTOR =
  'Calculate U-100 syringe units from vial amount and reconstitution volume, including a custom amount in milligrams or micrograms';

function WrappingProbe() {
  const { surfaces } = useTheme();

  return (
    <Screen contentGap={spacing.m}>
      <ScreenHeader title="Tools & Reference" back />
      <SectionHeader title="Tools" />
      <Card style={styles.panel}>
        <ListRow
          variant="flat"
          rule={false}
          wrap
          icon="calculator-outline"
          iconColor={palette.peptide}
          title="Peptide Calculator With A Deliberately Long Name"
          subtitle={LONG_DESCRIPTOR}
          chevron
          accessibilityHint="Fixture row"
          onPress={() => {}}
        />
        <ListRow
          variant="flat"
          wrap
          icon="body-outline"
          iconColor={palette.peptide}
          title="Injection Sites"
          subtitle="Body map, site reference, and your recorded history"
          chevron
          accessibilityHint="Fixture row"
          onPress={() => {}}
        />
      </Card>
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Fixture copy. No tool says this — the row is the shared primitive, not the screen.
      </Text>
    </Screen>
  );
}

export default function ToolsPreview() {
  const { surfaces } = useTheme();
  const { state } = useLocalSearchParams<{ state?: string }>();

  const active = SCENARIOS.find((item) => item.key === state) ?? SCENARIOS[0];

  if (!__DEV__) {
    return (
      <View style={[styles.root, { backgroundColor: surfaces.background }]}>
        <Text style={{ color: surfaces.text }}>Not available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: surfaces.background }]}>
      <View style={[styles.bar, { borderBottomColor: surfaces.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SCENARIOS.map((item) => {
            const selected = item.key === active.key;
            return (
              <PressableScale
                key={item.key}
                onPress={() => router.replace(`/tools-preview?state=${item.key}`)}
                style={[
                  styles.chip,
                  { borderColor: surfaces.border },
                  selected && { backgroundColor: surfaces.text, borderColor: surfaces.text },
                ]}
                accessibilityLabel={`Preview ${item.label}`}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[styles.chipLabel, { color: selected ? surfaces.background : surfaces.textSecondary }]}
                >
                  {item.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.stage}>
        {active.key === 'wrapping' ? <WrappingProbe /> : <ToolsAndReference />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    // Clear of the status bar, like the other preview harnesses.
    paddingTop: spacing.xxxl + spacing.xl,
  },
  chips: {
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.s,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  chipLabel: {
    ...typography.caption,
  },
  stage: {
    flex: 1,
  },
  panel: {
    paddingVertical: 0,
  },
  note: {
    ...typography.caption,
  },
});
