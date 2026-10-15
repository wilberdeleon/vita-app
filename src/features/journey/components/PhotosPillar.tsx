import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SectionHeader } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { elapsed, longDate, shortDate, weightNumber, weightOnDay } from '../format';
import type { JourneyPhotoView, JourneyViewData } from '../types';
import { PhotoFrame } from './PhotoFrame';

const COLUMNS = 3;
/** Screen's horizontal inset on each side — the grid fills what is left. */
const SCREEN_INSET = spacing.xl;

/**
 * Photos — the visual progress history. A first-class Journey pillar.
 *
 * Private history, not a gallery: no likes, no feed, no sharing language.
 * Frames are neutral; Journey gold stays on structure, not on bodies.
 *
 * Empty: one dashed portrait frame — the shape a progress photo will take —
 * beside what this place is for. No Add Photo button: capture and import are
 * slice 6.5, and no camera or library permission is requested in 6.3.
 *
 * Populated (`__DEV__` placeholders only, until 6.5): a static Then / Now
 * pair — earliest and latest, their dates, a weight only where one was
 * really recorded that day, and the time between — over a chronological grid.
 * Then / Now here is hierarchy only; 6.7 owns comparison.
 */
export function PhotosPillar({ data }: { data: JourneyViewData }) {
  if (data.photos.length === 0) return <PhotosEmpty />;
  return <PhotosPopulated data={data} />;
}

function PhotosEmpty() {
  const { surfaces } = useTheme();
  return (
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
  );
}

function photoLabel(photo: JourneyPhotoView): string {
  return `Development progress photo placeholder, ${shortDate(photo.takenAt)}`;
}

function PhotosPopulated({ data }: { data: JourneyViewData }) {
  const { surfaces } = useTheme();
  const { width } = useWindowDimensions();
  const { photos, weights, unit } = data;

  const content = width - SCREEN_INSET * 2;
  const pairWidth = Math.floor((content - spacing.l) / 2);
  const cell = Math.floor((content - spacing.s * (COLUMNS - 1)) / COLUMNS);

  const now = photos[0];
  const then = photos[photos.length - 1];

  return (
    <View style={styles.container}>
      {photos.length >= 2 ? (
        <View style={styles.section}>
          <View style={styles.pair}>
            {[
              { key: 'then', title: 'Then', photo: then },
              { key: 'now', title: 'Now', photo: now },
            ].map(({ key, title, photo }) => {
              const weight = weightOnDay(weights, photo.takenAt);
              return (
                <View key={key} style={[styles.pairItem, { width: pairWidth }]}>
                  <Text style={[styles.caption, { color: surfaces.textTertiary }]}>{title.toUpperCase()}</Text>
                  <PhotoFrame width={pairWidth} accessibilityLabel={`${title}: ${photoLabel(photo)}`} />
                  <Text style={[styles.date, { color: surfaces.text }]}>{longDate(photo.takenAt)}</Text>
                  {weight ? (
                    <Text style={[styles.meta, { color: surfaces.textSecondary }]}>
                      {`${weightNumber(weight.weightKg, unit)} ${unit}`}
                    </Text>
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
        <SectionHeader title={`All photos · ${photos.length}`} />
        <View style={styles.grid}>
          {photos.map((photo) => (
            <View key={photo.id} style={[styles.cell, { width: cell }]}>
              <PhotoFrame width={cell} accessibilityLabel={photoLabel(photo)} />
              <Text style={[styles.meta, { color: surfaces.textSecondary }]} numberOfLines={1}>
                {shortDate(photo.takenAt)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
    paddingTop: spacing.s,
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
    gap: spacing.l,
  },
  pairItem: {
    gap: spacing.xs,
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
    gap: spacing.s,
  },
  cell: {
    gap: spacing.xs,
  },
});
