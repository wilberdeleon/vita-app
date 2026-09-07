import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, NumericField, SegmentedTabs } from '../../../components/ui';
import {
  MASS_UNITS,
  calculateSyringeUnits,
  convertAuthoredAmount,
  formatConcentration,
  formatMcg,
  formatSyringeUnits,
  roundForDisplay,
  fromMcg,
  toMcg,
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
  /**
   * `false` when the surface around it already names the section — Routine
   * Setup puts the whole calculator behind a disclosure called *Unit
   * conversion calculator*, and a second heading immediately inside it says
   * the same thing twice.
   */
  showHeading?: boolean;
  /**
   * The amount **the user entered for this routine**, when there is a routine
   * at all.
   *
   * `undefined` means there is no routine in this context — the standalone
   * calculator tool, where a generic `1 mg = X units` reference is the whole
   * point. An object means Routine Setup: `amountMcg: null` is a routine
   * whose amount has not been typed yet, which is a different thing from
   * having no routine, and must not be answered with a number VITA chose.
   */
  routine?: { amountMcg: number | null; unit: MassUnit };
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
export function UnitConversion({
  vialAmountMcg,
  reconstitutionMl,
  vialUnit,
  unitsPerMl,
  showHeading = true,
  routine,
}: Props) {
  const { surfaces } = useTheme();

  /**
   * The optional custom conversion, owned here and never lifted.
   *
   * The generated table cannot cover every amount anyone cares about — a
   * low-mass vial produces rows in single micrograms while a user may be
   * thinking in hundreds — and sending them to a second calculator for that
   * would be absurd. So there is one small field for an amount the table
   * misses.
   *
   * **Nothing about it is suggested.** It starts blank, no value is
   * pre-filled, and no row above is marked as a common or typical choice.
   * Keeping the state local also makes "the calculator persists nothing" a
   * structural fact: `Save setup` cannot capture what it cannot see.
   */
  const [custom, setCustom] = useState('');
  const [customUnit, setCustomUnit] = useState<MassUnit>(vialUnit);

  const reference = unitConversionReference(
    { vialAmountMcg, reconstitutionMl, unitsPerMl },
    vialUnit,
  );

  /**
   * What the **user's own amount** comes to on the syringe.
   *
   * The founder's §21 objection: with a routine of 5 mg, the calculator's
   * headline still read `1 mg = 6 units` — mathematically true and not the
   * question anyone had. The subject of this card is now the amount they
   * typed, and the ladder below it is context around that.
   *
   * Computed from `calculateSyringeUnits`, the same canonical function the
   * log flow uses; there is no second conversion engine here.
   */
  const routineResult =
    routine && routine.amountMcg !== null
      ? calculateSyringeUnits({ vialAmountMcg, reconstitutionMl, unitsPerMl }, routine.amountMcg)
      : null;
  const routineUnit = routine?.unit ?? vialUnit;

  /**
   * The reference ladder, with the user's own amount in it.
   *
   * **Never a suggestion.** The ladder is the existing generated one —
   * deterministic, compound-agnostic, unordered by desirability — and the
   * only thing added is a marker on the row that is *theirs*. If their amount
   * already lands on a generated row it is marked in place rather than
   * duplicated; if it does not, it is inserted in numeric order so the column
   * still climbs. No neighbouring amounts are invented around it.
   */
  const rows = (() => {
    const generated = reference.ok ? reference.rows : [];
    if (!routineResult?.ok) return generated.map((entry) => ({ entry, mine: false }));

    const mineMcg = routineResult.amountMcg;
    // Compared as *displayed*, because two rows a user cannot tell apart are
    // one row — the same rule the generated ladder already de-duplicates by.
    const shown = (mcg: number) => roundForDisplay(fromMcg(mcg, routineUnit), routineUnit);
    const already = generated.find((entry) => shown(entry.amountMcg) === shown(mineMcg));
    if (already) {
      return generated.map((entry) => ({ entry, mine: entry === already }));
    }

    const withMine = [
      ...generated.map((entry) => ({ entry, mine: false })),
      {
        entry: { amountMcg: mineMcg, syringeUnits: routineResult.syringeUnits },
        mine: true,
      },
    ];
    return withMine.sort((a, b) => a.entry.amountMcg - b.entry.amountMcg);
  })();

  /**
   * `null` while the field is untouched — blank is where everyone starts and
   * must stay silent. The shared `parseAmount` collapses blank and "0" to the
   * same value, and here the difference is the whole message.
   */
  const trimmed = custom.trim();
  const typed = trimmed.length === 0 ? null : Number(trimmed);
  const customResult =
    typed === null
      ? null
      : !Number.isFinite(typed) || typed <= 0
        ? ({ ok: false } as const)
        : calculateSyringeUnits(
            { vialAmountMcg, reconstitutionMl, unitsPerMl },
            toMcg(typed, customUnit),
          );

  return (
    <>
      {/*
        * A subordinate label, not a section header (founder decision, 3.10A).
        *
        * This used to render a full `SectionHeader`, which made UNIT
        * CONVERSION a peer of VIAL and ROUTINE — three equally loud headings
        * competing down the setup form when only two of them name a group the
        * user has to fill in. The conversion is *derived from* the two fields
        * directly above it and belongs to them, so it is labelled at
        * field weight and sits inside the vial group.
        */}
      {showHeading ? (
        <Text style={[styles.groupLabel, { color: surfaces.textSecondary }]}>Unit conversion</Text>
      ) : null}

      {!reference.ok ? (
        <Text style={[styles.helper, { color: surfaces.textTertiary }]}>
          Enter vial amount and reconstitution volume to see the unit conversion.
        </Text>
      ) : (
        <Card style={styles.card}>
          {/*
           * The headline — **the user's own amount**, wherever there is one.
           *
           * One sentence someone can carry to a syringe and check against:
           * `5 mg = 30 units`. Spoken as a whole rather than as three
           * separate stops.
           *
           * With a routine but no amount typed yet, it says so and stops. It
           * deliberately does **not** fall back to `1 mg = …`, which is the
           * §29 trap: a number VITA picked, rendered in the position of an
           * answer, reads as a suggested amount.
           *
           * The standalone calculator tool passes no routine at all, and
           * there the generic reference is the entire point of the screen.
           */}
          {routine && !routineResult?.ok ? (
            <Text style={[styles.pending, { color: surfaces.textSecondary }]}>
              Enter an amount to see syringe units.
            </Text>
          ) : (
            <Text
              style={[styles.primary, { color: palette.peptide }]}
              accessibilityRole="text"
              accessibilityLabel={
                routineResult?.ok
                  ? `${formatMcg(routineResult.amountMcg, routineUnit)} equals ${formatSyringeUnits(routineResult.syringeUnits)}`
                  : `${formatMcg(reference.primary.amountMcg, vialUnit)} equals ${formatSyringeUnits(reference.primary.syringeUnits)}`
              }
            >
              {routineResult?.ok
                ? `${formatMcg(routineResult.amountMcg, routineUnit)} = ${formatSyringeUnits(routineResult.syringeUnits)}`
                : `${formatMcg(reference.primary.amountMcg, vialUnit)} = ${formatSyringeUnits(reference.primary.syringeUnits)}`}
            </Text>
          )}

          <Text style={[styles.concentration, { color: surfaces.textSecondary }]}>
            Concentration · {formatConcentration(reference.concentrationMcgPerMl, vialUnit)}
          </Text>

          <View style={[styles.table, { borderTopColor: surfaces.border }]}>
            <View style={styles.row}>
              {/*
               * "Reference conversions", never "suggested" or "popular"
               * amounts (§24). These rows are a ruler: a fixed, deterministic,
               * compound-agnostic ladder of the same ratio restated. Nothing
               * is ordered by desirability and nothing is recommended.
               */}
              <Text style={[styles.heading, { color: surfaces.textTertiary }]}>
                REFERENCE CONVERSIONS
              </Text>
              <Text style={[styles.heading, styles.right, { color: surfaces.textTertiary }]}>
                SYRINGE UNITS
              </Text>
            </View>

            {rows.map(({ entry, mine }) => {
              // A marked row is written in the user's own unit, because it is
              // their number; the generated ladder stays in the vial's.
              const amount = formatMcg(entry.amountMcg, mine ? routineUnit : vialUnit);
              const units = formatSyringeUnits(entry.syringeUnits);
              return (
                // One accessible node per line, so a screen reader says
                // "2 mg, 20 units" rather than reading two disconnected columns.
                <View
                  key={`${entry.amountMcg}-${mine ? 'mine' : 'ref'}`}
                  style={styles.row}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${amount}, ${units}${mine ? ', your routine' : ''}`}
                >
                  <View style={styles.amountCell}>
                    <Text
                      style={[
                        styles.cell,
                        mine && styles.mineCell,
                        { color: mine ? palette.peptide : surfaces.text },
                      ]}
                    >
                      {amount}
                    </Text>
                    {/*
                     * "Your routine" — a statement of whose number this is,
                     * not a grade of it. Never "recommended".
                     */}
                    {mine ? (
                      <Text style={[styles.mineTag, { color: palette.peptide }]}>Your routine</Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.cell,
                      styles.right,
                      mine && styles.mineCell,
                      { color: mine ? palette.peptide : surfaces.text },
                    ]}
                  >
                    {units}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={[styles.context, { color: surfaces.textTertiary }]}>
            Using U-100 · {reference.unitsPerMl} units/mL
          </Text>

          {/*
           * Kept inside the same card, below a hairline, rather than given a
           * section of its own. It is a supplement to the reference above,
           * not a peer of it — and the founder's whole objection to earlier
           * versions was an input taking over the page.
           */}
          <View style={[styles.custom, { borderTopColor: surfaces.border }]}>
            <Text style={[styles.customHeading, { color: surfaces.textTertiary }]}>
              CUSTOM CONVERSION
            </Text>

            <View style={styles.customRow}>
              <View style={styles.customField}>
                <NumericField
                  label="Custom Amount"
                  placeholder="e.g. 200"
                  value={custom}
                  onChangeText={setCustom}
                  accessibilityLabel={`Custom amount, in ${customUnit}`}
                />
              </View>
              <View style={styles.customUnit}>
                <SegmentedTabs
                  options={MASS_UNITS as readonly string[]}
                  selectedIndex={MASS_UNITS.indexOf(customUnit)}
                  onChange={(index) => {
                    const next = MASS_UNITS[index];
                    setCustom((text) => convertAuthoredAmount(text, customUnit, next));
                    setCustomUnit(next);
                  }}
                  activeColor={palette.peptide}
                  groupLabel="Custom amount unit"
                />
              </View>
            </View>

            {customResult === null ? null : customResult.ok ? (
              <Text
                style={[styles.customResult, { color: palette.peptide }]}
                accessibilityRole="text"
                accessibilityLabel={`${formatMcg(customResult.amountMcg, customUnit)} equals ${formatSyringeUnits(customResult.syringeUnits)}`}
              >
                = {formatSyringeUnits(customResult.syringeUnits)}
              </Text>
            ) : (
              <Text style={[styles.customError, { color: palette.fat }]}>
                Enter an amount greater than zero.
              </Text>
            )}
          </View>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    // Field weight — the same as "Vial Amount (MG)" above it — so it reads as
    // part of the vial group rather than as a new section.
    ...typography.captionMedium,
    marginTop: spacing.xs,
  },
  helper: {
    ...typography.caption,
  },
  card: {
    gap: 4,
  },
  primary: {
    ...typography.display,
  },
  pending: {
    ...typography.body,
  },
  amountCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexShrink: 1,
  },
  mineCell: {
    fontWeight: '600',
  },
  mineTag: {
    ...typography.micro,
    flexShrink: 1,
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
  custom: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.m,
    paddingTop: spacing.m,
    gap: spacing.xs,
  },
  customHeading: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.m,
  },
  customField: {
    flex: 1,
  },
  customUnit: {
    width: 120,
  },
  customResult: {
    ...typography.heading,
  },
  customError: {
    ...typography.caption,
  },
});
