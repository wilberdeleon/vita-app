import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip, SectionHeader, SegmentedTabs, Stepper, TextField } from '../../../components/ui';
import { isValidLogDate, todayLogDate, type LogDate } from '../../../lib/daily';
import {
  DEFAULT_UNITS_PER_ML,
  MASS_UNITS,
  WEEKDAY_INDEXES,
  parseAmount,
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

/**
 * Common insulin-syringe graduation densities.
 *
 * Labelled by density, not capacity — a "0.5 mL / 50 unit" syringe is still
 * U-100, and letting a user pick "50" here because their syringe holds 50
 * units would corrupt every calculation slice 3.6 builds on this value. The
 * caption below the control says so in words.
 */
const SYRINGE_PRESETS = [
  { unitsPerMl: DEFAULT_UNITS_PER_ML, label: 'U-100' },
  { unitsPerMl: 50, label: 'U-50' },
  { unitsPerMl: 40, label: 'U-40' },
] as const;

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

  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [vialAmount, setVialAmount] = useState(
    initial?.vial ? String(initial.vial.authored.amount) : '',
  );
  const [vialUnit, setVialUnit] = useState<MassUnit>(initial?.vial?.authored.unit ?? 'mg');
  const [reconstitution, setReconstitution] = useState(
    initial?.reconstitutionMl !== undefined ? String(initial.reconstitutionMl) : '',
  );
  const [unitsPerMl, setUnitsPerMl] = useState<number | null>(initial?.syringe?.unitsPerMl ?? null);
  const [doseUnit, setDoseUnit] = useState<MassUnit>(initial?.preferredDoseUnit ?? 'mg');
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
      vialUnit,
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
      vialUnit: MassUnit;
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
        vial: vial !== null ? vialFrom({ amount: vial, unit: state.vialUnit }) : undefined,
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
      <SectionHeader title="Name" />
      <TextField
        label="Display name (optional)"
        placeholder="Leave blank to use the peptide name"
        value={displayName}
        onChangeText={(text) => {
          setDisplayName(text);
          emit({ displayName: text });
        }}
        accessibilityLabel="Display name, optional"
      />

      <SectionHeader title="Vial" />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Optional. Add these only if you reconstitute a vial yourself.
      </Text>
      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label={`Vial amount (${vialUnit})`}
            placeholder="e.g. 10"
            keyboardType="decimal-pad"
            value={vialAmount}
            onChangeText={(text) => {
              setVialAmount(text);
              emit({ vialAmount: text });
            }}
            accessibilityLabel={`Vial amount in ${vialUnit}, optional`}
          />
        </View>
        <View style={styles.unitControl}>
          <SegmentedTabs
            options={MASS_UNITS as readonly string[]}
            selectedIndex={MASS_UNITS.indexOf(vialUnit)}
            onChange={(index) => {
              const next = MASS_UNITS[index];
              setVialUnit(next);
              emit({ vialUnit: next });
            }}
            activeColor={palette.peptide}
          />
        </View>
      </View>
      {vialInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      {/*
        * Familiar language on screen, generic name in the model. Bacteriostatic
        * water is what most people actually add, but `reconstitutionMl` does
        * not assume it is the only possible diluent.
        */}
      <TextField
        label="Bacteriostatic water / reconstitution (mL)"
        placeholder="e.g. 1"
        keyboardType="decimal-pad"
        value={reconstitution}
        onChangeText={(text) => {
          setReconstitution(text);
          emit({ reconstitution: text });
        }}
        accessibilityLabel="Bacteriostatic water or reconstitution volume in millilitres, optional"
      />
      {reconInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      <SectionHeader title="Syringe" />
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Optional. Choose by the units marked per millilitre, not by how much the syringe holds — a
        0.5 mL syringe marked to 50 units is still U-100.
      </Text>
      <View style={styles.chips}>
        {SYRINGE_PRESETS.map((preset) => (
          <Chip
            key={preset.unitsPerMl}
            label={`${preset.label} · ${preset.unitsPerMl} units/mL`}
            selected={unitsPerMl === preset.unitsPerMl}
            color={palette.peptide}
            onPress={() => {
              const next = unitsPerMl === preset.unitsPerMl ? null : preset.unitsPerMl;
              setUnitsPerMl(next);
              emit({ unitsPerMl: next });
            }}
          />
        ))}
      </View>

      <SectionHeader title="Preferred unit" />
      <SegmentedTabs
        options={MASS_UNITS as readonly string[]}
        selectedIndex={MASS_UNITS.indexOf(doseUnit)}
        onChange={(index) => {
          const next = MASS_UNITS[index];
          setDoseUnit(next);
          emit({ doseUnit: next });
        }}
        activeColor={palette.peptide}
      />
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
            label="Optional (YYYY-MM-DD)"
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
    </>
  );
}

const styles = StyleSheet.create({
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
