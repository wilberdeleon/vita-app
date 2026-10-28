import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Chip, NumericField, PressableScale, SegmentedTabs, TextField } from '../../../components/ui';
import { isValidLogDate } from '../../../lib/daily';
import {
  DURATION_PRESETS,
  JOURNEY_NAME_MAX,
  WEIGHT_UNITS,
  normalizeJourneyName,
  parseWeight,
  plannedDays,
  plannedEndFor,
  type DurationPreset,
  type WeightUnit,
} from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { calendarDay, dayCount } from '../format';
import { useJourneyAccent } from './useJourneyAccent';

export type JourneyStartValues = {
  name: string;
  plannedEndDate: string;
  startingWeight: number;
  unit: WeightUnit;
};

type Props = {
  /** Today, local calendar — the start date of the new Journey. */
  today: string;
  /** Journey's display unit; the weight step opens in it. */
  preferredUnit: WeightUnit;
  /** The only write. Resolves `false` if nothing could be saved. */
  onBegin: (values: JourneyStartValues) => Promise<boolean>;
};

const STEPS = ['Name', 'Duration', 'Starting weight', 'Review'] as const;
const UNIT_NAMES: Record<WeightUnit, string> = { lb: 'pounds', kg: 'kilograms' };

/**
 * Start a New Journey — four steps, one screen (slice 6.5).
 *
 * Name it · choose how long it runs · record the starting weight · review
 * and Begin. **Nothing is written until Begin Journey** — leaving at any step
 * (the header's close, or Back from the first step) leaves no Journey and no
 * weigh-in behind. Unfinished setup is not saved as a draft.
 *
 * A Journey starts today: no back-dating in this slice. The duration is
 * stored only as its result, the planned end date. The starting weight
 * becomes the Journey's first real weigh-in, in the unit typed; nothing is
 * proposed, prefilled or recommended — no target, no goal, no BMI.
 */
