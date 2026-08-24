import { StyleSheet, Text, View } from 'react-native';
import { formatLabel, type MechanismItem } from '../../../lib/peptides';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  mechanisms: readonly MechanismItem[];
};

/**
 * How a compound works, explained rather than recited.
 *
 * One or two sentences per pathway — enough that a reader understands why a
 * receptor system is relevant, not enough to become a textbook. Naming the
 * receptor without saying what it does is what made the old pages read as
 * reference output; the target is kept as a quiet subtitle so the plain
 * explanation leads.
 *
 * Rendered only where there is genuinely useful mechanism information. A page
 * with nothing to say here is shorter, which is better than filler.
 */
/** Ignores case, spacing and punctuation — "GHRH receptor" vs "GHRH Receptor". */
function saysTheSameThing(title: string, target: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalize(title) === normalize(target);
}

export function Mechanisms({ mechanisms }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.list}>
      {mechanisms.map((item) => (
        <View key={item.title} style={styles.item}>
          <Text style={[styles.title, { color: surfaces.text }]}>{item.title}</Text>
          {/**
           * The subtitle is dropped when it only repeats the heading. A
           * mechanism titled after its own receptor would otherwise print the
           * same words twice in two sizes, which reads as a rendering fault.
           */}
          {item.target && !saysTheSameThing(item.title, item.target) ? (
            <Text style={[styles.target, { color: surfaces.textTertiary }]}>
              {formatLabel(item.target)}
            </Text>
          ) : null}
          <Text style={[styles.explanation, { color: surfaces.textSecondary }]}>
            {item.explanation}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.l,
    marginTop: -spacing.xs,
  },
  item: {
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
  },
  target: {
    ...typography.micro,
  },
  explanation: {
    ...typography.body,
    marginTop: spacing.xs,
  },
});
