import type { PeptideToday } from './types';

/** Realistic placeholder data matching the approved UI reference. */
export const PEPTIDE_TODAY: PeptideToday = {
  logged: 1,
  goal: 3,
  slots: [
    { id: 'morning', label: 'Morning', logged: 1 },
    { id: 'midday', label: 'Midday', logged: 0 },
    { id: 'evening', label: 'Evening', logged: 0 },
  ],
};

/** Common peptides offered as quick picks on the examples screen. */
export const PEPTIDE_EXAMPLES = [
  'BPC-157',
  'TB-500',
  'CJC-1295 (No DAC)',
  'CJC-1295 (DAC)',
  'Tesamorelin',
  'Ipamorelin',
  'Selank',
  'Semax',
  'Melanotan II',
  'Other (Custom)',
];
