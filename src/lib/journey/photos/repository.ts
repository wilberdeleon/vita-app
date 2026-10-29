/**
 * Progress-photo metadata at `vita:v1:journey:photos` (6.6). Image bytes are
 * never stored here — only the facts and the owned file path.
 *
 * Validated on read like every VITA store: a malformed record is dropped,
 * never repaired, and reading never writes.
 */

import { isNonEmptyString, isRecord } from '../../daily/guards';
import { readJson, removeKey, writeJson } from '../../daily/storage';
import { JourneyKeys } from '../data/keys';
import { PHOTO_FILE_PATTERN, type ProgressPhoto } from './model';

export interface PhotoRepository {
  getPhotos(): Promise<ProgressPhoto[]>;
  savePhotos(photos: readonly ProgressPhoto[]): Promise<void>;
}

export function parsePhoto(value: unknown): ProgressPhoto | null {
  if (!isRecord(value)) return null;
  const { id, journeyId, file, takenAt, createdAt } = value;
  if (!isNonEmptyString(id) || !isNonEmptyString(journeyId)) return null;
  if (!isNonEmptyString(file) || !PHOTO_FILE_PATTERN.test(file) || !file.startsWith(`${journeyId}/`)) return null;
  if (!isNonEmptyString(takenAt) || Number.isNaN(Date.parse(takenAt))) return null;
  if (!isNonEmptyString(createdAt) || Number.isNaN(Date.parse(createdAt))) return null;
  return { id, journeyId, file, takenAt, createdAt };
}

export const asyncStoragePhotoRepository: PhotoRepository = {
  async getPhotos() {
    const stored = await readJson(JourneyKeys.photos);
    if (!Array.isArray(stored)) return [];
    const photos: ProgressPhoto[] = [];
    const seen = new Set<string>();
    for (const candidate of stored) {
      const photo = parsePhoto(candidate);
      if (photo && !seen.has(photo.id)) {
        seen.add(photo.id);
        photos.push(photo);
      }
    }
    return photos;
  },

  async savePhotos(photos) {
    if (photos.length === 0) {
      await removeKey(JourneyKeys.photos);
      return;
    }
    await writeJson(JourneyKeys.photos, photos);
  },
};
