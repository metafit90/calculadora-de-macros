
export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum ActivityLevel {
  Sedentary = 'sedentary',
  LightlyActive = 'lightly_active',
  ModeratelyActive = 'moderately_active',
  VeryActive = 'very_active',
  ExtremelyActive = 'extremely_active',
}

export enum Goal {
  LoseWeight = 'lose_weight',
  Maintain = 'maintain',
  GainMuscle = 'gain_muscle',
}

export enum TrainingTime {
  Under30 = 'under_30',
  Between30And45 = '30_45',
  Between45And60 = '45_60',
  Over60 = 'over_60',
}

export enum Discipline {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum DietHistory {
  None = 'none',
  Few = '1_2',
  Some = '3_5',
  Many = 'over_5',
}

export interface UserData {
  name: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight?: number; // kg
  weeklyRate: number; // kg per week
  activityLevel: ActivityLevel;
  goal: Goal;
  trainingTime: TrainingTime;
  discipline: Discipline;
  dietHistory: DietHistory;
  // Advanced Data (Optional)
  bodyFat?: number; // %
  waist?: number; // cm
  neck?: number; // cm
  hip?: number; // cm
}

export interface MacroResult {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  formulaUsed: 'Mifflin-St Jeor' | 'Katch-McArdle';
  weeksToGoal?: number;
}

export interface ProfileResult {
  profileName: string;
  description: string;
  advice: string;
}

export interface Meal {
  title: string;
  items: string[];
}

export interface MealPlan {
  name: string;
  description: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    snack: Meal;
    dinner: Meal;
  };
}

export interface CalculationResult {
  macros: MacroResult;
  profile: ProfileResult;
  mealPlans: MealPlan[]; // New
}
