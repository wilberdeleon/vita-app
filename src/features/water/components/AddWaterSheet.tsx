import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import {
  NumericField,
  NumericKeyboardAccessory,
  PressableScale,
  VitaSheet,
} from '../../../components/ui';
import {
  formatEntered,
  parseAmount,
  unitName,
  type VolumeUnit,
} from '../../../lib/water';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import {
  QUICK_ADDS,
  quickAddAccessibilityLabel,
  quickAddUnitLabel,
  quickAddValueLabel,
} from '../quickAdds';
import { UnitSelector } from './UnitSelector';

type Props = {
  visible: boolean;
  /** The user's saved display unit. The sheet opens in it, and never writes it. */
  preferredUnit: VolumeUnit;
  onClose: () => void;
  /** Resolves false when the entry could not be persisted. */
  onLog: (amount: number, unit: VolumeUnit) => Promise<boolean>;
};

/**
 * Logging a drink, in place.
 *
 * **This replaces a whole route.** Adding water used to push `/water/add` — a
 * full screen carrying a unit segmented control, a large amount readout, four
 * chips and a text field, for an action that takes two seconds and happens
 * several times a day. The thing being changed is now still on screen while
 * it changes, which is the distinction slice 5.1 drew between a sheet and a
 * route.
 *
 * ## The unit model, which is the subtle part
 *
 * There are two ideas here and conflating them is a bug the founders have
 * already had to correct once (2026-08-22, slice 3.2):
 *
 * - **The display preference** is what Water renders in. It lives in
 *   `vita:v1:water:prefs`, Settings → Units is its home, and **this sheet
 *   never writes it.**
 * - **The logging unit** belongs to *this drink*. The sheet opens in the
 *   user's preference, and switching it here logs one drink in that unit and
 *   changes nothing else.
 *
 * Logging 500 mL while your preference is fluid ounces records 500 mL and
 * leaves Water rendering in fluid ounces. The entry keeps `500 mL` as its
 * authored snapshot forever, so history stays truthful. The one line of copy
 * under the selector appears **only when the two differ**, because that is the
 * only moment the distinction needs explaining.
 *
 * ## Quick amounts adapt to the unit
 *
 * Four amounts a person would actually say in the unit they are logging in —
 * see `quickAdds.ts`. Converting one canonical set into the others produces
 * `0.35 cups`, which nobody taps.
 *
 * ## One tap, one haptic, and no success before the write
 *
 * A quick amount is a single tap that both chooses and commits, so it fires
 * one feedback, not a selection *and* a confirmation. The confirmation is
 * raised by the caller and only after the repository has actually accepted
 * the entry.
 *
 * ## The number pad has a Done key, and Done does not log
 *
 * iOS's decimal pad has no return key, so a focused amount field can leave
 * someone with no obvious way to put the keyboard away — founder device QA
 * found exactly that here, and had found it once before on the peptide
 * calculator, which is why `NumericKeyboardAccessory` already existed to
 * reuse.
 *
 * **Done dismisses the keyboard and nothing else.** It does not save, and the
 * amount and the chosen logging unit both survive it. `Log` remains the only
 * control that writes an entry — two controls that both save is precisely the
 * ambiguity this is meant to remove.
 */
