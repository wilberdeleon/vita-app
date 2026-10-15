import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { useJourneyAccent } from './useJourneyAccent';

export type SpineItem = {
  key: string;
  /** Small caps label — a date for a real event, a pillar name for structure. */
  label: string;
  body: string;
  /** Secondary detail on the right, e.g. a weight. */
  detail?: string;
  /**
   * `true` for a recorded event (a filled node); `false` for structure only
   * (a hollow node) — the empty Overview's sections, which are places history
   * will attach, not history.
   */
  recorded: boolean;
  accessibilityLabel?: string;
};

/**
 * Journey's signature line — a restrained gold rail with nodes on it.
 *
 * The one visual idea slice 6.3 introduces for the history Journey will
 * become: things attach to a single chronological spine. Empty, the nodes are
 * hollow and name what will live there; populated (the `__DEV__` preview
 * today, real records from 6.4), they are filled and carry a date. It never
 * draws an invented event — it renders exactly the items it is given.
 */
export function JourneySpine({ items }: { items: readonly SpineItem[] }) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();

  return (
    <View>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <View
            key={item.key}
            style={styles.row}
            accessible
            accessibilityLabel={item.accessibilityLabel ?? [item.label, item.body, item.detail].filter(Boolean).join(', ')}
          >
            <View style={styles.rail}>
              <View style={[styles.node, { borderColor: accent }, item.recorded && { backgroundColor: accent }]} />
              {last ? null : <View style={[styles.line, { backgroundColor: accent }]} />}
            </View>
            <View style={[styles.content, !last && styles.contentGap]}>
              <Text style={[styles.label, { color: surfaces.textTertiary }]}>{item.label.toUpperCase()}</Text>
              <View style={styles.bodyRow}>
                <Text style={[styles.body, { color: surfaces.text }]}>{item.body}</Text>
                {item.detail ? (
                  <Text style={[styles.detail, { color: surfaces.textSecondary }]}>{item.detail}</Text>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const NODE = 10;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  rail: {
    width: NODE,
    alignItems: 'center',
    paddingTop: 3,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 1.5,
  },
  line: {
    flex: 1,
    width: 1.5,
    marginTop: 3,
    opacity: 0.45,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  contentGap: {
    paddingBottom: spacing.l,
  },
  label: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: spacing.m,
  },
  body: {
    ...typography.body,
    flexShrink: 1,
  },
  detail: {
    ...typography.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
});
