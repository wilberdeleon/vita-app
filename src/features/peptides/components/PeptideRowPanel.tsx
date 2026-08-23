import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import type { ResolvedSetup } from '../../../lib/peptides';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { ClassificationChip } from './ClassificationChip';

type Props = {
  setups: readonly ResolvedSetup[];
};

/**
 * The user's setups, as rows in one panel.
 *
 * Rows, not a card each — the Design System's conclusion from Fuel, and the
 * same treatment the water log uses. A setup is a name and a line of context;
 * a card around each would be mostly padding.
 *
 * **Scannable, not exhaustive.** A row carries the name, the classification,
 * and the schedule the user chose. Vial contents, reconstitution volume, and
 * syringe configuration live on the detail screen — a list that shows every
 * field is a list nobody reads. There is deliberately no dose anywhere: no
 * dose has been recorded, because administration logging does not exist yet.
 */
export function PeptideRowPanel({ setups }: Props) {
  const { surfaces } = useTheme();

  return (
    <Card style={styles.panel}>
      {setups.map((item, index) => {
        const detail = [item.definition.category, item.scheduleLabel].filter(Boolean).join(' · ');

        return (
          <View
            key={item.setup.id}
            style={[index > 0 && styles.divided, index > 0 && { borderTopColor: surfaces.border }]}
          >
            <Pressable
              onPress={() => router.push(`/peptides/setup/${encodeURIComponent(item.setup.id)}`)}
              accessibilityRole="button"
              accessibilityLabel={[
                item.name,
                item.definition.classification === 'approved-medication'
                  ? 'approved medication'
                  : item.definition.classification === 'research-compound'
                    ? 'research compound'
                    : 'custom entry',
                detail,
                'Edit setup',
              ]
                .filter(Boolean)
                .join('. ')}
              style={styles.row}
            >
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={[styles.name, { color: surfaces.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <ClassificationChip classification={item.definition.classification} />
                </View>
                {detail ? (
                  <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={1}>
                    {detail}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingVertical: spacing.xs,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexWrap: 'wrap',
  },
  name: {
    ...typography.bodyMedium,
    flexShrink: 1,
  },
  detail: {
    ...typography.caption,
  },
});
