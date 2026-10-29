/**
 * `PhotosProvider` (slice 6.6) over in-memory repositories and an in-memory
 * owned folder that can fail on demand — the seams that prove a photo's file
 * and its record never disagree, and that a finished Journey is read-only.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { shiftLogDate, toLogDate } from '../../daily';
import type { JourneyRepository } from '../data/JourneyRepository';
import type { WeightRepository } from '../data/WeightRepository';
import type { Journey } from '../model/journeys';
import type { PhotoFileStore } from '../photos/fileStore';
import { PHOTO_FILE_PATTERN, type ProgressPhoto } from '../photos/model';
import { PhotosProvider, usePhotos, type PhotosContextValue } from '../photos/PhotosProvider';
import type { PhotoRepository } from '../photos/repository';
import { JourneyProvider } from '../state/JourneyProvider';
import { WeightProvider } from '../state/WeightProvider';

const TODAY = toLogDate(new Date());
const START = shiftLogDate(TODAY, -10);
const ACTIVE: Journey = { id: 'j-a', name: 'Now', startDate: START, plannedEndDate: shiftLogDate(START, 29), status: 'active', createdAt: new Date().toISOString() };
const DONE: Journey = {
  id: 'j-old',
  name: 'Before',
  startDate: shiftLogDate(TODAY, -100),
  plannedEndDate: shiftLogDate(TODAY, -40),
  status: 'completed',
  createdAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
};

const weights: WeightRepository = {
  getEntries: async () => [],
  saveEntries: async () => {},
  getPreferences: async () => null,
  savePreferences: async () => {},
};
const journeys: JourneyRepository = { getJourneys: async () => [ACTIVE, DONE], saveJourneys: async () => {} };

function photoRepo(seed: ProgressPhoto[] = []) {
  let photos = [...seed];
  let fail = false;
  const repository: PhotoRepository = {
    getPhotos: async () => [...photos],
    async savePhotos(next) {
      if (fail) {
        fail = false;
        throw new Error('disk full');
      }
      photos = [...next];
    },
  };
  return { repository, stored: () => photos, failNext: () => (fail = true) };
}

function folder() {
  const owned = new Set<string>();
  const log = { copies: [] as { from: string; to: string }[], removed: [] as string[] };
  let failCopy = false;
  const files: PhotoFileStore = {
    async copyIn(from, to) {
      if (failCopy) throw new Error('no space');
      log.copies.push({ from, to });
      owned.add(to);
    },
    async remove(file) {
      log.removed.push(file);
      owned.delete(file);
    },
    uriFor: (file) => `file:///doc/journey-photos/${file}`,
  };
  return { files, owned, log, failCopyNext: () => (failCopy = true) };
}

let ctx: PhotosContextValue;
function Probe() {
  ctx = usePhotos();
  return null;
}

let tree: ReactTestRenderer | null = null;
async function mount(repo: PhotoRepository, files: PhotoFileStore) {
  await act(async () => {
    tree = create(
      <WeightProvider repository={weights}>
        <JourneyProvider repository={journeys}>
          <PhotosProvider repository={repo} files={files}>
            <Probe />
          </PhotosProvider>
        </JourneyProvider>
      </WeightProvider>,
    );
  });
}

afterEach(async () => {
  const t = tree;
  tree = null;
  if (t) await act(async () => t.unmount());
});

const TEMP = 'file:///var/mobile/Containers/Data/tmp/ImagePicker/9F3A.jpg';
const earlier = (hours: number) => new Date(Date.now() - hours * 3_600_000);

async function add(journeyId = ACTIVE.id, takenAt = earlier(1)) {
  let result: ProgressPhoto | null = null;
  await act(async () => {
    result = await ctx.addPhoto({ journeyId, sourceUri: TEMP, mimeType: 'image/jpeg', takenAt });
  });
  return result as ProgressPhoto | null;
}

const old = (id: string, journeyId = DONE.id): ProgressPhoto => ({
  id,
  journeyId,
  file: `${journeyId}/${id}.jpg`,
  takenAt: new Date(`${shiftLogDate(TODAY, -60)}T12:00:00`).toISOString(),
  createdAt: new Date().toISOString(),
});

describe('saving a photo', () => {
  it('copies the image into the owned folder and records only the owned relative path', async () => {
    const repo = photoRepo();
    const dir = folder();
    await mount(repo.repository, dir.files);
    const saved = await add();
    expect(saved).not.toBeNull();
    expect(repo.stored()).toEqual([saved]);
    expect(saved!.journeyId).toBe(ACTIVE.id);
    expect(saved!.file).toMatch(PHOTO_FILE_PATTERN);
    expect(saved!.file.startsWith(`${ACTIVE.id}/`)).toBe(true);
    expect(JSON.stringify(repo.stored())).not.toContain('ImagePicker');
    expect(dir.log.copies).toEqual([{ from: TEMP, to: saved!.file }]);
    expect(ctx.uriFor(saved!)).toBe(`file:///doc/journey-photos/${saved!.file}`);
  });

  it('records nothing when the copy fails', async () => {
    const repo = photoRepo();
    const dir = folder();
    await mount(repo.repository, dir.files);
    dir.failCopyNext();
    expect(await add()).toBeNull();
    expect(repo.stored()).toEqual([]);
    expect(dir.owned.size).toBe(0);
    expect(ctx.photosFor(ACTIVE.id)).toEqual([]);
  });

  it('removes the copied file again when the record cannot be saved — no orphan', async () => {
    const repo = photoRepo();
    const dir = folder();
    await mount(repo.repository, dir.files);
    repo.failNext();
    expect(await add()).toBeNull();
    expect(repo.stored()).toEqual([]);
    expect(dir.log.copies).toHaveLength(1);
    expect(dir.log.removed).toEqual([dir.log.copies[0].to]);
    expect(dir.owned.size).toBe(0);
  });

  it('allows several photos on the same day', async () => {
    const repo = photoRepo();
    await mount(repo.repository, folder().files);
    await add(ACTIVE.id, earlier(1));
    await add(ACTIVE.id, earlier(2));
    expect(ctx.photosFor(ACTIVE.id)).toHaveLength(2);
  });

  it('refuses a moment before the Journey began or in the future, writing nothing', async () => {
    const repo = photoRepo();
    const dir = folder();
    await mount(repo.repository, dir.files);
    expect(await add(ACTIVE.id, new Date(`${shiftLogDate(START, -1)}T12:00:00`))).toBeNull();
    expect(await add(ACTIVE.id, new Date(Date.now() + 3_600_000))).toBeNull();
    expect(repo.stored()).toEqual([]);
    expect(dir.log.copies).toEqual([]);
  });

  it('refuses a completed or unknown Journey', async () => {
    const repo = photoRepo();
    const dir = folder();
    await mount(repo.repository, dir.files);
    expect(await add(DONE.id, new Date(`${shiftLogDate(TODAY, -60)}T12:00:00`))).toBeNull();
    expect(await add('j-nope')).toBeNull();
    expect(dir.log.copies).toEqual([]);
  });
});

describe('re-dating and deleting', () => {
  it('changes only takenAt — never the Journey, file or id', async () => {
    const repo = photoRepo();
    await mount(repo.repository, folder().files);
    const saved = (await add())!;
    const when = earlier(5);
    let ok = false;
    await act(async () => {
      ok = await ctx.updateTakenAt(saved.id, when);
    });
    expect(ok).toBe(true);
    expect(repo.stored()).toEqual([{ ...saved, takenAt: when.toISOString() }]);
  });

  it('refuses a new date before the Journey began', async () => {
    const repo = photoRepo();
    await mount(repo.repository, folder().files);
    const saved = (await add())!;
    let ok = true;
    await act(async () => {
      ok = await ctx.updateTakenAt(saved.id, new Date(`${shiftLogDate(START, -3)}T12:00:00`));
    });
    expect(ok).toBe(false);
    expect(repo.stored()).toEqual([saved]);
  });

  it('removes the record and its owned file only', async () => {
    const repo = photoRepo();
    const dir = folder();
    await mount(repo.repository, dir.files);
    const keep = (await add())!;
    const gone = (await add(ACTIVE.id, earlier(3)))!;
    await act(async () => {
      await ctx.removePhoto(gone.id);
    });
    expect(repo.stored()).toEqual([keep]);
    expect(dir.log.removed).toEqual([gone.file]);
    expect(dir.log.removed).not.toContain(TEMP);
  });

  it('keeps the file when the record cannot be removed — nothing shows a missing photo', async () => {
    const repo = photoRepo();
    const dir = folder();
    await mount(repo.repository, dir.files);
    const saved = (await add())!;
    repo.failNext();
    let ok = true;
    await act(async () => {
      ok = await ctx.removePhoto(saved.id);
    });
    expect(ok).toBe(false);
    expect(repo.stored()).toEqual([saved]);
    expect(dir.log.removed).toEqual([]);
  });

  it("a completed Journey's photos can't be re-dated or deleted", async () => {
    const photo = old('p-old');
    const repo = photoRepo([photo]);
    const dir = folder();
    await mount(repo.repository, dir.files);
    let edited = true;
    let removed = true;
    await act(async () => {
      edited = await ctx.updateTakenAt(photo.id, earlier(1));
      removed = await ctx.removePhoto(photo.id);
    });
    expect([edited, removed]).toEqual([false, false]);
    expect(repo.stored()).toEqual([photo]);
    expect(dir.log.removed).toEqual([]);
    expect(ctx.photosFor(DONE.id)).toEqual([photo]);
  });
});

describe('ownership', () => {
  it('each Journey sees only its own photos — the new one inherits nothing', async () => {
    const repo = photoRepo([old('p-old')]);
    await mount(repo.repository, folder().files);
    expect(ctx.photosFor(ACTIVE.id)).toEqual([]);
    await add();
    expect(ctx.photosFor(ACTIVE.id)).toHaveLength(1);
    expect(ctx.photosFor(DONE.id).map((p) => p.id)).toEqual(['p-old']);
  });
});
