/**
 * Slice 6.6 — progress photos through the real routes and providers, with
 * the camera / Photo Library mocked at `expo-image-picker` and VITA's owned
 * folder in memory (see `journeyHarness.photoFiles`).
 *
 * Pins: just-in-time permission; Cancel and refusal leave nothing; a review
 * step before anything is written; the owned copy is what is stored; photos
 * belong to one Journey; detail re-dates and deletes with confirmation; a
 * finished Journey's photos are visible and read-only.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    push: (...args: unknown[]) => mockPush(...args),
    navigate: jest.fn(),
    replace: jest.fn(),
    dismissTo: jest.fn(),
  },
  Redirect: () => null,
  useLocalSearchParams: () => mockParams,
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Alert } from 'react-native';
import { act } from 'react-test-renderer';
import Journey from '../../../app/(vita)/(tabs)/journey';
import JourneyDetail from '../../../app/(vita)/journey/[id]';
import PhotoDetail from '../../../app/(vita)/journey/photo/[id]';
import { shiftLogDate } from '../../../lib/daily';
import {
  TODAY,
  at,
  control,
  hasControl,
  journeyFixture,
  mountApp,
  photoFiles,
  photoFixture,
  pillar,
  press,
  seedPhotos,
  seedStorage,
  storedPhotos,
  text,
  type,
  unmountApp,
} from './journeyHarness';

const ACTIVE = journeyFixture({ id: 'j-a', name: 'Summer Transformation' }); // started 10 days ago
const DONE = journeyFixture({
  id: 'j-old',
  name: 'Getting Back to Me',
  startDate: shiftLogDate(TODAY, -200),
  plannedEndDate: shiftLogDate(TODAY, -110),
  status: 'completed',
  completedAt: at(100, 9),
});
const mockPicker = ImagePicker as unknown as Record<
  'requestCameraPermissionsAsync' | 'requestMediaLibraryPermissionsAsync' | 'launchCameraAsync' | 'launchImageLibraryAsync',
  jest.Mock
>;
const TEMP = 'file:///var/mobile/Containers/Data/Application/X/tmp/ImagePicker/9F3A.jpg';

let sheetChoice: number | null = null;
beforeEach(async () => {
  mockParams = {};
  sheetChoice = null;
  await AsyncStorage.clear();
  photoFiles.reset();
  jest.clearAllMocks();
  jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation((_options, callback) => {
    if (sheetChoice !== null) callback(sheetChoice);
  });
  mockPicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true });
  mockPicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
  mockPicker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [{ uri: TEMP, mimeType: 'image/jpeg' }] });
  mockPicker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [{ uri: TEMP, mimeType: 'image/heic', exif: { DateTimeOriginal: exifStamp(2, 7, 15) } }],
  });
});

afterEach(async () => {
  await unmountApp();
  jest.restoreAllMocks();
});

function exifStamp(daysAgo: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}:${p(d.getMonth() + 1)}:${p(d.getDate())} ${p(hour)}:${p(minute)}:00`;
}

async function photosPillar() {
  await seedStorage({ journeys: [ACTIVE, DONE] });
  const tree = await mountApp(<Journey />);
  await pillar(tree, 'Photos');
  return tree;
}

async function choose(tree: Awaited<ReturnType<typeof mountApp>>, index: 0 | 1 | 2) {
  sheetChoice = index;
  await press(tree, 'Add Progress Photo');
  await new Promise((resolve) => setImmediate(resolve));
}

describe('adding a progress photo', () => {
  it('offers Take Photo / Choose from Library, and asks for no permission until one is chosen', async () => {
    const tree = await photosPillar();
    expect(text(tree)).toContain('No progress photos yet');
    await choose(tree, 2);
    expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalledWith(
      expect.objectContaining({ options: ['Take Photo', 'Choose from Library', 'Cancel'], cancelButtonIndex: 2 }),
      expect.any(Function),
    );
    expect(mockPicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    expect(mockPicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });

  it('camera: review, then Save Photo copies into the owned folder and stores only that path', async () => {
    const tree = await photosPillar();
    await choose(tree, 0);
    expect(mockPicker.launchCameraAsync).toHaveBeenCalledWith(
      expect.objectContaining({ mediaTypes: ['images'], allowsEditing: false, quality: 1 }),
    );
    expect(text(tree)).toContain('Progress Photo');
    expect(await storedPhotos()).toEqual([]); // nothing until Save
    expect(photoFiles.copies).toEqual([]);
    await press(tree, 'Save Photo');
    const [saved] = await storedPhotos();
    expect(saved).toMatchObject({ journeyId: ACTIVE.id });
    expect(saved.file).toMatch(new RegExp(`^${ACTIVE.id}/photo_[a-z0-9]+\\.jpg$`));
    expect(JSON.stringify(await storedPhotos())).not.toContain('ImagePicker');
    expect(photoFiles.copies).toEqual([{ from: TEMP, to: saved.file }]);
    expect(text(tree)).toContain('PROGRESS PHOTOS · 1');
  });

  it('library: suggests the EXIF capture time, which the user can correct before saving', async () => {
    const tree = await photosPillar();
    await choose(tree, 1);
    expect(mockPicker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ exif: true, allowsEditing: false }));
    await press(tree, /^When, /);
    await type(tree, 'Date, year dash month dash day', shiftLogDate(TODAY, -3));
    await type(tree, 'Time, hours colon minutes', '06:45');
    await press(tree, 'Save Photo');
    const [saved] = await storedPhotos();
    const when = new Date(saved.takenAt);
    expect([when.getHours(), when.getMinutes()]).toEqual([6, 45]);
    expect(saved.file.endsWith('.heic')).toBe(true);
  });

  it('library without EXIF falls back to now', async () => {
    mockPicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: TEMP, mimeType: 'image/jpeg' }] });
    const tree = await photosPillar();
    const before = Date.now();
    await choose(tree, 1);
    await press(tree, 'Save Photo');
    const [saved] = await storedPhotos();
    expect(Date.parse(saved.takenAt)).toBeGreaterThanOrEqual(before - 1000);
  });

  it('refuses a date before the Journey began — Save stays off', async () => {
    const tree = await photosPillar();
    await choose(tree, 0);
    await press(tree, /^When, /);
    await type(tree, 'Date, year dash month dash day', shiftLogDate(ACTIVE.startDate, -1));
    expect(text(tree)).toMatch(/This Journey began .*Choose a date on or after it\./);
    expect(control(tree, 'Save Photo').props.disabled).toBe(true);
    expect(await storedPhotos()).toEqual([]);
  });

  it('Cancel in the picker or the review leaves no record and no file', async () => {
    mockPicker.launchCameraAsync.mockResolvedValueOnce({ canceled: true, assets: null });
    const tree = await photosPillar();
    await choose(tree, 0);
    expect(hasControl(tree, 'Save Photo')).toBe(false);
    await choose(tree, 0);
    await press(tree, 'Cancel');
    expect(await storedPhotos()).toEqual([]);
    expect(photoFiles.copies).toEqual([]);
  });

  it('a refused permission explains calmly, once, and opens nothing', async () => {
    mockPicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false });
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const tree = await photosPillar();
    await choose(tree, 0);
    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith('Camera access is off', expect.stringContaining('Settings'));
    expect(mockPicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(await storedPhotos()).toEqual([]);
  });

  it('a failed copy records nothing and says so', async () => {
    photoFiles.failCopy = true;
    const tree = await photosPillar();
    await choose(tree, 0);
    await press(tree, 'Save Photo');
    expect(await storedPhotos()).toEqual([]);
    expect(text(tree)).toContain("We couldn't save the photo. Nothing was recorded — try again.");
  });
});

describe('the Photos history', () => {
  it("shows only this Journey's photos, newest first, and Overview counts them", async () => {
    await seedStorage({ journeys: [ACTIVE, DONE] });
    await seedPhotos([
      photoFixture('p1', ACTIVE.id, at(5, 8)),
      photoFixture('p2', ACTIVE.id, at(1, 8)),
      photoFixture('p3', ACTIVE.id, at(1, 19)),
      photoFixture('p-old', DONE.id, at(150, 8)),
    ]);
    const tree = await mountApp(<Journey />);
    await pillar(tree, 'Overview');
    expect(text(tree)).toContain('3 progress photos');
    await pillar(tree, 'Photos');
    expect(text(tree)).toContain('PROGRESS PHOTOS · 3');
    const tiles = tree.root.findAll((n) => typeof n.props.onPress === 'function' && /^Progress photo, /.test(n.props.accessibilityLabel ?? ''));
    const labels = [...new Set(tiles.map((n) => n.props.accessibilityLabel as string))];
    expect(labels).toHaveLength(3); // distinct even for two photos on one day
    await act(async () => tiles[0].props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/journey/photo/p3');
  });

  it('a Journey started after a finished one inherits none of its photos', async () => {
    await seedStorage({ journeys: [ACTIVE, DONE] });
    await seedPhotos([photoFixture('p-old', DONE.id, at(150, 8))]);
    const tree = await mountApp(<Journey />);
    await pillar(tree, 'Photos');
    expect(text(tree)).toContain('No progress photos yet');
  });
});

describe('photo detail', () => {
  it('re-dates within the Journey, keeping its Journey and file', async () => {
    const photo = photoFixture('p1', ACTIVE.id, at(1, 8));
    await seedStorage({ journeys: [ACTIVE] });
    await seedPhotos([photo]);
    mockParams = { id: 'p1' };
    const tree = await mountApp(<PhotoDetail />);
    expect(text(tree)).toContain('Summer Transformation');
    await press(tree, 'Change date and time');
    await type(tree, 'Date, year dash month dash day', shiftLogDate(TODAY, -4));
    await type(tree, 'Time, hours colon minutes', '07:10');
    await press(tree, 'Save');
    const [saved] = await storedPhotos();
    expect({ ...saved, takenAt: undefined }).toEqual({ ...photo, takenAt: undefined });
    expect(new Date(saved.takenAt).getHours()).toBe(7);
  });

  it('deletes after "Delete progress photo?", removing the record and the owned file only', async () => {
    const photo = photoFixture('p1', ACTIVE.id, at(1, 8));
    const keep = photoFixture('p2', ACTIVE.id, at(2, 8));
    await seedStorage({ journeys: [ACTIVE] });
    await seedPhotos([photo, keep]);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      buttons?.find((b) => b.text === 'Delete')?.onPress?.();
    });
    mockParams = { id: 'p1' };
    const tree = await mountApp(<PhotoDetail />);
    await press(tree, 'Delete this progress photo');
    await new Promise((resolve) => setImmediate(resolve));
    expect(alert).toHaveBeenCalledWith('Delete progress photo?', 'This removes the photo from this Journey.', expect.any(Array));
    expect(await storedPhotos()).toEqual([keep]);
    expect(photoFiles.removed).toEqual([photo.file]);
    expect(photoFiles.owned.has(keep.file)).toBe(true);
    expect(mockBack).toHaveBeenCalled();
  });

  it("a finished Journey's photo is visible and read-only", async () => {
    await seedStorage({ journeys: [DONE] });
    await seedPhotos([photoFixture('p-old', DONE.id, at(150, 8))]);
    mockParams = { id: 'p-old' };
    const tree = await mountApp(<PhotoDetail />);
    expect(text(tree)).toContain('Getting Back to Me');
    expect(hasControl(tree, 'Change date and time')).toBe(false);
    expect(hasControl(tree, 'Delete this progress photo')).toBe(false);
  });

  it('an unknown photo says so', async () => {
    mockParams = { id: 'nope' };
    const tree = await mountApp(<PhotoDetail />);
    expect(text(tree)).toContain('This photo isn’t available.');
  });
});

describe('a finished Journey', () => {
  it('shows its photos read-only — no Add Progress Photo', async () => {
    await seedStorage({ journeys: [DONE] });
    await seedPhotos([photoFixture('p-old', DONE.id, at(150, 8))]);
    mockParams = { id: DONE.id };
    const tree = await mountApp(<JourneyDetail />);
    expect(text(tree)).toContain('PROGRESS PHOTOS · 1');
    expect(hasControl(tree, 'Add Progress Photo')).toBe(false);
  });
});
