import { palette } from '../../theme/tokens';
import type { FoodItem, FuelToday } from './types';

/** Realistic placeholder data matching the approved UI reference. */
export const FUEL_TODAY: FuelToday = {
  kcal: { current: 1267, goal: 2000 },
  macros: [
    { label: 'Protein', current: 107, goal: 160, unit: 'g', color: palette.protein },
    { label: 'Carbs', current: 100, goal: 214, unit: 'g', color: palette.carbs },
    { label: 'Fat', current: 45, goal: 64, unit: 'g', color: palette.fat },
  ],
  meals: [
    { id: 'breakfast', slot: 'Breakfast', name: 'Protein Oats', kcal: 300 },
    { id: 'lunch', slot: 'Lunch', name: 'Grilled Chicken Bowl', kcal: 450 },
    { id: 'dinner', slot: 'Dinner', name: 'Salmon & Veggies', kcal: 500 },
  ],
  mealsLogged: 1,
  mealSlots: 4,
  waterCups: { current: 5, goal: 8 },
  peptides: { logged: 1, goal: 3 },
};

const nutrition = (
  totalCarbs: number,
  totalFat: number,
  saturatedFat: number,
  totalSugars: number,
  protein: number,
  sodium: number,
) => ({ totalCarbs, totalFat, saturatedFat, totalSugars, protein, sodium });

export const FOODS: FoodItem[] = [
  { id: 'big-mac', name: 'Big Mac', brand: "McDonald's", kcal: 550, perServing: 'Per serving', favorite: true, nutrition: nutrition(45, 30, 11, 9, 25, 1010) },
  { id: 'big-mac-no-bun', name: 'Big Mac (No Bun)', brand: "McDonald's", kcal: 390, perServing: 'Per serving', favorite: false, nutrition: nutrition(9, 27, 10, 4, 22, 830) },
  { id: 'big-mac-no-cheese', name: 'Big Mac (No Cheese)', brand: "McDonald's", kcal: 470, perServing: 'Per serving', favorite: false, nutrition: nutrition(43, 24, 8, 8, 21, 780) },
  { id: 'double-big-mac', name: 'Double Big Mac', brand: "McDonald's", kcal: 710, perServing: 'Per serving', favorite: false, nutrition: nutrition(46, 42, 16, 10, 39, 1300) },
  { id: 'big-mac-meal', name: 'Big Mac Meal', brand: "McDonald's", kcal: 910, perServing: 'Per meal', favorite: false, nutrition: nutrition(101, 45, 13, 12, 30, 1250) },
  { id: 'grilled-chicken-bowl', name: 'Grilled Chicken Bowl', kcal: 450, perServing: 'Per bowl', favorite: true, nutrition: nutrition(38, 12, 3, 6, 42, 620) },
  { id: 'protein-oats', name: 'Protein Oats', kcal: 300, perServing: 'Per bowl', favorite: true, nutrition: nutrition(40, 7, 2, 8, 24, 180) },
  { id: 'salmon-veggies', name: 'Salmon & Veggies', kcal: 500, perServing: 'Per plate', favorite: true, nutrition: nutrition(18, 26, 5, 7, 46, 410) },
  { id: 'banana', name: 'Banana', kcal: 105, perServing: 'Per medium', favorite: false, nutrition: nutrition(27, 0, 0, 14, 1, 1) },
  { id: 'eggs-baked', name: 'Eggs, Baked', kcal: 78, perServing: 'Per egg', favorite: false, nutrition: nutrition(1, 5, 2, 0, 6, 62) },
];

/** Ordered as shown on the Recent Foods screen. */
export const RECENT_FOOD_IDS = [
  'big-mac',
  'grilled-chicken-bowl',
  'protein-oats',
  'banana',
  'eggs-baked',
];
