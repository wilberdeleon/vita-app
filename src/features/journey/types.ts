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
  /** This Journey's photos, newest first. Release: real only; preview: placeholders only. */
  photos: readonly JourneyPhotoView[];
  unit: WeightUnit;
};

/**
 * A progress photo as the Photos pillar lays it out.
 *
 * Either a real progress photo (6.6) with its owned file URI, or a `__DEV__`
 * layout placeholder. The two are a discriminated union, so a placeholder can
 * never carry an image and a real photo can never be mistaken for one.
 */
export type JourneyPhotoView =
  | {
      id: string;
      /** ISO instant the photo represents. */
      takenAt: string;
      /** A real progress photo (6.6): the owned file's URI. */
      uri: string;
      placeholder?: undefined;
    }
  | {
      id: string;
      takenAt: string;
      /** `__DEV__` preview layout placeholder — never a real image. */
      placeholder: true;
      uri?: undefined;
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

/** What release can do with photos (6.6). Omitted by the preview and by completed Journeys. */
export type JourneyPhotoActions = {
  /** Opens the Take Photo / Choose from Library choice. */
  onAdd: () => void;
};

