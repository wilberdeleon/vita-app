import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, ScreenHeader } from '../../components/ui';
import { JourneyView } from '../../features/journey/components/JourneyView';
import type { JourneyPhotoView, JourneyPillar, JourneyViewData } from '../../features/journey/types';
import { sortNewestFirst, toKg, type WeightEntry } from '../../lib/journey';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Journey, populated — `__DEV__` only (slice 6.3).
 *
 * ## Why this exists
 *
 * Release Journey is empty until the founder logs a weight (6.4) or adds a
 * photo (6.5), and it must stay empty rather than show an example. That makes
 * the product's *direction* impossible to judge on a real phone. This route
 * renders the **same `JourneyView`** release uses with fixture data, so the
 * founder sees the future Overview, Weight and Photos without one invented
 * record entering the real app.
 *
 * ## The boundary
 *
 * - The fixtures are declared **in this file and nowhere else**. No release
 *   module imports this route, and a test pins that.
 * - **No provider, no repository, no storage.** The data goes straight into
 *   `JourneyView` as props. Nothing here can write `vita:v1:journey:*`.
 * - Reached by deep link only — `/journey-preview?state=established&pillar=photos`
 *   — like every other preview harness; no product screen links to it.
 * - Release builds render "Not available."
 *
 * Photos are neutral **layout placeholders**, labelled as such to VoiceOver.
 * No stock image and no person's body is used or implied.
 */

const DAY = 86_400_000;

/** An instant `daysAgo` days before now, at a local wall-clock time. */
function at(daysAgo: number, hour: number, minute = 0): string {
  const date = new Date(Date.now() - daysAgo * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function weighIn(id: string, daysAgo: number, lb: number, hour = 7, minute = 0): WeightEntry {
  return { id: `preview-${id}`, loggedAt: at(daysAgo, hour, minute), weightKg: toKg(lb, 'lb'), enteredUnit: 'lb' };
}

function photo(id: string, daysAgo: number): JourneyPhotoView {
  return { id: `preview-photo-${id}`, takenAt: at(daysAgo, 7, 30), placeholder: true };
}

type Scenario = { key: string; label: string; weights: WeightEntry[]; photos: JourneyPhotoView[] };

const SCENARIOS: Scenario[] = [
  { key: 'empty', label: 'Empty', weights: [], photos: [] },
  {
    key: 'early',
    label: 'Early',
    // Two weigh-ins on one day, kept as two records.
    weights: sortNewestFirst([
      weighIn('e1', 13, 184.6),
      weighIn('e2', 6, 183.9, 7, 2),
      weighIn('e3', 6, 185.1, 21, 40),
      weighIn('e4', 0, 183.2, 6, 55),
    ]),
    photos: [photo('e1', 13)],
  },
  {
    key: 'established',
    label: 'Established',
    // Not monotonic on purpose: weight goes up as well as down.
    weights: sortNewestFirst([
      weighIn('s1', 70, 186.4),
      weighIn('s2', 63, 185.8),
      weighIn('s3', 56, 186.1),
      weighIn('s4', 49, 184.9),
      weighIn('s5', 42, 184.2),
      weighIn('s6', 35, 184.8),
      weighIn('s7', 28, 183.5),
      weighIn('s8', 21, 182.9),
      weighIn('s9', 14, 183.3),
      weighIn('s10', 7, 181.7),
      weighIn('s11', 3, 180.6),
      weighIn('s12', 0, 178.0, 6, 50),
    ]),
    photos: [photo('s1', 70), photo('s2', 42), photo('s3', 21), photo('s4', 0)].reverse(),
  },
];

const PILLARS: readonly JourneyPillar[] = ['overview', 'weight', 'photos'];

export default function JourneyPreview() {
  const { surfaces } = useTheme();
  const params = useLocalSearchParams<{ state?: string; pillar?: string }>();
  const active = SCENARIOS.find((item) => item.key === params.state) ?? SCENARIOS[2];
  const pillar = PILLARS.find((item) => item === params.pillar) ?? 'overview';

  const data = useMemo<JourneyViewData>(
    () => ({ status: 'ready', weights: active.weights, photos: active.photos, unit: 'lb' }),
    [active],
  );

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
          {SCENARIOS.map((item) => {
            const selected = item.key === active.key;
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
          <ScreenHeader title="My Journey" />
          {/* Keyed so a scenario switch starts the pillars fresh. */}
          <JourneyView key={`${active.key}-${pillar}`} data={data} initialPillar={pillar} />
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
