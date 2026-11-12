import { z } from "zod";

export const bodyMetricsSchema = z.object({
  sex: z.enum(["male", "female"], { error: "Selecione o sexo biológico" }),
  age: z
    .number({ error: "Informe sua idade" })
    .int()
    .min(14, "Idade mínima de 14 anos")
    .max(100, "Idade máxima de 100 anos"),
  height: z
    .number({ error: "Informe sua altura" })
    .min(120, "Altura mínima de 120 cm")
    .max(230, "Altura máxima de 230 cm"),
  weight: z.number({ error: "Informe seu peso" }).min(30, "Peso mínimo de 30 kg").max(300, "Peso máximo de 300 kg")
});

export const goalsFormSchema = z.object({
  goal: z.enum(["maintenance", "cutting", "bulking", "recomposition"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
  adjustmentPercent: z.number().min(-35, "Ajuste mínimo de -35%").max(30, "Ajuste máximo de 30%"),
  proteinPerKg: z.number({ error: "Informe a proteína" }).min(0.8, "Mínimo de 0,8 g/kg").max(3.5, "Máximo de 3,5 g/kg"),
  fatPerKg: z.number({ error: "Informe a gordura" }).min(0.4, "Mínimo de 0,4 g/kg").max(2, "Máximo de 2 g/kg"),
  customCalories: z.number().int().min(800, "Mínimo de 800 kcal").max(8000, "Máximo de 8000 kcal").optional(),
  targetWeight: z.number().min(30).max(300).optional(),
  phaseEndDate: z.string().optional(),
  includeWorkoutCalories: z.boolean()
});

export const quickEntrySchema = z.object({
  name: z.string().trim().max(120).optional(),
  calories: z.number({ error: "Informe as calorias" }).min(0).max(10000),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(1000).optional()
});

export const customFoodSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do alimento").max(120),
  category: z.string().trim().max(60).optional(),
  caloriesPer100g: z.number({ error: "Informe as calorias" }).min(0).max(1000, "Máximo de 1000 kcal por 100 g"),
  proteinPer100g: z.number({ error: "Informe a proteína" }).min(0).max(100),
  carbsPer100g: z.number({ error: "Informe os carboidratos" }).min(0).max(100),
  fatPer100g: z.number({ error: "Informe a gordura" }).min(0).max(100),
  servingName: z.string().trim().max(40).optional(),
  servingGrams: z.number().min(1).max(2000).optional()
});

export type BodyMetricsValues = z.infer<typeof bodyMetricsSchema>;
export type GoalsFormValues = z.infer<typeof goalsFormSchema>;
export type QuickEntryValues = z.infer<typeof quickEntrySchema>;
export type CustomFoodValues = z.infer<typeof customFoodSchema>;
