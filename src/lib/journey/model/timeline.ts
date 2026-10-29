/**
 * The Journey Timeline (Sprint 6 slice 6.7) — **derived, never stored**.
 *
 * Every item is computed from records VITA already keeps: the Journey itself,
 * its weigh-ins and its progress photos. There is no timeline key and no
 * timeline event is ever written, so the timeline cannot disagree with its
 * sources: edit a weigh-in and its item moves, delete a photo and its item is
 * gone, delete a fifth weigh-in and "5 weigh-ins recorded" is gone with it.
 *
 * ## What it contains
 *
 * - **Journey began** — the calendar start day (date-only).
 * - **Weight recorded** — one per Journey-owned weigh-in, at `loggedAt`.
 * - **Progress photo** — one per Journey-owned photo, at `takenAt`. The
 *   first carries `first: true`, which *is* the "first progress photo"
 *   milestone: a separate adjacent item would say the same thing twice.
 * - **Milestones** — the small, factual set in `MILESTONES`; see below.
 * - **Journey completed** — at `completedAt`, for a finished Journey.
 *
 * Not contained: the planned end (a plan, not something that happened — it
 * belongs to the header), and **extensions**: a Journey stores only its
 * current planned end, so past extensions cannot be known and are not
 * invented.
 *
 * ## Effective time and order
 *
 * Every item has `at`, an ISO instant used for ordering, and `precision`:
 * `'instant'` for records with a real time, `'day'` for calendar facts (the
 * start day, Day 30). A day-precision item is placed at **the start of its
 * local day** and is shown with a date only — no time is invented for it.
 *
 * Newest first. Equal instants break by kind — completed, milestone, photo,
 * weight, began — then by key, so the order is total and stable:
 * "Journey completed" heads a finished chapter; a threshold milestone sits
 * directly above the record that crossed it; "Journey began" is under
 * everything on its day.
 */

import { fromLogDate, shiftLogDate, toLogDate, type LogDate } from '../../daily/dates';
import { calendarDaysBetween, elapsedDays, type Journey } from './journeys';
import type { WeightEntry } from './types';

/** The milestone vocabulary. Small on purpose; participation and time, never body direction. */
export type MilestoneKind = 'weigh-ins-5' | 'weigh-ins-10' | 'photos-5' | 'day-30';

type Base = {
  /** Stable, deterministic — derived from source ids, never random. */
  key: string;
  /** ISO instant used for ordering. */
  at: string;
  precision: 'instant' | 'day';
};

export type JourneyTimelineItem =
  | (Base & { kind: 'began'; day: LogDate })
  | (Base & { kind: 'weight'; entryId: string; weightKg: number })
  | (Base & { kind: 'photo'; photoId: string; first: boolean })
  | (Base & { kind: 'milestone'; milestone: MilestoneKind })
  | (Base & { kind: 'completed'; day: LogDate; elapsedDays: number });

/** The fields a photo needs to take part — real photos and preview placeholders alike. */
export type TimelinePhoto = { id: string; takenAt: string };

type Source = {
  journey: Journey;
  /** Any weigh-ins; only those owned by `journey` are used. */
  weights: readonly WeightEntry[];
  /**
   * This Journey's photos. Photos carry `journeyId` in storage; callers pass
   * `photosFor(journey.id)`. Entries with a `journeyId` of another Journey
   * are dropped here too.
   */
  photos: readonly (TimelinePhoto & { journeyId?: string })[];
  /** Local calendar today — decides whether an active Journey has reached Day 30. */
  today: LogDate;
};

/** Counted from the oldest record: the Nth one crosses the threshold. */
const COUNT_MILESTONES: readonly { kind: MilestoneKind; of: 'weight' | 'photo'; n: number }[] = [
  { kind: 'weigh-ins-5', of: 'weight', n: 5 },
  { kind: 'weigh-ins-10', of: 'weight', n: 10 },
  { kind: 'photos-5', of: 'photo', n: 5 },
];

/** Calendar Day 30 — elapsed time, not a streak. */
export const DAY_MILESTONE = 30;

const RANK: Record<JourneyTimelineItem['kind'], number> = {
  completed: 4,
  milestone: 3,
  photo: 2,
  weight: 1,
  began: 0,
};

function startOfDay(day: LogDate): string {
  return fromLogDate(day).toISOString();
}

function oldestFirst<T>(items: readonly T[], at: (item: T) => string, id: (item: T) => string): T[] {
  return [...items].sort((a, b) => Date.parse(at(a)) - Date.parse(at(b)) || id(a).localeCompare(id(b)));
}

/** Newest first; ties by kind, then key. Total and deterministic. */
export function compareTimeline(a: JourneyTimelineItem, b: JourneyTimelineItem): number {
  return Date.parse(b.at) - Date.parse(a.at) || RANK[b.kind] - RANK[a.kind] || a.key.localeCompare(b.key);
}

/**
 * The Journey's timeline, newest first. Pure: the same records and `today`
 * always give the same items in the same order.
 */
export function deriveJourneyTimeline({ journey, weights, photos, today }: Source): JourneyTimelineItem[] {
  const id = journey.id;
  const ownWeights = oldestFirst(
    weights.filter((entry) => entry.journeyId === id),
    (entry) => entry.loggedAt,
    (entry) => entry.id,
  );
  const ownPhotos = oldestFirst(
    photos.filter((photo) => photo.journeyId === undefined || photo.journeyId === id),
    (photo) => photo.takenAt,
    (photo) => photo.id,
  );

  const items: JourneyTimelineItem[] = [
    { kind: 'began', key: `${id}:began`, at: startOfDay(journey.startDate), precision: 'day', day: journey.startDate },
    ...ownWeights.map(
      (entry): JourneyTimelineItem => ({
        kind: 'weight',
        key: `weight:${entry.id}`,
        at: entry.loggedAt,
        precision: 'instant',
        entryId: entry.id,
        weightKg: entry.weightKg,
      }),
    ),
    ...ownPhotos.map(
      (photo, index): JourneyTimelineItem => ({
        kind: 'photo',
        key: `photo:${photo.id}`,
        at: photo.takenAt,
        precision: 'instant',
        photoId: photo.id,
        first: index === 0,
      }),
    ),
  ];

  for (const { kind, of, n } of COUNT_MILESTONES) {
    const crossing = of === 'weight' ? ownWeights[n - 1]?.loggedAt : ownPhotos[n - 1]?.takenAt;
    if (crossing) items.push({ kind: 'milestone', key: `${id}:milestone:${kind}`, at: crossing, precision: 'instant', milestone: kind });
  }

  // Day 30 counts once the Journey has *reached* it: today for an active
  // Journey, the finishing day for a completed one. Dated on Day 30 itself,
  // never on the day VITA happened to notice.
  const reachedThrough = journey.completedAt ? toLogDate(new Date(journey.completedAt)) : today;
  const day30 = shiftLogDate(journey.startDate, DAY_MILESTONE - 1);
  if (calendarDaysBetween(journey.startDate, reachedThrough) + 1 >= DAY_MILESTONE) {
    items.push({ kind: 'milestone', key: `${id}:milestone:day-30`, at: startOfDay(day30), precision: 'day', milestone: 'day-30' });
  }

  if (journey.status === 'completed' && journey.completedAt) {
    const day = toLogDate(new Date(journey.completedAt));
    items.push({
      kind: 'completed',
      key: `${id}:completed`,
      at: journey.completedAt,
      precision: 'instant',
      day,
      elapsedDays: elapsedDays(journey, day),
    });
  }

  return items.sort(compareTimeline);
}
