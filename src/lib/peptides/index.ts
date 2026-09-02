/**
 * VITA's peptide domain — definitions and the user's setups.
 *
 * Slice 3.5 covers the first two layers of the three-part model. Log entries
 * (3.7), the dose calculator (3.6), and injection sites (3.8) are not here
 * yet, and this module deliberately exports nothing that pretends otherwise.
 */

export {
  DEFAULT_DOSE_UNIT,
  DEFAULT_UNITS_PER_ML,
  MASS_UNITS,
  RESEARCH_AREAS,
  type BlendComponent,
  TIME_SENSITIVE_STAGES,
  type CompoundType,
  type DevelopmentStage,
  type DevelopmentStatus,
  type MechanismItem,
  type ResearchClaim,
  type EvidenceLevel,
  type MassUnit,
  type PeptideClassification,
  type PeptideDefinition,
  type PeptideResearchInfo,
  type PeptideSchedule,
  type ResearchArea,
  type PeptideSetup,
  type PeptideLogEntry,
  type PeptideLogDraft,
  type LogCalculationSnapshot,
  type ResearchReference,
} from './model/types';

export {
  MCG_PER_MG,
  convertAuthoredAmount,
  formatConcentration,
  formatMass,
  formatMcg,
  formatSyringeUnits,
  formatVolume,
  fromMcg,
  isMassUnit,
  parseAmount,
  roundForDisplay,
  toMcg,
} from './model/units';

export {
  WEEKDAY_INDEXES,
  isPeptideSchedule,
  isScheduledOn,
  scheduleLabel,
  sortedDays,
  weekdayLong,
  weekdayShort,
} from './model/schedule';

export {
  applySetupChanges,
  createPeptideSetup,
  routineAmountFrom,
  vialFrom,
  type PeptideSetupChanges,
  type PeptideSetupDraft,
  type VialInput,
} from './model/setups';

export {
  CATALOG_VERSION,
  PEPTIDE_CATALOG,
  findCatalogDefinition,
  resolveBlendComponents,
  matchedAlias,
  rowAlias,
  searchCatalog,
  type AreaFilter,
  type CatalogFilter,
  type ResolvedComponent,
} from './data/catalog';
export {
  EVIDENCE_LABELS,
  RESEARCH_AREA_LABELS,
  classificationLabel,
  classificationSpoken,
  evidenceLabel,
  formatEvidenceContext,
  researchAreaLabel,
} from './model/labels';
export {
  applyLogChanges,
  createLogEntry,
  parseLogEntry,
  sortLogsNewestFirst,
} from './model/logs';
export {
  REGION_DESCRIPTIONS,
  SITE_PICKER_ORDER,
  CUSTOM_SITE_OPTION_LABEL,
  SITE_KEYS,
  createSiteSnapshot,
  entriesAtSite,
  entriesWithSites,
  isSiteKey,
  lastRecordedSite,
  parseSiteSnapshot,
  siteKeyLabel,
  siteLabel,
  sitesForView,
  type BodyView,
  type InjectionSiteKey,
  type InjectionSiteSnapshot,
} from './model/sites';

export {
  ROUTINE_STATES,
  ROUTINE_DAY_STATES,
  createRoutineStatus,
  isRoutineDayState,
  isRoutineState,
  parseRoutineStatus,
  routineDayMark,
  routineDayMarkLabel,
  routineDayMarkSymbol,
  routineStateFromLegacyActive,
  routineStateLabel,
  statusFor,
  statusesForSetup,
  type PeptideRoutineState,
  type RoutineDayMark,
  type RoutineDayState,
  type RoutineDayStatus,
} from './model/routine';
export { formatLabel, formatLabels } from './model/format';
export {
  calculateSyringeUnits,
  unitConversionReference,
  type DoseCalculation,
  type DoseCalculationError,
  type DoseCalculationResult,
  type ConversionRow,
  type UnitConversion,
  type UnitConversionResult,
  type VialInputs,
} from './model/dose';
export { PEPTIDE_DOMAIN, PeptideKeys } from './data/keys';
export type { PeptideRepository } from './data/PeptideRepository';
export { asyncStoragePeptideRepository } from './data/asyncStorageRepository';

export { PeptideProvider, usePeptideContext, type PeptideContextValue } from './state/PeptideProvider';
export {
  usePeptides,
  useResolvedSetup,
  useRoutineForDefinition,
  useRoutineWeek,
  usePeptideSummary,
  type PeptidesView,
  type ResolvedSetup,
  type TodayRoutine,
} from './state/usePeptides';
