import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionHeader,
  SegmentedTabs,
  TextField,
} from '../../../../../components/ui';
import { DoseResult } from '../../../../../features/peptides/components/DoseResult';
import { VialSummary } from '../../../../../features/peptides/components/VialSummary';
import {
  MASS_UNITS,
  calculateSyringeUnits,
  doseConsistencyNotes,
  toMcg,
  useResolvedSetup,
  type DoseCalculationError,
  type DoseCalculationResult,
  type DoseConsistencyNote,
  type MassUnit,
} from '../../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../../theme/tokens';
import { useTheme } from '../../../../../theme/ThemeProvider';

/**
 * Copy for the states the domain reports as typed reasons.
 *
 * The domain never holds user-facing English, so the mapping lives here. Only
 * the reasons this screen can actually produce are listed — it owns the amount
 * field and reads the rest from a saved setup, so `missing-units` and its
 * siblings from the reverse conversion cannot arise on this route.
 */
const MESSAGES: Partial<Record<DoseCalculationError, string>> = {
  'invalid-amount': 'Enter an amount greater than zero.',
  'invalid-vial-amount': 'The vial amount saved in this setup is not a usable number.',
  'invalid-reconstitution': 'The reconstitution volume saved in this setup is not a usable number.',
  'invalid-units-per-ml': 'The syringe scale saved in this setup is not a usable number.',
};

/**
 * Neutral observations about two numbers the user entered — never judgements
 * about the amount itself. "This is more than your vial holds" is arithmetic;
 * "this is a lot" would be an opinion VITA has no standing to hold.
 */
const CONSISTENCY_NOTES: Record<DoseConsistencyNote, string> = {
  'amount-exceeds-vial':
    'This amount is greater than the total vial amount saved in your setup.',
  'volume-exceeds-reconstitution':
    'This volume is greater than the total reconstitution volume saved in your setup.',
};

/**
 * The dose / unit calculator.
 *
 * **VITA converts; the user decides.** Every number that enters this screen was
 * typed by the person reading it — the vial and water come from their saved
 * setup, the amount from the field below. Nothing here proposes an amount,
 * defaults one, bounds one, or comments on whether one is appropriate. The
 * field is called *Amount Being Used* precisely because the user owns the
 * number and VITA owns only the conversion.
 *
 * **Derived from current setup state on every render.** Concentration is
 * recomputed from `useResolvedSetup` rather than cached, so editing the vial
 * or the water and coming back cannot leave a stale figure behind — a
 * calculator that quietly answers from last week's inputs is worse than one
 * that refuses.
 *
 * **Nothing is persisted.** The amount lives in component state and dies with
 * the screen. Storing it would turn an ephemeral conversion into something
 * that looks like a saved plan, and logging an administration is slice 3.7's
 * job, not this one's.
 *
 * V1 is forward-only: mass → units. The inverse exists and is tested in
 * `model/dose.ts`, but a mode switch is not worth the surface area before
 * anyone has asked for it.
 */
export default function DoseCalculator() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const resolved = useResolvedSetup(setupId);
  const { surfaces } = useTheme();

  /**
   * Blank is the correct initial state. Defaulting an amount — even a
   * harmless-looking one — would be VITA suggesting a number.
   */
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<MassUnit | null>(null);

  const setup = resolved?.setup;
  // Falls back to the setup's display preference, which is a preference about
  // units and says nothing about quantity.
  const amountUnit = unit ?? setup?.preferredDoseUnit ?? 'mg';

  const vial = useMemo(
    () => ({
      vialAmountMcg: setup?.vial?.amountMcg,
      reconstitutionMl: setup?.reconstitutionMl,
      unitsPerMl: setup?.syringe?.unitsPerMl,
    }),
    [setup?.vial?.amountMcg, setup?.reconstitutionMl, setup?.syringe?.unitsPerMl],
  );

  /**
   * An untouched field and a typed "0" are different states.
   *
   * The domain's shared `parseAmount` returns `null` for both, which is right
   * for a form that only cares whether it has a usable number — but here the
   * difference is the whole message: a blank field is where every user starts
   * and must say nothing, while "0" or "abc" is a mistake worth naming. So the
   * text is classified here before the domain sees it.
   */
  const trimmed = amount.trim();
  // `null` means pristine — nothing typed yet — and is distinct from a value
  // that parsed to something unusable.
  const typedValue = trimmed.length === 0 ? null : Number(trimmed);

  // Annotated so the inline refusal keeps `ok: false` literal rather than
  // widening to `boolean`, which would break narrowing at every use below.
  const result = useMemo<DoseCalculationResult | null>(() => {
    if (typedValue === null) return null;
    if (!Number.isFinite(typedValue) || typedValue <= 0) {
      return { ok: false, reason: 'invalid-amount' };
    }
    return calculateSyringeUnits(vial, toMcg(typedValue, amountUnit));
  }, [vial, typedValue, amountUnit]);

  const notes = result?.ok ? doseConsistencyNotes(vial, result) : [];

  if (!resolved || !setup) {
    return (
      <Screen>
        <ScreenHeader title="Calculator" back />
        <EmptyState
          icon="help-circle-outline"
          title="This setup is no longer available"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  /**
   * The calculator cannot run without a vial amount and a reconstitution
   * volume, and it must not invent either. A fabricated "10 mg / 1 mL" would
   * produce a confident, wrong number for someone whose vial is neither —
   * which is the single worst thing this screen could do.
   */
  const incomplete = setup.vial === undefined || setup.reconstitutionMl === undefined;

  if (incomplete) {
    return (
      <Screen>
        <ScreenHeader title="Calculator" back />
        <Text style={[styles.name, { color: surfaces.text }]}>{resolved.name}</Text>
        <Text style={[styles.subtitle, { color: surfaces.textTertiary }]}>Dose / Unit Calculator</Text>

        <EmptyState
          icon="flask-outline"
          title="Add your vial details first"
          body="Add your vial amount and reconstitution volume to use the calculator."
        />
        <Button
          label="Edit setup"
          color={palette.peptide}
          onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}`)}
        />
      </Screen>
    );
  }

  // A pristine field is not an error — it is where the user started.
  const message = result === null || result.ok ? null : MESSAGES[result.reason] ?? null;

  return (
    <Screen>
      <ScreenHeader title="Calculator" back />

      <Text style={[styles.name, { color: surfaces.text }]}>{resolved.name}</Text>
      <Text style={[styles.subtitle, { color: surfaces.textTertiary }]}>Dose / Unit Calculator</Text>

      <VialSummary setup={setup} />

      <SectionHeader title="Amount being used" />
      <View style={styles.amountRow}>
        <View style={styles.amountField}>
          <TextField
            placeholder="e.g. 2"
            keyboardType="decimal-pad"
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
          />
        </View>
      </View>

      {message ? (
        <Text style={[styles.error, { color: palette.fat }]} accessibilityRole="text">
          {message}
        </Text>
      ) : null}

      {result?.ok ? (
        <>
          <DoseResult
            calculation={result}
            vialUnit={setup.vial?.authored.unit ?? setup.preferredDoseUnit}
            amountUnit={amountUnit}
          />

          {notes.map((note) => (
            <Text
              key={note}
              style={[styles.note, { color: surfaces.textTertiary }]}
              accessibilityRole="text"
            >
              {CONSISTENCY_NOTES[note]}
            </Text>
          ))}

          <Text style={[styles.note, { color: surfaces.textTertiary }]}>
            Based on the vial and reconstitution information saved in this setup.
          </Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
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
