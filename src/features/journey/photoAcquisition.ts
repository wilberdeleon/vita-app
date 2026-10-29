/**
 * Getting an image from the camera or the Photo Library (slice 6.6).
 *
 * **Just in time.** Permission is requested only after the user chooses Take
 * Photo or Choose from Library — never on opening Journey. A refusal is
 * returned as `denied` for the screen to explain calmly, once; VITA does not
 * re-prompt. A limited Photo Library grant is respected as the platform
 * gives it.
 *
 * **Nothing processed.** No editing UI (`allowsEditing: false`), no crop,
 * full quality. One image at a time. The result is a temporary URI that the
 * caller hands to `PhotosProvider.addPhoto`, which copies it into VITA's own
 * storage only on Save. Nothing here touches the network.
 */

import * as ImagePicker from 'expo-image-picker';
import { exifTakenAt } from '../../lib/journey';

export type PhotoSource = 'camera' | 'library';

export type Acquired =
  | { kind: 'picked'; uri: string; mimeType: string | null; suggestedTakenAt: Date }
  | { kind: 'cancelled' }
  | { kind: 'denied'; source: PhotoSource };

export async function acquirePhoto(source: PhotoSource, now: () => Date = () => new Date()): Promise<Acquired> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { kind: 'denied', source };

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: false,
    allowsMultipleSelection: false,
    quality: 1,
    // Library only: the capture time, read locally, as a suggestion the user can correct.
    exif: source === 'library',
  };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return { kind: 'cancelled' };

  const asset = result.assets[0];
  const suggestedTakenAt = (source === 'library' && exifTakenAt(asset.exif ?? null)) || now();
  return { kind: 'picked', uri: asset.uri, mimeType: asset.mimeType ?? null, suggestedTakenAt };
}