export function JourneyStartFlow({ today, preferredUnit, onBegin }: Props) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [preset, setPreset] = useState<DurationPreset | 'custom' | null>(null);
  const [customEnd, setCustomEnd] = useState('');
  const [unit, setUnit] = useState<WeightUnit>(preferredUnit);
  const [weightText, setWeightText] = useState('');
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const validName = normalizeJourneyName(name);
  const plannedEndDate =
    preset === null ? null : preset === 'custom' ? (isValidLogDate(customEnd) ? customEnd : null) : plannedEndFor(preset, today);
  const endValid = plannedEndDate !== null && plannedEndDate > today;
  const weight = parseWeight(weightText);

  const canContinue = [validName !== null, endValid, weight !== null, true][step];

  const begin = async () => {
    if (!validName || !plannedEndDate || !endValid || weight === null || saving) return;
    setSaving(true);
    setFailed(false);
    const saved = await onBegin({ name: validName, plannedEndDate, startingWeight: weight, unit });
    if (!saved) {
      setSaving(false);
      setFailed(true);
    }
  };

  return (
    <View style={styles.root}>
      <Text
        style={[styles.step, { color: accent }]}
        accessibilityLabel={`Step ${step + 1} of ${STEPS.length}, ${STEPS[step]}`}
      >
        {`STEP ${step + 1} OF ${STEPS.length}`}
      </Text>

      {step === 0 ? (
        <View style={styles.body}>
          <Text style={[styles.title, { color: surfaces.text }]} accessibilityRole="header">
            Name your Journey
          </Text>
          <Text style={[styles.hint, { color: surfaces.textSecondary }]}>
            This is how you will find this chapter later.
          </Text>
          <TextField
            label="Journey name"
            value={name}
            onChangeText={setName}
            maxLength={JOURNEY_NAME_MAX}
            autoFocus
            accessibilityLabel="Journey name"
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.body}>
          <Text style={[styles.title, { color: surfaces.text }]} accessibilityRole="header">
            How long do you want this Journey to run?
          </Text>
          <View style={styles.chips}>
            {DURATION_PRESETS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={preset === option.key}
                onPress={() => setPreset(option.key)}
              />
            ))}
            <Chip label="Custom" selected={preset === 'custom'} onPress={() => setPreset('custom')} />
          </View>
          {preset === 'custom' ? (
            <TextField
              label="End date (YYYY-MM-DD)"
              autoCapitalize="none"
              autoCorrect={false}
              value={customEnd}
              onChangeText={setCustomEnd}
              accessibilityLabel="End date, year dash month dash day"
            />
          ) : null}
          {plannedEndDate && endValid ? (
            <Text style={[styles.hint, { color: surfaces.textSecondary }]}>
              {`${calendarDay(today, true)} to ${calendarDay(plannedEndDate, true)} · ${dayCount(plannedDays({ startDate: today, plannedEndDate }))}`}
            </Text>
          ) : preset === 'custom' && customEnd.length > 0 ? (
            <Text style={[styles.hint, { color: surfaces.textSecondary }]}>Choose a date after today.</Text>
          ) : null}
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.body}>
          <Text style={[styles.title, { color: surfaces.text }]} accessibilityRole="header">
            Record your starting weight
          </Text>
          <Text style={[styles.hint, { color: surfaces.textSecondary }]}>
            It becomes the first weigh-in of this Journey.
          </Text>
          <SegmentedTabs
            options={WEIGHT_UNITS}
            selectedIndex={WEIGHT_UNITS.indexOf(unit)}
            onChange={(index) => {
              const next = WEIGHT_UNITS[index];
              setUnit(next);
              setWeightText('');
            }}
            groupLabel="Weight unit"
          />
          <NumericField
            label={`Starting weight in ${UNIT_NAMES[unit]}`}
            value={weightText}
            onChangeText={setWeightText}
            suffix={unit}
            accessibilityLabel={`Starting weight in ${UNIT_NAMES[unit]}`}
          />
        </View>
      ) : null}

      {step === 3 && validName && plannedEndDate && weight !== null ? (
        <View style={styles.body}>
          <Text style={[styles.title, { color: surfaces.text }]} accessibilityRole="header">
            Review
          </Text>
          {[
            ['Journey', validName],
            ['Starts', `${calendarDay(today, true)} (today)`],
            ['Planned end', calendarDay(plannedEndDate, true)],
            ['Duration', dayCount(plannedDays({ startDate: today, plannedEndDate }))],
            ['Starting weight', `${weight} ${unit}`],
          ].map(([label, value], index) => (
            <View
              key={label}
              style={[styles.reviewRow, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border }]}
              accessible
              accessibilityLabel={`${label}, ${value}`}
            >
              <Text style={[styles.reviewLabel, { color: surfaces.textSecondary }]}>{label}</Text>
              <Text style={[styles.reviewValue, { color: surfaces.text }]}>{value}</Text>
            </View>
          ))}
          {failed ? (
            <Text style={[styles.hint, { color: surfaces.textSecondary }]}>
              We couldn't save your Journey. Nothing was recorded — try again.
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        {step < 3 ? (
          <Button variant="neutral" label="Continue" onPress={() => setStep(step + 1)} disabled={!canContinue} />
        ) : (
          <Button variant="neutral" label="Begin Journey" onPress={() => void begin()} disabled={saving} />
        )}
        {step > 0 ? (
          <PressableScale style={styles.back} onPress={() => setStep(step - 1)} accessibilityRole="button" accessibilityLabel="Back to the previous step">
            <Text style={[styles.backLabel, { color: surfaces.textSecondary }]}>Back</Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.l,
  },
  step: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  body: {
    gap: spacing.m,
  },
  title: {
    ...typography.title,
  },
  hint: {
    ...typography.body,
    lineHeight: 21,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: spacing.m,
    paddingVertical: spacing.m,
  },
  reviewLabel: {
    ...typography.body,
  },
  reviewValue: {
    ...typography.bodyMedium,
  },
  actions: {
    gap: spacing.s,
    marginTop: spacing.l,
  },
  back: {
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  backLabel: {
    ...typography.bodyMedium,
  },
});
