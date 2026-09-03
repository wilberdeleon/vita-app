import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { TextField } from './TextField';

/**
 * One shared id for the numeric accessory bar.
 *
 * A single constant rather than a per-field id: every numeric field on a
 * screen wants the same bar, and `InputAccessoryView` matches by `nativeID`,
 * so sharing one lets a screen render the bar once instead of once per input.
 */
export const NUMERIC_ACCESSORY_ID = 'vita-numeric-done';

type AccessoryProps = {
  /**
   * `'brand'` (default) keeps the peptide-purple Done every existing caller
   * renders today. `'neutral'` uses the theme's primary text, for screens
   * outside that feature. See the note in the component.
   */
  tone?: 'brand' | 'neutral';
};

/**
 * The **Done** bar above the number pad.
 *
 * iOS's decimal pad has no return key, so a numeric field is the one place in
 * the app where a user can be left with no obvious way to put the keyboard
 * away — which on the calculator meant the answer stayed hidden behind it.
 * Founder device QA found exactly that.
 *
 * `InputAccessoryView` is iOS-only and renders nothing elsewhere, so this is
 * guarded rather than left to fail quietly. Android's number pad has its own
 * system dismiss affordance and needs none of this.
 *
 * Render **once per screen**, alongside the fields rather than inside them.
 */
export function NumericKeyboardAccessory({ tone = 'brand' }: AccessoryProps = {}) {
  const { surfaces } = useTheme();

  if (Platform.OS !== 'ios') return null;

  /**
   * The bar is shared chrome, and until slice 5.2 every caller happened to be
   * a Peptides screen — so a hardcoded peptide purple looked correct by
   * coincidence rather than by design. Water is the first caller outside that
   * feature, and a purple Done key in a hydration sheet reads as a bug.
   *
   * `'neutral'` is what the Sprint 5 colour rule actually asks for here: a Done
   * key is keyboard chrome and has not earned a feature colour. The default
   * stays `'brand'` so the five existing Peptides call sites are untouched by
   * this slice. **Converging them onto neutral belongs to 5.7**, where shared
   * primitives are unified.
   */
  const doneColor = tone === 'neutral' ? surfaces.text : palette.peptide;

  return (
    <InputAccessoryView nativeID={NUMERIC_ACCESSORY_ID}>
      <View
        style={[
          styles.bar,
          { backgroundColor: surfaces.card, borderTopColor: surfaces.border },
        ]}
      >
        <Pressable
          onPress={() => Keyboard.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Done, close the number pad"
          hitSlop={12}
          style={({ pressed }) => [styles.done, pressed && styles.pressed]}
        >
          <Text style={[styles.doneLabel, { color: doneColor }]}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

type Props = Omit<React.ComponentProps<typeof TextField>, 'keyboardType'>;

/**
 * A `TextField` for numbers, with the decimal pad and the Done bar attached.
 *
 * `decimal-pad` rather than `number-pad` so `0.5` and `1.25` are typable —
 * amounts in this domain are routinely fractional.
 *
 * The raw string stays exactly as typed. Nothing here reformats input while
 * someone is mid-number: rewriting `0.` to `0` as they type is how a decimal
 * point becomes impossible to enter.
 */
export function NumericField(props: Props) {
  return (
    <TextField
      {...props}
      keyboardType="decimal-pad"
      inputAccessoryViewID={Platform.OS === 'ios' ? NUMERIC_ACCESSORY_ID : undefined}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  done: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  doneLabel: {
    ...typography.bodyMedium,
  },
});
