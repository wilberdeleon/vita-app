import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  NumericField,
  NumericKeyboardAccessory,
  Screen,
  ScreenHeader,
  SectionHeader,
  SegmentedTabs,
} from '../../../../components/ui';
import { DoseCalculatorPanel } from '../../../../features/peptides/components/DoseCalculatorPanel';
import { DEFAULT_UNITS_PER_ML, MASS_UNITS, parseAmount, toMcg, type MassUnit } from '../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * The peptide calculator, standing on its own.
 *
 * **No peptide required.** Nothing here needs a catalog entry, a definition,
 * a setup, or a saved anything — a user with a vial in one hand should be
 * able to work out how many units to draw without first committing to
 * tracking the compound. That was the flaw in the slice 3.6 design, where the
 * only way to reach a calculator was through a setup you had already created.
 *
 * **Nothing is persisted.** Vial, water and amount are component state and
 * die with the screen. No history, no recently-used values, no remembered
 * default — this is a scratch pad, and anything it kept would start to look
 * like a plan VITA was proposing.
 *
 * The calculation, validation, result and copy all come from the same
 * `DoseCalculatorPanel` the setup form uses. The only thing this screen owns
 * that the inline surface does not is the vial fields, because there is no
 * setup to read them from.
 */
export default function StandalonePeptideCalculator() {
  const { surfaces } = useTheme();

  const [vialAmount, setVialAmount] = useState('');
  const [vialUnit, setVialUnit] = useState<MassUnit>('mg');
  const [reconstitution, setReconstitution] = useState('');

  const vialParsed = parseAmount(vialAmount);
  const reconParsed = parseAmount(reconstitution);

  // A half-typed field is invalid rather than silently ignored: treating "1."
  // as no vial at all would drop information the user believes they entered.
  const vialInvalid = vialAmount.trim().length > 0 && vialParsed === null;
  const reconInvalid = reconstitution.trim().length > 0 && reconParsed === null;

  return (
    <Screen keyboardAware>
      <ScreenHeader title="Peptide Calculator" back />

      <Text style={[styles.intro, { color: surfaces.textTertiary }]}>
        Works out how many syringe units your own vial and reconstitution come to. Nothing here is
        saved, and no peptide needs to be tracked.
      </Text>

      <SectionHeader title="Vial" />
      <View style={styles.row}>
        <View style={styles.grow}>
          <NumericField
            label={`Vial amount (${vialUnit})`}
            placeholder="e.g. 20"
            value={vialAmount}
            onChangeText={setVialAmount}
            accessibilityLabel={`Vial amount in ${vialUnit}`}
          />
        </View>
        <View style={styles.unitControl}>
          <SegmentedTabs
            options={MASS_UNITS as readonly string[]}
            selectedIndex={MASS_UNITS.indexOf(vialUnit)}
            onChange={(index) => setVialUnit(MASS_UNITS[index])}
            activeColor={palette.peptide}
            groupLabel="Vial unit"
          />
        </View>
      </View>
      {vialInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      {/* Familiar words on screen; the model's name for it stays generic,
          since bacteriostatic water is the usual diluent but not the only one. */}
      <NumericField
        label="Bacteriostatic water / reconstitution (mL)"
        placeholder="e.g. 2"
        value={reconstitution}
        onChangeText={setReconstitution}
        accessibilityLabel="Bacteriostatic water or reconstitution volume in millilitres"
      />
      {reconInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      <DoseCalculatorPanel
        vialAmountMcg={vialParsed !== null ? toMcg(vialParsed, vialUnit) : undefined}
        reconstitutionMl={reconParsed ?? undefined}
        vialUnit={vialUnit}
        unitsPerMl={DEFAULT_UNITS_PER_ML}
      />

      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Information is for tracking and educational reference only. VITA does not recommend
        peptides, dosing, or treatment.
      </Text>

      {/* One accessory bar serves every numeric field on this screen. */}
      <NumericKeyboardAccessory />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.m,
  },
  grow: {
    flex: 1,
  },
  unitControl: {
    width: 128,
  },
  error: {
    ...typography.caption,
  },
  note: {
    ...typography.caption,
    marginTop: spacing.s,
  },
});
