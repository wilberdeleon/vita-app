import { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, NumericField, PressableScale, SegmentedTabs, TextField, VitaSheet } from '../../../components/ui';
import { fromDateAndTime, isValidLogDate, shiftLogDate, toLogDate, toTimeInput, type LogDate } from '../../../lib/daily';
import {
  WEIGHT_UNITS,
  fromKg,
  isLoggableTime,
  parseWeight,
  roundForDisplay,
  toKg,
  type WeightEntry,
  type WeightEntryChanges,
  type WeightUnit,
} from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { weightNumber, whenLabel } from '../format';

type Props = {
  visible: boolean;
  /** `null` logs a new weigh-in; an entry opens it for editing. */
  entry: WeightEntry | null;
  /** Journey's display unit. The sheet opens in it and never writes it. */
  preferredUnit: WeightUnit;
  onClose: () => void;
  onLog: (weight: number, unit: WeightUnit, loggedAt: Date) => Promise<boolean>;
  onUpdate: (id: string, changes: WeightEntryChanges) => Promise<boolean>;
  /** Asks for confirmation itself; resolves once the entry is gone. */
  onDelete: (entry: WeightEntry) => void;
};

const UNIT_NAMES: Record<WeightUnit, string> = { lb: 'pounds', kg: 'kilograms' };

/** One decimal, the precision Journey displays — never fed back into storage. */
function display(value: number): string {
  return roundForDisplay(value).toFixed(1);
}

/**
 * Log Weight / Edit Weight — one `VitaSheet` (slice 6.4).
 *
 * Built on Add Water's rules, because they were earned there:
 *
 * - **The unit is this weigh-in's, not Journey's.** The sheet opens in the
 *   Journey display unit and never writes it — the founder correction Water
 *   carries from 2026-08-22. The display unit has its own control on the
 *   Weight pillar. A note appears only when the two differ.
 * - **Switching unit converts what was typed** — 180 lb becomes 81.6 kg, it
 *   is not reinterpreted as 180 kg.
 * - **Done on the number pad dismisses the keyboard and nothing else.** Save
 *   is the only control that writes.
 * - **No success before the write.** The caller fires the haptic and the
 *   sheet closes only when storage accepted the entry; a failure leaves the
 *   sheet open with everything intact.
 *
 * **Precision on edit.** Opening an entry shows its weight to one decimal,
 * but the stored kilograms are kept aside untouched: saving without retyping
 * the number — after changing only the time, or only the unit — writes back
 * the exact canonical value, never the rounded display.
 *
 * **Delete is neutral, not red.** Journey never uses red, so it can never be
 * read as a verdict on a weight; the destructive step is the system
 * confirmation, which carries its own destructive styling.
 *
 * **When.** Defaults to now and stays collapsed to one line. Expanding it
 * gives the date and time fields VITA's peptide log already uses, with
 * Today / Yesterday / Now — no picker dependency. A time in the future is
 * refused: a weigh-in is something that already happened.
 */
