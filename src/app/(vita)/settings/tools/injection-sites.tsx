import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../../components/ui';
import { formatClockTime, formatLogDateLong } from '../../../../lib/daily';
import {
  REGION_DESCRIPTIONS,
  SITE_REGIONS,
  entriesWithSites,
  regionLabel,
  siteUsageCounts,
  usePeptideContext,
} from '../../../../lib/peptides';
import { spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/** How many recent site records the tool lists before it stops. */
const RECENT_LIMIT = 20;

/**
 * Injection Sites — a record of where administrations happened.
 *
 * **This screen never tells anyone where to inject.** It has no recommended
 * site, no "next" site, no rotation schedule, no colour coding of good and
 * bad. It answers three factual questions — where did I last do this, what
 * have I used recently, and what do these words mean — and stops there.
 *
 * **Aggregated across every peptide**, because that is how sites are actually
 * used: someone rotating locations does it across whatever they are taking,
 * not per compound. So the history is one list, and each row names its
 * peptide.
 *
 * Reads from log entries and nothing else. There is deliberately no separate
 * store of site usage — a second source of truth about the same events would
 * be one that could disagree with history.
 */
export default function InjectionSites() {
  const { logs, findDefinition } = usePeptideContext();
  const { surfaces } = useTheme();

  const recent = useMemo(() => entriesWithSites(logs).slice(0, RECENT_LIMIT), [logs]);
  const counts = useMemo(() => siteUsageCounts(logs), [logs]);

  return (
    <Screen>
      <ScreenHeader title="Injection Sites" back />

      <Text style={[styles.intro, { color: surfaces.textTertiary }]}>
        Where you recorded each administration. VITA keeps the history; choosing where to inject is
        yours.
      </Text>

      <SectionHeader title="Recent sites" />
      {recent.length === 0 ? (
        <EmptyState
          icon="body-outline"
          title="No sites recorded yet"
          body="Add a site when you log a peptide and it will appear here."
        />
      ) : (
        <Card style={styles.panel}>
          {recent.map((entry, index) => {
            const name = findDefinition(entry.definitionId)?.name ?? 'Peptide';
            const when = `${formatLogDateLong(entry.logDate)} · ${formatClockTime(entry.loggedAt)}`;
            return (
              // One accessible node per record, so it reads as a sentence
              // rather than three disconnected stops.
              <View
                key={entry.id}
                style={[
                  styles.row,
                  index > 0 && styles.divided,
                  index > 0 && { borderTopColor: surfaces.border },
                ]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${entry.site!.label}. ${name}. ${when}`}
              >
                <Text style={[styles.site, { color: surfaces.text }]}>{entry.site!.label}</Text>
                <Text style={[styles.meta, { color: surfaces.textTertiary }]} numberOfLines={1}>
                  {name} · {when}
                </Text>
              </View>
            );
          })}
        </Card>
      )}

      {/*
        * A plain tally of what was recorded. Ordered most-used first because
        * that is the only ordering the data itself supports — it is a
        * description of the past, not a ranking of preference, and no row is
        * marked as due, avoided, or suggested.
        */}
      {counts.length > 1 ? (
        <>
          <SectionHeader title="Sites used" />
          <Card style={styles.panel}>
            {counts.map((entry, index) => (
              <View
                key={entry.label}
                style={[
                  styles.countRow,
                  index > 0 && styles.divided,
                  index > 0 && { borderTopColor: surfaces.border },
                ]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${entry.label}, ${entry.count} ${entry.count === 1 ? 'log' : 'logs'}`}
              >
                <Text style={[styles.site, { color: surfaces.text }]}>{entry.label}</Text>
                <Text style={[styles.count, { color: surfaces.textSecondary }]}>
                  {entry.count} {entry.count === 1 ? 'log' : 'logs'}
                </Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {/*
        * What the words mean, and nothing more. No needle angle, no depth, no
        * technique, and nothing compound-specific — "best for GLP-1" is the
        * sentence this screen exists to not contain.
        */}
      <SectionHeader title="Site guide" />
      <Card style={styles.panel}>
        {SITE_REGIONS.map((region, index) => (
          <View
            key={region}
            style={[
              styles.guideRow,
              index > 0 && styles.divided,
              index > 0 && { borderTopColor: surfaces.border },
            ]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${regionLabel(region)}. ${REGION_DESCRIPTIONS[region]}`}
          >
            <Text style={[styles.guideName, { color: surfaces.text }]}>{regionLabel(region)}</Text>
            <Text style={[styles.guideBody, { color: surfaces.textSecondary }]}>
              {REGION_DESCRIPTIONS[region]}
            </Text>
          </View>
        ))}
      </Card>

      <Text style={[styles.footer, { color: surfaces.textTertiary }]}>
        Information is for tracking and educational reference only. VITA does not recommend
        injection sites, dosing, or treatment.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
  },
  panel: {
    paddingVertical: spacing.xs,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    gap: 2,
    paddingVertical: spacing.s,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingVertical: spacing.s,
  },
  guideRow: {
    gap: 2,
    paddingVertical: spacing.s,
  },
  site: {
    ...typography.bodyMedium,
  },
  meta: {
    ...typography.caption,
  },
  count: {
    ...typography.caption,
  },
  guideName: {
    ...typography.bodyMedium,
  },
  guideBody: {
    ...typography.caption,
  },
  footer: {
    ...typography.caption,
    marginTop: spacing.s,
  },
});
