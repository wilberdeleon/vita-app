import { Redirect, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen, ScreenHeader } from '../../../components/ui';
import { entriesForJourney, useJourneys, useWeight } from '../../../lib/journey';
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
  const { surfaces } = useTheme();
  const journey = journeys.journeys.find((candidate) => candidate.id === id);

  if (journeys.status === 'ready' && journey?.status === 'active') return <Redirect href="/journey" />;

  return (
    <Screen>
      <ScreenHeader title="Past Journey" back />
      {journey && journey.status === 'completed' ? (
        <JourneySummary journey={journey} weights={entriesForJourney(weight.entries, journey.id)} unit={weight.unit} />
      ) : journeys.status === 'ready' ? (
        <Text style={{ color: surfaces.textSecondary }}>This Journey isn’t available.</Text>
      ) : null}
    </Screen>
  );
}
