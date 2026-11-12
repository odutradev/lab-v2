export type AddFoodMode = "food" | "quick";

export interface QuickEntryFormState {
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
