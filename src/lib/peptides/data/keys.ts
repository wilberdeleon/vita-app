/**
 * Peptides' storage keys, built from the shared helpers so the namespace and
 * format cannot drift from the rest of the app.
 *
 * The `peptides` domain segment is what isolates these from Water and from
 * nutrition — `vita:v1:peptides:setups` can never collide with
 * `vita:v1:water:goal` or `vita:v1:myfoods`.
 *
 * The catalog is compiled code and is deliberately **not** persisted. Storing
 * it would mean maintaining a migration every time an entry's metadata
 * changed, for data the app already ships.
 */

import { singletonKey } from '../../daily/keys';

export const PEPTIDE_DOMAIN = 'peptides';

/**
 * Routine day statuses live under their own day-keyed domain (slice 3.9).
 *
 * Deliberately a sibling of the log domain rather than a suffix of it: the
 * shared store enumerates by prefix, and `vita:v1:peptides:routine:log:` is
 * not a prefix of — nor prefixed by — `vita:v1:peptides:log:`, so neither
 * store can ever read the other's days.
 */
export const ROUTINE_STATUS_DOMAIN = 'peptides:routine';

export const PeptideKeys = {
  setups: singletonKey(PEPTIDE_DOMAIN, 'setups'),
  customDefinitions: singletonKey(PEPTIDE_DOMAIN, 'customdefs'),
} as const;
