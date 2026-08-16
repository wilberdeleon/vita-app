import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { GlassSurface, IconBadge } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { MealSlot, MealSlotSummary } from '../types';

type Props = {
  meal: MealSlotSummary;
};

/**
 * Sun-cycle icon per slot, matching the approved mockup's meal icon set.
 * Ionicons has no literal sunrise/sunset glyphs, so Breakfast/Dinner use
 * the closest available stock equivalents (partly-sunny / filled sunny
 * tinted warm) rather than a custom-drawn asset — flagged, not silently
 * approximated.
 */
const SLOT_ICONS: Record<MealSlot, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  Breakfast: { icon: 'partly-sunny-outline', color: palette.gold },
  Lunch: { icon: 'sunny-outline', color: palette.primary },
  Dinner: { icon: 'sunny', color: palette.fat },
  Snacks: { icon: 'nutrition-outline', color: palette.peptide },
};

/**
 * One row per meal slot (founders, 2026-07-19 mockup v2) — icon, name,
 * logged status with a colored dot, calories. No chevron (Sprint 1
 * closeout, 2026-08-02) — Fuel/meal-detail doesn't exist yet, so the row
 * doesn't imply an interaction it can't fulfill. Restore a chevron/tap
 * target once Sprint 2 gives it somewhere to go.
 */
export function MealRow({ meal }: Props) {
  const { surfaces } = useTheme();
  const { icon, color } = SLOT_ICONS[meal.slot];
  const logged = meal.itemCount > 0;
  const status = logged ? (meal.itemCount > 1 ? `${meal.itemCount} logged` : 'Logged') : 'Not logged yet';

  return (
    <GlassSurface variant="card" radius={radii.glassRow} padding={spacing.m}>
      <View style={styles.row}>
        <IconBadge icon={icon} color={color} />
        <View style={styles.text}>
          <Text style={[styles.slot, { color: surfaces.text }]}>{meal.slot}</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.kcal, { color: surfaces.textTertiary }]}>{meal.kcal} kcal</Text>
            <View
              style={[
                styles.dot,
                logged ? { backgroundColor: color } : { borderWidth: 1, borderColor: surfaces.textTertiary },
              ]}
            />
            <Text style={[styles.status, { color: surfaces.textTertiary }]}>{status}</Text>
          </View>
        </View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  slot: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  kcal: {
    ...typography.caption,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  status: {
    ...typography.caption,
  },
});
