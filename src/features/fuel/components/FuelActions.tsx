import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * The one thing this screen is for.
 *
 * ## Why it is outlined rather than filled orange
 *
 * The old screen had a solid-orange *Log Food* card beside a bordered *Scan
 * Barcode* card, both with shadows and subtitles — the largest colour block on
 * the page spent on a control. Sprint 5's rule since 5.1 is that the primary
 * action is the app's neutral treatment and the feature colour is carried by
 * the objects and states around it; Peptides' *Add to Routine* and Water's
 * primary both follow it. The orange lives on the flame, the calorie figure
 * and the accent here, not on a filled rectangle.
 *
 * **Fixed.** It is not a section: it never reorders, never hides, and is the
 * last thing in the content whatever the user has arranged above it.
 *
 * ## The two setup controls that used to live here
 *
 * 5.6B.1 put the first-use invitation and the quiet way back to it on this
 * file, as a banner above the sections. 5.6B.2 folds both into the Nutrition
 * section itself — setting goals is a nutrition act, and an invitation
 * floating above the whole screen was the "disconnected" the founder's review
 * named. See `NutritionContext`.
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
});
