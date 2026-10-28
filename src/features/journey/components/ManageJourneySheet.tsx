import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, PressableScale, TextField, VitaSheet } from '../../../components/ui';
import { isValidLogDate, shiftLogDate } from '../../../lib/daily';
import { canExtendTo, earliestExtension, plannedDays, type Journey } from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { calendarDay, dayCount } from '../format';

type Props = {
  visible: boolean;
  journey: Journey;
  today: string;
  /** Open straight on Extend (from the end-date-reached state). */
  initialMode?: 'menu' | 'extend';
  onClose: () => void;
  onExtend: (newEnd: string) => Promise<boolean>;
  /** Asks for confirmation itself. */
  onFinish: () => void;
};

const EXTENSIONS = [30, 60, 90] as const;

/**
 * Manage Journey — Extend or Finish (slice 6.5).
 *
 * Kept off Overview on purpose: managing a Journey is occasional, and two
 * permanent buttons would turn the home of a Journey into a control panel.
 *
 * **Extend** moves only the planned end — same Journey, same records, same
 * Day count from the same start. The new end and the new length are shown
 * before anything is saved. **Finish** asks first, in factual terms: the
 * Journey moves to Past Journeys and its history stays.
 */
export function ManageJourneySheet({ visible, journey, today, initialMode = 'menu', onClose, onExtend, onFinish }: Props) {
  const { surfaces } = useTheme();
  const [mode, setMode] = useState<'menu' | 'extend'>(initialMode);
  const [choice, setChoice] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setMode(initialMode);
    setChoice(null);
    setCustom('');
    setSaving(false);
  }, [visible, initialMode]);

  // Extensions count from the later of the current end and today, so an
  // extension past an already-reached end still adds real days ahead.
  const base = shiftLogDate(earliestExtension(journey, today), -1);
  const newEnd = choice ?? (isValidLogDate(custom) ? custom : null);
  const valid = newEnd !== null && canExtendTo(journey, newEnd, today);

  const extend = async () => {
    if (!valid || !newEnd || saving) return;
    setSaving(true);
    const saved = await onExtend(newEnd);
    if (saved) onClose();
    else setSaving(false);
  };

  const finish = () => {
    Alert.alert('Finish this Journey?', 'The Journey will move to Past Journeys. Its recorded history will remain.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: onFinish },
    ]);
  };

  return (
    <VitaSheet visible={visible} onClose={onClose} title={mode === 'extend' ? 'Extend Journey' : journey.name}>
      {mode === 'menu' ? (
        <View style={styles.menu}>
          <PressableScale
            style={[styles.option, { borderBottomColor: surfaces.border }]}
            onPress={() => setMode('extend')}
            accessibilityRole="button"
            accessibilityLabel="Extend Journey"
            accessibilityHint="Choose a later planned end date"
          >
            <Text style={[styles.optionTitle, { color: surfaces.text }]}>Extend Journey</Text>
            <Text style={[styles.optionBody, { color: surfaces.textSecondary }]}>
              {`Planned to end ${calendarDay(journey.plannedEndDate, true)}`}
            </Text>
          </PressableScale>
          <PressableScale
            style={styles.option}
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="Finish Journey"
            accessibilityHint="Moves this Journey to Past Journeys"
          >
            <Text style={[styles.optionTitle, { color: surfaces.text }]}>Finish Journey</Text>
            <Text style={[styles.optionBody, { color: surfaces.textSecondary }]}>
              Move it to Past Journeys. Its recorded history stays.
            </Text>
          </PressableScale>
        </View>
      ) : (
        <View style={styles.extend}>
          <Text style={[styles.optionBody, { color: surfaces.textSecondary }]}>
            {`Currently ${calendarDay(journey.startDate, true)} to ${calendarDay(journey.plannedEndDate, true)} · ${dayCount(plannedDays(journey))}`}
          </Text>
          <View style={styles.chips}>
            {EXTENSIONS.map((days) => {
              const end = shiftLogDate(base, days);
              return (
                <Chip
                  key={days}
                  label={`+${days} days`}
                  selected={choice === end}
                  onPress={() => {
                    setChoice(end);
                    setCustom('');
                  }}
                  accessibilityLabel={`Add ${days} days, ending ${calendarDay(end, true)}`}
                />
              );
            })}
          </View>
          <TextField
            label="Or a new end date (YYYY-MM-DD)"
            autoCapitalize="none"
            autoCorrect={false}
            value={custom}
            onChangeText={(text) => {
              setCustom(text);
              setChoice(null);
            }}
            accessibilityLabel="New end date, year dash month dash day"
          />
          {newEnd ? (
            valid ? (
              <Text style={[styles.preview, { color: surfaces.text }]}>
                {`New end ${calendarDay(newEnd, true)} · ${dayCount(plannedDays({ startDate: journey.startDate, plannedEndDate: newEnd }))} in total`}
              </Text>
            ) : (
              <Text style={[styles.optionBody, { color: surfaces.textSecondary }]}>
                {`Choose a date after ${calendarDay(shiftLogDate(earliestExtension(journey, today), -1), true)}.`}
              </Text>
            )
          ) : null}
          <Button
            variant="neutral"
            label="Extend Journey"
            onPress={() => void extend()}
            disabled={!valid || saving}
            accessibilityLabel={valid && newEnd ? `Extend Journey to ${calendarDay(newEnd, true)}` : 'Extend Journey, choose a new end first'}
          />
        </View>
      )}
    </VitaSheet>
  );
}

const styles = StyleSheet.create({
  menu: {
    gap: 0,
  },
  option: {
    paddingVertical: spacing.l,
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  optionTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  optionBody: {
    ...typography.caption,
  },
  extend: {
    gap: spacing.l,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  preview: {
    ...typography.bodyMedium,
  },
});
