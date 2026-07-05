export type Macro = {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
};

export type FuelToday = {
  kcal: { current: number; goal: number };
  macros: Macro[];
  meals: LoggedMeal[];
  /** e.g. 1 of 4 meals logged. */
  mealsLogged: number;
  mealSlots: number;
  waterCups: { current: number; goal: number };
  peptides: { logged: number; goal: number };
};

export type LoggedMeal = {
  id: string;
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  kcal: number;
};

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  kcal: number;
  perServing: string;
  favorite: boolean;
  nutrition: {
    totalCarbs: number;
    totalFat: number;
    saturatedFat: number;
    totalSugars: number;
    protein: number;
    sodium: number;
  };
};
