/**
 * Progress photos (Sprint 6 slice 6.6) — private, local, owned by a Journey.
 *
 * A progress photo is a fact: this image, of this moment, in this Journey.
 * Nothing about the body in it is analysed, scored, tagged or inferred, and
 * nothing leaves the device. The image itself lives in VITA's own document
 * storage (see `fileStore.ts`); this record holds only metadata.
 */

import { toLogDate } from '../../daily/dates';
import { newId } from '../../daily/ids';
import type { Journey } from '../model/journeys';

export type ProgressPhoto = {
  /** Stable for the life of the photo. Also its file name. */
  id: string;
  /** The one Journey it belongs to. Required and never changed. */
  journeyId: string;
  /**
   * The image's path **relative to VITA's photo folder** —
   * `<journeyId>/<id>.<ext>`. Relative on purpose: iOS can change the app's
   * container path between app versions, so an absolute URI stored today can
   * point nowhere tomorrow. Resolved to a URI at render time.
   */
  file: string;
  /** ISO instant the photo represents — Journey chronology. User-correctable. */
  takenAt: string;
  /** ISO instant it was saved to VITA. */
  createdAt: string;
};

/** A stored path is only ever `<id>/<id>.<ext>` with safe characters. */
export const PHOTO_FILE_PATTERN = /^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|heic|heif|webp)$/;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/webp': 'webp',
};

/**
 * A safe extension from the picker's MIME type, else the source URI's own
 * extension if it is a known image type, else `jpg`. Never the original file
 * name — user strings never become file identity.
 */
export function photoExtension(sourceUri: string, mimeType?: string | null): string {
  if (mimeType && EXTENSIONS[mimeType.toLowerCase()]) return EXTENSIONS[mimeType.toLowerCase()];
  const match = /\.([A-Za-z0-9]+)(?:\?.*)?$/.exec(sourceUri);
  const ext = match?.[1].toLowerCase();
  return ext && ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'].includes(ext) ? ext : 'jpg';
}

/** A new record and its owned file path. Nothing is written here. */
export function newProgressPhoto(input: {
  journeyId: string;
  takenAt: Date;
  extension: string;
  now?: Date;
}): ProgressPhoto {
  const id = newId('photo');
  return {
    id,
    journeyId: input.journeyId,
    file: `${input.journeyId}/${id}.${input.extension}`,
    takenAt: input.takenAt.toISOString(),
    createdAt: (input.now ?? new Date()).toISOString(),
  };
}

/** One minute of clock skew, the same tolerance weigh-ins have. */
export const PHOTO_FUTURE_SKEW_MS = 60_000;

/**
 * A photo's moment must be real, already past, and inside the Journey: on or
 * after its start day. There is no upper Journey bound for an active Journey —
 * it stays active past its planned end until the user finishes it.
 */
export function isValidPhotoTime(at: Date, journey: Pick<Journey, 'startDate'>, now: Date = new Date()): boolean {
  const time = at.getTime();
  if (!Number.isFinite(time)) return false;
  if (time > now.getTime() + PHOTO_FUTURE_SKEW_MS) return false;
  return toLogDate(at) >= journey.startDate;
}

/** One Journey's photos, newest first. Never a global gallery. */
export function photosForJourney(photos: readonly ProgressPhoto[], journeyId: string): ProgressPhoto[] {
  return photos
    .filter((photo) => photo.journeyId === journeyId)
    .sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt));
}

/**
 * Reads the camera's EXIF capture time, `"2026:05:13 07:42:10"` in local
 * time, when the picker supplied one. `null` when absent or unreadable — the
 * caller falls back to now and the user can correct it before saving.
 */
export function exifTakenAt(exif: Record<string, unknown> | null | undefined): Date | null {
  const raw = exif?.DateTimeOriginal ?? exif?.DateTimeDigitized ?? exif?.DateTime;
  if (typeof raw !== 'string') return null;
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(raw.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match.map(Number) as unknown as number[];
  const date = new Date(y, mo - 1, d, h, mi, s || 0);
  return Number.isNaN(date.getTime()) || date.getFullYear() < 1990 ? null : date;
}
