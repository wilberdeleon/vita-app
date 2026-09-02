import { router } from 'expo-router';
import { ListRow, Screen, ScreenHeader, SectionHeader } from '../../../../components/ui';
import { palette } from '../../../../theme/tokens';

/**
 * Tools — small utilities that stand on their own.
 *
 * The distinction that earns this screen its place: everything else in VITA
 * is *about your data*. A tool is something you use once and walk away from,
 * without tracking anything, saving anything, or belonging to a feature.
 * The peptide calculator is the first — you should be able to work out how
 * many units to draw without first creating a tracked peptide.
 *
 * Reached from Settings rather than the dock. It is a drawer of utilities,
 * not a fifth destination, and a bottom tab would give it a prominence it
 * has not earned.
 *
 * **Built to grow, not padded to look full.** Injection Sites joined in slice
 * 3.8; a food/product scanning tool is a recorded future candidate. Nothing
 * is listed before it works — a dead button is worse than a short list.
 */
export default function Tools() {
  return (
    <Screen>
      <ScreenHeader title="Tools" back />

      <SectionHeader title="Peptides" />
      <ListRow
        icon="calculator-outline"
        iconColor={palette.peptide}
        title="Peptide Calculator"
        subtitle="Convert vial and water into syringe units"
        chevron
        accessibilityHint="Opens the peptide calculator"
        onPress={() => router.push('/settings/tools/peptide-calculator')}
      />
      <ListRow
        icon="body-outline"
        iconColor={palette.peptide}
        title="Injection Sites"
        subtitle="Where you recorded each administration"
        chevron
        accessibilityHint="Opens your injection site history"
        onPress={() => router.push('/settings/tools/injection-sites')}
      />
    </Screen>
  );
}
