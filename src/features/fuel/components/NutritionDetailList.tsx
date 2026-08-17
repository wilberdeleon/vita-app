import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { OPTIONAL_NUTRIENTS, formatAmount, type NutritionFacts, type OptionalNutrient } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  nutrition: NutritionFacts;
};

const LABELS: Record<OptionalNutrient, { label: string; unit: string }> = {
  saturatedFat: { label: 'Saturated Fat', unit: 'g' },
  fiber: { label: 'Fiber', unit: 'g' },
  sugar: { label: 'Sugar', unit: 'g' },
  sodium: { label: 'Sodium', unit: 'mg' },
};

/**
 * Secondary nutrition, collapsed by default.
 *
 * Only nutrients the food actually carries are listed. A missing value is
 * omitted rather than shown as "0" or "—", because the model deliberately
 * distinguishes "we don't know this" from "this is genuinely zero", and
 * flattening that distinction here would throw the information away at the
 * only point where it matters to a reader.
 *
 * Renders nothing at all when the food has no secondary data — an expander
 * that opens onto an empty list is worse than no expander.
 */
export function NutritionDetailList({ nutrition }: Props) {
  const [open, setOpen] = useState(false);
  const { surfaces } = useTheme();

  const available = OPTIONAL_NUTRIENTS.filter((key) => nutrition[key] !== undefined);
  if (available.length === 0) return null;

  return (
    <Card>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text style={[styles.toggle, { color: palette.primary }]}>
          {open ? 'Hide details' : 'More nutrition'}
        </Text>
      </Pressable>

      {open ? (
        <View style={styles.rows}>
          {available.map((key) => (
            <View key={key} style={[styles.row, { borderBottomColor: surfaces.border }]}>
              <Text style={[styles.label, { color: surfaces.textSecondary }]}>{LABELS[key].label}</Text>
              <Text style={[styles.value, { color: surfaces.text }]}>
                {formatAmount(nutrition[key]!)}
                {LABELS[key].unit}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  toggle: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  rows: {
    marginTop: spacing.m,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    ...typography.body,
  },
  value: {
    ...typography.bodyMedium,
  },
});
