import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  GlassSurface,
  ListRow,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  VitaSheet,
} from '../../components/ui';
import {
  TodaySchedule,
  type ScheduleItem,
} from '../../features/dashboard/components/TodaySchedule';
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
 * 4. **type and press** — the supporting vocabulary;
 * 5. **a populated Today's Schedule** — added in 5.3B so the founders can see
 *    what that section looks like with rows in it. Real Home shows an empty
 *    schedule until real routines exist, and seeding real ones just to take a
 *    screenshot would put invented records in someone's actual peptide
 *    history. These rows are local constants that touch nothing.
 */

/**
 * Sample schedule rows. `__DEV__`-only, local, and written nowhere.
 *
 * Note what is *not* here: a time. Routines schedule by day, so a preview
 * that showed `9:00 PM` would be demonstrating a design VITA cannot honestly
 * ship. The states are the domain's own marks.
 */
const PREVIEW_SCHEDULE: ScheduleItem[] = [
  { id: 'preview-1', name: '5-Amino-1MQ', amount: '1 mg', mark: 'unconfirmed', onOpen: () => {} },
  { id: 'preview-2', name: 'BPC-157', amount: '250 mcg', mark: 'taken', onOpen: () => {} },
  { id: 'preview-3', name: 'Retatrutide', amount: '2 mg', mark: 'skipped', onOpen: () => {} },
];

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
  const dark = scheme === 'dark';

  /**
   * The primary action stays neutral — the approved rule is that colour is
   * earned — but pure `surfaces.text` was stark on device, reading as an
   * unstyled default rather than as a designed control. A soft off-white in
   * dark and the brand ink in light both settle into the page, and the glyph
   * carries the one note of Water blue.
   */
  const ctaFill = dark ? '#F2F3F5' : palette.ink;
  const ctaLabel = dark ? '#14151A' : palette.paper;
  const ctaAccent = dark ? palette.water : '#7FB3F5';

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

        {/*
          * Two lines, three facts — the founder's Option C.
          *
          * The kicker `OF TODAY'S GOAL` and the trailing `Goal 64 fl oz` were
          * saying the same thing twice, and the vessel had already said it a
          * third time. What survives is the percentage as the hero, then
          * what is left and what it is out of on one quiet line. Nothing
          * useful was dropped for tidiness: remaining *and* goal are both
          * still there, one line shorter.
          */}
        <View style={styles.readout}>
          <Text style={[styles.percent, { color: surfaces.text }]}>{percent}%</Text>
          <Text style={[styles.readoutContext, { color: surfaces.textSecondary }]}>
            {complete
              ? `Goal reached · ${PROTOTYPE_GOAL_FLOZ} oz`
              : `${PROTOTYPE_GOAL_FLOZ - loggedFloz} oz to go · ${PROTOTYPE_GOAL_FLOZ} oz goal`}
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
          style={[styles.primaryAction, { backgroundColor: ctaFill }]}
          onPress={() => setSheetOpen(true)}
          haptic="selection"
          accessibilityLabel="Add Water"
        >
          {/*
            * Neutral surface, Water-blue glyph. Pure white read stark and
            * default-ish on device; an off-white in dark and the brand ink in
            * light both sit better against the near-black or cream ground.
            * The `+` is the one place the feature colour appears on the
            * control — which is the colour rule in miniature: the object and
            * the accent are blue, the button is not.
            */}
          <Ionicons name="add" size={18} color={ctaAccent} />
          <Text style={[styles.primaryActionLabel, { color: ctaLabel }]}>Add Water</Text>
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

      {/* ── 6. Today's Schedule, populated ───────────────────────────────
        * Home cannot show this state until real routines exist, and seeding
        * some would write into real history. Local rows, no persistence.
        */}
      <View style={styles.section}>
        <SectionHeader title="Today's Schedule — populated preview" />
        <TodaySchedule items={PREVIEW_SCHEDULE} isLoading={false} />
      </View>

      <Text style={[styles.footer, { color: surfaces.textTertiary }]}>
        Prototype · slice 5.1 · {scheme} mode · no production data is read or written
      </Text>

      {/* ── The quick-add sheet ───────────────────────────────────────────*/}
      <VitaSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Add Water">
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
          Prototype amounts — production quick-adds and units are unchanged.
        </Text>
        {/*
          * Four equal-width options across the sheet.
          *
          * The first device render stacked the number over a `FL OZ` kicker
          * inside a narrow pill, which compressed the unit and wasted the
          * horizontal room the sheet actually had. The number and unit now sit
          * on one baseline — `8 oz` — so each control is wide, shallow and
          * comfortable to hit, and the number is unambiguously the thing being
          * chosen.
          *
          * `oz` rather than `FL OZ`: the sheet is titled Add Water and every
          * amount here is a volume, so the longer form was buying precision
          * nobody needed at the cost of the layout.
          */}
        <View style={styles.amounts}>
          {QUICK_ADDS_FLOZ.map((amount) => (
            /*
             * The `flex: 1` has to live on a wrapper, not on the
             * `PressableScale`.
             *
             * `PressableScale` applies its `style` to the inner animated view,
             * so a flex basis handed to it never reaches the row and every
             * control collapses to its own text width — which is exactly what
             * the first 5.1A device render showed: four controls bunched into
             * the left two-thirds of the sheet. `MetricTile` records the same
             * trap. Wrapping is the fix that keeps the shared press language.
             */
            <View key={amount} style={styles.amountSlot}>
              <PressableScale
                style={[styles.amount, { borderColor: surfaces.border, backgroundColor: surfaces.card }]}
                onPress={() => logAmount(amount)}
                accessibilityLabel={`Add ${amount} ounces`}
              >
                <Text style={[styles.amountValue, { color: surfaces.text }]} numberOfLines={1}>
                  {amount}
                </Text>
                <Text style={[styles.amountUnit, { color: surfaces.textTertiary }]}>oz</Text>
              </PressableScale>
            </View>
          ))}
        </View>
        {/*
          * Secondary, and neutral for the same reason the primary action is:
          * a soft blue slab here made the *less* important control the most
          * colourful thing in the sheet. A hairline and neutral text put it
          * plainly below the quick amounts without hiding it.
          */}
        <PressableScale
          style={[styles.customAction, { borderColor: surfaces.border }]}
          onPress={() => logAmount(10)}
          haptic="selection"
          accessibilityLabel="Enter a custom amount"
        >
          <Text style={[styles.customLabel, { color: surfaces.text }]}>Custom amount</Text>
        </PressableScale>
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
  amountSlot: {
    flex: 1,
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 3,
    // Comfortable rather than tall-and-skinny: the control is now wider than
    // it is deep, which is what makes four across read as a set.
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xs,
    minHeight: 56,
    borderRadius: radii.control,
    borderWidth: 1,
  },
  amountValue: {
    ...typography.title,
  },
  amountUnit: {
    ...typography.caption,
  },
  customAction: {
    marginTop: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    minHeight: 48,
  },
  customLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  footer: {
    ...typography.micro,
    textAlign: 'center',
  },
});
