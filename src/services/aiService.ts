import { Ingredient, IngredientSize, MealPlanResponse, PantryOrganizeResponse } from "../types";

// Helper to get headers with the Supabase Auth Token
const getAuthHeaders = () => {
  const token = localStorage.getItem("supabase-token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function organizePantry(input: string): Promise<Ingredient[]> {
  try {
    const response = await fetch("/api/organize", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.error === "OUT_OF_CREDITS") {
        throw new Error("You are out of credits! Please refill to stock more items.");
      }
      throw new Error(errData.error || "Please sign in to organize your pantry.");
    }

    const data: PantryOrganizeResponse = await response.json();
    return data.items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      size: item.size as IngredientSize,
    }));
  } catch (error: any) {
    console.error("Pantry organization failed:", error);
    alert(error.message); 
    return [];
  }
}

export async function generateMealPlan(ingredients: Ingredient[]): Promise<MealPlanResponse> {
  try {
    const response = await fetch("/api/meal-plan", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.error === "OUT_OF_CREDITS") {
        throw new Error("You are out of credits! Please refill to consult the chef.");
      }
      throw new Error(errData.error || "Please sign in to consult the chef.");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Meal plan generation failed:", error);
    alert(error.message);
    // Return a default object so the app doesn't crash
    return {
      plan: [],
      encouragement: "Oh dear, the chef couldn't connect. Please check your login."
    };
  }
}