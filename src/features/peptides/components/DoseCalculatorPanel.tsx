import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NumericField, SectionHeader, SegmentedTabs } from '../../../components/ui';
import {
  MASS_UNITS,
  calculateSyringeUnits,
  doseConsistencyNotes,
  toMcg,
  type DoseCalculationError,
  type DoseCalculationResult,
  type DoseConsistencyNote,
  type MassUnit,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { DoseResult } from './DoseResult';

type Props = {
  /**
   * The vial, already parsed by whichever surface owns those fields. Inside a
   * setup form these are the live draft values; in the standalone tool they
   * are the tool's own inputs. `undefined` means "not entered yet", which is
   * a normal state, not an error.
   */
  vialAmountMcg?: number;
  reconstitutionMl?: number;
  /** The unit the vial was authored in — concentration is shown in it. */
  vialUnit: MassUnit;
  /** Graduation density. U-100 unless a setup says otherwise. */
  unitsPerMl?: number;
  /**
   * Which unit the amount field starts in. A display preference carried over
   * from the setup; it never implies a quantity.
   */
  defaultAmountUnit?: MassUnit;
};

const MESSAGES: Partial<Record<DoseCalculationError, string>> = {
  'invalid-amount': 'Amount must be greater than zero.',
  'invalid-vial-amount': 'Enter a vial amount greater than zero.',
  'invalid-reconstitution': 'Enter a reconstitution volume greater than zero.',
  'invalid-units-per-ml': 'The syringe scale for this setup is not a usable number.',
};

/**
 * Neutral observations about two numbers the user entered — never judgements
 * about the amount. "More than your vial holds" is arithmetic; "that's a lot"
 * would be an opinion VITA has no standing to hold.
 */
const CONSISTENCY_NOTES: Record<DoseConsistencyNote, string> = {
  'amount-exceeds-vial': 'This amount is greater than the total vial amount entered.',
  'volume-exceeds-reconstitution':
    'This volume is greater than the total reconstitution volume entered.',
};

/**
 * The calculator, wherever it appears.
 *
 * One component serves both surfaces — inline in a peptide setup, and the
 * standalone tool — so the two can never drift apart in arithmetic, wording,
 * validation or layout. The surfaces differ only in **where the vial numbers
 * come from**, which is why those arrive as props while everything downstream
 * of them lives here.
 *
 * **The amount is owned here and never leaves.** It is deliberately not
 * lifted into either parent: neither surface has any business reading it, and
 * keeping it local makes "the calculator persists nothing" a structural fact
 * rather than a rule someone has to remember. Saving a setup cannot capture
 * it because saving a setup cannot see it.
 *
 * **The section stays visible when the vial is incomplete.** Hiding it would
 * leave a user who has not yet filled in their vial with no idea the
 * calculator exists; showing it with one line explaining what is missing
 * tells them exactly what to do next.
 */
export function DoseCalculatorPanel({
  vialAmountMcg,
  reconstitutionMl,
  vialUnit,
  unitsPerMl,
  defaultAmountUnit,
}: Props) {
  const { surfaces } = useTheme();

  /** Blank. VITA supplies no amount, not even a plausible-looking one. */
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<MassUnit | null>(null);
  const amountUnit = unit ?? defaultAmountUnit ?? 'mg';

  const vial = useMemo(
    () => ({ vialAmountMcg, reconstitutionMl, unitsPerMl }),
    [vialAmountMcg, reconstitutionMl, unitsPerMl],
  );

  /**
   * An untouched field and a typed "0" are different states, and the shared
   * `parseAmount` collapses both to `null`. Here the difference is the whole
   * message — blank is where everyone starts and must stay silent, while "0"
   * or "abc" is a mistake worth naming — so the text is classified before the
   * domain sees it.
   */
  const trimmed = amount.trim();
  const typedValue = trimmed.length === 0 ? null : Number(trimmed);

  const result = useMemo<DoseCalculationResult | null>(() => {
    if (typedValue === null) return null;
    if (!Number.isFinite(typedValue) || typedValue <= 0) {
      return { ok: false, reason: 'invalid-amount' };
    }
    return calculateSyringeUnits(vial, toMcg(typedValue, amountUnit));
  }, [vial, typedValue, amountUnit]);

  const notes = result?.ok ? doseConsistencyNotes(vial, result) : [];
  const vialReady = vialAmountMcg !== undefined && reconstitutionMl !== undefined;
  const message = result === null || result.ok ? null : MESSAGES[result.reason] ?? null;

  return (
    <>
      <SectionHeader title="Calculator" />

      <View style={styles.amountRow}>
        <View style={styles.amountField}>
          <NumericField
            label="Amount being used"
            placeholder="e.g. 2"
            value={amount}
            onChangeText={setAmount}
            accessibilityLabel={`Amount being used, in ${amountUnit}`}
          />
        </View>
        <View style={styles.unitControl}>
          <SegmentedTabs
            options={MASS_UNITS as readonly string[]}
            selectedIndex={MASS_UNITS.indexOf(amountUnit)}
            onChange={(index) => setUnit(MASS_UNITS[index])}
            activeColor={palette.peptide}
            groupLabel="Amount unit"
          />
        </View>
      </View>

      {!vialReady ? (
        <Text style={[styles.note, { color: surfaces.textTertiary }]}>
          Add vial amount and reconstitution volume above to calculate syringe units.
        </Text>
      ) : null}

      {vialReady && message ? (
        <Text style={[styles.error, { color: palette.fat }]}>{message}</Text>
      ) : null}

      {result?.ok ? (
        <>
          <DoseResult calculation={result} vialUnit={vialUnit} amountUnit={amountUnit} />
          {notes.map((note) => (
            <Text key={note} style={[styles.note, { color: surfaces.textTertiary }]}>
              {CONSISTENCY_NOTES[note]}
            </Text>
          ))}
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.m,
  },
  amountField: {
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
  },
});
