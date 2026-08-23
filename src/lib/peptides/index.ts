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
  type MassUnit,
  type PeptideClassification,
  type PeptideDefinition,
  type PeptideSchedule,
  type PeptideSetup,
} from './model/types';

export {
  MCG_PER_MG,
  formatMass,
  formatMcg,
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
  vialFrom,
  type PeptideSetupChanges,
  type PeptideSetupDraft,
  type VialInput,
} from './model/setups';

export { CATALOG_VERSION, PEPTIDE_CATALOG, findCatalogDefinition, searchCatalog } from './data/catalog';
export { PEPTIDE_DOMAIN, PeptideKeys } from './data/keys';
export type { PeptideRepository } from './data/PeptideRepository';
export { asyncStoragePeptideRepository } from './data/asyncStorageRepository';

export { PeptideProvider, usePeptideContext, type PeptideContextValue } from './state/PeptideProvider';
export { usePeptides, useResolvedSetup, type PeptidesView, type ResolvedSetup } from './state/usePeptides';
