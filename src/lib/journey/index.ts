/**
 * Journey / Weight — the single source of truth for recorded body weight
 * (slice 6.2). Canonical kilograms; the lb/kg display unit is Journey's own.
 * No goal, no BMI, no trend storage, no recommendations.
 */

export {
  DEFAULT_WEIGHT_PREFERENCES,
  DEFAULT_WEIGHT_UNIT,
  WEIGHT_UNITS,
  type WeightEntry,
  type WeightPreferences,
  type WeightUnit,
} from './model/types';

export {
  KG_PER_LB,
  formatWeight,
  fromKg,
  isValidWeight,
  isWeightUnit,
  parseWeight,
  roundForDisplay,
  toKg,
} from './model/units';

export {
  addWeightEntry,
  createWeightEntry,
  entriesForJourney,
  MAX_FUTURE_SKEW_MS,
  isLoggableTime,
  latestEntry,
  removeWeightEntry,
  sortNewestFirst,
  updateWeightEntry,
  type CreateWeightEntryInput,
  type WeightEntryChanges,
} from './model/entries';

export type { WeightRepository } from './data/WeightRepository';
export { asyncStorageWeightRepository } from './data/asyncStorageRepository';
export { JOURNEY_DOMAIN, JourneyKeys } from './data/keys';
export { WeightProvider, useWeight, type WeightContextValue, type WeightState } from './state/WeightProvider';

export {
  DURATION_PRESETS,
  JOURNEY_NAME_MAX,
  activeJourney,
  addCalendarMonths,
  addJourney,
  calendarDaysBetween,
  canExtendTo,
  completeJourney,
  createJourney,
  earliestExtension,
  elapsedDays,
  extendJourney,
  journeyProgress,
  normalizeJourneyName,
  pastJourneys,
  plannedDays,
  plannedEndFor,
  replaceJourney,
  type DurationPreset,
  type Journey,
  type JourneyProgress,
  type JourneyStatus,
} from './model/journeys';
export {
  DAY_MILESTONE,
  compareTimeline,
  deriveJourneyTimeline,
  type JourneyTimelineItem,
  type MilestoneKind,
  type TimelinePhoto,
} from './model/timeline';
export type { JourneyRepository } from './data/JourneyRepository';
export { asyncStorageJourneyRepository, parseJourney } from './data/asyncStorageJourneyRepository';
export { JourneyProvider, useJourneys, type JourneyContextValue, type StartJourneyInput } from './state/JourneyProvider';
export {
  PHOTO_FILE_PATTERN,
  exifTakenAt,
  isValidPhotoTime,
  newProgressPhoto,
  photoExtension,
  photosForJourney,
  type ProgressPhoto,
} from './photos/model';
export { documentPhotoFileStore, type PhotoFileStore } from './photos/fileStore';
export { asyncStoragePhotoRepository, parsePhoto, type PhotoRepository } from './photos/repository';
export { PhotosProvider, usePhotos, type AddPhotoInput, type PhotosContextValue } from './photos/PhotosProvider';

