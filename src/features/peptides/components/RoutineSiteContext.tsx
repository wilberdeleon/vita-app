import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { weekdayInitial } from '../../../lib/daily';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { SiteLogSummary } from '../week';

type Props = {
  /** Every site-tagged log this routine recorded in the selected week. */
  logs: readonly SiteLogSummary[];
  onOpenTool: () => void;
};

/** How many distinct sites the chips show before deferring to the tool. */
const SITE_LIMIT = 3;

/**
 * Where this routine's injections landed this week — a line, not a body map.
 *
 * **The full picture belongs to the Injection Sites tool**, and putting a
 * second figure here would make the routine screen carry a second screen. This
 * is context: the days, the places, and a way through to the tool that does
 * the visual work.
 *
 * **It disappears when there is nothing to say.** A routine whose logs carry
 * no site — which is most of them, since the site is optional and always will
 * be — renders nothing at all rather than an empty body or a prompt to start
 * recording sites. Absence of an optional field is not a gap to be filled.
 *
 * **Nothing here suggests a next site.** No rotation, no rest periods, no
 * "you have used this one twice". It reads back what was recorded.
 */
export function RoutineSiteContext({ logs, onOpenTool }: Props) {
  const { surfaces } = useTheme();
  if (logs.length === 0) return null;

  /*
   * Grouped by place, not by log — the same rule the body map follows.
   * Four administrations at the centre abdomen are one chip reading `4`, not
   * four identical chips, which is what the first version drew and what made
   * this region noise rather than context.
   */
  const grouped = new Map<string, { label: string; days: string[]; first: number }>();
  for (const log of [...logs].sort((a, b) => a.dayIndex - b.dayIndex)) {
    const existing = grouped.get(log.label);
    if (existing) existing.days.push(weekdayInitial(log.logDate));
    else grouped.set(log.label, {
      label: log.label,
      days: [weekdayInitial(log.logDate)],
      first: log.dayIndex,
    });
  }

  const sites = [...grouped.values()].sort((a, b) => a.first - b.first);
  const shown = sites.slice(0, SITE_LIMIT);
  const remaining = sites.length - shown.length;

  const spoken = sites
    .map((site) =>
      site.days.length === 1
        ? `${site.label}, once`
        : `${site.label}, ${site.days.length} times`,
    )
    .join('. ');

  return (
    <PressableScale
      onPress={onOpenTool}
      style={styles.section}
      accessibilityLabel={`Injection sites this week. ${spoken}`}
      accessibilityHint="Opens Injection Sites"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: surfaces.text }]}>Injection sites this week</Text>
        <Ionicons name="chevron-forward" size={15} color={surfaces.textTertiary} />
      </View>

      {/*
        * One chip per administration, in day order. The weekday initial is
        * decoration over a label that already says the day and the place, so
        * nothing depends on reading a single letter.
        */}
      <View style={styles.chips}>
        {shown.map((site) => (
          <View
            key={site.label}
            style={[styles.chip, { borderColor: surfaces.border }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {/* The weekday for a single use, the count for several — one
                letter cannot honestly stand for two different days. */}
            <View style={[styles.dot, { backgroundColor: palette.peptide }]}>
              <Text style={styles.dotLabel}>
                {site.days.length === 1 ? site.days[0] : site.days.length}
              </Text>
            </View>
            <Text style={[styles.chipLabel, { color: surfaces.textSecondary }]} numberOfLines={1}>
              {site.label}
            </Text>
          </View>
        ))}
        {remaining > 0 ? (
          <View
            style={[styles.chip, { borderColor: surfaces.border }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text style={[styles.chipLabel, { color: surfaces.textTertiary }]}>
              +{remaining} more
            </Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.s,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    minHeight: 32,
  },
  title: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.chip,
    paddingLeft: spacing.xs,
    paddingRight: spacing.s,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: {
    color: palette.textOnColor,
    fontSize: 10,
    fontWeight: '700',
  },
  chipLabel: {
    ...typography.caption,
    fontSize: 13.5,
    flexShrink: 1,
  },
});
