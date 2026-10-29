import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Button, PressableScale, SectionHeader } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { elapsed, longDate, shortDate, spokenWhen, weightNumber, weightOnDay } from '../format';
import type { JourneyPhotoActions, JourneyPhotoView, JourneyViewData } from '../types';
import { PhotoFrame } from './PhotoFrame';

const COLUMNS = 2;
/** Screen's horizontal inset on each side — the grid fills what is left. */
const SCREEN_INSET = spacing.xl;

type Props = {
  data: JourneyViewData;
  /** Release, active Journey only: Add Progress Photo. */
  actions?: JourneyPhotoActions;
  /** Opens a photo's detail. Release only; the preview's placeholders open nothing. */
  onOpen?: (photo: JourneyPhotoView) => void;
  /** `__DEV__` preview only — the 6.8 Then / Now vision. Release never draws it. */
  showFuture?: boolean;
};

/**
 * Photos — the Journey's private visual history (6.3 structure, 6.6 real).
 *
 * Empty: the place a progress photo will live, and — in an active Journey —
 * **Add Progress Photo**. Populated: the action, then the photos, newest
 * first, **two to a row in large portrait frames** with the date beneath
 * each. Two columns, not three: on a phone a three-column grid turned
 * progress photos into thumbnails to scroll past, and this pillar exists to
 * be looked back through.
 *
 * Private history, not a gallery: no likes, feed, sharing, captions, tags or
 * scores. Frames are neutral; Journey gold stays on structure. Then / Now is
 * 6.8 and renders only in the `__DEV__` preview.
 */
export function PhotosPillar({ data, actions, onOpen, showFuture = false }: Props) {
  if (data.photos.length === 0) return <PhotosEmpty onAdd={actions?.onAdd} />;
  return <PhotosPopulated data={data} onAdd={actions?.onAdd} onOpen={onOpen} showFuture={showFuture} />;
}

function PhotosEmpty({ onAdd }: { onAdd?: () => void }) {
  const { surfaces } = useTheme();
  return (
    <View style={styles.emptyRoot}>
      <View style={styles.emptyRow}>
        <PhotoFrame width={84} empty />
        <View style={styles.emptyText}>
          <Text style={[styles.emptyTitle, { color: surfaces.text }]} accessibilityRole="header">
            No progress photos yet
          </Text>
          <Text style={[styles.emptyBody, { color: surfaces.textSecondary }]}>
            Your private progress-photo history will live here, in the order the photos were taken.
          </Text>
        </View>
      </View>
      {onAdd ? <Button variant="neutral" label="Add Progress Photo" onPress={onAdd} /> : null}
    </View>
  );
}

function photoLabel(photo: JourneyPhotoView): string {
  return photo.placeholder
    ? `Development progress photo placeholder, ${shortDate(photo.takenAt)}`
    : `Progress photo, ${spokenWhen(photo.takenAt)}`;
}

function PhotosPopulated({
  data,
  onAdd,
  onOpen,
  showFuture,
}: {
  data: JourneyViewData;
  onAdd?: () => void;
  onOpen?: (photo: JourneyPhotoView) => void;
  showFuture: boolean;
}) {
  const { surfaces } = useTheme();
  const { width } = useWindowDimensions();
  const { photos, weights, unit } = data;

  const content = width - SCREEN_INSET * 2;
  const cell = Math.floor((content - spacing.m * (COLUMNS - 1)) / COLUMNS);
  const now = photos[0];
  const then = photos[photos.length - 1];

  return (
    <View style={styles.container}>
      {onAdd ? <Button variant="neutral" label="Add Progress Photo" onPress={onAdd} /> : null}

      {showFuture && photos.length >= 2 ? (
        <View style={styles.section}>
          <View style={styles.pair}>
            {[
              { key: 'then', title: 'Then', photo: then },
              { key: 'now', title: 'Now', photo: now },
            ].map(({ key, title, photo }) => {
              const weight = weightOnDay(weights, photo.takenAt);
              return (
                <View key={key} style={[styles.cell, { width: cell }]}>
                  <Text style={[styles.caption, { color: surfaces.textTertiary }]}>{title.toUpperCase()}</Text>
                  <PhotoFrame width={cell} uri={photo.uri} accessibilityLabel={`${title}: ${photoLabel(photo)}`} />
                  <Text style={[styles.date, { color: surfaces.text }]}>{longDate(photo.takenAt)}</Text>
                  {weight ? (
                    <Text style={[styles.meta, { color: surfaces.textSecondary }]}>{`${weightNumber(weight.weightKg, unit)} ${unit}`}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
          <Text style={[styles.meta, styles.apart, { color: surfaces.textSecondary }]}>
            {`${elapsed(then.takenAt, now.takenAt)} apart`}
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={`Progress photos · ${photos.length}`} />
        <View style={styles.grid}>
          {photos.map((photo) => {
            const tile = (
              <>
                <PhotoFrame width={cell} uri={photo.uri} accessibilityLabel={onOpen ? undefined : photoLabel(photo)} />
                <Text style={[styles.meta, { color: surfaces.textSecondary }]} numberOfLines={1}>
                  {shortDate(photo.takenAt)}
                </Text>
              </>
            );
            return onOpen ? (
              <PressableScale
                key={photo.id}
                style={[styles.cell, { width: cell }]}
                onPress={() => onOpen(photo)}
                accessibilityRole="button"
                accessibilityLabel={photoLabel(photo)}
                accessibilityHint="Opens this photo"
              >
                {tile}
              </PressableScale>
            ) : (
              <View key={photo.id} style={[styles.cell, { width: cell }]}>
                {tile}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  emptyRoot: {
    gap: spacing.xl,
    paddingTop: spacing.s,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  emptyText: {
    flex: 1,
    gap: spacing.s,
  },
  emptyTitle: {
    ...typography.heading,
  },
  emptyBody: {
    ...typography.body,
    lineHeight: 21,
  },
  section: {
    gap: spacing.m,
  },
  pair: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  caption: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  date: {
    ...typography.bodyMedium,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
  },
  apart: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  cell: {
    gap: spacing.xs,
  },
});
