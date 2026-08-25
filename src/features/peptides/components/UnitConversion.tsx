import { StyleSheet, Text, View } from 'react-native';
import { Card, SectionHeader } from '../../../components/ui';
import {
  formatConcentration,
  formatMcg,
  formatSyringeUnits,
  unitConversionReference,
  type MassUnit,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  /** The vial, already parsed by whichever surface owns those fields. */
  vialAmountMcg?: number;
  reconstitutionMl?: number;
  /** The unit the vial was authored in — the reference is written in it. */
  vialUnit: MassUnit;
  /** Graduation density. U-100 unless a setup says otherwise. */
  unitsPerMl?: number;
};

/**
 * What the marks on the syringe are worth, worked out automatically.
 *
 * **There is no amount to enter.** Earlier versions asked for a third number
 * — how much are you using? — and that was the wrong question twice over: it
 * made the user do arithmetic in their head before they could ask VITA to do
 * arithmetic, and it put VITA in the position of receiving a dose. The vial
 * and the water already determine the entire relationship between mass and
 * units. Everything below is that one ratio, restated.
 *
 * **No row is recommended, and none can be.** The table is a ruler, not a
 * suggestion: nothing is highlighted, ordered by desirability, or described
 * as typical or standard, because VITA has no basis for any of that. A user
 * reads the line they need; VITA does not point at one.
 *
 * Regenerates on every render from the current vial values, so editing the
 * amount or the water updates it immediately, with no button to press.
 */
export function UnitConversion({ vialAmountMcg, reconstitutionMl, vialUnit, unitsPerMl }: Props) {
  const { surfaces } = useTheme();

  const reference = unitConversionReference(
    { vialAmountMcg, reconstitutionMl, unitsPerMl },
    vialUnit,
  );

  return (
    <>
      <SectionHeader title="Unit conversion" />

      {!reference.ok ? (
        <Text style={[styles.helper, { color: surfaces.textTertiary }]}>
          Enter vial amount and reconstitution volume to see the unit conversion.
        </Text>
      ) : (
        <Card style={styles.card}>
          {/*
           * The headline. One sentence a person can carry in their head and
           * check a syringe against — "1 mg = 10 units" — spoken as a whole
           * rather than as three separate stops.
           */}
          <Text
            style={[styles.primary, { color: palette.peptide }]}
            accessibilityRole="text"
            accessibilityLabel={`${formatMcg(reference.primary.amountMcg, vialUnit)} equals ${formatSyringeUnits(reference.primary.syringeUnits)}`}
          >
            {formatMcg(reference.primary.amountMcg, vialUnit)} ={' '}
            {formatSyringeUnits(reference.primary.syringeUnits)}
          </Text>

          <Text style={[styles.concentration, { color: surfaces.textSecondary }]}>
            Concentration · {formatConcentration(reference.concentrationMcgPerMl, vialUnit)}
          </Text>

          <View style={[styles.table, { borderTopColor: surfaces.border }]}>
            <View style={styles.row}>
              <Text style={[styles.heading, { color: surfaces.textTertiary }]}>AMOUNT</Text>
              <Text style={[styles.heading, styles.right, { color: surfaces.textTertiary }]}>
                SYRINGE UNITS
              </Text>
            </View>

            {reference.rows.map((entry) => {
              const amount = formatMcg(entry.amountMcg, vialUnit);
              const units = formatSyringeUnits(entry.syringeUnits);
              return (
                // One accessible node per line, so a screen reader says
                // "2 mg, 20 units" rather than reading two disconnected columns.
                <View
                  key={entry.amountMcg}
                  style={styles.row}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${amount}, ${units}`}
                >
                  <Text style={[styles.cell, { color: surfaces.text }]}>{amount}</Text>
                  <Text style={[styles.cell, styles.right, { color: surfaces.text }]}>{units}</Text>
                </View>
              );
            })}
          </View>

          <Text style={[styles.context, { color: surfaces.textTertiary }]}>
            Using U-100 · {reference.unitsPerMl} units/mL
          </Text>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  helper: {
    ...typography.caption,
  },
  card: {
    gap: 4,
  },
  primary: {
    ...typography.display,
  },
  concentration: {
    ...typography.caption,
  },
  table: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.s,
    paddingTop: spacing.s,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  heading: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  cell: {
    ...typography.body,
  },
  right: {
    textAlign: 'right',
  },
  context: {
    ...typography.micro,
    marginTop: spacing.xs,
  },
});
