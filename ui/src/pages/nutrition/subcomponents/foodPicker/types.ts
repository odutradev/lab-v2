import type { Food } from "@actions/nutrition/types";

export interface FoodPickerProps {
  submitLabel: string;
  onSubmit: (food: Food, grams: number) => Promise<boolean> | boolean;
}
