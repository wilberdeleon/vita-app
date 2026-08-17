import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ListRow } from '../../../components/ui';
import { entryServingLabel, type FoodEntry } from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  entry: FoodEntry;
  onDelete: () => void;
};

/**
 * One logged food in the Food Log.
 *
 * Tapping the row opens the editor — the interaction the row's card styling
 * already implies, rather than a new control bolted on.
 *
 * Delete stays as an explicit trailing button rather than a swipe: swipe-to
 * delete is invisible until discovered, and the Undo toast that follows makes
 * a confirm dialog unnecessary — the action is reversible, so it doesn't need
 * a gate in front of it. No chevron alongside it: value + delete + chevron is
 * three trailing elements competing in one row, and the editor is also
 * reachable from the row body.
 */
export function LoggedEntryRow({ entry, onDelete }: Props) {
  const { surfaces } = useTheme();
  const detail = entry.brand ? `${entry.brand} · ${entryServingLabel(entry)}` : entryServingLabel(entry);

  return (
    <ListRow
      title={entry.name}
      subtitle={detail}
      onPress={() => router.push(`/fuel/entry/${encodeURIComponent(entry.id)}`)}
      trailing={
        <View style={styles.trailing}>
          <Text style={[styles.kcal, { color: surfaces.textSecondary }]}>
            {Math.round(entry.nutrition.calories)} kcal
          </Text>
          <Pressable
            hitSlop={10}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${entry.name}`}
          >
            <Ionicons name="close-circle" size={20} color={surfaces.textTertiary} />
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  kcal: {
    ...typography.caption,
  },
});
