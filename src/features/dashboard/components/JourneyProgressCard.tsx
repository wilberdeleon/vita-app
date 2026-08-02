import { StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from '../../../components/ui';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { JourneySection } from './JourneySection';
import { MacroRow } from './MacroRow';
import type { CalorieSummary, JourneySnapshot } from '../types';

type Props = {
  journey: JourneySnapshot;
  macros: CalorieSummary['macros'];
};

/**
 * Current Journey — its own card again (founders, 2026-07-20 v4), matching
 * the reference screenshot's explicit "SECOND CARD" labeling and its
 * visible gap below Today's Summary. Wraps the unchanged JourneySection
 * content plus a full-width Macros block, both carried over from the v3
 * merge without modification — only the container changed back.
 */
export function JourneyProgressCard({ journey, macros }: Props) {
  const { surfaces } = useTheme();

  return (
    <GlassSurface variant="card" radius={radii.glassLarge} padding={spacing.xxl}>
      <JourneySection journey={journey} />

      <View style={[styles.divider, { backgroundColor: surfaces.border }]} />

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
  divider: {
    height: 1,
    marginVertical: spacing.xl,
  },
  kicker: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginBottom: spacing.m,
  },
  macros: {
    gap: spacing.m,
  },
});
