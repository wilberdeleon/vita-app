import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { toLogDate } from '../../../lib/daily';
import type { JourneyTimelineItem, MilestoneKind, WeightUnit } from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { calendarDay, clockTime, dayCount, dayLabel, spokenCalendarDay, spokenWeight, spokenWhen, weightNumber } from '../format';
import type { JourneyPhotoView } from '../types';
import { PhotoFrame } from './PhotoFrame';
import { useJourneyAccent } from './useJourneyAccent';

/** Items shown before "Show earlier", and how many more each press reveals. */
export const TIMELINE_INITIAL = 12;
export const TIMELINE_STEP = 20;

/** A restrained preview: enough to recognise the photo, not a gallery. */
const PHOTO_PREVIEW = 92;

export const MILESTONE_TITLES: Record<MilestoneKind, string> = {
  'weigh-ins-5': '5 weigh-ins recorded',
  'weigh-ins-10': '10 weigh-ins recorded',
  'photos-5': '5 progress photos recorded',
  'day-30': '30 days into this Journey',
};

type Props = {
  /** Derived, newest first (`deriveJourneyTimeline`). */
  items: readonly JourneyTimelineItem[];
  unit: WeightUnit;
  /** This Journey's photos, to draw each photo item's own image. */
  photos: readonly JourneyPhotoView[];
  /** Opens a real photo's existing detail. Omitted by the preview. */
  onOpenPhoto?: (photo: JourneyPhotoView) => void;
  /** Injected for tests; "Today" / "Yesterday" day captions. */
  now?: Date;
};

/**
 * The Journey Timeline (slice 6.7) — what happened in this Journey, and when.
 *
 * One gold spine, newest first. Each kind has its own weight on the page, so
 * frequent weighing can never bury the rest: a weigh-in is **one compact
 * line** on a small node; a progress photo shows **its own image**; a
 * milestone is a quiet gold historical marker; the beginning and the end are
 * the chapter's two bookends. A day caption appears once per calendar day
 * rather than on every row.
 *
 * Every value is shown the same neutral way — no colour for direction, no
 * arrows, no praise. Only photos are tappable (to the existing detail);
 * nothing else pretends to be a control. The latest `TIMELINE_INITIAL` items
 * mount first; **Show earlier** reveals more until the beginning is reached.
 */
