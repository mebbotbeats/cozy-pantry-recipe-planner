import { Ingredient, IngredientSize, MealPlanResponse, PantryOrganizeResponse } from "../types";

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
      if (errData.error === "OUT_OF_CREDITS") throw new Error("You are out of credits! Please refill.");
      // Fix: Don't guess "Please sign in". Show the real error or a server crash message!
      throw new Error(errData.error || `Server connection failed (Error ${response.status}). Please try again.`);
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
    return[];
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
      if (errData.error === "OUT_OF_CREDITS") throw new Error("You are out of credits! Please refill.");
      throw new Error(errData.error || `Server connection failed (Error ${response.status}). Please try again.`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Meal plan generation failed:", error);
    alert(error.message);
    return { plan: [],
      encouragement: "Oh dear, the chef couldn't connect. Please check your login."
    };
  }
}