import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Screen, ScreenHeader, SectionHeader, SegmentedTabs } from '../../../components/ui';
import { BodyMap } from '../../../features/peptides/components/BodyMap';
import { formatClockTime, formatLogDateLong } from '../../../lib/daily';
import {
  REGION_DESCRIPTIONS,
  entriesAtSite,
  entriesWithSites,
  siteKeyLabel,
  usePeptideContext,
  type BodyView,
  type InjectionSiteKey,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** How many recent records the screen lists before it stops. */
const RECENT_LIMIT = 12;
/** How many entries are shown for one selected zone. */
const ZONE_LIMIT = 4;

const VIEWS: readonly BodyView[] = ['front', 'back'];
const VIEW_LABELS = ['Front', 'Back'];

/**
 * Injection Sites — a map of where administrations happened.
 *
 * **This screen never tells anyone where to inject.** No recommended site, no
 * "next" site, no rotation schedule, no colour coding of good and bad. It
 * answers factual questions — where have I used, when was that one last, what
 * do these words mean — and stops there. Tapping a zone here records nothing;
 * it is a lens onto history, not a logging surface.
 *
 * **The figure leads** (slice 3.8A). The first version was a list of text and
 * the founder was right that it read as a definitions page rather than a
 * tool. A body gives the screen a focal point and makes "left thigh" mean
 * something instantly, which four sentences never will.
 *
 * **Aggregated across every peptide**, because that is how sites are actually
 * used: someone rotating locations does it across whatever they are taking.
 * Names resolve from the compiled catalog rather than the setup, so history
 * survives a setup going inactive — or being removed in a later slice.
 */
export default function InjectionSites() {
  const { logs, findDefinition } = usePeptideContext();
  const { surfaces } = useTheme();

  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<InjectionSiteKey | undefined>();

  const withSites = useMemo(() => entriesWithSites(logs), [logs]);
  const recent = useMemo(() => withSites.slice(0, RECENT_LIMIT), [withSites]);
  const atZone = useMemo(
    () => (selected ? entriesAtSite(withSites, selected) : []),
    [withSites, selected],
  );

  const describe = (entry: (typeof logs)[number]) => {
    const name = findDefinition(entry.definitionId)?.name ?? 'Peptide';
    return `${name} · ${formatLogDateLong(entry.logDate)} · ${formatClockTime(entry.loggedAt)}`;
  };

  return (
    <Screen>
      <ScreenHeader title="Injection Sites" back />
      <Text style={[styles.subtitle, { color: surfaces.textSecondary }]}>
        Where you have recorded administrations.
      </Text>

      <Card style={styles.mapCard}>
        <SegmentedTabs
          options={VIEW_LABELS}
          selectedIndex={VIEWS.indexOf(view)}
          onChange={(index) => setView(VIEWS[index])}
          activeColor={palette.peptide}
          groupLabel="Body view"
        />
        <BodyMap
          view={view}
          selected={selected}
          onSelect={(key) => setSelected((current) => (current === key ? undefined : key))}
        />

        {/*
         * What this zone's history says, and only that. A zone with nothing
         * recorded says so plainly rather than being styled as available.
         */}
        <View style={[styles.zone, { borderTopColor: surfaces.border }]}>
          {selected === undefined ? (
            <Text style={[styles.zoneHint, { color: surfaces.textTertiary }]}>
              Tap a location to see its history.
            </Text>
          ) : (
            <>
              <Text style={[styles.zoneName, { color: surfaces.text }]}>
                {siteKeyLabel(selected)}
              </Text>
              {atZone.length === 0 ? (
                <Text style={[styles.zoneHint, { color: surfaces.textTertiary }]}>
                  No history recorded here.
                </Text>
              ) : (
                <>
                  <Text style={[styles.zoneHint, { color: surfaces.textSecondary }]}>
                    Last recorded {formatLogDateLong(atZone[0].logDate)} ·{' '}
                    {atZone.length} {atZone.length === 1 ? 'log' : 'logs'}
                  </Text>
                  {atZone.slice(0, ZONE_LIMIT).map((entry) => (
                    <Text
                      key={entry.id}
                      style={[styles.zoneEntry, { color: surfaces.textTertiary }]}
                      numberOfLines={1}
                    >
                      {describe(entry)}
                    </Text>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </Card>

      <SectionHeader title="Recent Sites" />
      {recent.length === 0 ? (
        <Text style={[styles.empty, { color: surfaces.textTertiary }]}>
          Nothing recorded yet. Sites you add when logging a peptide appear here.
        </Text>
      ) : (
        <Card style={styles.panel}>
          {recent.map((entry, index) => (
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
              accessibilityLabel={`${entry.site!.label}. ${describe(entry)}`}
            >
              <Text style={[styles.site, { color: surfaces.text }]}>{entry.site!.label}</Text>
              <Text style={[styles.meta, { color: surfaces.textTertiary }]} numberOfLines={1}>
                {describe(entry)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Five lines, not five paragraphs — the figure above already explains
          the locations better than prose can, and this is reference material
          sitting under it rather than an introduction to it. */}
      <SectionHeader title="Site Reference" />
      <Card style={styles.panel}>
        {REGION_DESCRIPTIONS.map((entry, index) => (
          <View
            key={entry.region}
            style={[
              styles.guideRow,
              index > 0 && styles.divided,
              index > 0 && { borderTopColor: surfaces.border },
            ]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${entry.region}. ${entry.description}`}
          >
            <Text style={[styles.guideName, { color: surfaces.text }]}>{entry.region}</Text>
            <Text style={[styles.guideBody, { color: surfaces.textTertiary }]}>
              {entry.description}
            </Text>
          </View>
        ))}
      </Card>

      {/* One quiet line, once. The boundary is real and is stated — but
          repeating it beside every block would make the screen read as
          nervous, and nothing else here offers advice to disclaim. */}
      <Text style={[styles.footer, { color: surfaces.textTertiary }]}>
        For tracking and anatomical reference only.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.caption,
    marginTop: -spacing.s,
    marginBottom: spacing.xs,
  },
  mapCard: {
    gap: spacing.s,
  },
  panel: {
    paddingVertical: spacing.xs,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  zone: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
    gap: 2,
  },
  zoneName: {
    ...typography.bodyMedium,
  },
  zoneHint: {
    ...typography.caption,
  },
  zoneEntry: {
    ...typography.caption,
  },
  row: {
    gap: 2,
    paddingVertical: spacing.s,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingVertical: spacing.s,
  },
  site: {
    ...typography.bodyMedium,
  },
  meta: {
    ...typography.caption,
  },
  guideName: {
    ...typography.captionMedium,
  },
  guideBody: {
    ...typography.caption,
    flexShrink: 1,
    textAlign: 'right',
  },
  empty: {
    ...typography.caption,
  },
  footer: {
    ...typography.micro,
    marginTop: spacing.s,
  },
});
