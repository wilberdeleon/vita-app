import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, ScreenHeader } from '../../components/ui';
import { JourneySummary } from '../../features/journey/components/JourneySummary';
import { JourneyView } from '../../features/journey/components/JourneyView';
import { NoJourney } from '../../features/journey/components/NoJourney';
import type { JourneyPhotoView, JourneyPillar } from '../../features/journey/types';
import { shiftLogDate, toLogDate } from '../../lib/daily';
import { sortNewestFirst, toKg, type Journey, type WeightEntry } from '../../lib/journey';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Journey across its lifecycle — `__DEV__` only (slices 6.3, 6.5).
 *
 * Release Journey shows only what the user really created and recorded, so
 * most of the lifecycle cannot be seen on a device without living through
 * it. This renders the **same components** release uses — `NoJourney`,
 * `JourneyView`, `JourneySummary` — from fixtures declared in this file.
 *
 * ## The boundary
 *
 * - Fixtures live **here and nowhere else**; no release module imports this
 *   route, and a test pins that.
 * - **No provider, no repository, no storage.** Data goes straight into the
 *   components as props; no action is passed, so nothing here can write a
 *   Journey or a weigh-in.
 * - Deep link only — `/journey-preview?state=established&pillar=weight` —
 *   like every other harness. Release builds render "Not available."
 *
 * Photos are neutral layout placeholders, announced as such. No stock image
 * and no person's body is used or implied.
 */

const DAY = 86_400_000;
const TODAY = toLogDate(new Date());

