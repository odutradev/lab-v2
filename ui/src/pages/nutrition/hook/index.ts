import { useCallback, useMemo } from "react";

import {
  getNutritionProfileAction,
  updateNutritionProfileAction,
  listMealPlansAction,
  createMealPlanAction,
  updateMealPlanAction,
  removeMealPlanAction,
  getDiaryAction,
  createDiaryEntryAction,
  logPlanMealAction,
  removeDiaryEntryAction,
  getWeeklyReviewAction,
  listFoodsAction,
  createFoodAction
} from "@actions/nutrition";
import useNutritionStore from "@stores/nutrition";
import useHealthStore from "@stores/health";
import useAction from "@hooks/useAction";
import { addDaysToDateString, getTodayDateString } from "@utils/functions/challenges";
import { defaultMealNames } from "@utils/functions/nutrition";

import type {
  UpdateNutritionProfilePayload,
  CreateDiaryEntryPayload,
  SaveMealPlanPayload,
  CreateFoodPayload,
  MealPlan,
  MealPlanMeal,
  FoodLogEntry
} from "@actions/nutrition/types";
import type { BodyMetricsPayload, MealSection, UseNutritionPageReturn } from "./types";

const toastTitle = "Dieta";

export const useNutritionPage = (): UseNutritionPageReturn => {
  const store = useNutritionStore();
  const runAction = useAction();
  const todayKey = getTodayDateString();

  const activePlan = useMemo(() => store.mealPlans.find((plan) => plan.isActive), [store.mealPlans]);

  const mealSections = useMemo<MealSection[]>(() => {
    const entries = store.diary?.entries || [];
    const plannedSections: MealSection[] = activePlan
      ? activePlan.meals.map((meal) => ({
          key: meal.id,
          name: meal.name,
          time: meal.time,
          planMeal: meal,
          entries: entries.filter(
            (entry) => entry.planMealId === meal.id || (!entry.planMealId && entry.mealName === meal.name)
          )
        }))
      : defaultMealNames.map((name) => ({
          key: name,
          name,
          entries: entries.filter((entry) => entry.mealName === name)
        }));

    const coveredIds = new Set(plannedSections.flatMap((section) => section.entries.map((entry) => entry.id)));
    const extraNames = [
      ...new Set(entries.filter((entry) => !coveredIds.has(entry.id)).map((entry) => entry.mealName))
    ];
    const extraSections = extraNames.map((name) => ({
      key: `extra-${name}`,
      name,
      entries: entries.filter((entry) => !coveredIds.has(entry.id) && entry.mealName === name)
    }));

    return [...plannedSections, ...extraSections];
  }, [store.diary, activePlan]);

  const loadDiary = useCallback(async (date: string) => {
    const { setDiary, setIsDiaryLoading } = useNutritionStore.getState();
    setIsDiaryLoading(true);
    const diary = await getDiaryAction(date).catch(() => null);
    if (diary) setDiary(diary);
    setIsDiaryLoading(false);
  }, []);

  const loadReview = useCallback(async () => {
    const review = await getWeeklyReviewAction().catch(() => null);
    useNutritionStore.getState().setReview(review);
  }, []);

  const loadPage = useCallback(async () => {
    const { selectedDate, setIsLoading, setProfileData, setMealPlans } = useNutritionStore.getState();
    setIsLoading(true);
    await runAction({
      action: () => Promise.all([getNutritionProfileAction(), listMealPlansAction()]),
      toastMessages: { error: "Não foi possível carregar sua dieta.", errorTitle: toastTitle },
      callback: ([profileData, mealPlans]) => {
        setProfileData(profileData);
        setMealPlans(mealPlans);
      }
    });
    await Promise.all([loadDiary(selectedDate), loadReview()]);
    setIsLoading(false);
  }, [runAction, loadDiary, loadReview]);

  const handleChangeDate = useCallback(
    async (offsetDays: number) => {
      const nextDate = offsetDays === 0 ? todayKey : addDaysToDateString(store.selectedDate, offsetDays);
      if (nextDate > todayKey) return;
      store.setSelectedDate(nextDate);
      await loadDiary(nextDate);
    },
    [store, todayKey, loadDiary]
  );

  const refreshAfterProfileChange = useCallback(async () => {
    await Promise.all([loadDiary(useNutritionStore.getState().selectedDate), loadReview()]);
  }, [loadDiary, loadReview]);

  const handleSaveBodyMetrics = useCallback(
    async ({ height, age, weight }: BodyMetricsPayload) => {
      const healthStore = useHealthStore.getState();
      const currentProfile = healthStore.profile;
      if (height !== currentProfile.height || age !== currentProfile.age) {
        await healthStore.updateProfile({ height, age });
      }
      if (weight && weight !== store.profileData?.metrics.weight) {
        await healthStore.saveWeightRecord(weight);
      }
    },
    [store.profileData]
  );

  const handleSaveProfile = useCallback(
    async (payload: UpdateNutritionProfilePayload, successMessage = "Metas atualizadas!") => {
      const saved = await runAction({
        action: () => updateNutritionProfileAction(payload),
        toastMessages: {
          success: successMessage,
          error: "Não foi possível salvar o perfil nutricional.",
          errorTitle: toastTitle,
          preferApiErrorMessage: true
        },
        callback: (profileData) => store.setProfileData(profileData)
      });
      if (saved) await refreshAfterProfileChange();
      return Boolean(saved);
    },
    [runAction, store, refreshAfterProfileChange]
  );

  const openAddFood = useCallback((mealName: string) => store.setAddFoodMealName(mealName), [store]);
  const closeAddFood = useCallback(() => store.setAddFoodMealName(null), [store]);

  const handleAddEntry = useCallback(
    async (payload: CreateDiaryEntryPayload) => {
      const saved = await runAction({
        action: () => createDiaryEntryAction({ ...payload, date: store.selectedDate }),
        toastMessages: {
          success: "Adicionado ao diário.",
          error: "Não foi possível registrar o alimento.",
          errorTitle: toastTitle,
          preferApiErrorMessage: true
        }
      });
      if (saved) await loadDiary(store.selectedDate);
      return Boolean(saved);
    },
    [runAction, store.selectedDate, loadDiary]
  );

  const handleLogPlanMeal = useCallback(
    async (meal: MealPlanMeal) => {
      if (!activePlan) return;
      const saved = await runAction({
        action: () => logPlanMealAction({ date: store.selectedDate, mealPlanId: activePlan.id, mealId: meal.id }),
        toastMessages: {
          success: `${meal.name} registrado conforme o plano.`,
          error: "Não foi possível registrar a refeição.",
          errorTitle: toastTitle
        }
      });
      if (saved) await loadDiary(store.selectedDate);
    },
    [runAction, activePlan, store.selectedDate, loadDiary]
  );

  const handleRemoveEntry = useCallback(
    async (entry: FoodLogEntry) => {
      const removed = await runAction({
        action: () => removeDiaryEntryAction(entry.id),
        toastMessages: { error: "Não foi possível remover o registro.", errorTitle: toastTitle }
      });
      if (removed) await loadDiary(store.selectedDate);
    },
    [runAction, store.selectedDate, loadDiary]
  );

  const openPlanEditor = useCallback((plan: MealPlan | "new") => store.setEditingPlan(plan), [store]);
  const closePlanEditor = useCallback(() => store.setEditingPlan(null), [store]);

  const reloadPlans = useCallback(async () => {
    const mealPlans = await listMealPlansAction().catch(() => null);
    if (mealPlans) useNutritionStore.getState().setMealPlans(mealPlans);
  }, []);

  const handleSavePlan = useCallback(
    async (payload: SaveMealPlanPayload) => {
      const target = store.editingPlan;
      const saved = await runAction({
        action: () =>
          target && target !== "new" ? updateMealPlanAction(target.id, payload) : createMealPlanAction(payload),
        toastMessages: {
          success: "Plano alimentar salvo!",
          error: "Não foi possível salvar o plano.",
          errorTitle: toastTitle,
          preferApiErrorMessage: true
        },
        callback: () => store.setEditingPlan(null)
      });
      if (saved) await reloadPlans();
      return Boolean(saved);
    },
    [runAction, store, reloadPlans]
  );

  const handleActivatePlan = useCallback(
    async (plan: MealPlan) => {
      const saved = await runAction({
        action: () => updateMealPlanAction(plan.id, { isActive: true }),
        toastMessages: {
          success: `"${plan.name}" agora é o plano ativo.`,
          error: "Não foi possível ativar o plano.",
          errorTitle: toastTitle
        }
      });
      if (saved) await reloadPlans();
    },
    [runAction, reloadPlans]
  );

  const handleRemovePlan = useCallback(
    async (plan: MealPlan) => {
      const removed = await runAction({
        action: () => removeMealPlanAction(plan.id),
        toastMessages: {
          success: "Plano removido.",
          error: "Não foi possível remover o plano.",
          errorTitle: toastTitle
        }
      });
      if (removed) await reloadPlans();
    },
    [runAction, reloadPlans]
  );

  const openCustomFood = useCallback(() => store.setIsCustomFoodOpen(true), [store]);
  const closeCustomFood = useCallback(() => store.setIsCustomFoodOpen(false), [store]);

  const handleCreateFood = useCallback(
    async (payload: CreateFoodPayload) => {
      return runAction({
        action: () => createFoodAction(payload),
        toastMessages: {
          success: "Alimento cadastrado! Já aparece na busca.",
          error: "Não foi possível cadastrar o alimento.",
          errorTitle: toastTitle,
          preferApiErrorMessage: true
        },
        callback: () => store.setIsCustomFoodOpen(false)
      });
    },
    [runAction, store]
  );

  const searchFoods = useCallback(async (search: string) => {
    const response = await listFoodsAction({ search: search || undefined, limit: 20 }).catch(() => null);
    return response?.data || [];
  }, []);

  return {
    profileData: store.profileData,
    diary: store.diary,
    mealPlans: store.mealPlans,
    activePlan,
    review: store.review,
    mealSections,
    selectedDate: store.selectedDate,
    todayKey,
    activeTab: store.activeTab,
    isLoading: store.isLoading,
    isDiaryLoading: store.isDiaryLoading,
    addFoodMealName: store.addFoodMealName,
    editingPlan: store.editingPlan,
    isCustomFoodOpen: store.isCustomFoodOpen,
    loadPage,
    setActiveTab: store.setActiveTab,
    handleChangeDate,
    handleSaveBodyMetrics,
    handleSaveProfile,
    openAddFood,
    closeAddFood,
    handleAddEntry,
    handleLogPlanMeal,
    handleRemoveEntry,
    openPlanEditor,
    closePlanEditor,
    handleSavePlan,
    handleActivatePlan,
    handleRemovePlan,
    openCustomFood,
    closeCustomFood,
    handleCreateFood,
    searchFoods
  };
};

export default useNutritionPage;
