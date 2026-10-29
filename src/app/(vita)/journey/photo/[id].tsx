import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, Screen, ScreenHeader } from '../../../../components/ui';
import { usePhotos, useJourneys } from '../../../../lib/journey';
import { PhotoReviewSheet } from '../../../../features/journey/components/PhotoReviewSheet';
import { whenLabel } from '../../../../features/journey/format';
import { radii, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * One progress photo (slice 6.6) — the whole image, its date, and in an
 * active Journey: Change Date and Delete.
 *
 * The image is contain-fit: the detail view never crops what the user took.
 * No zoom library, no comparison, no editing. A completed Journey's photo is
 * read-only. Deleting removes the photo from this Journey and VITA's own copy
 * of the file — never the original in the user's Photo Library.
 */
export default function PhotoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const journeys = useJourneys();
  const photos = usePhotos();
  const { surfaces } = useTheme();
  const { width } = useWindowDimensions();
  const [editing, setEditing] = useState(false);

  const photo = journeys.journeys.flatMap((journey) => photos.photosFor(journey.id)).find((candidate) => candidate.id === id);
  const journey = photo ? journeys.journeys.find((candidate) => candidate.id === photo.journeyId) : undefined;
  const editable = journey?.status === 'active';

  if (!photo || !journey) {
    return (
      <Screen>
        <ScreenHeader title="Progress Photo" back />
        {photos.status === 'ready' && journeys.status === 'ready' ? (
          <Text style={{ color: surfaces.textSecondary }}>This photo isn’t available.</Text>
        ) : null}
      </Screen>
    );
  }

  const confirmDelete = () =>
    Alert.alert('Delete progress photo?', 'This removes the photo from this Journey.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (await photos.removePhoto(photo.id)) router.back();
          })();
        },
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Progress Photo" back />
      <View style={[styles.well, { height: Math.round((width - spacing.xl * 2) * (4 / 3)), backgroundColor: surfaces.track }]}>
        <Image
          source={{ uri: photos.uriFor(photo) }}
          style={styles.image}
          resizeMode="contain"
          accessible
          accessibilityLabel={`Progress photo, ${whenLabel(photo.takenAt)}`}
        />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.when, { color: surfaces.text }]}>{whenLabel(photo.takenAt)}</Text>
        <Text style={[styles.journey, { color: surfaces.textSecondary }]}>{journey.name}</Text>
      </View>
      {editable ? (
        <View style={styles.actions}>
          {/* PressableScale styles its inner view, so the row's halves are these wrappers. */}
          <View style={styles.actionSlot}>
            <PressableScale
              style={[styles.action, { borderColor: surfaces.border }]}
              onPress={() => setEditing(true)}
              accessibilityRole="button"
              accessibilityLabel="Change date and time"
            >
              <Text style={[styles.actionLabel, { color: surfaces.text }]}>Change Date</Text>
            </PressableScale>
          </View>
          <View style={styles.actionSlot}>
            <PressableScale
              style={[styles.action, { borderColor: surfaces.border }]}
              onPress={confirmDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete this progress photo"
            >
              <Text style={[styles.actionLabel, { color: surfaces.textSecondary }]}>Delete Photo</Text>
            </PressableScale>
          </View>
        </View>
      ) : null}
      {editable ? (
        <PhotoReviewSheet
          visible={editing}
          mode="edit"
          uri={null}
          initialTakenAt={new Date(photo.takenAt)}
          journey={journey}
          onCancel={() => setEditing(false)}
          onSave={async (takenAt) => {
            const saved = await photos.updateTakenAt(photo.id, takenAt);
            if (saved) setEditing(false);
            return saved;
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  well: {
    borderRadius: radii.chip,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  meta: {
    gap: 2,
  },
  when: {
    ...typography.heading,
  },
  journey: {
    ...typography.caption,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  actionSlot: {
    flex: 1,
  },
  action: {
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderRadius: radii.control,
    borderWidth: 1,
  },
  actionLabel: {
    ...typography.bodyMedium,
  },
});
