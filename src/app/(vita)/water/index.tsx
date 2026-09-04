import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, ScreenHeader, useToast } from '../../../components/ui';
import { AddWaterSheet } from '../../../features/water/components/AddWaterSheet';
import { TodayEntries } from '../../../features/water/components/TodayEntries';
import { WaterHero } from '../../../features/water/components/WaterHero';
import { WaterHistoryStrip } from '../../../features/water/components/WaterHistoryStrip';
import { vitaHaptic } from '../../../lib/haptics';
import {
  createWaterEntry,
  formatEntered,
  useWater,
  useWaterToday,
  useWaterWeek,
  type VolumeUnit,
  type WaterEntry,
} from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Water.
 *
 * **The first production feature in the Sprint 5 identity** (slice 5.2). What
 * changed is the presentation and the logging interaction; the hydration
 * engine underneath is untouched. Every figure still comes from
 * `useWaterToday()`, every write still goes through `useWater()`, and
 * millilitres are still canonical.
 *
 * ## What it replaced
 *
 * A summary card, a full-width button that pushed a whole screen, a card
 * holding seven bars, and a card holding the day's drinks — four stacked
 * rounded rectangles down a scroll, which is the "card soup" the sprint
 * exists to remove.
 *
 * ## The hierarchy now
 *
 * The vessel and the day's state hold the top of the screen, direct on the
 * background. The primary action sits under them, neutral — Water blue is
 * carried by the liquid, not by the button, which is what stops Water and
 * Peptides from being the same screen in two hues. Below the fold: seven days
 * of context, then today's drinks collapsed behind a one-line summary. Goal
 * editing is a quiet link, because setting a target is a deliberate act
 * someone does rarely and logging is what they do daily.
 *
 * ## Logging
 *
 * `AddWaterSheet` replaces the `/water/add` route entirely — that route is
 * gone rather than left reachable, because two ways to log the same drink is
 * the duplicate-flow problem, and a screen nothing links to is the dead-row
 * problem Settings had. Editing an existing drink still uses its own route:
 * everyday adding should be fast, and amending a record should be deliberate.
 *
 * **Nothing signals success before the write lands.** `addEntry` reports
 * whether it reached storage, and the confirmation haptic and toast fire only
 * on `true`. A failed save keeps the sheet open with the amount intact and
 * says so.
 */
export default function Water() {
  const today = useWaterToday();
  const week = useWaterWeek();
  const { addEntry, removeEntry, restoreEntry } = useWater();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  /**
   * Home can ask Water to open with the sheet already up (`/water?add=1`).
   *
   * The param is read once, as the initial state, rather than watched: Water
   * owns the sheet from that point on, and a param that kept re-opening it
   * after a close would make the screen fight the user. Home asks; Water
   * decides — which is what keeps logging in exactly one place.
   */
  const { add } = useLocalSearchParams<{ add?: string }>();
  const [adding, setAdding] = useState(add === '1');

  /**
   * One haptic per log, and the more specific one wins.
   *
   * Reaching the goal fires `complete` *instead of* `confirm`, never both.
   * Neither fires at all if the repository refused the entry — a vibration
   * that says "saved" over a failed write is worse than no vibration.
   */
  const log = async (amount: number, unit: VolumeUnit): Promise<boolean> => {
    const entry = createWaterEntry({ amount, unit });
    const wasMet = today.isGoalMet;
    const saved = await addEntry(entry);

    if (!saved) {
      vitaHaptic('warn');
      showToast({ message: "We couldn't save that. Nothing was recorded." });
      return false;
    }

    const nowMet =
      today.goalMl !== null && today.totalMl + entry.amountMl >= today.goalMl && !wasMet;
    vitaHaptic(nowMet ? 'complete' : 'confirm');
    showToast({ message: `Added · ${formatEntered(amount, unit)}` });
    return true;
  };

  const handleDelete = (entry: WaterEntry) => {
    // Captured before removal so Undo restores the entry to where it was,
    // not to the end of the list.
    const index = today.entries.findIndex((candidate) => candidate.id === entry.id);
    void removeEntry(entry.id);
    showToast({
      message: `Removed · ${formatEntered(entry.enteredAmount, entry.enteredUnit)}`,
      actionLabel: 'Undo',
      onAction: () => {
        void restoreEntry(entry, index);
      },
    });
  };

  return (
    <Screen contentGap={spacing.xxxl}>
      <ScreenHeader title="Water" back />

      <WaterHero today={today} onSetGoal={() => router.push('/water/goal')} />

      {/*
        * The primary action, neutral. Water blue appears on the glyph and in
        * the liquid above it — the feature colour marks what the action is
        * about while the control itself stays the app's one primary
        * treatment.
        */}
      <PressableScale
        style={[styles.addAction, { backgroundColor: surfaces.text }]}
        onPress={() => setAdding(true)}
        haptic="selection"
        accessibilityLabel="Add Water"
      >
        <Ionicons name="add" size={18} color={palette.water} />
        <Text style={[styles.addLabel, { color: surfaces.background }]}>Add Water</Text>
      </PressableScale>

      {today.error ? (
        <Text style={[styles.error, { color: palette.fat }]}>{today.error}</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: surfaces.text }]}>Last 7 days</Text>
        <WaterHistoryStrip days={week} unit={today.unit} />
      </View>

      <TodayEntries entries={today.recentFirst} isLoading={today.isLoading} onDelete={handleDelete} />

      <AddWaterSheet
        visible={adding}
        preferredUnit={today.unit}
        onClose={() => setAdding(false)}
        onLog={log}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    paddingVertical: 14,
    borderRadius: 999,
    minHeight: 50,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  addLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  section: {
    gap: spacing.m,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  error: {
    ...typography.caption,
    textAlign: 'center',
  },
});
