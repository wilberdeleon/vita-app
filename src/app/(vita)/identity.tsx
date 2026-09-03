import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  GlassSurface,
  ListRow,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  VitaSheet,
} from '../../components/ui';
import { WaterVessel } from '../../features/water/components/WaterVessel';
import { vitaHaptic } from '../../lib/haptics';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * The VITA identity prototype (Sprint 5 slice 5.1).
 *
 * **A reference implementation, not a product screen.** Its whole purpose is
 * to let the founder judge the new visual and interaction language on a real
 * device *before* five production screens commit to it. Nothing here is
 * shipped UI, and nothing here touches production state — see "Data safety"
 * below.
 *
 * **`__DEV__`-gated.** In a release build this route renders a plain notice
 * and nothing else. It is reachable in development from Settings → Identity
 * Prototype (also `__DEV__`-only) or by deep link to `/identity`. Both the
 * route and the Settings row are **temporary and are removed in slice 5.9** —
 * the standing rule that Home is not a launcher applies just as much to a
 * developer playground.
 *
 * **Data safety.** Every value on this screen is local `useState`. It does not
 * read `useWater()`, does not write an entry, does not touch a goal, and
 * cannot appear in real hydration history. Founder testing here is free —
 * tapping *Add Water* fifty times changes nothing real.
 *
 * ## What it is for
 *
 * The screen is ordered by how much the answer matters:
 *
 * 1. **the Water object** — the identity proof, and the thing to judge first;
 * 2. **the quick-add sheet** — whether a decision made in place beats
 *    navigating to a form;
 * 3. **the surface roles** — the same content at four weights, side by side,
 *    which is the fastest way to see whether "card soup" has merely become
 *    "glass soup";
 * 4. **type and press** — the supporting vocabulary.
 */

/** Prototype-only. Not VITA's default, and not written anywhere. */
const PROTOTYPE_GOAL_FLOZ = 64;
const QUICK_ADDS_FLOZ = [8, 12, 16, 24] as const;
const PRESETS = [0, 0.25, 0.5, 0.75, 1] as const;

