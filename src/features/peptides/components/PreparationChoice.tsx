import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * `null` until the user says. Never guessed from whether a vial happens to be
 * filled in — an empty vial field means *unanswered*, not *already prepared*.
 */
export type PreparationMode = 'configure' | 'already-prepared' | null;

type Props = {
  value: PreparationMode;
  onChange: (next: Exclude<PreparationMode, null>) => void;
};

const OPTIONS = [
  {
    value: 'configure' as const,
    title: 'Set up vial',
    body: 'You reconstitute it yourself. VITA works out what the syringe marks are worth.',
    icon: 'flask-outline' as const,
  },
  {
    value: 'already-prepared' as const,
    /*
     * Not "Skip".
     *
     * Someone whose clinic hands them a prepared pen has not skipped a step —
     * there was no step. "Skip preparation" frames a complete, ordinary
     * situation as an omission, and the founder's §54 note is right that it
     * would read as the lesser of the two paths. This names what is true.
     */
    title: 'Already prepared',
    body: 'It arrives ready to use — from a pharmacy, a clinic, or a pen.',
    icon: 'checkmark-circle-outline' as const,
  },
];

/**
 * The first question Routine Setup asks, and the one that decides how much
 * of the rest of it applies.
 *
 * ## Why this comes first
 *
 * The founder's model is *prepare it, then track it*. Someone who mixes a
 * vial has a concentration to work out before an amount means anything;
 * someone handed a prepared pen has nothing to work out at all and was
 * previously made to scroll past a vial field, a reconstitution field and a
 * conversion table to reach the one thing they came to set — the amount.
 *
 * ## Neither answer is the lesser one
 *
 * Both options are the same size, in the same order every time, with no
 * default selection and nothing marked recommended. Preparation remains
 * **optional** either way: choosing *Set up vial* and then leaving both
 * fields empty saves a perfectly valid routine, exactly as it always did.
 *
 * ## Choosing "Already prepared" stores nothing
 *
 * It is a statement about how the compound arrives, not a value. No vial
 * amount is inferred, no reconstitution volume is defaulted, and no unit
 * conversion is shown — because with no concentration there is no honest
 * conversion to show. See `SetupForm`, which clears rather than retains
 * anything typed before the choice changed.
 *
 * Stacked rather than side by side: two full-width rows read calmly, wrap
 * properly at accessibility text sizes, and avoid handing `flex` to a
 * `PressableScale`, which does not pass it through.
 */
export function PreparationChoice({ value, onChange }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.group} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            haptic="selection"
            accessibilityRole="radio"
            /* Spoken as a whole: what it is, what it means, and whether it is
               the current answer — §63. */
            accessibilityLabel={`${option.title}. ${option.body}`}
            accessibilityState={{ selected }}
            style={[
              styles.option,
              {
                backgroundColor: surfaces.card,
                borderColor: selected ? palette.peptide : surfaces.border,
              },
              selected && styles.selected,
            ]}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={selected ? palette.peptide : surfaces.textTertiary}
            />
            <View style={styles.text}>
              <Text
                style={[
                  styles.title,
                  { color: selected ? palette.peptide : surfaces.text },
                ]}
              >
                {option.title}
              </Text>
              <Text style={[styles.body, { color: surfaces.textTertiary }]}>{option.body}</Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.s,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.m,
    borderRadius: radii.control,
    borderWidth: 1,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  selected: {
    borderWidth: 1.5,
  },
  text: {
    // Only the text column flexes; the row itself never hands `flex` to the
    // pressable around it.
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
  },
  body: {
    ...typography.caption,
  },
});
