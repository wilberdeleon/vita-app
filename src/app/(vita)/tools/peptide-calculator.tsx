import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  NumericField,
  NumericKeyboardAccessory,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '../../../components/ui';
import { UnitConversion } from '../../../features/peptides/components/UnitConversion';
import { DEFAULT_UNITS_PER_ML, parseAmount, toMcg } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

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
 * The conversion, its validation and its copy all come from the same
 * `UnitConversion` component the setup form uses, under the same field labels
 * (3.10 audit — the two surfaces had drifted apart). The only thing this
 * screen owns that the inline surface does not is the vial fields themselves,
 * because there is no setup to read them from.
 */
export default function StandalonePeptideCalculator() {
  const { surfaces } = useTheme();

  const [vialAmount, setVialAmount] = useState('');
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
        Enter your vial amount and reconstitution volume to view the U-100 unit conversion. Nothing
        here is saved, and no peptide needs to be tracked.
      </Text>

      {/*
        * Milligrams only, exactly as Routine Setup is (founder decision,
        * slice 3.10A).
        *
        * The toggle that used to sit here was kept on the argument that this
        * screen saves nothing, so a mistaken unit was disposable. The audit's
        * counter-argument, which the founder accepted: the mistake is not
        * *visible*. A vial entered as mcg instead of mg produces a table that
        * looks entirely coherent and is wrong by a factor of a thousand, and
        * the user acts on the number, not on whether it was stored.
        *
        * Vials are labelled in mg. **The Custom Amount below keeps its
        * mg/mcg choice** — that is the amount being converted, not the vial,
        * and micrograms are a perfectly ordinary way to say it.
        */}
      <SectionHeader title="Vial" />
      <NumericField
        label="Vial Amount (MG)"
        placeholder="e.g. 20"
        value={vialAmount}
        onChangeText={setVialAmount}
        accessibilityLabel="Vial amount in milligrams"
      />
      {vialInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      {/*
        * The same label and helper as Routine Setup (3.10 audit).
        *
        * "Bacteriostatic Water / Reconstitution (mL)" named one number twice
        * in a single line and made the screen read as technical. That was
        * rewritten on the setup form in slice 3.9A and never reached here, so
        * the two surfaces asked for the same measurement under two different
        * names — and in two different casings. The label names the
        * measurement; the helper says what it is. The model keeps the generic
        * `reconstitutionMl`, which does not assume bacteriostatic water is the
        * only possible diluent.
        */}
      <NumericField
        label="Reconstitution Volume (ML)"
        placeholder="e.g. 2"
        value={reconstitution}
        onChangeText={setReconstitution}
        accessibilityLabel="Reconstitution volume in millilitres"
      />
      <Text style={[styles.helper, { color: surfaces.textTertiary }]}>
        Bacteriostatic water added to the vial.
      </Text>
      {reconInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      <UnitConversion
        vialAmountMcg={vialParsed !== null ? toMcg(vialParsed, 'mg') : undefined}
        reconstitutionMl={reconParsed ?? undefined}
        vialUnit="mg"
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
  helper: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  error: {
    ...typography.caption,
  },
  note: {
    ...typography.caption,
    marginTop: spacing.s,
  },
});
