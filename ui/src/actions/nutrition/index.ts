import api from "@utils/api";

import type {
  NutritionProfileResponse,
  UpdateNutritionProfilePayload,
  Food,
  ListFoodsParams,
  CreateFoodPayload,
  MealPlan,
  SaveMealPlanPayload,
  Diary,
  CreateDiaryEntryPayload,
  LogPlanMealPayload,
  WeeklyReview,
  NutritionIdResponse,
  NutritionIdsResponse
} from "@actions/nutrition/types";
import type { PaginatedResponse } from "@utils/types/api";

export const getNutritionProfileAction = async (): Promise<NutritionProfileResponse> => {
  const response = await api.get<NutritionProfileResponse>("/nutrition/profile/details");
  return response.data;
};

export const updateNutritionProfileAction = async (
  payload: UpdateNutritionProfilePayload
): Promise<NutritionProfileResponse> => {
  const response = await api.patch<NutritionProfileResponse>("/nutrition/profile/update", payload);
  return response.data;
};

export const listFoodsAction = async (params?: ListFoodsParams): Promise<PaginatedResponse<Food>> => {
  const response = await api.get<PaginatedResponse<Food>>("/nutrition/foods/list", { params });
  return response.data;
};

export const createFoodAction = async (payload: CreateFoodPayload): Promise<Food> => {
  const response = await api.post<Food>("/nutrition/foods/create", payload);
  return response.data;
};

export const removeFoodAction = async (id: string): Promise<NutritionIdResponse> => {
  const response = await api.delete<NutritionIdResponse>(`/nutrition/foods/${id}/remove`);
  return response.data;
};

export const listMealPlansAction = async (): Promise<MealPlan[]> => {
  const response = await api.get<PaginatedResponse<MealPlan>>("/nutrition/meal-plans/list");
  return response.data.data;
};

export const createMealPlanAction = async (payload: SaveMealPlanPayload): Promise<MealPlan> => {
  const response = await api.post<MealPlan>("/nutrition/meal-plans/create", payload);
  return response.data;
};

export const updateMealPlanAction = async (id: string, payload: SaveMealPlanPayload): Promise<MealPlan> => {
  const response = await api.patch<MealPlan>(`/nutrition/meal-plans/${id}/update`, payload);
  return response.data;
};

export const removeMealPlanAction = async (id: string): Promise<NutritionIdResponse> => {
  const response = await api.delete<NutritionIdResponse>(`/nutrition/meal-plans/${id}/remove`);
  return response.data;
};

export const getDiaryAction = async (date: string): Promise<Diary> => {
  const response = await api.get<Diary>("/nutrition/diary/details", { params: { date } });
  return response.data;
};

export const createDiaryEntryAction = async (payload: CreateDiaryEntryPayload): Promise<NutritionIdsResponse> => {
  const response = await api.post<NutritionIdsResponse>("/nutrition/diary/entries/create", payload);
  return response.data;
};

export const logPlanMealAction = async (payload: LogPlanMealPayload): Promise<NutritionIdsResponse> => {
  const response = await api.post<NutritionIdsResponse>("/nutrition/diary/log-plan-meal", payload);
  return response.data;
};

export const removeDiaryEntryAction = async (id: string): Promise<NutritionIdResponse> => {
  const response = await api.delete<NutritionIdResponse>(`/nutrition/diary/entries/${id}/remove`);
  return response.data;
};

export const getWeeklyReviewAction = async (): Promise<WeeklyReview> => {
  const response = await api.get<WeeklyReview>("/nutrition/review/details");
  return response.data;
};
