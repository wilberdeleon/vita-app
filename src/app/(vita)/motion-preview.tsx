import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  SegmentedTabs,
  VitaSheet,
} from '../../components/ui';
import { FavoriteButton } from '../../features/fuel/components/FavoriteButton';
import { Disclosure } from '../../features/peptides/components/Disclosure';
import {
  NutritionProvider,
  type NutritionRepository,
  type VitaFood,
} from '../../lib/nutrition';
import { palette, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../theme/useReducedMotion';

/**
 * VITA's interaction vocabulary, on one screen — `__DEV__` only.
 *
 * ## Why it exists
 *
 * Motion is the one part of the design system that **cannot be reviewed from
 * a screenshot**. Every other slice in Sprint 5 could be judged from a still
 * image; a press response, a selection, a sheet arriving and a reduced-motion
 * branch can only be judged with a finger. Those interactions are otherwise
 * scattered across five features, so comparing them means walking the whole
 * app and remembering how the last one felt.
 *
 * This puts the shared vocabulary side by side, in the order 5.8A named it:
 * **Press**, **Select**, **Reveal**, **Sheet** — with the live Reduced Motion
 * state shown at the top, because the single most common way to misjudge
 * motion work is to review it without knowing which branch you are in.
 *
 * ## What it is not
 *
 * **Every control here is the real shared component**, not a mock-up of one.
 * A preview that hand-rolled its own button would be reviewing a button that
 * does not ship. Nothing is persisted, nothing is logged, and no product
 * state is touched — the toggles below move local `useState` and nothing else.
 *
 * **The target is that motion is almost invisible until you take it away.**
 * If anything on this screen calls attention to itself, it is too much.
 *
 * Temporary, and removed with the other Sprint 5 scaffolding in 5.9.
 */
/** A food that exists only here. Nothing about it is written anywhere. */
const SAMPLE_FOOD: VitaFood = {
  vitaId: 'preview:1',
  source: 'vita-custom',
  sourceId: '1',
  name: 'Sample food',
  servings: [
    {
      label: '1 serving',
      quantity: 1,
      unit: 'serving',
      nutrition: { calories: 100, protein: 10, carbs: 10, fat: 2 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: true,
  fetchedAt: '2026-09-27T00:00:00.000Z',
};

/** Favorites live in this closure and die with the route. */
const forgetfulRepository: NutritionRepository = (() => {
  let favorites: unknown[] = [];
  return {
    async getEntries() {
      return [];
    },
    async saveEntries() {},
    async getTargets() {
      return null;
    },
    async saveTargets() {},
    async getCustomFoods() {
      return [];
    },
    async saveCustomFoods() {},
    async getRecentEntries() {
      return [];
    },
    async getFavorites() {
      return [...favorites] as never;
    },
    async saveFavorites(next: unknown[]) {
      favorites = [...next];
    },
  } as NutritionRepository;
})();

export default function MotionPreview() {
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();

  const [appearance, setAppearance] = useState(0);
  const [unit, setUnit] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!__DEV__) {
    return (
      <View style={[styles.root, { backgroundColor: surfaces.background }]}>
        <Text style={{ color: surfaces.text }}>Not available.</Text>
      </View>
    );
  }

  return (
    <Screen contentGap={spacing.m}>
      <ScreenHeader title="Motion" back />

      {/* The branch you are actually reviewing. Reads live: toggling Reduce
          Motion in Settings updates it without relaunching. */}
      <Card>
        <Text style={[styles.stateLabel, { color: surfaces.textTertiary }]}>REDUCED MOTION</Text>
        <Text style={[styles.state, { color: reducedMotion ? palette.peptide : surfaces.text }]}>
          {reducedMotion ? 'On — movement removed' : 'Off — full motion'}
        </Text>
        <Text style={[styles.note, { color: surfaces.textTertiary }]}>
          iOS Settings → Accessibility → Motion → Reduce Motion. Presses answer with a fade
          instead of a spring, and nothing travels.
        </Text>
      </Card>

      {/* ── Press ─────────────────────────────────────────────────────── */}
      <SectionHeader title="Press" />
      <View style={styles.group}>
        <Button label="Neutral primary" variant="neutral" onPress={() => {}} />
        <Button label="Outline" variant="outline" color={palette.peptide} onPress={() => {}} />
        <Button label="Disabled — must not answer" variant="neutral" disabled onPress={() => {}} />
      </View>
      <Card style={styles.panel}>
        <ListRow
          variant="flat"
          rule={false}
          icon="hand-left-outline"
          title="Row press"
          subtitle="The same primitive, at surface scale"
          chevron
          accessibilityHint="Does nothing; this is a press sample"
          onPress={() => {}}
        />
      </Card>

      {/* ── Select ────────────────────────────────────────────────────── */}
      <SectionHeader title="Select" />
      <View style={styles.group}>
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
          Neutral, as Settings draws it. A haptic fires only when the choice changes.
        </Text>
        <SegmentedTabs
          options={['Light', 'Dark', 'System']}
          selectedIndex={appearance}
          onChange={setAppearance}
          groupLabel="Appearance sample"
        />
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
          Feature-accented, as Peptides draws it.
        </Text>
        <SegmentedTabs
          options={['mg', 'mcg']}
          selectedIndex={unit}
          onChange={setUnit}
          activeColor={palette.peptide}
          groupLabel="Unit sample"
        />
        {/*
          * The **real** `FavoriteButton`, over a repository that forgets
          * everything — not a lookalike. It is the component 5.8C gave a
          * single quick pulse to, and the only way to judge that pulse is
          * against the one that ships.
          */}
        <View style={styles.favoriteRow}>
          <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
            Favorite — one pulse on change, no haptic
          </Text>
          <NutritionProvider repository={forgetfulRepository}>
            <FavoriteButton food={SAMPLE_FOOD} withSurface />
          </NutritionProvider>
        </View>
      </View>

      {/* ── Reveal ────────────────────────────────────────────────────── */}
      <SectionHeader title="Reveal" />
      <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
        Still instant here, and everywhere except one place: 5.8C animated Fuel Home&apos;s meal
        expand and nothing else, so the one reveal that earns motion has it and the rest stay
        immediate. Open a meal on Fuel Home to compare with the disclosure below.
      </Text>
      <Disclosure title="Sample section" summary="Closed">
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
          The content appears and disappears with no transition, the same as Fuel's meals and
          Injection Sites' reference.
        </Text>
      </Disclosure>

      {/* ── Sheet ─────────────────────────────────────────────────────── */}
      <SectionHeader title="Sheet" />
      <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
        React Native&apos;s own Modal, which is what every VITA sheet is built on. Reduced Motion
        swaps the platform slide for no animation at all.
      </Text>
      <Button label="Open sheet" variant="outline" onPress={() => setSheetOpen(true)} />
      <VitaSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Sample sheet">
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>
          Tap the backdrop, or the close control, to dismiss. Nothing here is saved.
        </Text>
      </VitaSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    gap: spacing.s,
  },
  panel: {
    paddingVertical: 0,
  },
  stateLabel: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  state: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
    marginTop: 2,
  },
  note: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  caption: {
    ...typography.caption,
    flex: 1,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
  },
});
