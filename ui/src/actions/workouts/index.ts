import api from "@utils/api";

import type {
  WorkoutCatalog,
  WorkoutRoutine,
  CreateWorkoutRoutinePayload,
  UpdateWorkoutRoutinePayload,
  WorkoutSession,
  RegisterWorkoutSessionPayload,
  ListWorkoutSessionsParams,
  WorkoutSummary,
  WorkoutIdResponse,
  WorkoutIdsResponse
} from "@actions/workouts/types";
import type { PaginatedResponse } from "@utils/types/api";

export const getWorkoutCatalogAction = async (): Promise<WorkoutCatalog> => {
  const response = await api.get<WorkoutCatalog>("/workouts/catalog/details");
  return response.data;
};

export const listWorkoutRoutinesAction = async (): Promise<WorkoutRoutine[]> => {
  const response = await api.get<PaginatedResponse<WorkoutRoutine>>("/workouts/routines/list");
  return response.data.data;
};

export const createWorkoutRoutineAction = async (payload: CreateWorkoutRoutinePayload): Promise<WorkoutRoutine> => {
  const response = await api.post<WorkoutRoutine>("/workouts/routines/create", payload);
  return response.data;
};

export const applyRoutineTemplateAction = async (templateId: string): Promise<WorkoutIdsResponse> => {
  const response = await api.post<WorkoutIdsResponse>("/workouts/routines/apply-template", { templateId });
  return response.data;
};

export const updateWorkoutRoutineAction = async (
  id: string,
  payload: UpdateWorkoutRoutinePayload
): Promise<WorkoutRoutine> => {
  const response = await api.patch<WorkoutRoutine>(`/workouts/routines/${id}/update`, payload);
  return response.data;
};

export const removeWorkoutRoutineAction = async (id: string): Promise<WorkoutIdResponse> => {
  const response = await api.delete<WorkoutIdResponse>(`/workouts/routines/${id}/remove`);
  return response.data;
};

export const registerWorkoutSessionAction = async (payload: RegisterWorkoutSessionPayload): Promise<WorkoutSession> => {
  const response = await api.post<WorkoutSession>("/workouts/sessions/register", payload);
  return response.data;
};

export const listWorkoutSessionsAction = async (params?: ListWorkoutSessionsParams): Promise<WorkoutSession[]> => {
  const response = await api.get<PaginatedResponse<WorkoutSession>>("/workouts/sessions/list", { params });
  return response.data.data;
};

export const removeWorkoutSessionAction = async (id: string): Promise<WorkoutIdResponse> => {
  const response = await api.delete<WorkoutIdResponse>(`/workouts/sessions/${id}/remove`);
  return response.data;
};

export const getWorkoutSummaryAction = async (startDate: string, endDate: string): Promise<WorkoutSummary> => {
  const response = await api.get<WorkoutSummary>("/workouts/summary/details", { params: { startDate, endDate } });
  return response.data;
};
