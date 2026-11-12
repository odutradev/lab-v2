import type { NutritionProfileResponse, Diary, MealPlan, WeeklyReview } from "@actions/nutrition/types";

export type NutritionTab = "diary" | "plans" | "goals" | "review";

export interface NutritionState {
  profileData: NutritionProfileResponse | null;
  diary: Diary | null;
  mealPlans: MealPlan[];
  review: WeeklyReview | null;
  selectedDate: string;
  activeTab: NutritionTab;
  isLoading: boolean;
  isDiaryLoading: boolean;
  addFoodMealName: string | null;
  editingPlan: MealPlan | "new" | null;
  isCustomFoodOpen: boolean;
  setProfileData: (profileData: NutritionProfileResponse) => void;
  setDiary: (diary: Diary) => void;
  setMealPlans: (mealPlans: MealPlan[]) => void;
  setReview: (review: WeeklyReview | null) => void;
  setSelectedDate: (selectedDate: string) => void;
  setActiveTab: (activeTab: NutritionTab) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsDiaryLoading: (isDiaryLoading: boolean) => void;
  setAddFoodMealName: (mealName: string | null) => void;
  setEditingPlan: (plan: MealPlan | "new" | null) => void;
  setIsCustomFoodOpen: (isOpen: boolean) => void;
}
