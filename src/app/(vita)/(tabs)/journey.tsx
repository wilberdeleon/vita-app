import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Screen, ScreenHeader } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { entriesForJourney, useJourneys, useWeight } from '../../../lib/journey';
import { JourneyView } from '../../../features/journey/components/JourneyView';
import { ManageJourneySheet } from '../../../features/journey/components/ManageJourneySheet';
import { NoJourney } from '../../../features/journey/components/NoJourney';
import type { JourneyPhotoView } from '../../../features/journey/types';

/**
 * Release has no photo domain until slice 6.6, so Photos always receives
 * this. Named and frozen so no code path can hand release a photo.
 */
const NO_PHOTOS: readonly JourneyPhotoView[] = Object.freeze([]);

/**
 * My Journey (slice 6.5 — the Journey lifecycle).
 *
 * **No active Journey:** Start a New Journey, and Past Journeys if there are
 * any. No Overview / Weight / Photos — those belong to a Journey.
 *
 * **An active Journey:** its name and place in time, then its own pillars.
 * Weight shows only the weigh-ins whose `journeyId` is this Journey's; legacy
 * 6.4 weigh-ins and other Journeys' never appear. Logging here stamps the
 * active Journey's id automatically.
 *
 * **Real data only.** Journeys and weight come from the root providers,
 * which read storage and write nothing on view. There is no fixture and no
 * fallback: the `__DEV__` preview renders these components from its own
 * in-file fixtures and never touches storage.
 */
export default function Journey() {
  const journeys = useJourneys();
  const weight = useWeight();
  const [manage, setManage] = useState<{ open: boolean; mode: 'menu' | 'extend' }>({ open: false, mode: 'menu' });
  const today = todayLogDate();
  const active = journeys.active;

  if (journeys.status !== 'ready') {
    return (
      <Screen dockClearance>
        <ScreenHeader title="My Journey" settings />
      </Screen>
    );
  }

  if (!active) {
    return (
      <Screen dockClearance>
        <ScreenHeader title="My Journey" settings />
        <NoJourney
          past={journeys.past}
          onStart={() => router.push('/journey/start')}
          onOpenPast={(journey) => router.push(`/journey/${journey.id}`)}
        />
      </Screen>
    );
  }

  const finish = () => {
    setManage((current) => ({ ...current, open: false }));
    void (async () => {
      if (await journeys.finishJourney(active.id)) router.push(`/journey/${active.id}`);
    })();
  };
  const confirmFinish = () =>
    Alert.alert('Finish this Journey?', 'The Journey will move to Past Journeys. Its recorded history will remain.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: finish },
    ]);

  return (
    <Screen dockClearance>
      <ScreenHeader title="My Journey" settings />
      <JourneyView
        key={active.id}
        journey={active}
        today={today}
        data={{ status: weight.status, weights: entriesForJourney(weight.entries, active.id), photos: NO_PHOTOS, unit: weight.unit }}
        actions={{
          addEntry: (value, unit, loggedAt) => weight.addEntry(value, unit, loggedAt, active.id),
          updateEntry: weight.updateEntry,
          removeEntry: weight.removeEntry,
          restoreEntry: weight.restoreEntry,
          setUnit: weight.setUnit,
        }}
        onManage={() => setManage({ open: true, mode: 'menu' })}
        onExtend={() => setManage({ open: true, mode: 'extend' })}
        onFinish={confirmFinish}
      />
      <ManageJourneySheet
        visible={manage.open}
        initialMode={manage.mode}
        journey={active}
        today={today}
        onClose={() => setManage((current) => ({ ...current, open: false }))}
        onExtend={(newEnd) => journeys.extendJourney(active.id, newEnd)}
        onFinish={finish}
      />
    </Screen>
  );
}
