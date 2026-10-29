/**
 * Where progress-photo images live: VITA's own document storage (6.6).
 *
 * `Documents/journey-photos/<journeyId>/<photoId>.<ext>` — app-owned,
 * kept by the system (unlike the cache), and never visible to other apps.
 * Local only: nothing here uploads, syncs or backs up anything, and a photo
 * lasts as long as VITA's local app data does.
 *
 * **Structurally safe deletion.** `remove` accepts only a relative path that
 * matches `PHOTO_FILE_PATTERN` and resolves it inside the photo folder, so it
 * can never touch the user's Photo Library, a picker's temporary file, or
 * anything else on the device.
 */

import { Directory, File, Paths } from 'expo-file-system';
import { PHOTO_FILE_PATTERN } from './model';

export interface PhotoFileStore {
  /** Copies a picked/captured image into owned storage at `file`. */
  copyIn(sourceUri: string, file: string): Promise<void>;
  /** Deletes an owned file. Refuses anything outside the photo folder. */
  remove(file: string): Promise<void>;
  /** The URI to render an owned file. */
  uriFor(file: string): string;
}

const ROOT = 'journey-photos';

function assertOwned(file: string) {
  if (!PHOTO_FILE_PATTERN.test(file)) throw new Error(`Refusing a path outside VITA's photo folder: ${file}`);
}

export const documentPhotoFileStore: PhotoFileStore = {
  async copyIn(sourceUri, file) {
    assertOwned(file);
    const [journeyFolder, name] = file.split('/');
    const folder = new Directory(Paths.document, ROOT, journeyFolder);
    folder.create({ intermediates: true, idempotent: true });
    await new File(sourceUri).copy(new File(folder, name));
  },

  async remove(file) {
    assertOwned(file);
    const target = new File(Paths.document, ROOT, file);
    if (target.exists) target.delete();
  },

  uriFor(file) {
    return new File(Paths.document, ROOT, file).uri;
  },
};
