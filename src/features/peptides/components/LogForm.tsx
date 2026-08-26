import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Chip, NumericField, SectionHeader, SegmentedTabs, TextField } from '../../../components/ui';
import {
  fromDateAndTime,
  isValidLogDate,
  todayLogDate,
  toLogDate,
  toTimeInput,
  type LogDate,
} from '../../../lib/daily';
import {
  MASS_UNITS,
  calculateSyringeUnits,
  convertAuthoredAmount,
  formatConcentration,
  formatSyringeUnits,
  formatVolume,
  toMcg,
  type InjectionSiteSnapshot,
  type LogCalculationSnapshot,
  type MassUnit,
  type PeptideLogDraft,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { SiteSelector } from './SiteSelector';

/**
 * The conversion context this form should preview against.
 *
 * For a new entry that is the setup as it stands now. For an edit it is the
 * entry's **own** snapshot — correcting a typo on a past log must not quietly
 * re-date its arithmetic to today's vial.
 */
export type LogContext = {
  vialAmountMcg?: number;
  reconstitutionMl?: number;
  unitsPerMl?: number;
  /** The unit the vial was authored in, for the concentration line. */
  vialUnit: MassUnit;
};

type Props = {
  context: LogContext;
  /** Seeds the amount unit. A display preference, never a quantity. */
  preferredUnit?: MassUnit;
  /** Present when editing; absent for a new entry. */
  initial?: {
    amount: number;
    unit: MassUnit;
    loggedAt: string;
    notes?: string;
    site?: InjectionSiteSnapshot;
  };
  /** Where the last administration was recorded — context, never a default. */
  lastSiteLabel?: string;
  onChange: (draft: PeptideLogDraft | null) => void;
};

/**
 * Recording one administration.
 *
 * **The amount starts blank and stays the user's.** Nothing is prefilled —
 * not a scheduled amount, not the last thing they logged, not a typical
 * figure. VITA converts what it is given and proposes nothing, which is why
 * there is no field here that could hold a suggestion.
 *
 * Date and time default to now and are editable in place, because people log
 * after the fact. Everything else defaults sensibly so the common case is
 * open, type a number, save.
 */
export function LogForm({ context, preferredUnit, initial, lastSiteLabel, onChange }: Props) {
  const { surfaces } = useTheme();

  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [unit, setUnit] = useState<MassUnit>(initial?.unit ?? preferredUnit ?? 'mg');
  /**
   * The **local** calendar day of the timestamp, not the UTC slice of its ISO
   * string. An 8:30 PM administration is stored as the next day in UTC, so
   * `loggedAt.slice(0, 10)` would open the editor showing tomorrow's date and
   * move the entry on save. This is the same UTC trap `toLogDate` exists for.
   */
  const [logDate, setLogDate] = useState<LogDate>(
    initial ? toLogDate(new Date(initial.loggedAt)) : todayLogDate(),
  );
  const [time, setTime] = useState(toTimeInput(initial?.loggedAt ?? new Date().toISOString()));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  /**
   * Blank for a new entry even when a previous site exists. Prefilling it
   * would make VITA's memory look like VITA's advice.
   */
  const [site, setSite] = useState<InjectionSiteSnapshot | undefined>(initial?.site);

  /**
   * A date edited by hand can be nonsense mid-typing, so the *stored* day is
   * derived from the entry's own timestamp rather than trusted from the field
   * — the same reasoning that fixed water's `logDate` defaulting bug in 3.3.
   */
  const dateForStorage: LogDate = initial ? toLogDate(new Date(initial.loggedAt)) : todayLogDate();
  const loggedAt = fromDateAndTime(isValidLogDate(logDate) ? logDate : dateForStorage, time);

  const trimmed = amount.trim();
  const complete = /^\d*\.?\d+$/.test(trimmed);
  const parsed = complete ? Number(trimmed) : Number.NaN;
  const amountValid = complete && parsed > 0;
  const amountInvalid = trimmed.length > 0 && !amountValid;

  const emit = (next: {
    amount?: string;
    unit?: MassUnit;
    logDate?: LogDate;
    time?: string;
    notes?: string;
    site?: InjectionSiteSnapshot | undefined;
  }) => {
    const state = { amount, unit, logDate, time, notes, site, ...next };
    const text = state.amount.trim();
    const ok = /^\d*\.?\d+$/.test(text) && Number(text) > 0;
    const at = fromDateAndTime(
      isValidLogDate(state.logDate) ? state.logDate : dateForStorage,
      state.time,
    );

    onChange(
      ok && at !== null
        ? {
            authoredAmount: Number(text),
            authoredUnit: state.unit,
            loggedAt: at,
            site: state.site,
            notes: state.notes.trim() || undefined,
          }
        : null,
    );
  };

  /** The conversion preview, from whichever context this form was given. */
  const preview =
    amountValid && context.vialAmountMcg !== undefined && context.reconstitutionMl !== undefined
      ? calculateSyringeUnits(
          {
            vialAmountMcg: context.vialAmountMcg,
            reconstitutionMl: context.reconstitutionMl,
            unitsPerMl: context.unitsPerMl,
          },
          toMcg(parsed, unit),
        )
      : null;

  return (
    <>
      <SectionHeader title="Amount" />
      <View style={styles.row}>
        <View style={styles.grow}>
          <NumericField
            label={`Amount (${unit})`}
            placeholder="e.g. 2"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              emit({ amount: text });
            }}
            accessibilityLabel={`Amount, in ${unit}`}
          />
        </View>
        <View style={styles.unitControl}>
          <SegmentedTabs
            options={MASS_UNITS as readonly string[]}
            selectedIndex={MASS_UNITS.indexOf(unit)}
            onChange={(index) => {
              // Restates the amount rather than reinterpreting it, exactly as
              // the calculator's toggles do: `2 mg` becomes `2000 mcg`.
              const next = MASS_UNITS[index];
              const converted = convertAuthoredAmount(amount, unit, next);
              setAmount(converted);
              setUnit(next);
              emit({ amount: converted, unit: next });
            }}
            activeColor={palette.peptide}
            groupLabel="Amount unit"
          />
        </View>
      </View>
      {amountInvalid ? (
        <Text style={[styles.error, { color: palette.fat }]}>Enter a number greater than zero.</Text>
      ) : null}

      {preview?.ok ? (
        <Card style={styles.preview}>
          <Text style={[styles.previewLabel, { color: surfaces.textTertiary }]}>
            CALCULATED SYRINGE UNITS
          </Text>
          <Text
            style={[styles.previewValue, { color: palette.peptide }]}
            accessibilityRole="text"
            accessibilityLabel={`Calculated syringe units: ${formatSyringeUnits(preview.syringeUnits)}`}
          >
            {formatSyringeUnits(preview.syringeUnits)}
          </Text>
          <Text style={[styles.previewNote, { color: surfaces.textSecondary }]}>
            Equivalent volume · {formatVolume(preview.volumeMl)}
          </Text>
          <Text style={[styles.previewNote, { color: surfaces.textTertiary }]}>
            {formatConcentration(preview.concentrationMcgPerMl, context.vialUnit)} · U-100 ·{' '}
            {preview.unitsPerMl} units/mL
          </Text>
        </Card>
      ) : null}

      {/*
        * Optional, and it sits after the amount so skipping it costs nothing:
        * someone who does not track sites scrolls straight past.
        */}
      <SectionHeader title="Site" />
      <SiteSelector
        value={site}
        lastRecordedLabel={lastSiteLabel}
        onChange={(next) => {
          setSite(next);
          emit({ site: next });
        }}
      />

      <SectionHeader title="When" />
      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label="Date (YYYY-MM-DD)"
            placeholder={todayLogDate()}
            autoCapitalize="none"
            autoCorrect={false}
            value={logDate}
            onChangeText={(text) => {
              setLogDate(text as LogDate);
              emit({ logDate: text as LogDate });
            }}
            accessibilityLabel="Date, year dash month dash day"
          />
        </View>
        <Chip
          label="Today"
          color={palette.peptide}
          onPress={() => {
            const today = todayLogDate();
            setLogDate(today);
            emit({ logDate: today });
          }}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label="Time (24-hour)"
            placeholder="20:30"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            value={time}
            onChangeText={(text) => {
              setTime(text);
              emit({ time: text });
            }}
            accessibilityLabel="Time, hours colon minutes"
          />
        </View>
        <Chip
          label="Now"
          color={palette.peptide}
          onPress={() => {
            const now = toTimeInput(new Date().toISOString());
            setTime(now);
            emit({ time: now });
          }}
        />
      </View>
      {loggedAt === null ? (
        <Text style={[styles.error, { color: palette.fat }]}>
          Enter a valid date and a time like 20:30.
        </Text>
      ) : null}

      {/*
        * About this administration, not about the setup. Someone's note that
        * a particular injection stung belongs to that event; how they track
        * the compound belongs to the setup and outlives any single log.
        */}
      <SectionHeader title="Notes" />
      <TextField
        placeholder="Optional — anything worth remembering"
        multiline
        value={notes}
        onChangeText={(text) => {
          setNotes(text);
          emit({ notes: text });
        }}
        accessibilityLabel="Notes for this log, optional"
      />
    </>
  );
}

/** Turns a stored entry's snapshot back into a preview context for editing. */
export function contextFromSnapshot(
  snapshot: LogCalculationSnapshot | undefined,
  vialUnit: MassUnit,
): LogContext {
  return {
    vialAmountMcg: snapshot?.vialAmountMcg,
    reconstitutionMl: snapshot?.reconstitutionMl,
    unitsPerMl: snapshot?.unitsPerMl,
    vialUnit,
  };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.m,
  },
  grow: {
    flex: 1,
  },
  unitControl: {
    width: 120,
  },
  error: {
    ...typography.caption,
  },
  preview: {
    gap: 2,
  },
  previewLabel: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  previewValue: {
    ...typography.display,
  },
  previewNote: {
    ...typography.caption,
  },
});
