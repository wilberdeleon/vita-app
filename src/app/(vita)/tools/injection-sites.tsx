import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, ScreenHeader, SegmentedTabs } from '../../../components/ui';
import { BodyMap, type SiteMarker } from '../../../features/peptides/components/BodyMap';
import { Disclosure } from '../../../features/peptides/components/Disclosure';
import { WeekSelector } from '../../../features/peptides/components/WeekSelector';
import { compactWeekday } from '../../../features/peptides/month';
import { countSiteLogs, siteLogsForWeek, weekOf } from '../../../features/peptides/week';
import { formatClockTime, formatLogDateLong, weekdayName } from '../../../lib/daily';
import {
  REGION_DESCRIPTIONS,
  entriesAtSite,
  entriesWithSites,
  formatMcg,
  siteKeyLabel,
  usePeptideContext,
  type BodyView,
  type InjectionSiteKey,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** How many all-time records the disclosed list shows before it stops. */
const ALL_TIME_LIMIT = 12;

const VIEWS: readonly BodyView[] = ['front', 'back'];
const VIEW_LABELS = ['Front', 'Back'];

/**
 * Injection Sites — where administrations were recorded, one week at a time.
 *
 * ## Slice 5.5: a history, not a directory
 *
 * It used to be a map you could tap to read a zone's all-time history, plus a
 * flat list of the twelve most recent records. That answered *what have I
 * ever done here* and never answered the question people actually have, which
 * is **where did I inject this week**. The figure now carries markers for the
 * selected week, and the week can be stepped through.
 *
 * ## This screen never tells anyone where to inject
 *
 * No recommended site, no "next" site, no rotation schedule, no rest period,
 * no spacing advice, no colour scale of good and bad. A marker means *you
 * logged here*, and that is the entire vocabulary. Tapping a zone records
 * nothing — it is a lens onto history, not a logging surface.
 *
 * ## Markers describe history exactly as it was stored
 *
 * Read from each log's own site snapshot, never inferred from a routine's
 * current configuration. A site recorded in March stays where it was
 * recorded, whatever the routine looks like now.
 *
 * **One marker per place.** Two administrations at the left thigh are one
 * marker reading `2`, not two circles stacked where neither can be read or
 * tapped. Everything a marker shows is also written out below it, because a
 * drawing is not an accessible interface on its own.
 *
 * **Aggregated across every peptide**, because that is how sites are actually
 * used. One violet, not a colour per compound — a legend of arbitrary hues on
 * a body would look like it meant something clinical.
 *
 * ## A week is the view, not the limit
 *
 * The map answers *this week*, which is the question people arrive with. But
 * someone whose last injection was two months ago should not have to press
 * *previous week* eight times to find it, so the all-time list the tool
 * already had is still here, disclosed beneath. Narrowing the default view is
 * not the same as removing history.
 */
export default function InjectionSites() {
  const { logs, findDefinition, today } = usePeptideContext();
  const { surfaces } = useTheme();

  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<InjectionSiteKey | undefined>();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => weekOf(today, weekOffset), [today, weekOffset]);

  const grouped = useMemo(
    () =>
      siteLogsForWeek(logs, weekDays, (entry) => ({
        name: findDefinition(entry.definitionId)?.name ?? 'Peptide',
        amount: formatMcg(entry.amount.amountMcg, entry.amount.authoredUnit),
      })),
    [logs, weekDays, findDefinition],
  );

  const total = countSiteLogs(grouped);

  /**
   * One marker per site, spoken as a full sentence.
   *
   * A single log gets its weekday initial; several get the count, because one
   * letter cannot honestly stand for two different days.
   */
  const markers: SiteMarker[] = useMemo(
    () =>
      [...grouped.entries()].map(([key, entries]) => ({
        key,
        count: entries.length,
        // `TH`/`SU` where one letter is ambiguous; the spoken label below
        // always says the weekday in full.
        initial: entries.length === 1 ? compactWeekday(entries[0].logDate) : undefined,
        spoken: `${siteKeyLabel(key)}. ${entries
          .map(
            (entry) =>
              `${weekdayName(entry.logDate)}, ${formatLogDateLong(entry.logDate)}, ${entry.name}${
                entry.amount ? `, ${entry.amount}` : ''
              }`,
          )
          .join('. ')}`,
      })),
    [grouped],
  );

  const selectedEntries = selected ? (grouped.get(selected) ?? []) : [];

  /** Every site-tagged log ever, newest first. Names resolve from the
      compiled catalog, so history survives a routine being removed. */
  const allTime = useMemo(() => entriesWithSites(logs), [logs]);

  const describe = (entry: (typeof logs)[number]) => {
    const name = findDefinition(entry.definitionId)?.name ?? 'Peptide';
    return `${name} · ${formatLogDateLong(entry.logDate)} · ${formatClockTime(entry.loggedAt)}`;
  };

  /** Everything ever recorded at the selected zone, newest first. */
  const selectedAllTime = useMemo(
    () => (selected ? entriesAtSite(allTime, selected) : []),
    [allTime, selected],
  );

  /** Every site used this week, in day order — the accessible equivalent. */
  const listed = useMemo(
    () =>
      [...grouped.entries()]
        .flatMap(([key, entries]) => entries.map((entry) => ({ key, entry })))
        .sort((a, b) => a.entry.loggedAt.localeCompare(b.entry.loggedAt)),
    [grouped],
  );

  return (
    <Screen contentGap={spacing.xl}>
      <ScreenHeader title="Injection Sites" back />

      <WeekSelector days={weekDays} offset={weekOffset} onChange={setWeekOffset} />

      <View style={styles.map}>
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
          markers={markers}
          onSelect={(key) => setSelected((current) => (current === key ? undefined : key))}
        />

        {/*
          * What the tapped zone's week says, and only that. A zone with
          * nothing recorded says so plainly rather than being styled as
          * available — "available" would be a recommendation.
          */}
        <View style={[styles.zone, { borderTopColor: surfaces.border }]}>
          {selected === undefined ? (
            <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
              {/*
                * An empty week is worth saying, but it is not the end of the
                * sentence: the zones still hold history, and a screen that
                * stopped at "nothing this week" would hide it.
                */}
              {total === 0 && allTime.length > 0
                ? 'No sites logged this week. Tap a location to see its history.'
                : total === 0
                  ? 'No injection sites logged this week.'
                  : 'Tap a location to see its history.'}
            </Text>
          ) : (
            <>
              <Text style={[styles.zoneName, { color: surfaces.text }]}>
                {siteKeyLabel(selected)}
              </Text>

              {/* This week first — the map's markers, in words. */}
              {selectedEntries.map((entry) => (
                <Text
                  key={entry.id}
                  style={[styles.hint, { color: surfaces.textSecondary }]}
                  numberOfLines={2}
                >
                  {formatLogDateLong(entry.logDate)} · {formatClockTime(entry.loggedAt)} ·{' '}
                  {entry.name}
                  {entry.amount ? ` · ${entry.amount}` : ''}
                </Text>
              ))}

              {/*
                * Then the zone's whole record.
                *
                * "When did I last use this one" is the question the pre-5.5
                * tool answered, and narrowing the map to a week must not take
                * it away — a zone with nothing this week and something last
                * month should say so rather than read as empty. Still purely
                * factual: a date and a count, never a suggestion about
                * whether to use it.
                */}
              {selectedAllTime.length === 0 ? (
                <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
                  No history recorded here.
                </Text>
              ) : (
                <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
                  {selectedEntries.length === 0 ? 'Nothing this week. ' : ''}
                  Last recorded {formatLogDateLong(selectedAllTime[0].logDate)} ·{' '}
                  {selectedAllTime.length} {selectedAllTime.length === 1 ? 'log' : 'logs'}
                </Text>
              )}
            </>
          )}
        </View>
      </View>

      {/*
        * The same information as words.
        *
        * **Not a fallback — an equal.** A body map cannot be read by a screen
        * reader, cannot be scanned at a glance by someone who finds the
        * figure ambiguous, and cannot be searched. Every marker above appears
        * here as a row, and every row opens the log it came from.
        */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: surfaces.text }]}>This week</Text>

        {listed.length === 0 ? (
          <Text style={[styles.empty, { color: surfaces.textTertiary }]}>
            No injection sites logged this week. Sites you add when logging a peptide appear here.
          </Text>
        ) : (
          <View>
            {listed.map(({ entry }, index) => (
              <PressableScale
                key={entry.id}
                onPress={() => router.push(`/peptides/log/${encodeURIComponent(entry.id)}`)}
                style={[
                  styles.row,
                  index > 0 && styles.divided,
                  index > 0 && { borderTopColor: surfaces.border },
                ]}
                accessibilityLabel={`${weekdayName(entry.logDate)}, ${formatLogDateLong(
                  entry.logDate,
                )}, ${entry.name}, ${entry.label}${entry.amount ? `, ${entry.amount}` : ''}`}
                accessibilityHint="Opens this log"
              >
                <View style={[styles.day, { backgroundColor: palette.peptide }]}>
                  <Text style={styles.dayLabel}>{compactWeekday(entry.logDate)}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.site, { color: surfaces.text }]} numberOfLines={2}>
                    {entry.label}
                  </Text>
                  <Text style={[styles.meta, { color: surfaces.textTertiary }]} numberOfLines={2}>
                    {entry.name} · {formatClockTime(entry.loggedAt)}
                    {entry.amount ? ` · ${entry.amount}` : ''}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>
        )}
      </View>

      {/*
        * Everything ever recorded, most recent first — the view the tool had
        * before 5.5, kept and folded away. The weekly map is the better
        * answer to the common question; this is the better answer to "when
        * did I last use that one", which stepping back through weeks answers
        * badly.
        */}
      <Disclosure
        title="All recorded sites"
        summary={allTime.length === 0 ? 'Nothing recorded yet' : `${allTime.length} recorded`}
      >
        {allTime.length === 0 ? (
          <Text style={[styles.empty, { color: surfaces.textTertiary }]}>
            Nothing recorded yet. Sites you add when logging a peptide appear here.
          </Text>
        ) : (
          allTime.slice(0, ALL_TIME_LIMIT).map((entry, index) => (
            <PressableScale
              key={entry.id}
              onPress={() => router.push(`/peptides/log/${encodeURIComponent(entry.id)}`)}
              style={[
                styles.row,
                index > 0 && styles.divided,
                index > 0 && { borderTopColor: surfaces.border },
              ]}
              accessibilityLabel={`${entry.site!.label}. ${describe(entry)}`}
              accessibilityHint="Opens this log"
            >
              <View style={styles.rowText}>
                <Text style={[styles.site, { color: surfaces.text }]} numberOfLines={2}>
                  {entry.site!.label}
                </Text>
                <Text style={[styles.meta, { color: surfaces.textTertiary }]} numberOfLines={2}>
                  {describe(entry)}
                </Text>
              </View>
            </PressableScale>
          ))
        )}
      </Disclosure>

      {/* Reference material, disclosed — the figure above already explains
          the locations better than prose can. */}
      <Disclosure title="Site reference">
        {REGION_DESCRIPTIONS.map((entry) => (
          <View
            key={entry.region}
            style={styles.guideRow}
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
      </Disclosure>

      {/* One quiet line, once. Nothing here offers advice to disclaim. */}
      <Text style={[styles.footer, { color: surfaces.textTertiary }]}>
        For tracking and anatomical reference only.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: {
    gap: spacing.m,
  },
  zone: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
    gap: 2,
  },
  zoneName: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
  },
  hint: {
    ...typography.caption,
    fontSize: 14,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 56,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  day: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    color: palette.textOnColor,
    fontSize: 12,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  site: {
    ...typography.bodyMedium,
    fontSize: 16,
  },
  meta: {
    ...typography.caption,
    fontSize: 13.5,
  },
  empty: {
    ...typography.caption,
    fontSize: 14,
    paddingVertical: spacing.s,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingVertical: spacing.xs,
  },
  guideName: {
    ...typography.captionMedium,
    fontSize: 14,
  },
  guideBody: {
    ...typography.caption,
    fontSize: 13.5,
    flexShrink: 1,
    textAlign: 'right',
  },
  footer: {
    ...typography.micro,
    fontSize: 12,
  },
});
