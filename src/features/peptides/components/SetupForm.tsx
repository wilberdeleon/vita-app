import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Chip,
  NumericField,
  NumericKeyboardAccessory,
  SectionHeader,
  SegmentedTabs,
  Stepper,
  TextField,
} from '../../../components/ui';
import { isValidLogDate, todayLogDate, type LogDate } from '../../../lib/daily';
import { UnitConversion } from './UnitConversion';
import {
  DEFAULT_UNITS_PER_ML,
  WEEKDAY_INDEXES,
  parseAmount,
  fromMcg,
  toMcg,
  sortedDays,
  vialFrom,
  weekdayLong,
  weekdayShort,
  type MassUnit,
  type PeptideSchedule,
  type PeptideSetup,
  type PeptideSetupDraft,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type ScheduleKind = PeptideSchedule['kind'];

const SCHEDULE_KINDS: readonly ScheduleKind[] = ['daily', 'daysOfWeek', 'everyNDays', 'asNeeded'];
/**
 * User-facing wording. The model still says `everyNDays` — internal code does
 * not have to mirror the copy, and "Every N" is programmer language that
 * leaked onto a screen.
 */
const SCHEDULE_LABELS = ['Daily', 'Selected days', 'Every X days', 'As needed'];

export type SetupFormValue = PeptideSetupDraft & { active?: boolean };

type Props = {
  /** Seeds the form once. Empty for a new setup. */
  initial?: PeptideSetup;
  onChange: (value: SetupFormValue, isValid: boolean) => void;
};

/**
 * Everything a user may configure about how they track one compound.
 *
 * **Only the compound itself is required**, and it is chosen before this form
 * opens. Every field here is optional: a GLP-1 pen user reconstitutes nothing
 * and must not be made to answer vial questions to record that they are
 * tracking something. Nothing is pre-filled with a plausible number, because a
 * pre-filled vial size or schedule would be VITA suggesting an answer.
 *
 * There is no dose field of any kind. VITA does not store a "typical",
 * "recommended", or "standard" amount — it has no basis for one, and a field
 * with that name would imply it did.
 */
export function SetupForm({ initial, onChange }: Props) {
  const { surfaces } = useTheme();

  /**
   * Read, never edited, never dropped (slice 3.9).
   *
   * The Display Name input is gone, but the value has to survive a save.
   * `applySetupChanges` deletes any key passed as `undefined`, so emitting
   * nothing here would quietly erase what an old setup was called the first
   * time its owner edited anything else. It round-trips instead: invisible,
   * unread, and intact.
   */
  const [displayName] = useState(initial?.displayName ?? '');
  /**
   * Always shown in milligrams, whatever it was authored in.
   *
   * Derived from canonical `amountMcg` rather than from `authored.amount`, so
   * a setup saved before slice 3.9A as `5000 mcg` displays as `5` — not as
   * `5000`, which would silently become a five-gram vial the next time it was
   * saved. Converting is the migration; there is nothing to rewrite on disk.
   */
  const [vialAmount, setVialAmount] = useState(
    initial?.vial ? String(fromMcg(initial.vial.amountMcg, 'mg')) : '',
  );
  const [reconstitution, setReconstitution] = useState(
    initial?.reconstitutionMl !== undefined ? String(initial.reconstitutionMl) : '',
  );
  /**
   * Syringe graduation density. **No longer asked for** (founder decision,
   * slice 3.5B): people were being made to choose between U-100, U-50 and
   * U-40 when what they actually see on the box is a *capacity* — 0.3 mL,
   * 0.5 mL, 1 mL — and those are different things. A 0.5 mL syringe marked to
   * 50 units is still U-100.
   *
   * V1 therefore assumes the ordinary U-100 scale, 100 units per mL, and the
   * calculator in 3.6 will state that assumption beside its result. An
   * existing setup keeps whatever it already had, and the field stays on the
   * model so another scale can be supported without a migration.
   */
  const [unitsPerMl] = useState<number | null>(initial?.syringe?.unitsPerMl ?? DEFAULT_UNITS_PER_ML);
  /**
   * Kept on the model, no longer asked for. Existing setups keep whatever
   * they had; new ones default to mg. Recording an amount still offers both
   * units, beside the number being typed, where the choice is meaningful.
   */
  const [doseUnit] = useState<MassUnit>(initial?.preferredDoseUnit ?? 'mg');
  const [scheduleKind, setScheduleKind] = useState<ScheduleKind | null>(initial?.schedule?.kind ?? null);
  const [days, setDays] = useState<number[]>(
    initial?.schedule?.kind === 'daysOfWeek' ? initial.schedule.days : [],
  );
  const [everyN, setEveryN] = useState(
    initial?.schedule?.kind === 'everyNDays' ? initial.schedule.n : 2,
  );
  const [startDate, setStartDate] = useState<LogDate>(initial?.startDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const vialParsed = parseAmount(vialAmount);
  const reconParsed = parseAmount(reconstitution);
  const startDateValid = startDate.length === 0 || isValidLogDate(startDate);

  /**
   * A partially-typed optional field makes the form invalid rather than being
   * silently dropped. Saving "10" as no vial at all because the user hadn't
   * finished typing would lose data they believe they entered.
   */
  const vialInvalid = vialAmount.trim().length > 0 && vialParsed === null;
  const reconInvalid = reconstitution.trim().length > 0 && reconParsed === null;

  const emit = (overrides: Partial<Record<string, unknown>> = {}) => {
    const state = {
      displayName,
      vialAmount,
      reconstitution,
      unitsPerMl,
      doseUnit,
      scheduleKind,
      days,
      everyN,
      startDate,
      notes,
      ...overrides,
    } as {
      displayName: string;
      vialAmount: string;
      reconstitution: string;
      unitsPerMl: number | null;
      doseUnit: MassUnit;
      scheduleKind: ScheduleKind | null;
      days: number[];
      everyN: number;
      startDate: LogDate;
      notes: string;
    };

    const vial = parseAmount(state.vialAmount);
    const recon = parseAmount(state.reconstitution);
    const dateOk = state.startDate.length === 0 || isValidLogDate(state.startDate);
    const valid =
      !(state.vialAmount.trim().length > 0 && vial === null) &&
      !(state.reconstitution.trim().length > 0 && recon === null) &&
      dateOk;

    let schedule: PeptideSchedule | undefined;
    switch (state.scheduleKind) {
      case 'daily':
        schedule = { kind: 'daily' };
        break;
      case 'asNeeded':
        schedule = { kind: 'asNeeded' };
        break;
      case 'everyNDays':
        schedule = { kind: 'everyNDays', n: state.everyN };
        break;
      case 'daysOfWeek':
        // No days chosen yet is not a schedule; leaving it undefined is more
        // honest than storing an empty set that means nothing.
        schedule = state.days.length > 0 ? { kind: 'daysOfWeek', days: sortedDays(state.days) } : undefined;
        break;
      default:
        schedule = undefined;
    }

    onChange(
      {
        displayName: state.displayName.trim() || undefined,
        vial: vial !== null ? vialFrom({ amount: vial, unit: 'mg' }) : undefined,
        reconstitutionMl: recon ?? undefined,
        syringe: state.unitsPerMl !== null ? { unitsPerMl: state.unitsPerMl } : undefined,
        preferredDoseUnit: state.doseUnit,
        schedule,
        startDate: dateOk && state.startDate.length > 0 ? state.startDate : undefined,
        notes: state.notes.trim() || undefined,
      },
      valid,
    );
  };

  const toggleDay = (day: number) => {
    const next = days.includes(day) ? days.filter((candidate) => candidate !== day) : [...days, day];
    setDays(next);
    emit({ days: next });
  };

  return (
    <>
      {/*
        * No name field (slice 3.9).
        *
        * A routine is named by the peptide it tracks — catalog or custom —
        * and a second place to name it only creates two answers to the same
        * question. Stored `displayName` values from earlier setups survive on
        * disk untouched; they are simply no longer read.
        */}

      <SectionHeader title="Vial" />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Optional. Add these only if you reconstitute a vial yourself.
      </Text>
      {/*
        * Milligrams only (slice 3.9A).
        *
        * Vials are labelled in mg — nobody reads "10000 mcg" off a vial — and
        * the toggle offered a choice whose wrong answer was catastrophic and
        * invisible: a vial entered as mcg instead of mg is off by a thousand,
        * and every syringe number derived from it is wrong in the same
        * direction. Removing the choice removes the failure.
        *
        * Nothing changes underneath: `amountMcg` is still canonical, and a
        * legacy setup authored in mcg is converted for display rather than
        * reinterpreted.
        */}
      <NumericField
        label="Vial Amount (MG)"
        placeholder="e.g. 10"
        value={vialAmount}
        onChangeText={(text) => {
          setVialAmount(text);
          emit({ vialAmount: text });
        }}
        accessibilityLabel="Vial amount in milligrams, optional"
      />
      {vialInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      {/*
        * One idea in the label, the detail underneath it.
        *
        * "Bacteriostatic Water / Reconstitution (mL)" put two names for the
        * same number in one line and made the form read as technical. The
        * label now names the measurement; the helper says what it is. The
        * model keeps the generic `reconstitutionMl`, which does not assume
        * bacteriostatic water is the only possible diluent.
        */}
      <NumericField
        label="Reconstitution Volume (ML)"
        placeholder="e.g. 1"
        value={reconstitution}
        onChangeText={(text) => {
          setReconstitution(text);
          emit({ reconstitution: text });
        }}
        accessibilityLabel="Reconstitution volume in millilitres, optional"
      />
      <Text style={[styles.helper, { color: surfaces.textTertiary }]}>
        Bacteriostatic water added to the vial.
      </Text>
      {reconInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      {/*
        * The unit conversion, immediately beneath the vial it is derived from.
        *
        * It reads the **draft** values above — the live text in those two
        * fields — not the saved setup, so it appears while someone is still
        * filling the form in. There is nothing else to enter: the vial and
        * the water already fix the entire relationship between mass and
        * syringe units, so asking for a third number would only make the user
        * do arithmetic before VITA would do arithmetic for them.
        */}
      <UnitConversion
        vialAmountMcg={vialParsed !== null ? toMcg(vialParsed, 'mg') : undefined}
        reconstitutionMl={reconParsed ?? undefined}
        vialUnit="mg"
        unitsPerMl={unitsPerMl ?? undefined}
      />

      {/*
        * No Preferred Unit control (slice 3.9A).
        *
        * It asked the user to answer, up front and out of context, a question
        * that only matters at the moment they record an amount — where the
        * mg/mcg toggle still sits, right beside the number they are typing.
        * The stored value is kept for backward compatibility and defaults to
        * mg for new routines.
        */}
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        How amounts are shown for this peptide. A display preference, not a recommended amount.
      </Text>

      <SectionHeader title="Schedule" />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Optional, and entirely yours to choose.
      </Text>
      <SegmentedTabs
        options={SCHEDULE_LABELS}
        selectedIndex={scheduleKind ? SCHEDULE_KINDS.indexOf(scheduleKind) : -1}
        onChange={(index) => {
          const next = SCHEDULE_KINDS[index];
          const cleared = scheduleKind === next ? null : next;
          setScheduleKind(cleared);
          emit({ scheduleKind: cleared });
        }}
        activeColor={palette.peptide}
      />

      {scheduleKind === 'daysOfWeek' ? (
        <View style={styles.chips}>
          {WEEKDAY_INDEXES.map((day) => (
            <Chip
              key={day}
              label={weekdayShort(day)}
              // "Mon" is fine to read and poor to hear; the full name is spoken.
              accessibilityLabel={weekdayLong(day)}
              selected={days.includes(day)}
              color={palette.peptide}
              onPress={() => toggleDay(day)}
            />
          ))}
        </View>
      ) : null}

      {scheduleKind === 'everyNDays' ? (
        <>
          <Text style={[styles.note, { color: surfaces.textSecondary }]}>Repeat every</Text>
          <Stepper
            value={everyN}
            min={2}
            max={90}
            suffix="days"
            onChange={(next) => {
              setEveryN(next);
              emit({ everyN: next });
            }}
          />
        </>
      ) : null}

      <SectionHeader title="Start date" />
      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label="Date (YYYY-MM-DD)"
            placeholder="2026-08-23"
            autoCapitalize="none"
            autoCorrect={false}
            value={startDate}
            onChangeText={(text) => {
              setStartDate(text);
              emit({ startDate: text });
            }}
            accessibilityLabel="Start date, optional, year dash month dash day"
          />
        </View>
        <Chip
          label="Today"
          color={palette.peptide}
          onPress={() => {
            const today = todayLogDate();
            setStartDate(today);
            emit({ startDate: today });
          }}
        />
      </View>
      {!startDateValid ? (
        <Text style={[styles.error, { color: palette.fat }]}>
          Use a real date in YYYY-MM-DD form.
        </Text>
      ) : null}

      <SectionHeader title="Notes" />
      <TextField
        placeholder="Anything you want to remember"
        multiline
        numberOfLines={3}
        value={notes}
        onChangeText={(text) => {
          setNotes(text);
          emit({ notes: text });
        }}
        style={styles.notes}
        accessibilityLabel="Notes, optional"
      />

      {/* One accessory bar for every numeric field on this form. */}
      <NumericKeyboardAccessory />
    </>
  );
}

const styles = StyleSheet.create({
  helper: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  note: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  error: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.m,
    alignItems: 'flex-end',
  },
  grow: {
    flex: 1,
  },
  unitControl: {
    width: 120,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  notes: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
