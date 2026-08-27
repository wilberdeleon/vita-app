import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, NumericField, SegmentedTabs, TextField } from '../../../components/ui';
import { formatLogDateLong, fromDateAndTime, toTimeInput, type LogDate } from '../../../lib/daily';
import {
  MASS_UNITS,
  calculateSyringeUnits,
  convertAuthoredAmount,
  formatSyringeUnits,
  lastRecordedSite,
  toMcg,
  type InjectionSiteSnapshot,
  type MassUnit,
  type PeptideLogDraft,
  type PeptideLogEntry,
  type PeptideSetup,
} from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { SiteSelector } from './SiteSelector';

type Props = {
  visible: boolean;
  name: string;
  setup: PeptideSetup;
  /** The day being recorded. Defaults to today. */
  logDate: LogDate;
  /** True when `logDate` is today, which is what lets the time be implicit. */
  isToday: boolean;
  /** Recent history, only to show what was recorded last. Never a default. */
  history: readonly PeptideLogEntry[];
  onCancel: () => void;
  onConfirm: (draft: PeptideLogDraft) => void;
};

/**
 * Confirming that today's scheduled administration happened.
 *
 * **Compact on purpose.** The whole point of the Today card is that daily
 * tracking takes seconds; routing it through the full log form would have
 * put a date picker and a notes field between the user and one tap. Amount,
 * optionally a site, confirm. Date is not asked at all — this flow only ever
 * describes today, and offering to change it would invite exactly the
 * mistake it cannot detect.
 *
 * **Nothing is prefilled.** No typical dose, no recommended amount, no "same
 * as last time". VITA has no basis for any of them, and a number sitting in
 * the field is a suggestion whatever the label above it says. The last
 * recorded *site* appears as a line of context under the picker — a memory
 * aid the user asked for — while the field itself stays empty.
 *
 * **Units appear only when the setup can produce them.** A pre-filled pen has
 * no vial to convert against; the amount is still recorded, simply without a
 * conversion. There is no `— units` placeholder, which would imply a number
 * went missing.
 */
