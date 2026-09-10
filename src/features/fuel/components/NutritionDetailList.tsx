import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../../../components/ui';
import { OPTIONAL_NUTRIENTS, formatAmount, type NutritionFacts, type OptionalNutrient } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  nutrition: NutritionFacts;
};

const LABELS: Record<OptionalNutrient, { label: string; unit: string }> = {
  saturatedFat: { label: 'Saturated fat', unit: 'g' },
  fiber: { label: 'Fiber', unit: 'g' },
  sugar: { label: 'Sugar', unit: 'g' },
  sodium: { label: 'Sodium', unit: 'mg' },
};

/**
 * Secondary nutrition, collapsed by default.
 *
 * ## Only what the food actually carries
 *
 * A missing value is omitted rather than shown as `0` or `—`, because the
 * model deliberately distinguishes *we don't know this* from *this is
 * genuinely zero*, and flattening that here would throw the information away
 * at the only point where it matters to a reader. Renders nothing at all when
 * the food has no secondary data — an expander that opens onto an empty list
 * is worse than no expander. §74.
 *
 * ## 5.6D: out of the card
 *
 * It was a third `Card` on a screen that was already a stack of them. It now
 * sits direct on the background under the same uppercase heading and hairline
 * rows the rest of Fuel uses — the progressive-disclosure language Water and
 * Peptides established, not a nutrition label. §66.
 *
 * Still no daily context of any kind: no target, no remaining allowance, no
 * percentage of anything. This is what is in the food. §37, §45, §87.
 */
export function NutritionDetailList({ nutrition }: Props) {
  const [open, setOpen] = useState(false);
  const { surfaces } = useTheme();

  const available = OPTIONAL_NUTRIENTS.filter((key) => nutrition[key] !== undefined);
  if (available.length === 0) return null;

  return (
    <View>
      <SectionHeader title="More nutrition" />
      <Pressable
        onPress={() => setOpen((value) => !value)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Hide more nutrition' : 'Show more nutrition'}
        accessibilityState={{ expanded: open }}
        style={styles.toggleRow}
      >
        <Text style={[styles.toggle, { color: palette.primary }]}>
          {open ? 'Hide' : `Show ${available.length} more`}
        </Text>
      </Pressable>

      {open ? (
        <View>
          {available.map((key) => (
            <View
              key={key}
              style={[styles.row, { borderTopColor: surfaces.border }]}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${LABELS[key].label}: ${formatAmount(nutrition[key]!)} ${
                LABELS[key].unit === 'g' ? 'grams' : 'milligrams'
              }.`}
            >
              <Text style={[styles.label, { color: surfaces.textSecondary }]}>{LABELS[key].label}</Text>
              <Text style={[styles.value, { color: surfaces.text }]}>
                {formatAmount(nutrition[key]!)} {LABELS[key].unit}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    paddingVertical: spacing.xs,
    minHeight: 32,
    justifyContent: 'center',
  },
  toggle: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Wraps rather than clipping a label at accessibility text sizes.
    flexWrap: 'wrap',
    gap: spacing.m,
    paddingVertical: spacing.s,
    minHeight: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: {
    ...typography.body,
    flexShrink: 1,
  },
  value: {
    ...typography.bodyMedium,
  },
});
