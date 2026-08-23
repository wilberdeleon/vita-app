/**
 * AsyncStorage implementation of `PeptideRepository`.
 *
 * Everything read back is validated first, on the principle the nutrition and
 * water repositories established: persisted JSON is only as trustworthy as the
 * last write, and a malformed record is **dropped rather than repaired**.
 *
 * That matters more here than anywhere else in the app. A corrupted vial
 * amount or a mangled unit feeds the dose calculator in slice 3.6, where a
 * plausible-but-wrong number is worse than a missing one and invisible either
 * way. So every numeric field is checked for being finite *and* positive, and
 * a record that fails any check is discarded whole rather than partially
 * rescued.
 *
 * Reading never writes. Corrupt records stay on disk untouched until the
 * collection is saved again for a real reason.
 */

import { isValidLogDate } from '../../daily/dates';
import { isNonEmptyString, isPositiveNumber, isRecord } from '../../daily/guards';
import { readJson, removeKey, writeJson } from '../../daily/storage';
import { isPeptideSchedule } from '../model/schedule';
import type { MassUnit, PeptideDefinition, PeptideSetup } from '../model/types';
import { isMassUnit } from '../model/units';
import type { PeptideRepository } from './PeptideRepository';
import { PeptideKeys } from './keys';

/* ── validation ─────────────────────────────────────────────────────── */

/**
 * A stored custom definition.
 *
 * Only `custom` is accepted here. A persisted record claiming to be an
 * approved medication must never be able to enter the app through the user's
 * own storage — approval status is asserted by the compiled catalog and
 * nowhere else, which is what keeps a hand-edited store from relabelling a
 * research compound as approved.
 */
function parseCustomDefinition(value: unknown): PeptideDefinition | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.name)) return null;
  if (value.classification !== 'custom') return null;
  if (value.origin !== 'user') return null;

  return {
    id: value.id,
    name: value.name,
    classification: 'custom',
    origin: 'user',
    ...(isNonEmptyString(value.category) ? { category: value.category } : {}),
  };
}

function parseVial(value: unknown): PeptideSetup['vial'] | null {
  if (!isRecord(value)) return null;
  if (!isPositiveNumber(value.amountMcg)) return null;
  if (!isRecord(value.authored)) return null;
  if (!isPositiveNumber(value.authored.amount) || !isMassUnit(value.authored.unit)) return null;

  return {
    amountMcg: value.amountMcg,
    authored: { amount: value.authored.amount, unit: value.authored.unit as MassUnit },
  };
}

function parseSyringe(value: unknown): PeptideSetup['syringe'] | null {
  if (!isRecord(value)) return null;
  if (!isPositiveNumber(value.unitsPerMl)) return null;
  return { unitsPerMl: value.unitsPerMl };
}

/**
 * A stored setup.
 *
 * Optional fields are dropped individually when malformed rather than voiding
 * the whole setup — losing a notes field should not lose the setup. The
 * exceptions are the fields that define it: id, definition, the two
 * preferences, and the active flag. A setup missing any of those is not a
 * setup this app wrote.
 */
function parseSetup(value: unknown): PeptideSetup | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.definitionId)) return null;
  if (!isMassUnit(value.preferredDoseUnit)) return null;
  if (value.preferredEntryMode !== 'mass' && value.preferredEntryMode !== 'syringe-units') return null;
  if (typeof value.active !== 'boolean') return null;
  if (!isNonEmptyString(value.createdAt) || !isNonEmptyString(value.updatedAt)) return null;

  const vial = parseVial(value.vial);
  const syringe = parseSyringe(value.syringe);

  return {
    id: value.id,
    definitionId: value.definitionId,
    active: value.active,
    preferredDoseUnit: value.preferredDoseUnit as MassUnit,
    preferredEntryMode: value.preferredEntryMode,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    ...(isNonEmptyString(value.displayName) ? { displayName: value.displayName } : {}),
    ...(vial ? { vial } : {}),
    ...(isPositiveNumber(value.reconstitutionMl) ? { reconstitutionMl: value.reconstitutionMl } : {}),
    ...(syringe ? { syringe } : {}),
    ...(isPeptideSchedule(value.schedule) ? { schedule: value.schedule } : {}),
    // The hardened validator rejects impossible calendar days, so a corrupted
    // '2026-02-30' start date is dropped rather than carried into scheduling.
    ...(isValidLogDate(value.startDate) ? { startDate: value.startDate } : {}),
    ...(isNonEmptyString(value.notes) ? { notes: value.notes } : {}),
  };
}

/* ── implementation ─────────────────────────────────────────────────── */

async function readCollection<T>(key: string, parse: (value: unknown) => T | null): Promise<T[]> {
  const parsed = await readJson(key);
  if (!Array.isArray(parsed)) return [];

  const records: T[] = [];
  for (const candidate of parsed) {
    const record = parse(candidate);
    if (record !== null) records.push(record);
  }
  return records;
}

async function writeCollection(key: string, records: readonly unknown[]): Promise<void> {
  // An empty collection is removed rather than stored as `[]`, matching the
  // rest of VITA's stores, so clearing leaves no residue.
  if (records.length === 0) {
    await removeKey(key);
    return;
  }
  await writeJson(key, records);
}

export const asyncStoragePeptideRepository: PeptideRepository = {
  getSetups() {
    return readCollection(PeptideKeys.setups, parseSetup);
  },

  saveSetups(setups) {
    return writeCollection(PeptideKeys.setups, setups);
  },

  getCustomDefinitions() {
    return readCollection(PeptideKeys.customDefinitions, parseCustomDefinition);
  },

  saveCustomDefinitions(definitions) {
    return writeCollection(PeptideKeys.customDefinitions, definitions);
  },
};
