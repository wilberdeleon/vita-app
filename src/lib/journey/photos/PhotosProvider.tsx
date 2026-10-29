/**
 * Progress-photo state (slice 6.6) — inside `JourneyProvider`, because every
 * change is checked against the Journey it belongs to.
 *
 * ## Saving keeps file and record consistent
 *
 * 1. The Journey must exist and be **active**; the moment must be on or
 *    after its start and not in the future.
 * 2. The picked/captured image is **copied** into VITA's own folder. If that
 *    fails, nothing is recorded.
 * 3. The record is written. If that fails, the copy is deleted again, so no
 *    orphan file is left behind.
 *
 * A picker's temporary URI is never stored — only the owned copy's relative
 * path. The source (camera temp file or Photo Library asset) is never
 * modified or deleted.
 *
 * ## Deleting
 *
 * The record goes first (so nothing ever shows a photo whose file is gone),
 * then the owned file. A file that fails to delete is unreachable — no record
 * points at it.
 *
 * Completed Journeys are read-only: add, re-date and delete all refuse them.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useJourneys } from '../state/JourneyProvider';
import { documentPhotoFileStore, type PhotoFileStore } from './fileStore';
import { isValidPhotoTime, newProgressPhoto, photoExtension, photosForJourney, type ProgressPhoto } from './model';
import { asyncStoragePhotoRepository, type PhotoRepository } from './repository';

export type AddPhotoInput = {
  journeyId: string;
  /** The picker's temporary URI. Copied, never stored. */
  sourceUri: string;
  mimeType?: string | null;
  takenAt: Date;
};

export type PhotosContextValue = {
  status: 'loading' | 'ready';
  /** One Journey's photos, newest first. The only way consumers read photos. */
  photosFor: (journeyId: string) => ProgressPhoto[];
  /** Renderable URI for a stored photo. */
  uriFor: (photo: ProgressPhoto) => string;
  error: string | null;
  addPhoto: (input: AddPhotoInput) => Promise<ProgressPhoto | null>;
  /** Re-dates one photo. Its Journey never changes. */
  updateTakenAt: (id: string, takenAt: Date) => Promise<boolean>;
  removePhoto: (id: string) => Promise<boolean>;
};

const PhotosContext = createContext<PhotosContextValue | null>(null);

type Props = PropsWithChildren<{
  repository?: PhotoRepository;
  files?: PhotoFileStore;
}>;

export function PhotosProvider({ children, repository = asyncStoragePhotoRepository, files = documentPhotoFileStore }: Props) {
  const journeys = useJourneys();
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const photosRef = useRef<ProgressPhoto[]>([]);
  const journeysRef = useRef(journeys.journeys);
  journeysRef.current = journeys.journeys;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await repository.getPhotos();
        if (cancelled) return;
        photosRef.current = stored;
        setPhotos(stored);
      } catch {
        if (!cancelled) setError("We couldn't load your progress photos.");
      } finally {
        if (!cancelled) setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const save = useCallback(
    async (next: ProgressPhoto[]) => {
      try {
        await repository.savePhotos(next);
        photosRef.current = next;
        setPhotos(next);
        setError(null);
        return true;
      } catch {
        setError("We couldn't save that photo change.");
        return false;
      }
    },
    [repository],
  );

  const activeJourney = (id: string) =>
    journeysRef.current.find((journey) => journey.id === id && journey.status === 'active') ?? null;

  const addPhoto = useCallback(
    async ({ journeyId, sourceUri, mimeType, takenAt }: AddPhotoInput) => {
      const journey = activeJourney(journeyId);
      if (!journey || !isValidPhotoTime(takenAt, journey)) return null;
      const photo = newProgressPhoto({ journeyId, takenAt, extension: photoExtension(sourceUri, mimeType) });
      try {
        await files.copyIn(sourceUri, photo.file);
      } catch {
        setError("We couldn't save that photo.");
        return null;
      }
      if (!(await save([...photosRef.current, photo]))) {
        try {
          await files.remove(photo.file);
        } catch {
          // An unreferenced owned file is invisible; nothing else to do.
        }
        return null;
      }
      return photo;
    },
    [files, save],
  );

  const updateTakenAt = useCallback(
    async (id: string, takenAt: Date) => {
      const photo = photosRef.current.find((candidate) => candidate.id === id);
      if (!photo) return false;
      const journey = activeJourney(photo.journeyId);
      if (!journey || !isValidPhotoTime(takenAt, journey)) return false;
      return save(photosRef.current.map((candidate) => (candidate.id === id ? { ...candidate, takenAt: takenAt.toISOString() } : candidate)));
    },
    [save],
  );

  const removePhoto = useCallback(
    async (id: string) => {
      const photo = photosRef.current.find((candidate) => candidate.id === id);
      if (!photo || !activeJourney(photo.journeyId)) return false;
      if (!(await save(photosRef.current.filter((candidate) => candidate.id !== id)))) return false;
      try {
        await files.remove(photo.file);
      } catch {
        // The record is gone, so nothing can show the file; it is unreachable.
      }
      return true;
    },
    [files, save],
  );

  const value = useMemo<PhotosContextValue>(
    () => ({
      status,
      photosFor: (journeyId: string) => photosForJourney(photos, journeyId),
      uriFor: (photo: ProgressPhoto) => files.uriFor(photo.file),
      error,
      addPhoto,
      updateTakenAt,
      removePhoto,
    }),
    [status, photos, files, error, addPhoto, updateTakenAt, removePhoto],
  );

  return <PhotosContext.Provider value={value}>{children}</PhotosContext.Provider>;
}

export function usePhotos(): PhotosContextValue {
  const context = useContext(PhotosContext);
  if (!context) throw new Error('usePhotos must be used inside a PhotosProvider (mounted in src/app/_layout.tsx).');
  return context;
}
