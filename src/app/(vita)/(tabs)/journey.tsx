import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { Screen, ScreenHeader } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import { entriesForJourney, useJourneys, usePhotos, useWeight } from '../../../lib/journey';
import { JourneyView } from '../../../features/journey/components/JourneyView';
import { ManageJourneySheet } from '../../../features/journey/components/ManageJourneySheet';
import { NoJourney } from '../../../features/journey/components/NoJourney';
import { PhotoReviewSheet } from '../../../features/journey/components/PhotoReviewSheet';
import { acquirePhoto, type PhotoSource } from '../../../features/journey/photoAcquisition';
import type { JourneyPhotoView } from '../../../features/journey/types';

type Pending = { uri: string; mimeType: string | null; suggestedTakenAt: Date } | null;

const DENIED: Record<PhotoSource, string> = {
  camera: 'VITA doesn’t have access to your camera. You can allow it in Settings → VITA (or Expo Go).',
  library: 'VITA doesn’t have access to your photos. You can allow it in Settings → VITA (or Expo Go).',
};

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
 * **Photos (6.6).** Photos shows only this Journey's progress photos. Add
 * Progress Photo offers Take Photo / Choose from Library first and asks for
 * permission only after that choice; the picked image is reviewed, then
 * copied into VITA's own storage on Save. Nothing leaves the device.
 *
 * **Real data only.** Journeys, weight and photos come from the root providers,
 * which read storage and write nothing on view. There is no fixture and no
 * fallback: the `__DEV__` preview renders these components from its own
 * in-file fixtures and never touches storage.
 */
export default function Journey() {
  const journeys = useJourneys();
  const weight = useWeight();
  const photos = usePhotos();
  const [pending, setPending] = useState<Pending>(null);
  const [manage, setManage] = useState<{ open: boolean; mode: 'menu' | 'extend' }>({ open: false, mode: 'menu' });
  const today = todayLogDate();
  const active = journeys.active;
  const activeId = active?.id ?? null;
  // Stable between changes, so the Overview Timeline (6.7) is derived once per
  // change to the records rather than on every render.
  const journeyWeights = useMemo(() => (activeId ? entriesForJourney(weight.entries, activeId) : []), [weight.entries, activeId]);
  const photoViews: JourneyPhotoView[] = useMemo(
    () => (activeId ? photos.photosFor(activeId).map((photo) => ({ id: photo.id, takenAt: photo.takenAt, uri: photos.uriFor(photo) })) : []),
    [photos, activeId],
  );

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

  const ownerId = active.id;

  const acquire = async (source: PhotoSource) => {
    const result = await acquirePhoto(source);
    if (result.kind === 'denied') Alert.alert(source === 'camera' ? 'Camera access is off' : 'Photo access is off', DENIED[source]);
    if (result.kind === 'picked') setPending(result);
  };

  /** The choice comes first; permission is asked only once the user picks. */
  const addPhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Take Photo', 'Choose from Library', 'Cancel'], cancelButtonIndex: 2, title: 'Add Progress Photo' },
        (index) => {
          if (index === 0) void acquire('camera');
          if (index === 1) void acquire('library');
        },
      );
      return;
    }
    Alert.alert('Add Progress Photo', undefined, [
      { text: 'Take Photo', onPress: () => void acquire('camera') },
      { text: 'Choose from Library', onPress: () => void acquire('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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
        data={{
          status: weight.status === 'ready' && photos.status === 'ready' ? 'ready' : 'loading',
          weights: journeyWeights,
          photos: photoViews,
          unit: weight.unit,
        }}
        actions={{
          addEntry: (value, unit, loggedAt) => weight.addEntry(value, unit, loggedAt, active.id),
          updateEntry: weight.updateEntry,
          removeEntry: weight.removeEntry,
          restoreEntry: weight.restoreEntry,
          setUnit: weight.setUnit,
        }}
        photoActions={{ onAdd: addPhoto }}
        onOpenPhoto={(photo) => router.push(`/journey/photo/${photo.id}`)}
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
      <PhotoReviewSheet
        visible={pending !== null}
        mode="add"
        uri={pending?.uri ?? null}
        initialTakenAt={pending?.suggestedTakenAt ?? new Date()}
        journey={active}
        onCancel={() => setPending(null)}
        onSave={async (takenAt) => {
          if (!pending) return false;
          const saved = await photos.addPhoto({ journeyId: ownerId, sourceUri: pending.uri, mimeType: pending.mimeType, takenAt });
          if (saved) setPending(null);
          return saved !== null;
        }}
      />
    </Screen>
  );
}
