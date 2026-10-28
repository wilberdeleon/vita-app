import { Redirect, router } from 'expo-router';
import { Screen, ScreenHeader } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { useJourneys, useWeight } from '../../../lib/journey';
import { JourneyStartFlow } from '../../../features/journey/components/JourneyStartFlow';

/**
 * Start a New Journey (slice 6.5) — one route, four steps inside it, so the
 * stack never fills with a wizard.
 *
 * Close leaves with nothing written. Begin Journey writes the Journey and its
 * starting weigh-in together, then `dismissTo('/journey')` — the lesson from
 * the Peptides creation flow: finishing closes the creation screen, so Back
 * from the new Journey never reveals the completed setup.
 *
 * One active Journey at a time: arriving here with one already active goes
 * straight back to it.
 */
export default function StartJourney() {
  const journeys = useJourneys();
  const weight = useWeight();

  if (journeys.status === 'ready' && journeys.active) return <Redirect href="/journey" />;

  return (
    <Screen keyboardAware>
      <ScreenHeader title="New Journey" close />
      <JourneyStartFlow
        today={todayLogDate()}
        preferredUnit={weight.unit}
        onBegin={async ({ name, plannedEndDate, startingWeight, unit }) => {
          const journey = await journeys.startJourney({ name, plannedEndDate, startingWeight, unit });
          if (!journey) return false;
          router.dismissTo('/journey');
          return true;
        }}
      />
    </Screen>
  );
}