export function AddWaterSheet({ visible, preferredUnit, onClose, onLog }: Props) {
  const { surfaces } = useTheme();

  const [unit, setUnit] = useState<VolumeUnit>(preferredUnit);
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Every open starts from the saved preference and a clean slate.
   *
   * Without this the sheet would remember the unit from the last drink, which
   * is a preference the user never set — exactly the drift the two-concept
   * model above exists to prevent.
   */
  useEffect(() => {
    if (visible) {
      setUnit(preferredUnit);
      setCustom('');
      setShowCustom(false);
      setSaving(false);
    }
  }, [visible, preferredUnit]);

  const customAmount = parseAmount(custom);

  const log = async (amount: number) => {
    if (saving) return;
    setSaving(true);
    // The sheet is about to go; the keyboard must not outlive it.
    Keyboard.dismiss();
    const saved = await onLog(amount, unit);
    // A failed write leaves the sheet open with the amount intact, so the
    // user can try again rather than discovering later that nothing saved.
    if (saved) onClose();
    else setSaving(false);
  };

  /**
   * Every way out of the sheet takes the keyboard with it.
   *
   * The backdrop and the close control both route through here, so neither
   * can leave a number pad floating over the Water screen.
   */
  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  /**
   * Switching units clears a typed amount, and that is deliberate.
   *
   * `16` means something very different in ounces and litres, and carrying it
   * across a unit change would log a drink the user never chose — the exact
   * reasoning `AmountEditor` records for the same decision. A tapped quick
   * amount is unaffected, since it commits immediately.
   */
  const selectUnit = (next: VolumeUnit) => {
    setUnit(next);
    setCustom('');
  };

  return (
    <VitaSheet visible={visible} onClose={close} title="Add Water">
      <UnitSelector value={unit} onChange={selectUnit} groupLabel="Log in" tone="neutral" />

      {unit !== preferredUnit ? (
        <Text style={[styles.note, { color: surfaces.textTertiary }]}>
          Logging this drink in {unitName(unit)}. Water still shows {unitName(preferredUnit)}.
        </Text>
      ) : null}

      <View style={styles.amounts}>
        {QUICK_ADDS[unit].map((amount) => (
          /*
           * `flex` has to sit on a wrapper: `PressableScale` applies its
           * `style` to the inner animated view, so a flex basis handed to it
           * never reaches the row. Learned twice — see `MetricTile` and the
           * 5.1A polish.
           */
          <View key={amount} style={styles.amountSlot}>
            <PressableScale
              style={[styles.amount, { borderColor: surfaces.border, backgroundColor: surfaces.card }]}
              onPress={() => void log(amount)}
              disabled={saving}
              accessibilityLabel={quickAddAccessibilityLabel(amount, unit)}
            >
              <Text style={[styles.amountValue, { color: surfaces.text }]} numberOfLines={1}>
                {quickAddValueLabel(amount)}
              </Text>
              <Text style={[styles.amountUnit, { color: surfaces.textTertiary }]} numberOfLines={1}>
                {quickAddUnitLabel(unit, amount)}
              </Text>
            </PressableScale>
          </View>
        ))}
      </View>

      {/*
        * Custom is disclosed rather than always present. It is the rarer path,
        * and a permanently open text field would put a keyboard between the
        * user and four buttons that answer most drinks in one tap.
        */}
      {showCustom ? (
        <View style={styles.custom}>
          {/*
            * `NumericField` carries the decimal pad and the Done bar's id; the
            * bar itself is rendered once, below, because `InputAccessoryView`
            * matches by `nativeID` and one field needs one bar.
            */}
          <NumericField
            label={`Amount in ${unitName(unit)}`}
            placeholder={`Enter ${unitName(unit)}`}
            value={custom}
            onChangeText={setCustom}
            autoFocus
            accessibilityLabel={`Custom amount in ${unitName(unit)}`}
          />
          <PressableScale
            style={[
              styles.customLog,
              { backgroundColor: surfaces.text },
              (customAmount === null || saving) && styles.disabled,
            ]}
            disabled={customAmount === null || saving}
            onPress={() => customAmount !== null && void log(customAmount)}
            accessibilityLabel={
              customAmount === null
                ? 'Log custom amount, enter an amount first'
                : `Log ${formatEntered(customAmount, unit)}`
            }
          >
            <Text style={[styles.customLogLabel, { color: surfaces.background }]}>
              {customAmount === null ? 'Log' : `Log ${formatEntered(customAmount, unit)}`}
            </Text>
          </PressableScale>
        </View>
      ) : (
        <PressableScale
          style={[styles.customToggle, { borderColor: surfaces.border }]}
          onPress={() => setShowCustom(true)}
          haptic="selection"
          accessibilityLabel="Enter a custom amount"
        >
          <Text style={[styles.customToggleLabel, { color: surfaces.text }]}>Custom amount</Text>
        </PressableScale>
      )}

      {/*
        * Neutral rather than the bar's default brand purple — this is a
        * hydration sheet, and a Done key is keyboard chrome that has not
        * earned a feature colour.
        */}
      {showCustom ? <NumericKeyboardAccessory tone="neutral" /> : null}
    </VitaSheet>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typography.caption,
    marginTop: spacing.m,
  },
  amounts: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.l,
  },
  amountSlot: {
    flex: 1,
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xs,
    minHeight: 56,
    borderRadius: radii.control,
    borderWidth: 1,
  },
  amountValue: {
    ...typography.title,
  },
  amountUnit: {
    ...typography.caption,
  },
  custom: {
    marginTop: spacing.l,
    gap: spacing.m,
  },
  customLog: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.control,
    minHeight: 48,
  },
  customLogLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
  customToggle: {
    marginTop: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    minHeight: 48,
  },
  customToggleLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
});
