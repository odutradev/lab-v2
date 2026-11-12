import type { ActivityLevel, NutritionGoal, Food, Macros, ReviewStatus } from "@actions/nutrition/types";

export const goalOptions: Array<{ value: NutritionGoal; label: string; description: string }> = [
  { value: "maintenance", label: "Manutenção", description: "Manter o peso atual" },
  { value: "cutting", label: "Cutting", description: "Perder gordura (déficit calórico)" },
  { value: "bulking", label: "Bulking", description: "Ganhar massa (superávit calórico)" },
  { value: "recomposition", label: "Recomposição", description: "Perder gordura e ganhar massa devagar" }
];

export const activityOptions: Array<{ value: ActivityLevel; label: string; description: string }> = [
  { value: "sedentary", label: "Sedentário", description: "Pouco ou nenhum exercício" },
  { value: "light", label: "Leve", description: "Exercício 1 a 3 dias por semana" },
  { value: "moderate", label: "Moderado", description: "Exercício 3 a 5 dias por semana" },
  { value: "active", label: "Ativo", description: "Exercício intenso 6 a 7 dias por semana" },
  { value: "veryActive", label: "Muito ativo", description: "Treino pesado diário ou trabalho físico" }
];

export const goalLabels: Record<NutritionGoal, string> = {
  maintenance: "Manutenção",
  cutting: "Cutting",
  bulking: "Bulking",
  recomposition: "Recomposição"
};

export const defaultMealNames = ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar", "Ceia"];

export const reviewStatusMessages: Record<ReviewStatus, { title: string; color: string }> = {
  insufficient_data: { title: "Dados insuficientes", color: "gray" },
  on_track: { title: "No ritmo certo", color: "teal" },
  increase_calories: { title: "Sugestão: aumentar calorias", color: "yellow" },
  decrease_calories: { title: "Sugestão: reduzir calorias", color: "orange" }
};

const roundOne = (value: number): number => Math.round(value * 10) / 10;

export const calculateFoodMacros = (food: Food, grams: number): Macros => {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * ratio),
    protein: roundOne(food.proteinPer100g * ratio),
    carbs: roundOne(food.carbsPer100g * ratio),
    fat: roundOne(food.fatPer100g * ratio)
  };
};

export const sumMacros = (items: Macros[]): Macros => {
  const total = items.reduce(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      protein: sum.protein + item.protein,
      carbs: sum.carbs + item.carbs,
      fat: sum.fat + item.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: Math.round(total.calories),
    protein: roundOne(total.protein),
    carbs: roundOne(total.carbs),
    fat: roundOne(total.fat)
  };
};

export const getProgressPercent = (value: number, target?: number | null): number => {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
};

export const formatMacros = (macros: Macros): string => {
  return `${macros.calories} kcal · P ${macros.protein}g · C ${macros.carbs}g · G ${macros.fat}g`;
};