export function JourneyTimeline({ items, unit, photos, onOpenPhoto, now }: Props) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  const [shown, setShown] = useState(TIMELINE_INITIAL);
  const byId = useMemo(() => new Map(photos.map((photo) => [photo.id, photo])), [photos]);

  const visible = items.slice(0, shown);
  const hidden = items.length - visible.length;
  const today = now ?? new Date();

  return (
    <View>
      {visible.map((item, index) => {
        const previous = visible[index - 1];
        const day = toLogDate(new Date(item.at));
        const caption = !previous || toLogDate(new Date(previous.at)) !== day ? dayCaption(item, today) : null;
        const last = index === visible.length - 1 && hidden === 0;
        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.rail} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Node kind={item.kind} accent={accent} />
              {last ? null : <View style={[styles.line, { backgroundColor: accent }]} />}
            </View>
            <View style={[styles.content, !last && (item.kind === 'weight' ? styles.compactGap : styles.contentGap)]}>
              {caption ? (
                <Text style={[styles.caption, { color: surfaces.textTertiary }]} importantForAccessibility="no" accessibilityElementsHidden>
                  {caption.toUpperCase()}
                </Text>
              ) : null}
              <TimelineRow item={item} unit={unit} photo={item.kind === 'photo' ? byId.get(item.photoId) : undefined} onOpenPhoto={onOpenPhoto} />
            </View>
          </View>
        );
      })}
      {hidden > 0 ? (
        <Pressable
          onPress={() => setShown((count) => count + TIMELINE_STEP)}
          accessibilityRole="button"
          accessibilityLabel={`Show earlier, ${hidden} more in this Journey`}
          style={styles.more}
        >
          <Text style={[styles.moreLabel, { color: surfaces.textSecondary }]}>{`Show earlier · ${hidden} more`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function dayCaption(item: JourneyTimelineItem, now: Date): string {
  return dayLabel(item.at, now);
}

function Node({ kind, accent }: { kind: JourneyTimelineItem['kind']; accent: string }) {
  if (kind === 'weight') return <View style={[styles.small, { backgroundColor: accent }]} />;
  if (kind === 'milestone') return <View style={[styles.marker, { borderColor: accent }]} />;
  return <View style={[styles.node, { borderColor: accent, backgroundColor: kind === 'photo' ? 'transparent' : accent }]} />;
}

/** Spoken label for one item — kind, fact, when. Exported for tests. */
export function spokenTimelineItem(item: JourneyTimelineItem, unit: WeightUnit): string {
  switch (item.kind) {
    case 'began':
      return `Journey began, ${spokenCalendarDay(item.day)}`;
    case 'weight':
      return `Weight recorded, ${spokenWeight(item.weightKg, unit)}, ${spokenWhen(item.at)}`;
    case 'photo':
      return `Progress photo${item.first ? ', the first in this Journey' : ''}, ${spokenWhen(item.at)}`;
    case 'milestone':
      return `Milestone, ${MILESTONE_TITLES[item.milestone]}, ${
        item.precision === 'day' ? spokenCalendarDay(toLogDate(new Date(item.at))) : spokenWhen(item.at)
      }`;
    case 'completed':
      return `Journey completed, ${spokenCalendarDay(item.day)}, ran ${dayCount(item.elapsedDays)}`;
  }
}

function TimelineRow({
  item,
  unit,
  photo,
  onOpenPhoto,
}: {
  item: JourneyTimelineItem;
  unit: WeightUnit;
  photo?: JourneyPhotoView;
  onOpenPhoto?: (photo: JourneyPhotoView) => void;
}) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  const spoken = spokenTimelineItem(item, unit);

  if (item.kind === 'weight') {
    return (
      <View style={styles.inline} accessible accessibilityLabel={spoken}>
        <Text style={[styles.quiet, { color: surfaces.textSecondary }]}>Weight recorded</Text>
        <Text style={[styles.value, { color: surfaces.text }]}>
          {`${weightNumber(item.weightKg, unit)} ${unit}`}
          <Text style={[styles.time, { color: surfaces.textTertiary }]}>{`  ${clockTime(item.at)}`}</Text>
        </Text>
      </View>
    );
  }

  if (item.kind === 'photo') {
    const body = (
      <View style={styles.photoRow}>
        <PhotoFrame width={PHOTO_PREVIEW} uri={photo?.uri} />
        <View style={styles.photoMeta}>
          <Text style={[styles.title, { color: surfaces.text }]}>Progress photo</Text>
          <Text style={[styles.time, { color: surfaces.textSecondary }]}>{clockTime(item.at)}</Text>
          {item.first ? (
            <Text style={[styles.time, { color: surfaces.textSecondary }]}>First progress photo in this Journey</Text>
          ) : null}
        </View>
      </View>
    );
    return onOpenPhoto && photo && !photo.placeholder ? (
      <PressableScale onPress={() => onOpenPhoto(photo)} accessibilityRole="button" accessibilityLabel={spoken} accessibilityHint="Opens this photo">
        {body}
      </PressableScale>
    ) : (
      <View accessible accessibilityLabel={spoken}>
        {body}
      </View>
    );
  }

  if (item.kind === 'milestone') {
    return (
      <View accessible accessibilityLabel={spoken} style={styles.block}>
        <Text style={[styles.kicker, { color: accent }]}>MILESTONE</Text>
        <Text style={[styles.marked, { color: surfaces.text }]}>{MILESTONE_TITLES[item.milestone]}</Text>
      </View>
    );
  }

  if (item.kind === 'began') {
    return (
      <View accessible accessibilityLabel={spoken} style={styles.block}>
        <Text style={[styles.marked, { color: surfaces.text }]}>Journey began</Text>
        <Text style={[styles.time, { color: surfaces.textSecondary }]}>{calendarDay(item.day, true)}</Text>
      </View>
    );
  }

  return (
    <View accessible accessibilityLabel={spoken} style={styles.block}>
      <Text style={[styles.marked, { color: surfaces.text }]}>Journey completed</Text>
      <Text style={[styles.time, { color: surfaces.textSecondary }]}>
        {`${calendarDay(item.day, true)} · ran ${dayCount(item.elapsedDays)}`}
      </Text>
    </View>
  );
}

const NODE = 10;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  rail: {
    width: NODE,
    alignItems: 'center',
    paddingTop: 4,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 1.5,
  },
  small: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 1,
    opacity: 0.6,
  },
  marker: {
    width: NODE,
    height: NODE,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  line: {
    flex: 1,
    width: 1.5,
    marginTop: 3,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  contentGap: {
    paddingBottom: spacing.l,
  },
  /** Weigh-ins sit closer together: frequent weighing must not set the page's rhythm. */
  compactGap: {
    paddingBottom: spacing.m,
  },
  caption: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  inline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: spacing.m,
  },
  quiet: {
    ...typography.caption,
  },
  value: {
    ...typography.captionMedium,
    fontVariant: ['tabular-nums'],
  },
  time: {
    ...typography.caption,
    fontVariant: ['tabular-nums'],
  },
  title: {
    ...typography.bodyMedium,
  },
  /** Bookends and milestones: one step up, still plain text. */
  marked: {
    ...typography.heading,
  },
  kicker: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  block: {
    gap: 2,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.m,
    alignItems: 'flex-start',
  },
  photoMeta: {
    flex: 1,
    gap: 2,
  },
  more: {
    paddingVertical: spacing.m,
    paddingLeft: NODE + spacing.m,
  },
  moreLabel: {
    ...typography.bodyMedium,
  },
});
