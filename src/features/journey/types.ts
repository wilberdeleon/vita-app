import type { WeightEntry, WeightEntryChanges, WeightUnit } from '../../lib/journey';

/**
 * What the Journey pillars render — slice 6.3.
 *
 * Every Journey component takes this as **explicit props** and reads nothing
 * on its own. The release route fills it from the real `WeightProvider`; the
 * `__DEV__` preview fills it from fixtures declared inside the preview route.
 * Neither can fall back to the other: there is no default, no "if empty, show
 * an example" — a component handed nothing renders the truthful empty state.
 */
export type JourneyViewData = {
  status: 'loading' | 'ready';
  /** Newest first, as `WeightProvider` delivers them. */
  weights: readonly WeightEntry[];
  /** Always `[]` in release until slice 6.5 builds a photo domain. */
  photos: readonly JourneyPhotoView[];
  unit: WeightUnit;
};

/**
 * A progress photo as the Photos pillar lays it out.
 *
 * **Visual characterization only.** No photo model, storage or image exists
 * yet — 6.5 designs those. The only photos that can exist in 6.3 are `__DEV__`
 * layout placeholders, hence `placeholder: true` as a literal: there is no way
 * to construct one that claims to be a real image.
 */
export type JourneyPhotoView = {
  id: string;
  /** ISO instant the photo was taken. */
  takenAt: string;
  placeholder: true;
};

export type JourneyPillar = 'overview' | 'weight' | 'photos';

/**
 * What release Journey can *do* with weight (slice 6.4) — the real
 * `WeightProvider`'s own functions, passed through unchanged. Every one
 * resolves `true` only when storage was written.
 *
 * Optional on `JourneyView`: the `__DEV__` preview passes none, so it shows
 * no Log Weight button and cannot write anything, anywhere.
 */
export type JourneyWeightActions = {
  addEntry: (weight: number, unit: WeightUnit, loggedAt?: Date) => Promise<boolean>;
  updateEntry: (id: string, changes: WeightEntryChanges) => Promise<boolean>;
  removeEntry: (id: string) => Promise<boolean>;
  restoreEntry: (entry: WeightEntry) => Promise<boolean>;
  setUnit: (unit: WeightUnit) => Promise<boolean>;
};

