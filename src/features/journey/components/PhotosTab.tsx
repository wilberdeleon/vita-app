import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, SectionHeader } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { getJourney } from '../api';

export function PhotosTab() {
  const journey = getJourney();
  const { surfaces } = useTheme();

  return (
    <View style={styles.container}>
      <SectionHeader title="Progress Photos" />
      <Pressable>
        <Card style={styles.addCard}>
          <View style={[styles.addCircle, { backgroundColor: `${palette.journey}1A` }]}>
            <Ionicons name="add" size={28} color={palette.journey} />
          </View>
          <Text style={[styles.addTitle, { color: surfaces.text }]}>Add Progress Photo</Text>
          <Text style={[styles.addHint, { color: surfaces.textTertiary }]}>Front, side, or back. You choose.</Text>
        </Card>
      </Pressable>

      <Card style={styles.visualCard}>
        <View style={styles.visualText}>
          <Text style={styles.visualTitle}>VISUAL PROGRESS</Text>
          <Text style={styles.visualBody}>Stay consistent.{'\n'}The results will follow.</Text>
        </View>
        <View style={styles.cameraCircle}>
          <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
        </View>
      </Card>

      <SectionHeader title="Timeline" actionLabel="View all" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeline}>
        {journey.photos.map((photo) => (
          <Card key={photo.id} style={styles.photoCard}>
            <View style={[styles.silhouette, { backgroundColor: surfaces.track }]}>
              <Ionicons name="body-outline" size={40} color={surfaces.textTertiary} />
            </View>
            <Text style={[styles.photoDate, { color: surfaces.text }]}>{photo.dateLabel}</Text>
            <Text style={[styles.photoWeek, { color: surfaces.textTertiary }]}>{photo.weekLabel}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.l,
  },
  addCard: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
  },
  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  addTitle: {
    ...typography.heading,
  },
  addHint: {
    ...typography.caption,
  },
  visualCard: {
    backgroundColor: palette.cardWarm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  visualText: {
    flex: 1,
    gap: spacing.xs,
  },
  visualTitle: {
    ...typography.micro,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
  },
  visualBody: {
    ...typography.heading,
    color: '#FFFFFF',
  },
  cameraCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    gap: spacing.m,
  },
  photoCard: {
    width: 110,
    alignItems: 'center',
    gap: 2,
  },
  silhouette: {
    width: 72,
    height: 88,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  photoDate: {
    ...typography.captionMedium,
  },
  photoWeek: {
    ...typography.micro,
  },
});