export function WeightEntrySheet({ visible, entry, preferredUnit, onClose, onLog, onUpdate, onDelete }: Props) {
  const { surfaces } = useTheme();
  const editing = entry !== null;

  const [unit, setUnit] = useState<WeightUnit>(preferredUnit);
  const [text, setText] = useState('');
  /** The stored kilograms while the user has not retyped the number. */
  const [untouchedKg, setUntouchedKg] = useState<number | null>(null);
  const [whenOpen, setWhenOpen] = useState(false);
  const [logDate, setLogDate] = useState<string>('');
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const startUnit = entry ? entry.enteredUnit : preferredUnit;
    const at = entry ? entry.loggedAt : new Date().toISOString();
    setUnit(startUnit);
    setText(entry ? display(fromKg(entry.weightKg, startUnit)) : '');
    setUntouchedKg(entry ? entry.weightKg : null);
    setWhenOpen(false);
    setLogDate(toLogDate(new Date(at)));
    setTime(toTimeInput(at));
    setSaving(false);
  }, [visible, entry, preferredUnit]);

  const typed = parseWeight(text);
  const weight = untouchedKg !== null ? fromKg(untouchedKg, unit) : typed;
  const weightInvalid = text.trim().length > 0 && untouchedKg === null && typed === null;

  /** `undefined` = "now" (a new weigh-in whose time was never opened). */
  const chosenIso =
    !whenOpen && !editing ? undefined : fromDateAndTime(isValidLogDate(logDate) ? (logDate as LogDate) : ('' as LogDate), time);
  const timeInvalid = chosenIso === null;
  const timeInFuture = typeof chosenIso === 'string' && !isLoggableTime(new Date(chosenIso));

  const canSave = weight !== null && !timeInvalid && !timeInFuture && !saving;

  const selectUnit = (index: number) => {
    const next = WEIGHT_UNITS[index];
    if (next === unit) return;
    if (untouchedKg !== null) {
      setText(display(fromKg(untouchedKg, next)));
    } else if (typed !== null) {
      setText(display(fromKg(toKg(typed, unit), next)));
    }
    setUnit(next);
  };

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  const save = async () => {
    if (!canSave || weight === null) return;
    setSaving(true);
    Keyboard.dismiss();
    let saved: boolean;
    if (!entry) {
      saved = await onLog(weight, unit, chosenIso ? new Date(chosenIso) : new Date());
    } else {
      const changes: WeightEntryChanges = {};
      const weightChanged = untouchedKg === null || unit !== entry.enteredUnit;
      if (weightChanged) changes.weight = { value: weight, unit };
      if (chosenIso && chosenIso !== new Date(entry.loggedAt).toISOString()) {
        // Minutes are what the fields hold; keep the original seconds if the
        // user did not move the minute.
        if (toTimeInput(chosenIso) !== toTimeInput(entry.loggedAt) || logDate !== toLogDate(new Date(entry.loggedAt))) {
          changes.loggedAt = new Date(chosenIso);
        }
      }
      saved = changes.weight || changes.loggedAt ? await onUpdate(entry.id, changes) : true;
    }
    if (saved) onClose();
    else setSaving(false);
  };

  const confirmDelete = () => {
    if (!entry) return;
    Keyboard.dismiss();
    Alert.alert(
      'Delete weight entry?',
      `${weightNumber(entry.weightKg, preferredUnit)} ${preferredUnit} · ${whenLabel(entry.loggedAt)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry) },
      ],
    );
  };

  const whenSummary =
    !editing && !whenOpen ? 'Now' : typeof chosenIso === 'string' ? whenLabel(chosenIso) : 'Enter a date and time';

  return (
    <VitaSheet visible={visible} onClose={close} title={editing ? 'Edit Weight' : 'Log Weight'}>
      <View style={styles.body}>
        <SegmentedTabs
          options={WEIGHT_UNITS}
          selectedIndex={WEIGHT_UNITS.indexOf(unit)}
          onChange={selectUnit}
          groupLabel="Weight unit"
        />
        {unit !== preferredUnit ? (
          <Text style={[styles.note, { color: surfaces.textTertiary }]}>
            {`Recording this weigh-in in ${UNIT_NAMES[unit]}. Journey still shows ${UNIT_NAMES[preferredUnit]}.`}
          </Text>
        ) : null}

        <NumericField
          label={`Weight in ${UNIT_NAMES[unit]}`}
          value={text}
          onChangeText={(next) => {
            setText(next);
            setUntouchedKg(null);
          }}
          suffix={unit}
          autoFocus={!editing}
          accessibilityLabel={`Weight in ${UNIT_NAMES[unit]}`}
        />
        {weightInvalid ? (
          <Text style={[styles.error, { color: surfaces.textSecondary }]}>Enter a weight greater than zero.</Text>
        ) : null}

        <PressableScale
          style={[styles.whenRow, { borderColor: surfaces.border }]}
          onPress={() => setWhenOpen((open) => !open)}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel={`When, ${whenSummary}`}
          accessibilityHint={whenOpen ? 'Hides the date and time fields' : 'Shows the date and time fields'}
          accessibilityState={{ expanded: whenOpen }}
        >
          <Text style={[styles.whenLabel, { color: surfaces.textSecondary }]}>When</Text>
          <Text style={[styles.whenValue, { color: surfaces.text }]}>{whenSummary}</Text>
        </PressableScale>

        {whenOpen ? (
          <View style={styles.whenFields}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <TextField
                  label="Date (YYYY-MM-DD)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={logDate}
                  onChangeText={setLogDate}
                  accessibilityLabel="Date, year dash month dash day"
                />
              </View>
              <Chip label="Today" onPress={() => setLogDate(toLogDate(new Date()))} />
              <Chip label="Yesterday" onPress={() => setLogDate(shiftLogDate(toLogDate(new Date()), -1))} />
            </View>
            <View style={styles.row}>
              <View style={styles.grow}>
                <TextField
                  label="Time (24-hour)"
                  placeholder="07:30"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numbers-and-punctuation"
                  value={time}
                  onChangeText={setTime}
                  accessibilityLabel="Time, hours colon minutes"
                />
              </View>
              <Chip label="Now" onPress={() => setTime(toTimeInput(new Date().toISOString()))} />
            </View>
            {timeInvalid ? (
              <Text style={[styles.error, { color: surfaces.textSecondary }]}>Enter a valid date and a time like 07:30.</Text>
            ) : null}
            {timeInFuture ? (
              <Text style={[styles.error, { color: surfaces.textSecondary }]}>That time hasn’t happened yet.</Text>
            ) : null}
          </View>
        ) : null}

        <Button
          variant="neutral"
          label={editing ? 'Save' : 'Log Weight'}
          onPress={() => void save()}
          disabled={!canSave}
          accessibilityLabel={
            weight === null
              ? `${editing ? 'Save' : 'Log Weight'}, enter a weight first`
              : `${editing ? 'Save' : 'Log'} ${display(weight)} ${UNIT_NAMES[unit]}`
          }
        />

        {editing ? (
          <PressableScale
            style={styles.delete}
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete this weight entry"
          >
            <Text style={[styles.deleteLabel, { color: surfaces.textSecondary }]}>Delete Entry</Text>
          </PressableScale>
        ) : null}
      </View>
    </VitaSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.l,
  },
  note: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  error: {
    ...typography.caption,
    marginTop: -spacing.s,
  },
  whenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: spacing.m,
    paddingVertical: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  whenLabel: {
    ...typography.body,
  },
  whenValue: {
    ...typography.bodyMedium,
  },
  whenFields: {
    gap: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.s,
  },
  grow: {
    flex: 1,
  },
  delete: {
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  deleteLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
});
