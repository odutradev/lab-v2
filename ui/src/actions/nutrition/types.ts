export type BiologicalSex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type NutritionGoal = "maintenance" | "cutting" | "bulking" | "recomposition";
export type ReviewStatus = "insufficient_data" | "on_track" | "increase_calories" | "decrease_calories";
export type FoodSource = "taco" | "custom";
export type FoodLogEntrySource = "plan" | "food" | "quick";

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionTargets extends Macros {
  bmr: number;
  tdee: number;
}

export interface NutritionPhase {
  goal: NutritionGoal;
  startDate: string;
  endDate: string;
  startWeight?: number;
  endWeight?: number;
}

export interface NutritionProfile {
  id: string;
  userId: string;
  sex: BiologicalSex;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  adjustmentPercent: number;
  proteinPerKg: number;
  fatPerKg: number;
  customCalories?: number;
  includeWorkoutCalories: boolean;
  targetWeight?: number;
  phaseStartDate: string;
  phaseStartWeight?: number;
  phaseEndDate?: string;
  phaseHistory: NutritionPhase[];
}

export interface NutritionProfileResponse {
  profile: NutritionProfile | null;
  metrics: { weight?: number; height?: number; age?: number };
  missingFields: string[];
  targets: NutritionTargets | null;
}

export interface UpdateNutritionProfilePayload {
  sex?: BiologicalSex;
  activityLevel?: ActivityLevel;
  goal?: NutritionGoal;
  adjustmentPercent?: number;
  proteinPerKg?: number;
  fatPerKg?: number;
  customCalories?: number | null;
  includeWorkoutCalories?: boolean;
  targetWeight?: number | null;
  phaseEndDate?: string | null;
}

export interface Food {
  id: string;
  userId?: string;
  name: string;
  category: string;
  source: FoodSource;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  servingName?: string;
  servingGrams?: number;
}

export interface ListFoodsParams {
  search?: string;
  source?: FoodSource;
  page?: number;
  limit?: number;
}

export interface CreateFoodPayload {
  name: string;
  category?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  servingName?: string;
  servingGrams?: number;
}

export interface MealPlanItem extends Macros {
  id: string;
  foodId: string;
  foodName: string;
  grams: number;
}

export interface MealPlanMeal {
  id: string;
  name: string;
  time?: string;
  items: MealPlanItem[];
  totals: Macros;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  meals: MealPlanMeal[];
  totals: Macros;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealPlanMealInput {
  id?: string;
  name: string;
  time?: string;
  items: Array<{ foodId: string; grams: number }>;
}

export interface SaveMealPlanPayload {
  name?: string;
  isActive?: boolean;
  meals?: MealPlanMealInput[];
}

export interface FoodLogEntry extends Macros {
  id: string;
  date: string;
  mealName: string;
  planMealId?: string;
  foodId?: string;
  name: string;
  grams?: number;
  source: FoodLogEntrySource;
}

export interface Diary {
  date: string;
  entries: FoodLogEntry[];
  totals: Macros;
  targets: NutritionTargets | null;
  burnedCalories: number;
  calorieGoal: number | null;
  remainingCalories: number | null;
}

export interface CreateDiaryEntryPayload {
  date?: string;
  mealName: string;
  foodId?: string;
  grams?: number;
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface LogPlanMealPayload {
  date?: string;
  mealPlanId: string;
  mealId: string;
}

export interface WeeklyReview {
  goal: NutritionGoal;
  targetRatePercent: number;
  currentWeekAverageWeight: number | null;
  previousWeekAverageWeight: number | null;
  weeklyChangePercent: number | null;
  loggedDays: number;
  averageCalories: number | null;
  adherentDays: number;
  targetCalories: number | null;
  status: ReviewStatus;
  suggestedCalorieAdjustment: number;
}

export interface NutritionIdResponse {
  id: string;
}

export interface NutritionIdsResponse {
  ids: string[];
}
