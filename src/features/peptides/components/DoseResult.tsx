import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import {
  formatConcentration,
  formatMcg,
  formatSyringeUnits,
  formatVolume,
  type DoseCalculation,
  type MassUnit,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  calculation: DoseCalculation;
  /** The unit the user authored their vial in — the concentration is shown in it. */
  vialUnit: MassUnit;
  /** The unit the amount was entered in, so the working reads back as typed. */
  amountUnit: MassUnit;
};

/**
 * The answer, and the arithmetic behind it.
 *
 * One number dominates — the syringe units, which is the only figure anyone
 * actually acts on. Everything else supports it in descending size: the
 * equivalent volume, then the concentration, then the full working. The
 * founder's note was explicit about not showing five giant numbers competing
 * for attention, and a calculator that presents its inputs as loudly as its
 * output makes the reader do the ranking themselves.
 *
 * **The working is shown because the founder asked for the maths to be
 * visible**, and because a result you can check is a result you can trust. It
 * is rendered from the same `DoseCalculation` the headline uses, never
 * recomputed, so the explanation cannot drift from the answer it explains.
 */
export function DoseResult({ calculation, vialUnit, amountUnit }: Props) {
  const { surfaces } = useTheme();
  const reduceMotion = useReducedMotion();

  const concentration = formatConcentration(calculation.concentrationMcgPerMl, vialUnit);
  const amount = formatMcg(calculation.amountMcg, amountUnit);
  const volume = formatVolume(calculation.volumeMl);
  const units = formatSyringeUnits(calculation.syringeUnits);

  /**
   * A short fade as the answer changes, so a recalculation registers as an
   * event rather than silently swapping digits. Reduce Motion lands on the
   * final value directly — same contract as the water fill in slice 3.4. No
   * number rolling: this is a value to read, not an animation to watch.
   */
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduceMotion) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0.4);
    const animation = Animated.timing(fade, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [fade, reduceMotion, units, volume]);

  return (
    <Card style={styles.card}>
      <Text style={[styles.label, { color: surfaces.textTertiary }]}>CALCULATED SYRINGE AMOUNT</Text>

      {/*
       * The whole result is one accessible node. A screen reader announcing
       * "20", "units", "Equivalent to", "0.2 mL" as four stops makes the
       * reader assemble the answer; announcing it as a sentence does not.
       * The value is never carried by colour alone — it is the largest text
       * on the screen and it is spoken in full.
       */}
      <Animated.View
        style={{ opacity: fade }}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Calculated syringe amount: ${units}. Equivalent to ${volume}.`}
      >
        <Text style={[styles.value, { color: palette.peptide }]}>{units}</Text>
        <Text style={[styles.equivalent, { color: surfaces.textSecondary }]}>
          Equivalent to {volume}
        </Text>
      </Animated.View>

      <View style={[styles.working, { borderTopColor: surfaces.border }]}>
        <Text
          style={[styles.workingLine, { color: surfaces.textSecondary }]}
          accessibilityLabel={`Working: ${concentration} concentration. ${amount} equals ${volume}, which is ${units}.`}
        >
          {concentration} · {amount} = {volume} = {units}
        </Text>
        <Text style={[styles.context, { color: surfaces.textTertiary }]}>
          Using U-100 · {calculation.unitsPerMl} units/mL
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  label: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  value: {
    ...typography.display,
  },
  equivalent: {
    ...typography.body,
    marginTop: 2,
  },
  working: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.s,
    paddingTop: spacing.s,
    gap: 4,
  },
  workingLine: {
    ...typography.caption,
  },
  context: {
    ...typography.micro,
  },
});
