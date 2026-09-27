import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Card, ListRow, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { palette, spacing } from '../../../theme/tokens';

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
 *
 * ## What 5.7C changed: the presentation, and only that
 *
 * **No route, no tool, no copy claim and no behaviour moved.** Both
 * destinations, the back behaviour and the two tools' own screens are
 * untouched — the calculator's arithmetic and the injection-site taxonomy
 * are 5.7D's to look at, and this slice only links to them.
 *
 * **Two floating cards became one group.** Each row was a `ListRow` in its
 * default `'card'` dress — rounded, bordered, shadowed, carrying a 36pt
 * filled violet orb — so a screen holding two things rendered as two
 * isolated objects with a 20pt trench between them, on a screen with
 * nothing else to dilute them. They are now hairline-separated rows inside
 * **one restrained panel**, which is what a directory of two utilities is.
 *
 * **Why a panel and not Settings' bare rows.** Settings draws its rows
 * direct on the background, and Tools copying that exactly would make a
 * destination screen read as another Settings section (§9: it must belong
 * to the system without being a duplicate of it). The panel is the same
 * `Card` surface every other grouped module in VITA uses — same token, same
 * radius, same hairline — so the vocabulary is shared while the geometry
 * says *this is a place*, not *this is a settings group*.
 *
 * **The violet is the glyph and nothing else.** Both tools belong to
 * Peptides, so both carry Peptides' accent exactly as Dashboard's Quick
 * Tools tiles already draw them — bare glyph, no orb, no tinted row, no
 * second invented feature colour. The rows are told apart by their glyph
 * and their descriptor, which is how the locked Quick Tools row tells the
 * same two tools apart.
 *
 * **The `TOOLS` header stays.** It is redundant against the screen title in
 * the way 5.7B removed from Settings, and it was still kept: the Migration
 * Guide freezes *the hub's two-section structure*, the 4.2 rationale above
 * is explicit that this header is what makes REFERENCE one row to add, and
 * §7 authorizes this slice to restyle the landing screen, not to rewrite its
 * information architecture.
 *
 * **Rhythm.** `contentGap` is `spacing.m` rather than the default
 * `spacing.l`, the same correction Settings needed in 5.7B: `SectionHeader`
 * already carries `marginTop: spacing.s`, so the default left a visible
 * trench under the title on a screen with only two rows to fill it.
 */
export default function ToolsAndReference() {
  return (
    <Screen contentGap={spacing.m}>
      <ScreenHeader title="Tools & Reference" back />

      <SectionHeader title="Tools" />

      {/*
       * One group, `paddingVertical: 0` — the rows' own `spacing.m` is the
       * panel's vertical rhythm, so a row's tap target reaches the panel edge
       * instead of sitting inside a second, larger box.
       */}
      <Card style={styles.panel}>
        {/*
         * `rule={false}`: the panel's own top border is this group's opening
         * rule. Both descriptors are plain statements of what the tool does
         * — the calculator performs arithmetic and the sites screen shows
         * what you recorded, and neither line may suggest more than that.
         */}
        <ListRow
          variant="flat"
          rule={false}
          wrap
          icon="calculator-outline"
          iconColor={palette.peptide}
          title="Peptide Calculator"
          subtitle="Calculate U-100 syringe units from vial and reconstitution values"
          chevron
          accessibilityHint="Opens the peptide calculator"
          onPress={() => router.push('/tools/peptide-calculator')}
        />
        <ListRow
          variant="flat"
          wrap
          icon="body-outline"
          iconColor={palette.peptide}
          title="Injection Sites"
          subtitle="Body map, site reference, and your recorded history"
          chevron
          accessibilityHint="Opens your injection site history"
          onPress={() => router.push('/tools/injection-sites')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingVertical: 0,
  },
});
