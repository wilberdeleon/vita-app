import { router } from 'expo-router';
import { ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { palette } from '../../../theme/tokens';

/**
 * Tools & Reference — a destination of its own, not a Settings subfolder.
 *
 * **Why this stopped living under `/settings/`** (slice 4.2). Everything else
 * in VITA is *about your data*; a tool is something you use once and walk
 * away from, without tracking or saving anything. That distinction was
 * already the reason this screen existed — but the address contradicted it.
 * `/settings/tools/peptide-calculator` said a calculator was a child of
 * Settings, and a route is the plainest statement an app makes about what
 * something *is*. It is now `/tools/peptide-calculator`.
 *
 * **Settings is still the way in, and only that.** The founders' model:
 * Settings owns preferences, Tools owns utilities, Reference owns reading
 * material. Settings may be where you *find* a tool; it is not where a tool
 * *belongs*. Reached from there rather than the dock — the dock is a fixed
 * four, and a drawer of utilities has not earned a fifth destination.
 *
 * **Grouped by TOOLS rather than by domain.** The old header read `Peptides`,
 * which was right when every tool here was a peptide tool and will be wrong
 * the moment one is not — a BMI calculator is not a peptide tool, and would
 * force either a second header or a false grouping. The split the founders
 * want visible is Tools versus Reference, so that is the split the headers
 * carry.
 *
 * **Nothing is listed before it works.** No BMI row, no scanner row, no
 * Research Library row, and no disabled "Coming Soon" cards — a dead button
 * is worse than a short list. There is deliberately **no REFERENCE section
 * yet**: the title names the destination the founders approved, and the
 * section appears in slice 4.5 when there is something real inside it.
 * Adding it then is one header and one row, which is the whole point of
 * carrying the TOOLS header now.
 */
export default function ToolsAndReference() {
  return (
    <Screen>
      <ScreenHeader title="Tools & Reference" back />

      <SectionHeader title="Tools" />
      {/*
       * Both tools take the peptide purple because both belong to Peptides —
       * the icon colour tracks the domain a tool serves, not the screen it
       * sits on. A tool belonging to no domain (BMI) takes the neutral
       * treatment instead.
       */}
      <ListRow
        icon="calculator-outline"
        iconColor={palette.peptide}
        title="Peptide Calculator"
        subtitle="Vial and reconstitution to U-100 units"
        chevron
        accessibilityHint="Opens the peptide calculator"
        onPress={() => router.push('/tools/peptide-calculator')}
      />
      <ListRow
        icon="body-outline"
        iconColor={palette.peptide}
        title="Injection Sites"
        subtitle="Body map, site reference, and your history"
        chevron
        accessibilityHint="Opens your injection site history"
        onPress={() => router.push('/tools/injection-sites')}
      />
    </Screen>
  );
}
