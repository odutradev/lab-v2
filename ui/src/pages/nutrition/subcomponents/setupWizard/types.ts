import type { ActivityLevel, BiologicalSex, NutritionGoal } from "@actions/nutrition/types";

export interface WizardValues {
  sex?: BiologicalSex;
  age?: number;
  height?: number;
  weight?: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  targetWeight?: number;
}
