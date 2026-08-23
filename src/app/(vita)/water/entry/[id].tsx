import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { AmountEditor, type AmountValue } from '../../../../features/water/components/AmountEditor';
import { timeLabel } from '../../../../features/water/components/WaterLogPanel';
import { formatEntered, useWater, waterAmountChanges } from '../../../../lib/water';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * Edits one logged drink — how much, and in which unit.
 *
 * `id`, `logDate`, and `loggedAt` are never touched: correcting the amount
 * does not make it a different drink at a different time. Preserving the id is
 * also what keeps this an update rather than a delete-and-insert, so the entry
 * stays in place in the day's log instead of jumping to the end.
 *
 * Moving an entry to another day is deliberately not offered. It is a
 * different feature — a history editor — and nothing in this slice needs it.
 *
 * Uses the same `AmountEditor` as Add Water so the two can never drift apart
 * on parsing, rounding, or what a unit switch does.
 */
export default function EditWaterEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = decodeURIComponent(id ?? '');

  const { entries, updateEntry, removeEntry, restoreEntry } = useWater();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const entry = entries.find((candidate) => candidate.id === entryId);

  const [value, setValue] = useState<AmountValue>({
    amount: entry?.enteredAmount ?? null,
    unit: entry?.enteredUnit ?? 'floz',
  });
  const [saving, setSaving] = useState(false);

  /**
   * Re-seed when a different entry is opened.
   *
   * `/water/entry/[id]` is one route, so navigating from one entry to another
   * updates params without remounting and a `useState` initializer never
   * re-runs — the second entry would inherit the first one's amount. The same
   * defect class that made a scanned barcode show an earlier product on Food
   * Detail, and that Fuel's entry editor already guards against.
   */
  useEffect(() => {
    if (!entry) return;
    setValue({ amount: entry.enteredAmount, unit: entry.enteredUnit });
    setSaving(false);
  }, [entryId, entry?.id]);

  if (!entry) {
    return (
      <Screen>
        <ScreenHeader title="Edit Entry" back />
        <EmptyState
          icon="help-circle-outline"
          title="This entry is no longer in your log"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  const original = formatEntered(entry.enteredAmount, entry.enteredUnit);

  const handleSave = async () => {
    if (value.amount === null || saving) return;
    setSaving(true);

    // Amount and unit are recomputed together, so the canonical millilitres
    // can never contradict the label shown beside them.
    await updateEntry(entry.id, waterAmountChanges(value.amount, value.unit));
    showToast({ message: `Updated · ${formatEntered(value.amount, value.unit)}` });
    router.back();
  };

  const handleRemove = () => {
    const index = entries.findIndex((candidate) => candidate.id === entry.id);
    void removeEntry(entry.id);
    showToast({
      message: `Removed · ${original}`,
      actionLabel: 'Undo',
      onAction: () => {
        void restoreEntry(entry, index);
      },
    });
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Edit Entry" back />

      <Text style={[styles.logged, { color: surfaces.textTertiary }]}>
        Logged {original} at {timeLabel(entry.loggedAt)}
      </Text>

      {/* Keyed on the entry so switching entries rebuilds the editor's own
          internal draft state rather than carrying the previous one over. */}
      <AmountEditor
        key={entry.id}
        initial={{ amount: entry.enteredAmount, unit: entry.enteredUnit }}
        onChange={setValue}
      />

      <Button
        label="Save changes"
        color={palette.water}
        disabled={value.amount === null || saving}
        onPress={() => void handleSave()}
      />
      <Button label="Remove entry" variant="soft" color={palette.fat} onPress={handleRemove} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logged: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
});
