import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';

type Props = {
  firstName: string;
  headline: string;
  subline: string;
};

export function GreetingCard({ firstName, headline, subline }: Props) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.greeting}>Good morning, {firstName}.</Text>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.subline}>{subline}</Text>
        </View>
        <View style={styles.sun}>
          <Ionicons name="sunny" size={30} color={palette.primary} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  headline: {
    ...typography.title,
    color: palette.text,
  },
  subline: {
    ...typography.caption,
    color: palette.textTertiary,
  },
  sun: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
