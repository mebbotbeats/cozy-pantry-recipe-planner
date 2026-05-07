export type IngredientSize = 'small' | 'medium' | 'tall' | 'wide' | 'large';

export interface Ingredient {
  id: string;
  label: string;
  originalName: string;
  color: string;
  size: IngredientSize;
  shelf: number; // 1 to 5
  group: string; // Dynamic cluster name (e.g., "Coffee Bar", "Baking")
}

export interface MealPlanDay {
  day: number;
  title: string;
  description: string;
  instructions: string[];
}

export interface MealPlanResponse {
  plan: MealPlanDay[];
  encouragement: string;
  groceryHint?: string;
}

export interface PantryOrganizeResponse {
  items: Omit<Ingredient, 'id'>[];
}