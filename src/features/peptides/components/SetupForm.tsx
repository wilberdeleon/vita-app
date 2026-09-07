import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Chip,
  NumericField,
  SegmentedTabs,
  Stepper,
  TextField,
} from '../../../components/ui';
import { Disclosure } from './Disclosure';
import { PreparationChoice, type PreparationMode } from './PreparationChoice';
import { isValidLogDate, todayLogDate, type LogDate } from '../../../lib/daily';
import { UnitConversion } from './UnitConversion';
import {
  DEFAULT_UNITS_PER_ML,
  WEEKDAY_INDEXES,
  calculateSyringeUnits,
  formatMcg,
  formatSyringeUnits,
  parseAmount,
  unitConversionReference,
  fromMcg,
  MASS_UNITS,
  convertAuthoredAmount,
  routineAmountFrom,
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
  /**
   * `'new'` for a routine that has never been configured, `'edit'` for one
   * that is already running. It changes **what opens by default and nothing
   * else** — every field exists, is reachable, and behaves identically in
   * both. See the note on `SetupForm`.
   */
  mode?: 'new' | 'edit';
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
 *
 * ## Progressive disclosure, one form (slice 5.5)
 *
 * The founders' review was that this screen showed too much at once: vial,
 * reconstitution, a conversion table, custom conversion, routine amount,
 * schedule, reminder, start date and notes, all in one scroll. Someone
 * opening it to change a schedule had to scroll past a calculator to reach
 * one control.
 *
 * **Nothing was removed and nothing was duplicated.** It is still one form
 * and one component; what changed is what is open when it loads. Amount,
 * schedule and reminder — the fields people actually edit — are visible.
 * *More options* holds start date and notes. *Preparation* holds the vial,
 * the water, the conversion and the custom conversion, collapsed behind a
 * summary line, and **open by default only for a routine that has never been
 * configured**, where it is the reason the screen exists.
 *
 * `mode` changes that default and nothing else. Every field is present,
 * reachable and identical in both.
 */
export function SetupForm({ initial, onChange, mode = 'edit' }: Props) {
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
  /**
   * What this routine usually uses — configured once, reused every day.
   *
   * The whole point of slice 3.9B: the durable facts live here, and the daily
   * flow reads them rather than asking again. Never prefilled from a catalog
   * value or a protocol; it is blank until the user types their own number.
   */
  const [routineAmount, setRoutineAmount] = useState(
    initial?.routineAmount ? String(initial.routineAmount.authored.amount) : '',
  );
  const [routineUnit, setRoutineUnit] = useState<MassUnit>(
    initial?.routineAmount?.authored.unit ?? 'mg',
  );
  /**
   * How this compound reaches the user — asked only when setting a routine up
   * for the first time.
   *
   * `null` means unanswered — the state a genuinely new routine starts in.
   * Two cases are never asked. An already-running routine opens straight onto
   * the collapsed Preparation section it always had, because someone changing
   * a schedule answered this long ago. And a setup that *already carries* a
   * vial or a reconstitution volume has answered it by having one: showing
   * that person a choice, with their own values hidden behind one of its
   * branches, would be asking a question whose answer is on the screen. See
   * the note on the two orders at the bottom of this file.
   */
  const [preparation, setPreparation] = useState<PreparationMode>(
    mode !== 'new' || initial?.vial || initial?.reconstitutionMl !== undefined
      ? 'configure'
      : null,
  );
  const [reminderOn, setReminderOn] = useState(initial?.reminder?.enabled ?? false);
  const [reminderTime, setReminderTime] = useState(initial?.reminder?.timeLocal ?? '09:00');
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
  const routineParsed = parseAmount(routineAmount);
  const routineInvalid = routineAmount.trim().length > 0 && routineParsed === null;
  const reminderInvalid = reminderOn && !/^\d{1,2}:\d{2}$/.test(reminderTime.trim());

  const emit = (overrides: Partial<Record<string, unknown>> = {}) => {
    const state = {
      displayName,
      vialAmount,
      reconstitution,
      unitsPerMl,
      doseUnit,
      routineAmount,
      routineUnit,
      reminderOn,
      reminderTime,
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
      routineAmount: string;
      routineUnit: MassUnit;
      reminderOn: boolean;
      reminderTime: string;
      scheduleKind: ScheduleKind | null;
      days: number[];
      everyN: number;
      startDate: LogDate;
      notes: string;
    };

    const vial = parseAmount(state.vialAmount);
    const recon = parseAmount(state.reconstitution);
    const routine = parseAmount(state.routineAmount);
    const dateOk = state.startDate.length === 0 || isValidLogDate(state.startDate);
    const timeOk = !state.reminderOn || /^\d{1,2}:\d{2}$/.test(state.reminderTime.trim());
    const valid =
      !(state.vialAmount.trim().length > 0 && vial === null) &&
      !(state.reconstitution.trim().length > 0 && recon === null) &&
      !(state.routineAmount.trim().length > 0 && routine === null) &&
      dateOk &&
      timeOk;

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
        routineAmount:
          routine !== null ? routineAmountFrom({ amount: routine, unit: state.routineUnit }) : undefined,
        reminder: state.reminderOn
          ? { enabled: true, timeLocal: state.reminderTime.trim() }
          : { enabled: false },
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

  /**
   * What Preparation says while it is closed.
   *
   * Read from the **draft** fields rather than from the saved setup, so it
   * updates as someone types and is honest the moment they change a vial.
   * An unconfigured routine says what the section is for rather than
   * pretending to summarise nothing.
   */
  const preparationSummary = vialAmount.trim()
    ? `${vialAmount.trim()} mg vial${reconstitution.trim() ? ` · ${reconstitution.trim()} mL` : ''}`
    : 'Optional — for vials you reconstitute yourself';

  /**
   * The decision, and what follows from it.
   *
   * Choosing *Already prepared* **clears** anything typed into the vial
   * fields rather than keeping it aside. Someone who says the compound
   * arrives ready to use should not have a half-finished vial amount saved
   * underneath that statement, and a value the form is no longer showing is a
   * value the user cannot correct.
   */
  const choosePreparation = (next: Exclude<PreparationMode, null>) => {
    setPreparation(next);
    if (next === 'already-prepared') {
      setVialAmount('');
      setReconstitution('');
      emit({ vialAmount: '', reconstitution: '' });
    }
  };

  /**
   * The one line the calculator can be collapsed behind — `1 mg = 20 units`.
   *
   * Built from the same reference the table is, so it cannot disagree with
   * what opening it would show. `null` until both vial fields hold real
   * numbers, because there is no conversion to summarise before then.
   */
  const conversion = unitConversionReference(
    {
      vialAmountMcg: vialParsed !== null ? toMcg(vialParsed, 'mg') : undefined,
      reconstitutionMl: reconParsed ?? undefined,
      unitsPerMl: unitsPerMl ?? undefined,
    },
    'mg',
  );

  /**
   * The routine amount, canonical — the calculator's subject since 5.5D.
   *
   * `null` while the field is blank or half-typed, which the calculator
   * reports as *enter an amount* rather than answering with a number nobody
   * chose.
   */
  const routineAmountMcg = routineParsed !== null ? toMcg(routineParsed, routineUnit) : null;

  const routineUnits = calculateSyringeUnits(
    {
      vialAmountMcg: vialParsed !== null ? toMcg(vialParsed, 'mg') : undefined,
      reconstitutionMl: reconParsed ?? undefined,
      unitsPerMl: unitsPerMl ?? undefined,
    },
    routineAmountMcg ?? undefined,
  );

  /**
   * What the collapsed calculator says — `5 mg = 30 units`, their own amount.
   *
   * Founder §28: with a routine of 5 mg the closed summary read
   * `1 mg = 6 units`, which is the one number on that line nobody asked for.
   * `null` when there is no amount yet, so the section shows its title and
   * nothing that looks like an answer.
   */
  const conversionSummary = routineUnits.ok
    ? `${formatMcg(routineUnits.amountMcg, routineUnit)} = ${formatSyringeUnits(routineUnits.syringeUnits)}`
    : null;

  /**
   * The vial fields and the calculator — identical in both orders.
   *
   * Extracted so New Setup and Edit can present them at different points in
   * the screen without owning two copies of them. There is one set of fields,
   * one piece of validation and one emit path; only the surrounding
   * hierarchy differs.
   */
  const preparationFields = (
    <>
      {/*
        * Milligrams only (slice 3.9A).
        *
        * Vials are labelled in mg — nobody reads "10000 mcg" off a vial — and
        * the toggle offered a choice whose wrong answer was catastrophic and
        * invisible: a vial entered as mcg instead of mg is off by a thousand,
        * and every syringe number derived from it is wrong in the same
        * direction. Removing the choice removes the failure.
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
        * One idea in the label, the detail underneath it. The model keeps the
        * generic `reconstitutionMl`, which does not assume bacteriostatic
        * water is the only possible diluent.
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

    </>
  );

  /**
   * The calculator — **after the amount it is about** (founder direction,
   * 5.5D §17).
   *
   * It sat inside Preparation, above the Routine amount, which put the
   * arithmetic before its own input: someone met a conversion table before
   * they had told VITA the number they wanted converted. It now follows
   * Amount directly, and answers *how many syringe units is the amount I
   * entered* — which is the only question it was ever for.
   *
   * **Shown only when the preparation math is real** (§30). With no vial, no
   * reconstitution volume, or *Already prepared*, there is no concentration,
   * so there is nothing to calculate and no section — rather than a section
   * that appears and then explains that it cannot help. That also means the
   * *Already prepared* path never sees it, which is §19.
   *
   * Identical in both orders: nothing here depends on `mode`, so a routine
   * being edited gets the same routine-aware result as one being created.
   */
  const calculatorSection = conversion.ok ? (
    <Disclosure title="Unit conversion calculator" summary={conversionSummary}>
      <UnitConversion
        vialAmountMcg={vialParsed !== null ? toMcg(vialParsed, 'mg') : undefined}
        reconstitutionMl={reconParsed ?? undefined}
        vialUnit="mg"
        unitsPerMl={unitsPerMl ?? undefined}
        showHeading={false}
        routine={{ amountMcg: routineAmountMcg, unit: routineUnit }}
      />
    </Disclosure>
  ) : null;

  /**
   * Preparation as the opening question — New Setup only.
   *
   * **It never becomes mandatory by being first.** Leaving the question
   * unanswered, or answering it and typing nothing, both save a valid
   * routine; the Routine fields below are visible and editable throughout.
   */
  const preparationDecision = (
    <View style={styles.group}>
      <Text style={[styles.sectionTitle, { color: surfaces.text }]}>Preparation</Text>
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Optional. How does this one reach you?
      </Text>

      <PreparationChoice value={preparation} onChange={choosePreparation} />

      {preparation === 'already-prepared' ? (
        <Text style={[styles.helper, { color: surfaces.textTertiary }]}>
          Nothing to set up here. You can add preparation details later.
        </Text>
      ) : null}

      {preparation === 'configure' ? preparationFields : null}
    </View>
  );

  /**
   * Preparation as a collapsed section — Edit only.
   *
   * Opening Edit Routine to change a schedule should not put a vial field and
   * a conversion table between you and the schedule. Nothing was removed; the
   * summary line answers the common question without expanding anything.
   */
  const preparationSection = (
    <Disclosure title="Preparation" summary={preparationSummary}>
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Optional. Add these only if you reconstitute a vial yourself.
      </Text>
      {preparationFields}
    </Disclosure>
  );

  /** Amount, schedule and reminder — the fields people actually edit. */
  const routineSection = (
    <View style={styles.group}>
      <Text style={[styles.sectionTitle, { color: surfaces.text }]}>Routine</Text>

      <View style={styles.row}>
        <View style={styles.grow}>
          <NumericField
            label={`Amount (${routineUnit.toUpperCase()})`}
            placeholder="e.g. 2"
            value={routineAmount}
            onChangeText={(text) => {
              setRoutineAmount(text);
              emit({ routineAmount: text });
            }}
            accessibilityLabel={`Routine amount in ${routineUnit}, optional`}
          />
        </View>
        <View style={styles.unitControl}>
          <SegmentedTabs
            options={MASS_UNITS as readonly string[]}
            selectedIndex={MASS_UNITS.indexOf(routineUnit)}
            onChange={(index) => {
              // Restates rather than reinterprets, exactly as every other
              // unit toggle in this app does.
              const next = MASS_UNITS[index];
              const converted = convertAuthoredAmount(routineAmount, routineUnit, next);
              setRoutineAmount(converted);
              setRoutineUnit(next);
              emit({ routineAmount: converted, routineUnit: next });
            }}
            activeColor={palette.peptide}
            groupLabel="Routine amount unit"
          />
        </View>
      </View>
      {routineInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}
      {/*
        * Schedule-neutral copy (founder correction, 5.5C §19).
        *
        * It used to say "your daily log", which is wrong for three of the four
        * schedules this same form offers — a routine can be twice a week or
        * as needed. "When logging" is also more accurate about *when* the
        * value can be changed: at the moment of recording, not on some day.
        */}
      <Text style={[styles.helper, { color: surfaces.textTertiary }]}>
        The amount you usually use. Used to prefill your log — you can change it when logging.
      </Text>

      {/* Directly under the amount it converts. */}
      {calculatorSection}

      {/*
        * Schedule, Reminder and Start date are **fields of the routine**, not
        * sections of their own (founder decision, 3.10A).
        */}
      <Text style={[styles.fieldLabel, { color: surfaces.textSecondary }]}>Schedule</Text>
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
        groupLabel="Schedule"
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

      {/*
        * A reminder the user sets for themselves. **Stored, not scheduled** —
        * no OS notification is registered yet. Neutral wording on purpose:
        * "reminder", never "dose reminder" or "medication reminder".
        */}
      <Text style={[styles.fieldLabel, { color: surfaces.textSecondary }]}>Reminder</Text>
      <SegmentedTabs
        options={['Off', 'On']}
        selectedIndex={reminderOn ? 1 : 0}
        onChange={(index) => {
          setReminderOn(index === 1);
          emit({ reminderOn: index === 1 });
        }}
        activeColor={palette.peptide}
        groupLabel="Reminder"
      />
      {reminderOn ? (
        <>
          <TextField
            label="Time"
            placeholder="e.g. 09:00"
            value={reminderTime}
            onChangeText={(text) => {
              setReminderTime(text);
              emit({ reminderTime: text });
            }}
            accessibilityLabel="Reminder time, 24-hour"
          />
          {reminderInvalid ? (
            <Text style={[styles.error, { color: palette.fat }]}>Enter a time like 09:00.</Text>
          ) : null}
          <Text style={[styles.helper, { color: surfaces.textTertiary }]}>
            Saved with your routine. Reminders aren't sent yet.
          </Text>
        </>
      ) : null}
    </View>
  );

  const moreOptions = (
    <Disclosure title="More options">
      <Text style={[styles.fieldLabel, { color: surfaces.textSecondary }]}>Start date</Text>

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
    </Disclosure>
  );

  /*
   * Two orders, one form (founder direction, 5.5C §7 and §8).
   *
   * **New setup** is a sequence: prepare it, then track it. Preparation leads
   * because the answer to it decides whether a concentration exists at all,
   * and because someone handed a prepared pen should be able to say so and
   * move straight to the amount.
   *
   * **Editing** is not a sequence. Nobody opens a running routine to
   * reconsider how their vial arrives; they open it to change a schedule or
   * an amount. So Routine stays first there, exactly as 5.5 left it.
   *
   * The sections themselves are identical objects in both branches — same
   * fields, same validation, same emit. Only the order and the framing of
   * Preparation differ, which is the whole of the difference the founder
   * asked for and none of the duplication.
   */
  return mode === 'new' ? (
    <>
      {preparationDecision}
      {routineSection}
      {moreOptions}
    </>
  ) : (
    <>
      {routineSection}
      {moreOptions}
      {preparationSection}
    </>
  );
}

const styles = StyleSheet.create({
  /**
   * A group of fields that used to be loose children of `Screen`, which
   * spaced them with its own `contentGap`. Wrapping them so the two orders
   * can move them as a unit means reproducing that gap here — otherwise the
   * fields inside a group would sit flush while the groups themselves kept
   * their air.
   */
  group: {
    gap: spacing.l,
  },
  /** Field weight, matching `TextField`'s own label — a field of the group
      above it, never a section of its own. */
  /** The one always-visible group heading, matching `Disclosure`'s title. */
  sectionTitle: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
  },
  fieldLabel: {
    ...typography.captionMedium,
    marginTop: spacing.s,
  },
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