function at(daysAgo: number, hour: number, minute = 0): string {
  const date = new Date(Date.now() - daysAgo * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function journey(id: string, name: string, startDaysAgo: number, days: number, completedDaysAgo?: number): Journey {
  const startDate = shiftLogDate(TODAY, -startDaysAgo);
  return {
    id: `preview-${id}`,
    name,
    startDate,
    plannedEndDate: shiftLogDate(startDate, days - 1),
    status: completedDaysAgo === undefined ? 'active' : 'completed',
    createdAt: at(startDaysAgo, 7),
    ...(completedDaysAgo === undefined ? {} : { completedAt: at(completedDaysAgo, 18) }),
  };
}

function weighIn(journeyId: string, id: string, daysAgo: number, lb: number, hour = 7, minute = 0): WeightEntry {
  return {
    id: `preview-${id}`,
    loggedAt: at(daysAgo, hour, minute),
    weightKg: toKg(lb, 'lb'),
    enteredUnit: 'lb',
    journeyId: `preview-${journeyId}`,
  };
}

function photo(id: string, daysAgo: number): JourneyPhotoView {
  return { id: `preview-photo-${id}`, takenAt: at(daysAgo, 7, 30), placeholder: true };
}

const EARLY = journey('early', 'Getting Back to Me', 12, 90);
// Planned for 60 days, extended to 90 three weeks ago — a recorded extension (6.7).
const ESTABLISHED: Journey = (() => {
  const base = journey('established', 'Summer Transformation', 70, 90);
  return {
    ...base,
    extensions: [
      {
        id: 'preview-extension-1',
        extendedAt: at(21, 19, 10),
        previousPlannedEndDate: shiftLogDate(base.startDate, 59),
        newPlannedEndDate: base.plannedEndDate,
      },
    ],
  };
})();
const ENDED = journey('ended', 'Marathon Prep', 92, 90);
const COMPLETED = journey('completed', 'Spring Reset', 200, 90, 108);
const OLDER = journey('older', 'New Year, Slowly', 400, 60, 335);

const WEIGHTS: Record<string, WeightEntry[]> = {
  early: sortNewestFirst([
    weighIn('early', 'e1', 12, 184.6),
    weighIn('early', 'e2', 6, 183.9, 7, 2),
    weighIn('early', 'e3', 6, 185.1, 21, 40),
    weighIn('early', 'e4', 0, 183.2, 6, 55),
  ]),
  established: sortNewestFirst(
    // Not monotonic on purpose: weight goes up as well as down.
    [186.4, 185.8, 186.1, 184.9, 184.2, 184.8, 183.5, 182.9, 183.3, 181.7, 180.6, 178.0].map((lb, i) =>
      weighIn('established', `s${i}`, 70 - i * 6 - (i === 11 ? 4 : 0), lb),
    ),
  ),
  ended: sortNewestFirst([weighIn('ended', 'n1', 92, 171.2), weighIn('ended', 'n2', 45, 169.0), weighIn('ended', 'n3', 1, 167.4)]),
  completed: sortNewestFirst([
    weighIn('completed', 'c1', 200, 192.0),
    weighIn('completed', 'c2', 160, 189.5),
    weighIn('completed', 'c3', 130, 188.8),
    weighIn('completed', 'c4', 109, 187.1),
  ]),
};

// Enough for the timeline's milestones to appear: Established has 12
// weigh-ins (5 and 10) and 5 photos (5), and is past Day 30.
const PHOTOS: Record<string, JourneyPhotoView[]> = {
  early: [photo('e1', 6)],
  established: [photo('s1', 70), photo('s2', 56), photo('s3', 42), photo('s4', 21), photo('s5', 1)].reverse(),
  completed: [photo('c1', 199), photo('c2', 130)].reverse(),
};

type StateKey = 'none' | 'early' | 'established' | 'ended' | 'completed' | 'library';

const STATES: { key: StateKey; label: string }[] = [
  { key: 'none', label: 'No Journey' },
  { key: 'early', label: 'Active — Early' },
  { key: 'established', label: 'Active — Established' },
  { key: 'ended', label: 'End Reached' },
  { key: 'completed', label: 'Completed' },
  { key: 'library', label: 'Past Journeys' },
];

const PILLARS: readonly JourneyPillar[] = ['overview', 'weight', 'photos'];
const ACTIVE: Partial<Record<StateKey, Journey>> = { early: EARLY, established: ESTABLISHED, ended: ENDED };

export default function JourneyPreview() {
  const { surfaces } = useTheme();
  const params = useLocalSearchParams<{ state?: string; pillar?: string }>();
  const state = STATES.find((item) => item.key === params.state)?.key ?? 'established';
  const pillar = PILLARS.find((item) => item === params.pillar) ?? 'overview';
  const active = ACTIVE[state];

  if (!__DEV__) {
    return (
      <View style={[styles.root, { backgroundColor: surfaces.background }]}>
        <Text style={{ color: surfaces.text }}>Not available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: surfaces.background }]}>
      <View style={[styles.bar, { borderBottomColor: surfaces.border }]}>
        <Text style={[styles.notice, { color: surfaces.textTertiary }]}>
          DEVELOPMENT PREVIEW · FIXTURE DATA, NOT A REAL JOURNEY
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {STATES.map((item) => {
            const selected = item.key === state;
            return (
              <PressableScale
                key={item.key}
                onPress={() => router.replace(`/journey-preview?state=${item.key}&pillar=${pillar}`)}
                style={[
                  styles.chip,
                  { borderColor: surfaces.border },
                  selected && { backgroundColor: surfaces.text, borderColor: surfaces.text },
                ]}
                accessibilityLabel={`Preview ${item.label}`}
                accessibilityState={{ selected }}
              >
                <Text style={[styles.chipLabel, { color: selected ? surfaces.background : surfaces.textSecondary }]}>
                  {item.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.stage}>
        {/* The bar above already clears the status bar. */}
        <Screen topInset={false}>
          <ScreenHeader title={state === 'completed' ? 'Past Journey' : 'My Journey'} />
          {active ? (
            <JourneyView
              key={`${state}-${pillar}`}
              journey={active}
              today={TODAY}
              data={{ status: 'ready', weights: WEIGHTS[state] ?? [], photos: PHOTOS[state] ?? [], unit: 'lb' }}
              initialPillar={pillar}
              showFuture
            />
          ) : state === 'completed' ? (
            <JourneySummary journey={COMPLETED} weights={WEIGHTS.completed} photos={PHOTOS.completed} unit="lb" />
          ) : (
            <NoJourney past={state === 'library' ? [COMPLETED, OLDER] : []} />
          )}
        </Screen>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xxxl + spacing.xl,
    gap: spacing.s,
  },
  notice: {
    ...typography.micro,
    letterSpacing: 0.8,
    paddingHorizontal: spacing.l,
  },
  chips: {
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.s,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  chipLabel: {
    ...typography.caption,
  },
  stage: {
    flex: 1,
  },
});
