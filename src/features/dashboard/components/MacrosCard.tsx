import { StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from '../../../components/ui';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { MacroRow } from './MacroRow';
import type { CalorieSummary } from '../types';

type Props = {
  macros: CalorieSummary['macros'];
};

/**
 * Today's Macros (founders, 2026-07-22 — final Sprint 1 density pass).
 * Split out from Current Journey into its own card, deliberately lighter
 * than it: tighter padding, a plain label with no kicker rule, no gold
 * accents — just three compact progress rows so it reads as a quick
 * reference, not a second hero card.
 */
export function MacrosCard({ macros }: Props) {
  const { surfaces } = useTheme();

  return (
    <GlassSurface variant="card" radius={radii.glassLarge} padding={spacing.xl}>
      <Text style={[styles.kicker, { color: surfaces.textTertiary }]}>MACROS</Text>
      <View style={styles.macros}>
        {macros.map((macro) => (
          <MacroRow key={macro.label} macro={macro} />
        ))}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginBottom: spacing.m,
  },
  macros: {
    gap: spacing.m,
  },
});
