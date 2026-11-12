import { z } from "zod";

export const routineExerciseSchema = z.object({
  exerciseId: z.string().optional(),
  name: z.string().trim().min(1, "Informe o exercício"),
  sets: z.number({ error: "Informe as séries" }).int().min(1, "Mínimo 1 série").max(20),
  reps: z.string().trim().min(1, "Informe as repetições").max(20),
  load: z.number().min(0).max(1000).optional(),
  restSeconds: z.number().int().min(0).max(900).optional()
});

export const routineFormSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome para a rotina").max(80, "Máximo de 80 caracteres"),
  modalityId: z.string().min(1, "Escolha a modalidade"),
  weekDays: z.array(z.number()).max(7),
  durationMinutes: z.number().int().min(1, "Duração mínima de 1 minuto").max(600).optional(),
  distanceKm: z.number().min(0).max(500).optional(),
  notes: z.string().max(1000).optional(),
  exercises: z.array(routineExerciseSchema).max(40)
});

export const sessionFormSchema = z.object({
  modalityId: z.string().min(1, "Escolha a modalidade"),
  name: z.string().trim().min(1, "Dê um nome para o treino").max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  durationMinutes: z.number().int().min(1, "Duração mínima de 1 minuto").max(600).optional(),
  distanceKm: z.number().min(0).max(500).optional(),
  effort: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional()
});

export type RoutineFormValues = z.infer<typeof routineFormSchema>;
export type SessionFormValues = z.infer<typeof sessionFormSchema>;
