import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Screen, ScreenHeader, useToast } from '../../../components/ui';
import { AmountEditor, type AmountValue } from '../../../features/water/components/AmountEditor';
import { createWaterEntry, formatEntered, useWater } from '../../../lib/water';
import { palette } from '../../../theme/tokens';

/**
 * Add Water.
 *
 * Opens in the user's preferred unit, because that is the one they think in.
 * They may switch it for this drink — **and that switch belongs to this entry
 * alone.** Logging a 500 mL bottle while your preference is fluid ounces
 * records 500 mL and leaves your preference at fluid ounces (founder decision,
 * 2026-08-22, correcting slice 3.2's temporary behavior). Changing the
 * preference is an explicit act, done on the goal screen.
 */
export default function AddWater() {
  const { preferences, addEntry } = useWater();
  const { showToast } = useToast();

  const [value, setValue] = useState<AmountValue>({ amount: null, unit: preferences.unit });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (value.amount === null || saving) return;
    setSaving(true);

    await addEntry(createWaterEntry({ amount: value.amount, unit: value.unit }));
    showToast({ message: `Added · ${formatEntered(value.amount, value.unit)}` });
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Add Water" back />

      <AmountEditor initial={{ amount: null, unit: preferences.unit }} onChange={setValue} />

      <Button
        label="Add Water"
        icon="add"
        color={palette.water}
        disabled={value.amount === null || saving}
        onPress={() => void save()}
      />
    </Screen>
  );
}
