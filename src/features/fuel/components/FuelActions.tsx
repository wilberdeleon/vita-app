import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * The one thing this screen is for.
 *
 * ## Why it is outlined rather than filled orange
 *
 * The old screen had a solid-orange *Log Food* card beside a bordered *Scan
 * Barcode* card, both with shadows and subtitles — the largest colour block
 * on the page spent on a control. Sprint 5's rule since 5.1 is that the
 * primary action is the app's neutral treatment and the feature colour is
 * carried by the objects and states around it; Peptides' *Add to Routine*
 * and Water's primary both follow it. The orange lives on the flame, the
 * calorie figure and the accent here, not on a filled rectangle.
 */
export function AddFoodAction({ onPress }: { onPress: () => void }) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityLabel="Add food"
      accessibilityHint="Search, scan, or enter a food"
      style={[styles.add, { borderColor: surfaces.border, backgroundColor: surfaces.card }]}
    >
      <Ionicons name="add" size={18} color={palette.primary} />
      <Text style={[styles.addLabel, { color: surfaces.text }]}>Add food</Text>
    </PressableScale>
  );
}

/**
 * The first-use invitation into setup.
 *
 * Shown while the user has configured **nothing** — no calorie goal, no
 * protein goal, no water goal — and has not waved it away. 5.6A.1 offered
 * this as one quiet line, and the founder's device review was that it still
 * felt like being sent to a settings screen; this states what setup is for
 * and opens a surface built for it.
 *
 * **Never a warning and never a gate.** Fuel logs food, counts calories and
 * scans barcodes with no goals at all. Once any goal exists — set here or in
 * Settings — the invitation is gone, and it does not come back for someone
 * who skipped it.
 */
export function SetUpFuel({ onPress }: { onPress: () => void }) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Set up Fuel"
      accessibilityHint="Set optional calorie, protein and water goals"
      style={[styles.goals, { borderColor: surfaces.border }]}
    >
      <View style={styles.goalsText}>
        <Text style={[styles.goalsTitle, { color: surfaces.text }]}>Set up Fuel</Text>
        <Text style={[styles.goalsBody, { color: surfaces.textTertiary }]} numberOfLines={2}>
          Set your daily intake goals and make Fuel yours. Optional — Fuel works without them.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.primary} />
    </PressableScale>
  );
}

/** The quiet way back to setup, once the invitation has been dealt with. */
export function EditGoalsAction({ onPress }: { onPress: () => void }) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Set up Fuel"
      accessibilityHint="Set optional calorie, protein and water goals"
      style={styles.editGoals}
    >
      <Text style={[styles.editGoalsLabel, { color: surfaces.textSecondary }]}>Set up Fuel</Text>
      <Ionicons name="chevron-forward" size={13} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingVertical: 14,
    minHeight: 50,
  },
  addLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  goals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  goalsText: {
    flex: 1,
    gap: 1,
  },
  goalsTitle: {
    ...typography.bodyMedium,
  },
  goalsBody: {
    ...typography.caption,
  },
  editGoals: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    minHeight: 36,
  },
  editGoalsLabel: {
    ...typography.captionMedium,
  },
});
