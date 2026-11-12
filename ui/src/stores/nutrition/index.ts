import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getTodayDateString } from "@utils/functions/challenges";

import type { NutritionState } from "@stores/nutrition/types";

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set) => ({
      profileData: null,
      diary: null,
      mealPlans: [],
      review: null,
      selectedDate: getTodayDateString(),
      activeTab: "diary",
      isLoading: true,
      isDiaryLoading: false,
      addFoodMealName: null,
      editingPlan: null,
      isCustomFoodOpen: false,

      setProfileData: (profileData) => set({ profileData }),
      setDiary: (diary) => set({ diary }),
      setMealPlans: (mealPlans) => set({ mealPlans }),
      setReview: (review) => set({ review }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsDiaryLoading: (isDiaryLoading) => set({ isDiaryLoading }),
      setAddFoodMealName: (addFoodMealName) => set({ addFoodMealName }),
      setEditingPlan: (editingPlan) => set({ editingPlan }),
      setIsCustomFoodOpen: (isCustomFoodOpen) => set({ isCustomFoodOpen })
    }),
    {
      name: "lab_nutrition_ui_v1",
      partialize: (state) => ({ activeTab: state.activeTab })
    }
  )
);

export default useNutritionStore;
