import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, ProgressBar } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import type { JourneySnapshot } from '../types';

type Props = {
  journey: JourneySnapshot;
};

export function JourneyCard({ journey }: Props) {
  return (
    <Pressable onPress={() => router.push('/journey')}>
      <Card>
        <View style={styles.row}>
          <View style={styles.text}>
            <Text style={styles.stage}>{journey.stage}</Text>
            <Text style={styles.week}>
              Week {journey.week} of {journey.totalWeeks}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
        </View>
        <ProgressBar progress={journey.week / journey.totalWeeks} height={6} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  stage: {
    ...typography.heading,
    color: palette.text,
  },
  week: {
    ...typography.caption,
    color: palette.textTertiary,
  },
});
