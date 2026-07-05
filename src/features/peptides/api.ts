import { PEPTIDE_TODAY } from './mock';
import type { PeptideToday } from './types';

/**
 * Data boundary for Peptides. Sprint 0 serves fixtures; later sprints
 * replace this with Supabase queries — the screen contract is stable.
 */
export function getPeptideToday(): PeptideToday {
  return PEPTIDE_TODAY;
}
