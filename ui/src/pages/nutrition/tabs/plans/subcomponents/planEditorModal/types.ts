import type { Macros } from "@actions/nutrition/types";

export interface EditorItem {
  key: string;
  foodId: string;
  foodName: string;
  grams: number;
  per100g: Macros;
}

export interface EditorMeal {
  key: string;
  id?: string;
  name: string;
  time: string;
  items: EditorItem[];
}
