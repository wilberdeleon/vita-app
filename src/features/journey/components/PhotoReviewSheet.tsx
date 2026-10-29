import { useEffect, useState } from 'react';
import { Image, Keyboard, StyleSheet, Text, View } from 'react-native';
import { Button, PressableScale, VitaSheet } from '../../../components/ui';
import { toLogDate, toTimeInput } from '../../../lib/daily';
import { isValidPhotoTime, type Journey } from '../../../lib/journey';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { calendarDay, whenLabel } from '../format';
import { WhenFields, whenFromFields } from './WhenFields';

type Props = {
  visible: boolean;
  /** 'add' reviews a just-picked image; 'edit' corrects a saved photo's date. */
  mode: 'add' | 'edit';
  uri: string | null;
  /** The moment to start from: camera → now; library → its capture time if known, else now; edit → saved. */
  initialTakenAt: Date;
  journey: Journey;
  onCancel: () => void;
  onSave: (takenAt: Date) => Promise<boolean>;
};

/**
 * Review before saving (and re-dating after) — slice 6.6.
 *
 * The image, its date and time, Save. Nothing else: no crop, filter, caption,
 * weight, tag or score. Nothing is written until Save; Cancel leaves no
 * record and no file. The date must fall inside the Journey (on or after its
 * start day) and not in the future — a progress photo is something that
 * already happened during this Journey.
 */
export function PhotoReviewSheet({ visible, mode, uri, initialTakenAt, journey, onCancel, onSave }: Props) {
  const { surfaces } = useTheme();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [editingWhen, setEditingWhen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDate(toLogDate(initialTakenAt));
    setTime(toTimeInput(initialTakenAt.toISOString()));
    setEditingWhen(mode === 'edit');
    setSaving(false);
    setFailed(false);
  }, [visible, initialTakenAt, mode]);

  const when = editingWhen ? whenFromFields(date, time) : initialTakenAt;
  const beforeStart = when !== null && toLogDate(when) < journey.startDate;
  const valid = when !== null && isValidPhotoTime(when, journey);
  const error =
    when === null
      ? 'Enter a valid date and a time like 07:30.'
      : beforeStart
        ? `This Journey began ${calendarDay(journey.startDate, true)}. Choose a date on or after it.`
        : !valid
          ? 'That time hasn’t happened yet.'
          : null;

  const save = async () => {
    if (!when || !valid || saving) return;
    setSaving(true);
    Keyboard.dismiss();
    const saved = await onSave(when);
    if (!saved) {
      setSaving(false);
      setFailed(true);
    }
  };

  return (
    <VitaSheet visible={visible} onClose={onCancel} title={mode === 'add' ? 'Progress Photo' : 'Change Date'}>
      <View style={styles.body}>
        {uri ? (
          <View style={[styles.imageWell, { backgroundColor: surfaces.track }]}>
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="contain"
              accessible
              accessibilityLabel={`Progress photo to save, ${when ? whenLabel(when.toISOString()) : 'date not set'}`}
            />
          </View>
        ) : null}

        <PressableScale
          style={[styles.whenRow, { borderColor: surfaces.border }]}
          onPress={() => setEditingWhen(true)}
          disabled={editingWhen}
          accessibilityRole="button"
          accessibilityLabel={`When, ${when ? whenLabel(when.toISOString()) : 'not set'}`}
          accessibilityHint={editingWhen ? undefined : 'Shows the date and time fields'}
        >
          <Text style={[styles.whenLabel, { color: surfaces.textSecondary }]}>When</Text>
          <Text style={[styles.whenValue, { color: surfaces.text }]}>
            {when ? whenLabel(when.toISOString()) : 'Enter a date and time'}
          </Text>
        </PressableScale>

        {editingWhen ? <WhenFields date={date} time={time} onDate={setDate} onTime={setTime} error={error} /> : error ? (
          <Text style={[styles.note, { color: surfaces.textSecondary }]}>{error}</Text>
        ) : null}

        {failed ? (
          <Text style={[styles.note, { color: surfaces.textSecondary }]}>
            We couldn't save the photo. Nothing was recorded — try again.
          </Text>
        ) : null}

        <Button
          variant="neutral"
          label={mode === 'add' ? 'Save Photo' : 'Save'}
          onPress={() => void save()}
          disabled={!valid || saving}
        />
        <PressableScale style={styles.cancel} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel">
          <Text style={[styles.cancelLabel, { color: surfaces.textSecondary }]}>Cancel</Text>
        </PressableScale>
      </View>
    </VitaSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.l,
  },
  imageWell: {
    borderRadius: radii.chip,
    overflow: 'hidden',
    height: 320,
  },
  image: {
    width: '100%',
    height: '100%',
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
  note: {
    ...typography.caption,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  cancelLabel: {
    ...typography.bodyMedium,
  },
});
