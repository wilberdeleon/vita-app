/**
 * VITA's shared daily-tracking foundation.
 *
 * The pieces every date-keyed feature needs and none of them should own: one
 * local-calendar date model, one id scheme, one storage namespace, one set of
 * read-time guards, and the day-keyed storage and rollover mechanics that
 * nutrition proved in Sprint 2.
 *
 * What lives here is deliberately narrow. This is not a tracking framework
 * and there is no shared "entry" type — a glass of water and a peptide
 * administration have genuinely different shapes, and hiding that behind a
 * type parameter would make both harder to read. Shared infrastructure ends
 * where the domains begin.
 */

export {
  formatLogDateLong,
  fromLogDate,
  isToday,
  isValidLogDate,
  toLogDate,
  todayLogDate,
  type LogDate,
} from './dates';

export { newId } from './ids';

export { NAMESPACE, dayKey, dayKeyPrefix, singletonKey, type StorageDomain } from './keys';

export { isFiniteNumber, isNonEmptyString, isPositiveNumber, isRecord } from './guards';

export { allKeys, readJson, removeKey, writeJson } from './storage';

export {
  createDayKeyedStore,
  type DayKeyedStore,
  type DayRecords,
  type RecordParser,
} from './dayStore';

export { useDayRollover, type DayRolloverOptions } from './useDayRollover';
