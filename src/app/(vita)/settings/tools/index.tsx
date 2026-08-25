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
 * **Built to grow, not padded to look full.** Slice 3.8's injection-site
 * work is the obvious next tenant — a site guide, a rotation helper — and
 * whatever else proves to belong here. No placeholder rows in the meantime:
 * a dead button is worse than a short list.
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
    </Screen>
  );
}
