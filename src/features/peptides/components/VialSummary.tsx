import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import {
  calculateConcentration,
  formatConcentration,
  formatMcg,
  type PeptideSetup,
} from '../../../lib/peptides';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  setup: PeptideSetup;
};

/**
 * What the calculator is working from, stated where the answer can be checked
 * against it.
 *
 * The result on this screen is only as good as the vial and water figures
 * saved in the setup, and those were entered on a different screen, possibly
 * weeks ago. Showing them here makes the calculation auditable at a glance —
 * a wrong answer is almost always a wrong input, and this is where a user
 * notices they typed 2 mL when they added 1.
 *
 * Concentration is **derived**, never editable. It is the one number here the
 * user did not type, and presenting it as a field would invite someone to
 * "correct" it into disagreeing with its own inputs.
 */
export function VialSummary({ setup }: Props) {
  const { surfaces } = useTheme();

  const vialUnit = setup.vial?.authored.unit ?? setup.preferredDoseUnit;
  const concentration = calculateConcentration({
    vialAmountMcg: setup.vial?.amountMcg,
    reconstitutionMl: setup.reconstitutionMl,
    unitsPerMl: setup.syringe?.unitsPerMl,
  });

  const rows: Array<{ label: string; value: string }> = [];

  if (setup.vial) {
    rows.push({ label: 'Vial', value: formatMcg(setup.vial.amountMcg, vialUnit) });
  }
  if (setup.reconstitutionMl !== undefined) {
    rows.push({ label: 'Reconstitution', value: `${setup.reconstitutionMl} mL` });
  }
  if (concentration.ok) {
    rows.push({
      label: 'Concentration',
      value: formatConcentration(concentration.concentrationMcgPerMl, vialUnit),
    });
    rows.push({
      label: 'Syringe scale',
      value: `U-100 · ${concentration.unitsPerMl} units/mL`,
    });
  }

  return (
    <Card style={styles.card}>
      <Text style={[styles.heading, { color: surfaces.textTertiary }]}>CURRENT SETUP</Text>
      {rows.map((row) => (
        // Each row is one accessible node so it reads as "Vial, 10 mg" rather
        // than as two unrelated stops.
        <View
          key={row.label}
          style={styles.row}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${row.label}: ${row.value}`}
        >
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>{row.label}</Text>
          <Text style={[styles.value, { color: surfaces.text }]}>{row.value}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  heading: {
    ...typography.micro,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  label: {
    ...typography.caption,
  },
  value: {
    ...typography.captionMedium,
    flexShrink: 1,
    textAlign: 'right',
  },
});