export function TakenSheet({
  visible,
  name,
  setup,
  logDate,
  isToday,
  history,
  onCancel,
  onConfirm,
}: Props) {
  const { surfaces } = useTheme();

  /**
   * Seeded from the routine, not from a recommendation.
   *
   * Slice 3.9B's whole point: the durable facts were configured once, so the
   * daily flow reads them instead of asking again. This is the number *this
   * user* told VITA they use — nothing here is derived from the catalog, a
   * protocol, or what anyone else takes.
   *
   * Seeded once via `useState`, never re-read: editing today's amount must
   * not be undone by a re-render, and must not write back to the routine.
   */
  const [amount, setAmount] = useState(
    setup.routineAmount ? String(setup.routineAmount.authored.amount) : '',
  );
  const [unit, setUnit] = useState<MassUnit>(
    setup.routineAmount?.authored.unit ?? setup.preferredDoseUnit,
  );
  /** Collapsed by default when the routine already answered the question. */
  const [editingAmount, setEditingAmount] = useState(!setup.routineAmount);
  const [site, setSite] = useState<InjectionSiteSnapshot | undefined>();
  /**
   * Defaulted to now, and always editable.
   *
   * Today's time is genuinely known, so it is filled in rather than asked
   * for — nobody should type the current time. But someone logging at 5pm
   * something they took at 9am must be able to say so, so the field is
   * present and correctable rather than implicit. A past day opens at noon,
   * because that one really is unknown.
   */
  const [time, setTime] = useState(() =>
    isToday ? toTimeInput(new Date().toISOString()) : '12:00',
  );
  const [notes, setNotes] = useState('');
  const timeValid = /^\d{1,2}:\d{2}$/.test(time.trim());

  const parsed = Number(amount.trim());
  const amountValid = amount.trim().length > 0 && Number.isFinite(parsed) && parsed > 0;
  const valid = amountValid && timeValid;

  const conversion = amountValid
    ? calculateSyringeUnits(
        {
          vialAmountMcg: setup.vial?.amountMcg,
          reconstitutionMl: setup.reconstitutionMl,
          unitsPerMl: setup.syringe?.unitsPerMl,
        },
        toMcg(parsed, unit),
      )
    : null;

  const previous = lastRecordedSite(history);

  const confirm = () => {
    if (!valid) return;

    /**
     * Now, as local wall-clock time.
     *
     * Built through the shared date helpers rather than from an ISO string:
     * an evening administration read back through a UTC slice lands on
     * tomorrow, which is the exact defect slice 3.7 shipped and had to fix.
     */
    const now = new Date();
    const loggedAt = fromDateAndTime(logDate, time.trim()) ?? now.toISOString();

    onConfirm({
      authoredAmount: parsed,
      authoredUnit: unit,
      loggedAt,
      ...(site ? { site } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: surfaces.background }]}>
        <View style={styles.head}>
          <View>
            <Text style={[styles.title, { color: surfaces.text }]}>{name}</Text>
            <Text style={[styles.subtitle, { color: surfaces.textTertiary }]}>
              {isToday ? "Recording today's administration" : formatLogDateLong(logDate)}
            </Text>
          </View>
          <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel" hitSlop={10}>
            <Ionicons name="close" size={22} color={surfaces.textSecondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/*
           * The amount reads as settled unless the user says otherwise.
           *
           * A text field sitting open invites retyping something that is
           * already correct; a stated value with one way to change it does
           * not. Changing it here affects today only — the routine is
           * untouched, which is why this never writes back.
           */}
          {!editingAmount ? (
            <View style={styles.settled}>
              <View style={styles.settledText}>
                <Text style={[styles.settledAmount, { color: surfaces.text }]}>
                  {amount} {unit}
                  {conversion?.ok ? ` · ${formatSyringeUnits(conversion.syringeUnits)}` : ''}
                </Text>
                <Text style={[styles.settledNote, { color: surfaces.textTertiary }]}>
                  From your routine
                </Text>
              </View>
              <Pressable
                onPress={() => setEditingAmount(true)}
                accessibilityRole="button"
                accessibilityLabel="Change amount for today"
                hitSlop={8}
              >
                <Text style={[styles.change, { color: palette.peptide }]}>Change</Text>
              </Pressable>
            </View>
          ) : (
          <View style={styles.amountRow}>
            <View style={styles.amountField}>
              <NumericField
                label={`Amount (${unit})`}
                placeholder="e.g. 2"
                value={amount}
                onChangeText={setAmount}
                accessibilityLabel={`Amount in ${unit}`}
              />
            </View>
            {/* Fixed width, as on the log form. Left to size itself the
                toggle takes the whole row and squeezes the field to a sliver. */}
            <View style={styles.unitControl}>
              <SegmentedTabs
                options={[...MASS_UNITS]}
                selectedIndex={MASS_UNITS.indexOf(unit)}
                onChange={(index) => {
                  // Restates the amount rather than reinterpreting it, exactly
                  // as the calculator and the log form do: 2 mg becomes
                  // 2000 mcg, never 2 mcg.
                  const next = MASS_UNITS[index];
                  setAmount(convertAuthoredAmount(amount, unit, next));
                  setUnit(next);
                }}
                activeColor={palette.peptide}
                groupLabel="Amount unit"
              />
            </View>
          </View>
          )}

          {/* Only when the setup can actually produce a conversion, and only
              while editing — the settled row already carries it. A pre-filled
              pen has no vial, and the amount is recorded anyway. */}
          {editingAmount && conversion?.ok ? (
            <Text style={[styles.units, { color: palette.peptide }]}>
              {formatSyringeUnits(conversion.syringeUnits)}
            </Text>
          ) : null}

          <TextField
            label="Time"
            placeholder="e.g. 08:30"
            value={time}
            onChangeText={setTime}
            accessibilityLabel="Time in 24-hour format"
          />

          <SiteSelector
            value={site}
            onChange={setSite}
            lastRecordedLabel={previous?.site.label}
          />

          {/* One optional line. Nothing is required to record that something
              happened beyond the amount and the time. */}
          <TextField
            label="Notes"
            placeholder="Optional"
            value={notes}
            onChangeText={setNotes}
            accessibilityLabel="Notes, optional"
          />

          <Button
            label="Confirm Taken"
            color={palette.peptide}
            onPress={confirm}
            disabled={!valid}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '88%',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.s,
  },
  title: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.caption,
  },
  body: {
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
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
    width: 120,
  },
  units: {
    ...typography.bodyMedium,
    marginTop: -spacing.xs,
  },
  settled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  settledText: {
    flex: 1,
    gap: 2,
  },
  settledAmount: {
    ...typography.heading,
  },
  settledNote: {
    ...typography.caption,
  },
  change: {
    ...typography.caption,
  },
});
