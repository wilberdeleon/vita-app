import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/ui';
import type { PeptideRoutineState } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  /** `undefined` when this peptide is not in the user's routine at all. */
  state?: PeptideRoutineState;
  onPress: () => void;
};

/**
 * What this page's action is, given where the peptide already stands.
 *
 * Four states, four sentences — because "Add to Routine" on something the
 * user added last week is not merely redundant, it invites a tap that would
 * mean nothing. The label always names the next real step.
 *
 * The supporting line exists for the first state only. Someone deciding
 * whether to track a compound benefits from knowing that adding it is
 * lightweight; someone returning to a routine they already configured does
 * not need it explained.
 */
export function RoutineCta({ state, onPress }: Props) {
  const { surfaces } = useTheme();

  const label =
    state === undefined
      ? 'Add to Routine'
      : state === 'needs-setup'
        ? 'Finish Setup'
        : 'View Routine';

  const hint =
    state === undefined
      ? 'Add this peptide to your routine. You can set it up whenever you like.'
      : state === 'needs-setup'
        ? 'In your routine · setup needed'
        : state === 'inactive'
          ? 'In your routine · paused'
          : 'In your routine';

  return (
    <View style={styles.wrap}>
      <Button
        label={label}
        icon={state === undefined ? 'add' : undefined}
        color={palette.peptide}
        onPress={onPress}
      />
      <Text style={[styles.hint, { color: surfaces.textTertiary }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
  },
});
