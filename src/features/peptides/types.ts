export type PeptideSlot = {
  id: string;
  label: 'Morning' | 'Midday' | 'Evening';
  logged: number;
};

export type PeptideToday = {
  logged: number;
  goal: number;
  slots: PeptideSlot[];
};
