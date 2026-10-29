/**
 * Progress-photo domain, metadata store and owned file store (slice 6.6).
 *
 * The file store runs over a fake `expo-file-system` that records every path
 * it is asked to touch — the proof that deletion can only ever reach VITA's
 * own `journey-photos` folder.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockFs = { created: [] as string[], copied: [] as { from: string; to: string }[], deleted: [] as string[], existing: new Set<string>() };
jest.mock('expo-file-system', () => {
  const join = (parts: unknown[]) =>
    parts.map((part) => (typeof part === 'string' ? part : (part as { uri: string }).uri)).join('/');
  class Directory {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(parts);
    }
    create() {
      mockFs.created.push(this.uri);
    }
  }
  class File {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(parts);
    }
    get exists() {
      return mockFs.existing.has(this.uri);
    }
    async copy(dest: { uri: string }) {
      mockFs.copied.push({ from: this.uri, to: dest.uri });
    }
    delete() {
      mockFs.deleted.push(this.uri);
    }
  }
  return { Directory, File, Paths: { document: { uri: 'file:///doc' } } };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JourneyKeys } from '../data/keys';
import { documentPhotoFileStore } from '../photos/fileStore';
import {
  PHOTO_FILE_PATTERN,
  exifTakenAt,
  isValidPhotoTime,
  newProgressPhoto,
  photoExtension,
  photosForJourney,
  type ProgressPhoto,
} from '../photos/model';
import { asyncStoragePhotoRepository, parsePhoto } from '../photos/repository';

const NOW = new Date(2026, 9, 28, 9, 30);
const JOURNEY = { startDate: '2026-10-20' };

function photo(id: string, journeyId: string, takenAt: string): ProgressPhoto {
  return { id, journeyId, file: `${journeyId}/${id}.jpg`, takenAt, createdAt: takenAt };
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockFs.created = [];
  mockFs.copied = [];
  mockFs.deleted = [];
  mockFs.existing.clear();
});

describe('a new progress photo', () => {
  it('belongs to one Journey and points at an owned relative path — never the picker URI', () => {
    const p = newProgressPhoto({ journeyId: 'journey_abc', takenAt: NOW, extension: 'heic', now: NOW });
    expect(p).toEqual({
      id: expect.stringMatching(/^photo_/),
      journeyId: 'journey_abc',
      file: `journey_abc/${p.id}.heic`,
      takenAt: NOW.toISOString(),
      createdAt: NOW.toISOString(),
    });
    expect(p.file).toMatch(PHOTO_FILE_PATTERN);
    expect(Object.keys(p).sort()).toEqual(['createdAt', 'file', 'id', 'journeyId', 'takenAt']);
  });

  it('takes its extension from the MIME type, then the URI, else jpg — never a user file name', () => {
    expect(photoExtension('file:///tmp/x.jpg', 'image/heic')).toBe('heic');
    expect(photoExtension('file:///tmp/IMG_0001.PNG')).toBe('png');
    expect(photoExtension('file:///tmp/evil.exe')).toBe('jpg');
    expect(photoExtension('ph://asset-id')).toBe('jpg');
  });
});

describe('when a photo may be dated', () => {
  it('accepts now, the start day, and past the planned end', () => {
    expect(isValidPhotoTime(NOW, JOURNEY, NOW)).toBe(true);
    expect(isValidPhotoTime(new Date(2026, 9, 20, 0, 1), JOURNEY, NOW)).toBe(true);
  });

  it('refuses before the Journey began, the future beyond a minute of skew, and nonsense', () => {
    expect(isValidPhotoTime(new Date(2026, 9, 19, 23, 59), JOURNEY, NOW)).toBe(false);
    expect(isValidPhotoTime(new Date(NOW.getTime() + 30_000), JOURNEY, NOW)).toBe(true);
    expect(isValidPhotoTime(new Date(NOW.getTime() + 61_000), JOURNEY, NOW)).toBe(false);
    expect(isValidPhotoTime(new Date('nope'), JOURNEY, NOW)).toBe(false);
  });
});

describe('a Journey shows only its own photos', () => {
  it('filters by journeyId and sorts newest first, several per day allowed', () => {
    const photos = [
      photo('a', 'j1', '2026-10-21T08:00:00.000Z'),
      photo('b', 'j2', '2026-10-25T08:00:00.000Z'),
      photo('c', 'j1', '2026-10-24T08:00:00.000Z'),
      photo('d', 'j1', '2026-10-24T20:00:00.000Z'),
    ];
    expect(photosForJourney(photos, 'j1').map((p) => p.id)).toEqual(['d', 'c', 'a']);
    expect(photosForJourney(photos, 'j3')).toEqual([]);
  });
});

describe('EXIF capture time', () => {
  it('reads DateTimeOriginal as local time, falling back to Digitized and DateTime', () => {
    expect(exifTakenAt({ DateTimeOriginal: '2026:05:13 07:42:10' })).toEqual(new Date(2026, 4, 13, 7, 42, 10));
    expect(exifTakenAt({ DateTimeDigitized: '2026:05:13 07:42' })).toEqual(new Date(2026, 4, 13, 7, 42, 0));
    expect(exifTakenAt({ DateTime: '2026:05:13 07:42:10' })).toEqual(new Date(2026, 4, 13, 7, 42, 10));
  });

  it('is null when absent or unreadable — the caller falls back to now', () => {
    expect(exifTakenAt(null)).toBeNull();
    expect(exifTakenAt({})).toBeNull();
    expect(exifTakenAt({ DateTimeOriginal: 12 })).toBeNull();
    expect(exifTakenAt({ DateTimeOriginal: 'yesterday' })).toBeNull();
    expect(exifTakenAt({ DateTimeOriginal: '0000:00:00 00:00:00' })).toBeNull();
  });
});

describe('the metadata store', () => {
  it('round-trips under vita:v1:journey:photos and removes the key when empty', async () => {
    const photos = [photo('a', 'j1', '2026-10-21T08:00:00.000Z')];
    await asyncStoragePhotoRepository.savePhotos(photos);
    expect(JourneyKeys.photos).toBe('vita:v1:journey:photos');
    expect(await asyncStoragePhotoRepository.getPhotos()).toEqual(photos);
    await asyncStoragePhotoRepository.savePhotos([]);
    expect(await AsyncStorage.getItem(JourneyKeys.photos)).toBeNull();
  });

  it('drops malformed records, never repairs them, and never writes on read', async () => {
    const good = photo('a', 'j1', '2026-10-21T08:00:00.000Z');
    const raw = [
      good,
      { ...good }, // duplicate id
      { ...photo('b', 'j1', '2026-10-21T08:00:00.000Z'), journeyId: '' },
      { ...photo('c', 'j1', '2026-10-21T08:00:00.000Z'), file: 'file:///var/mobile/tmp/c.jpg' }, // a temp URI
      { ...photo('d', 'j1', '2026-10-21T08:00:00.000Z'), file: 'j2/d.jpg' }, // another Journey's folder
      { ...photo('e', 'j1', '2026-10-21T08:00:00.000Z'), file: 'j1/../../e.jpg' },
      { ...photo('f', 'j1', 'not a date') },
      'nonsense',
    ];
    await AsyncStorage.setItem(JourneyKeys.photos, JSON.stringify(raw));
    const before = await AsyncStorage.getItem(JourneyKeys.photos);
    expect(await asyncStoragePhotoRepository.getPhotos()).toEqual([good]);
    expect(await AsyncStorage.getItem(JourneyKeys.photos)).toBe(before);
    expect(parsePhoto({ ...good, extra: 'ignored' })).toEqual(good);
  });
});

describe('the owned file store', () => {
  it('copies into Documents/journey-photos/<journeyId>/ and renders from there', async () => {
    await documentPhotoFileStore.copyIn('file:///tmp/ImagePicker/abc.jpg', 'j1/photo_1.jpg');
    expect(mockFs.created).toEqual(['file:///doc/journey-photos/j1']);
    expect(mockFs.copied).toEqual([{ from: 'file:///tmp/ImagePicker/abc.jpg', to: 'file:///doc/journey-photos/j1/photo_1.jpg' }]);
    expect(documentPhotoFileStore.uriFor('j1/photo_1.jpg')).toBe('file:///doc/journey-photos/j1/photo_1.jpg');
  });

  it('deletes only an owned file, and only when it exists', async () => {
    mockFs.existing.add('file:///doc/journey-photos/j1/photo_1.jpg');
    await documentPhotoFileStore.remove('j1/photo_1.jpg');
    await documentPhotoFileStore.remove('j1/photo_gone.jpg');
    expect(mockFs.deleted).toEqual(['file:///doc/journey-photos/j1/photo_1.jpg']);
  });

  it.each([
    'file:///var/mobile/Media/DCIM/IMG_0001.jpg',
    'ph://ABC-123',
    '../secrets.jpg',
    'j1/../../x.jpg',
    '/etc/passwd',
    'j1/photo.exe',
    'j1/sub/photo.jpg',
  ])('refuses to touch %s', async (path) => {
    await expect(documentPhotoFileStore.remove(path)).rejects.toThrow(/outside VITA's photo folder/);
    await expect(documentPhotoFileStore.copyIn('file:///tmp/a.jpg', path)).rejects.toThrow(/outside VITA's photo folder/);
    expect(mockFs.deleted).toEqual([]);
    expect(mockFs.copied).toEqual([]);
  });
});
