import type {
  NutritionProfileResponse,
  UpdateNutritionProfilePayload,
  Diary,
  MealPlan,
  MealPlanMeal,
  FoodLogEntry,
  WeeklyReview,
  Food,
  CreateFoodPayload,
  CreateDiaryEntryPayload,
  SaveMealPlanPayload
} from "@actions/nutrition/types";
import type { NutritionTab } from "@stores/nutrition/types";

export interface MealSection {
  key: string;
  name: string;
  time?: string;
  planMeal?: MealPlanMeal;
  entries: FoodLogEntry[];
}

export interface BodyMetricsPayload {
  height?: number;
  age?: number;
  weight?: number;
}

export interface UseNutritionPageReturn {
  profileData: NutritionProfileResponse | null;
  diary: Diary | null;
  mealPlans: MealPlan[];
  activePlan: MealPlan | undefined;
  review: WeeklyReview | null;
  mealSections: MealSection[];
  selectedDate: string;
  todayKey: string;
  activeTab: NutritionTab;
  isLoading: boolean;
  isDiaryLoading: boolean;
  addFoodMealName: string | null;
  editingPlan: MealPlan | "new" | null;
  isCustomFoodOpen: boolean;
  loadPage: () => Promise<void>;
  setActiveTab: (tab: NutritionTab) => void;
  handleChangeDate: (offsetDays: number) => Promise<void>;
  handleSaveBodyMetrics: (payload: BodyMetricsPayload) => Promise<void>;
  handleSaveProfile: (payload: UpdateNutritionProfilePayload, successMessage?: string) => Promise<boolean>;
  openAddFood: (mealName: string) => void;
  closeAddFood: () => void;
  handleAddEntry: (payload: CreateDiaryEntryPayload) => Promise<boolean>;
  handleLogPlanMeal: (meal: MealPlanMeal) => Promise<void>;
  handleRemoveEntry: (entry: FoodLogEntry) => Promise<void>;
  openPlanEditor: (plan: MealPlan | "new") => void;
  closePlanEditor: () => void;
  handleSavePlan: (payload: SaveMealPlanPayload) => Promise<boolean>;
  handleActivatePlan: (plan: MealPlan) => Promise<void>;
  handleRemovePlan: (plan: MealPlan) => Promise<void>;
  openCustomFood: () => void;
  closeCustomFood: () => void;
  handleCreateFood: (payload: CreateFoodPayload) => Promise<Food | undefined>;
  searchFoods: (search: string) => Promise<Food[]>;
}