export default function IdentityPrototype() {
  const { surfaces, scheme } = useTheme();
  const [loggedFloz, setLoggedFloz] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!__DEV__) {
    return (
      <Screen>
        <ScreenHeader title="Identity" back />
        <Text style={[styles.body, { color: surfaces.textSecondary }]}>
          The identity prototype is only available in development builds.
        </Text>
      </Screen>
    );
  }

  const progress = Math.min(1, loggedFloz / PROTOTYPE_GOAL_FLOZ);
  const percent = Math.round(progress * 100);
  const complete = progress >= 1;

  /**
   * One haptic per action, and the more specific one wins.
   *
   * Reaching the goal fires `complete` *instead of* `confirm`, never both —
   * two vibrations for one tap is exactly the noise the vocabulary exists to
   * prevent.
   */
  const logAmount = (floz: number) => {
    const next = loggedFloz + floz;
    const reachedGoal = next >= PROTOTYPE_GOAL_FLOZ && loggedFloz < PROTOTYPE_GOAL_FLOZ;
    setLoggedFloz(next);
    setSheetOpen(false);
    vitaHaptic(reachedGoal ? 'complete' : 'confirm');
  };

  return (
    <Screen contentGap={spacing.xxxl}>
      <ScreenHeader title="Identity" back />

      {/* ── 1. The Water object ───────────────────────────────────────────
        * Direct on the background, with no container at all. That is the
        * point: this is the surface role the new language makes the default,
        * and the object is strong enough to hold the screen without a card
        * drawn around it.
        */}
      <View style={styles.hero}>
        <WaterVessel progress={progress} width={116} accessibilityLabel="Hydration" />

        <View style={styles.readout}>
          <Text style={[styles.percent, { color: surfaces.text }]}>{percent}%</Text>
          <Text style={[styles.readoutLabel, { color: surfaces.textTertiary }]}>OF TODAY'S GOAL</Text>
          <Text style={[styles.readoutContext, { color: surfaces.textSecondary }]}>
            {complete
              ? 'Goal reached'
              : `${PROTOTYPE_GOAL_FLOZ - loggedFloz} fl oz to go · Goal ${PROTOTYPE_GOAL_FLOZ} fl oz`}
          </Text>
        </View>

        {/*
          * The primary action, in the app's neutral — deliberately **not**
          * water blue.
          *
          * The first device render of this prototype used the shared `Button`
          * with `color={palette.water}`, and it came back a full-width
          * saturated blue slab: the single loudest thing on the screen, louder
          * than the object it was about. That is precisely what the founder
          * colour rule this slice has to establish forbids — no giant
          * saturated feature-coloured surfaces, and no primary button that
          * changes hue by section.
          *
          * So the rule is demonstrated rather than described: **the action is
          * neutral, and the feature colour belongs to the object, the fill and
          * the state.** It is also what stops Water and Peptides from being
          * the same screen in two hues, which is the diagnosis the whole
          * sprint rests on.
          *
          * Built inline rather than by changing the shared `Button`, which has
          * 23 call sites this slice is not authorised to migrate. Proposed for
          * `Button` to adopt in 5.2.
          */}
        <PressableScale
          style={[styles.primaryAction, { backgroundColor: surfaces.text }]}
          onPress={() => setSheetOpen(true)}
          haptic="selection"
          accessibilityLabel="Add Water"
        >
          <Ionicons name="add" size={18} color={surfaces.background} />
          <Text style={[styles.primaryActionLabel, { color: surfaces.background }]}>Add Water</Text>
        </PressableScale>
      </View>

      {/* ── 2. Prototype controls ─────────────────────────────────────────
        * Visually quarantined on purpose — a dashed border and a tertiary
        * label, so nothing here can be mistaken for the design under review.
        */}
      <View style={[styles.devBox, { borderColor: surfaces.border }]}>
        <Text style={[styles.devLabel, { color: surfaces.textTertiary }]}>PROTOTYPE CONTROLS</Text>
        <View style={styles.devRow}>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setLoggedFloz(preset * PROTOTYPE_GOAL_FLOZ)}
              accessibilityRole="button"
              accessibilityLabel={`Set hydration to ${Math.round(preset * 100)} percent`}
              style={[styles.devChip, { borderColor: surfaces.border }]}
            >
              <Text style={[styles.devChipLabel, { color: surfaces.textSecondary }]}>
                {Math.round(preset * 100)}%
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── 3. Surface roles ──────────────────────────────────────────────*/}
      <View style={styles.section}>
        <SectionHeader title="Surface roles" />

        <Text style={[styles.roleName, { color: surfaces.text }]}>Direct content</Text>
        <Text style={[styles.roleBody, { color: surfaces.textSecondary }]}>
          The default. No container, no border, no shadow — hierarchy comes from type and space.
          The Water object above uses it.
        </Text>

        <Text style={[styles.roleName, { color: surfaces.text }]}>Grouped surface</Text>
        <Card>
          <Text style={[styles.roleBody, { color: surfaces.textSecondary }]}>
            For several related things that genuinely belong together. One card around a group,
            never one card per item.
          </Text>
        </Card>

        <Text style={[styles.roleName, { color: surfaces.text }]}>Layered surface</Text>
        <GlassSurface variant="card" radius={radii.glassLarge}>
          <Text style={[styles.roleBody, { color: surfaces.textSecondary }]}>
            Rare. Floating navigation, overlays, genuine layering. Not a prettier card.
          </Text>
        </GlassSurface>

        <Text style={[styles.roleName, { color: surfaces.text }]}>Utility row</Text>
        <ListRow
          icon="calculator-outline"
          iconColor={palette.peptide}
          title="Peptide Calculator"
          subtitle="Small, navigational, low weight"
          chevron
          onPress={() => vitaHaptic('selection')}
        />
      </View>

      {/* ── 4. Type hierarchy ─────────────────────────────────────────────*/}
      <View style={styles.section}>
        <SectionHeader title="Type hierarchy" />
        <Text style={[styles.hero1, { color: surfaces.text }]}>64 fl oz</Text>
        <Text style={[styles.typeNote, { color: surfaces.textTertiary }]}>
          HERO METRIC · one per screen
        </Text>
        <Text style={[styles.screenTitle, { color: surfaces.text }]}>Water</Text>
        <Text style={[styles.typeNote, { color: surfaces.textTertiary }]}>SCREEN CONTEXT</Text>
        <Text style={[styles.body, { color: surfaces.text }]}>
          Body copy sits at fifteen points and carries everything a screen actually says.
        </Text>
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
          Caption — metadata, timestamps, and anything the eye should skip.
        </Text>
      </View>

      {/* ── 5. Press ──────────────────────────────────────────────────────*/}
      <View style={styles.section}>
        <SectionHeader title="Press" />
        <PressableScale
          style={[styles.pressDemo, { borderColor: surfaces.border }]}
          haptic="selection"
          onPress={() => {}}
          accessibilityLabel="Press demonstration"
        >
          <Text style={[styles.body, { color: surfaces.text }]}>Press and hold me</Text>
          <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
            Scale compression, plus a selection haptic. Under Reduced Motion this fades instead
            of scaling — feedback stays, movement goes.
          </Text>
        </PressableScale>
      </View>

      <Text style={[styles.footer, { color: surfaces.textTertiary }]}>
        Prototype · slice 5.1 · {scheme} mode · no production data is read or written
      </Text>

      {/* ── The quick-add sheet ───────────────────────────────────────────*/}
      <VitaSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Add Water">
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
          Prototype amounts — production quick-adds and units are unchanged.
        </Text>
        <View style={styles.amounts}>
          {QUICK_ADDS_FLOZ.map((amount) => (
            <PressableScale
              key={amount}
              style={[styles.amount, { borderColor: surfaces.border, backgroundColor: surfaces.card }]}
              onPress={() => logAmount(amount)}
              accessibilityLabel={`Add ${amount} fluid ounces`}
            >
              <Text style={[styles.amountValue, { color: palette.water }]}>{amount}</Text>
              <Text style={[styles.amountUnit, { color: surfaces.textTertiary }]}>FL OZ</Text>
            </PressableScale>
          ))}
        </View>
        <View style={styles.sheetFooter}>
          <Button
            label="Custom amount"
            variant="soft"
            color={palette.water}
            onPress={() => logAmount(10)}
          />
        </View>
      </VitaSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.l,
  },
  readout: {
    alignItems: 'center',
    gap: 2,
  },
  percent: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  readoutLabel: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  readoutContext: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    borderRadius: radii.control,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxxl,
  },
  primaryActionLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  devBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radii.control,
    padding: spacing.m,
    gap: spacing.s,
  },
  devLabel: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  devRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  devChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderRadius: radii.chip,
    borderWidth: 1,
  },
  devChipLabel: {
    ...typography.micro,
  },
  section: {
    gap: spacing.m,
  },
  roleName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginTop: spacing.s,
  },
  roleBody: {
    ...typography.caption,
  },
  hero1: {
    ...typography.display,
  },
  screenTitle: {
    ...typography.title,
  },
  typeNote: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginTop: -spacing.s,
  },
  body: {
    ...typography.body,
  },
  caption: {
    ...typography.caption,
  },
  pressDemo: {
    borderWidth: 1,
    borderRadius: radii.control,
    padding: spacing.l,
    gap: spacing.xs,
  },
  amounts: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.m,
  },
  amount: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.l,
    borderRadius: radii.control,
    borderWidth: 1,
    gap: 2,
  },
  amountValue: {
    ...typography.title,
  },
  amountUnit: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  sheetFooter: {
    marginTop: spacing.m,
  },
  footer: {
    ...typography.micro,
    textAlign: 'center',
  },
});
