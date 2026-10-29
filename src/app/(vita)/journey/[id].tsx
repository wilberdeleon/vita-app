import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text } from 'react-native';
import { Screen, ScreenHeader } from '../../../components/ui';
import { entriesForJourney, useJourneys, usePhotos, useWeight } from '../../../lib/journey';
import { JourneySummary } from '../../../features/journey/components/JourneySummary';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * A completed Journey, read-only (slice 6.5) — reached from Past Journeys and
 * right after Finish. Shows only that Journey's own weigh-ins. An active
 * Journey is never shown here; it lives on the Journey tab.
 */
export default function JourneyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const journeys = useJourneys();
  const weight = useWeight();
  const photos = usePhotos();
  const { surfaces } = useTheme();
  const journey = journeys.journeys.find((candidate) => candidate.id === id);
  // Stable between changes, so the Timeline is derived once per change.
  const ownWeights = useMemo(() => (journey ? entriesForJourney(weight.entries, journey.id) : []), [weight.entries, journey]);
  const ownPhotos = useMemo(
    () => (journey ? photos.photosFor(journey.id).map((photo) => ({ id: photo.id, takenAt: photo.takenAt, uri: photos.uriFor(photo) })) : []),
    [photos, journey],
  );

  if (journeys.status === 'ready' && journey?.status === 'active') return <Redirect href="/journey" />;

  return (
    <Screen>
      <ScreenHeader title="Past Journey" back />
      {journey && journey.status === 'completed' ? (
        <JourneySummary
          journey={journey}
          weights={ownWeights}
          unit={weight.unit}
          photos={ownPhotos}
          onOpenPhoto={(photo) => router.push(`/journey/photo/${photo.id}`)}
        />
      ) : journeys.status === 'ready' ? (
        <Text style={{ color: surfaces.textSecondary }}>This Journey isn’t available.</Text>
      ) : null}
    </Screen>
  );
}
