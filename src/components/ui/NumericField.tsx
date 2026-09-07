import { useId } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { TextField } from './TextField';

/**
 * The **Done** bar above the number pad.
 *
 * iOS's decimal and number pads have no return key, so a numeric field is the
 * one place in the app where someone can be left with no obvious way to put
 * the keyboard away — which means the field they just typed into, and the
 * button that would save it, stay hidden behind the pad.
 *
 * `InputAccessoryView` is iOS-only and renders nothing elsewhere. Android's
 * number pad has its own system dismiss affordance and needs none of this.
 *
 * **Not rendered by screens.** Every instance belongs to exactly one
 * `NumericField`, which is what makes the behaviour impossible to forget —
 * see the note there.
 */
function NumericKeyboardAccessory({ nativeID }: { nativeID: string }) {
  const { surfaces } = useTheme();

  if (Platform.OS !== 'ios') return null;

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View
        style={[styles.bar, { backgroundColor: surfaces.card, borderTopColor: surfaces.border }]}
      >
        <Pressable
          /*
           * Dismisses, and does nothing else.
           *
           * Not a submit, not a save, and not an advance to the next field:
           * the typed value stays exactly as typed, and the form's own action
           * stays the thing that commits it. A Done key that saved would make
           * closing a keyboard a destructive act.
           */
          onPress={() => Keyboard.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Done, close the number pad"
          hitSlop={12}
          style={({ pressed }) => [styles.done, pressed && styles.pressed]}
        >
          {/*
           * Neutral, not a feature colour.
           *
           * A Done key is keyboard chrome. It was peptide purple while every
           * caller happened to be a Peptides screen, which read as a bug the
           * moment Water and Fuel got one too.
           */}
          <Text style={[styles.doneLabel, { color: surfaces.text }]}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

type Props = Omit<React.ComponentProps<typeof TextField>, 'keyboardType'> & {
  /**
   * `'decimal'` (default) types `0.5` and `1.25`; `'integer'` is for counts
   * that cannot be fractional. Both are pads with no return key, so both get
   * the Done bar.
   */
  numericKind?: 'decimal' | 'integer';
};

/**
 * A `TextField` for numbers, which **carries its own Done bar**.
 *
 * ## Why the accessory lives here
 *
 * It used to be a separate export that each screen rendered once, next to its
 * fields, keyed to one shared `nativeID`. That worked exactly as long as
 * everyone remembered — and the failure was silent in both directions. A
 * screen that used a numeric field and forgot the bar pointed
 * `inputAccessoryViewID` at an id nothing had registered, so iOS showed a
 * bare pad with no way to dismiss it. A screen that rendered the bar and no
 * longer had a numeric field kept a stray registration nobody could see.
 * Founder device QA found the first kind three times, in three separate
 * slices, and each was patched where it was found rather than at the cause.
 *
 * So the bar is now part of the primitive. Each field mints its own id with
 * `useId` and renders the matching accessory beside itself. Nothing to wire
 * up, nothing to forget, and **no screen renders an accessory any more**.
 *
 * ## Why one bar per field rather than one per screen
 *
 * Because a shared id cannot be made modal-safe. `InputAccessoryView` has to
 * live in the same presented hierarchy as the input it serves — the
 * `TakenSheet` finding in slice 5.5 — and a bar registered by the route
 * underneath a modal is in the wrong hierarchy for a field inside it. Making
 * each field self-sufficient removes the hierarchy question entirely: the
 * accessory is wherever the field is, so a field works identically in a
 * route, a `VitaSheet`, and a bare RN `Modal`.
 *
 * iOS displays only the focused input's accessory, so N fields on a screen
 * cost N small views of which at most one is ever on screen.
 *
 * The raw string stays exactly as typed. Nothing here reformats input while
 * someone is mid-number: rewriting `0.` to `0` as they type is how a decimal
 * point becomes impossible to enter.
 */
export function NumericField({ numericKind = 'decimal', ...props }: Props) {
  /*
   * Unique per mounted field. `useId` produces ids containing characters iOS
   * has no reason to like in a view tag, so they are stripped rather than
   * trusted.
   */
  const generated = useId().replace(/[^a-zA-Z0-9]/g, '');
  const accessoryID = `vita-numeric-${generated}`;

  return (
    <>
      <TextField
        {...props}
        keyboardType={numericKind === 'integer' ? 'number-pad' : 'decimal-pad'}
        inputAccessoryViewID={Platform.OS === 'ios' ? accessoryID : undefined}
      />
      <NumericKeyboardAccessory nativeID={accessoryID} />
    </>
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
