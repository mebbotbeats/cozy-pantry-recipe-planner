import { useState, useEffect } from "react";
import { Plus, ChefHat, RotateCcw, LogOut, Check } from "lucide-react";
import { Ingredient, MealPlanResponse } from "./types";
import { organizePantry, generateMealPlan } from "./services/aiService";
import PantryShelf from "./components/PantryShelf";
import PantryInput from "./components/PantryInput";
import MealPlanModal from "./components/MealPlanModal";
import { captureElement, shareImages } from "./lib/share";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";

const SHELF_LABELS: Record<number, string> = {
  1: "Spices & Dry Goods",
  2: "Canned & Jars",
  3: "Fresh & Produce",
  4: "Baking & Grains",
  5: "Miscellaneous",
};

export default function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const[isOrganizing, setIsOrganizing] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);

  // --- MONETIZATION & AUTH STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.access_token) {
        localStorage.setItem("supabase-token", session.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.access_token) {
        localStorage.setItem("supabase-token", session.access_token);
      } else {
        localStorage.removeItem("supabase-token");
      }
    });

    return () => subscription.unsubscribe();
  },[]);

  // Fetch Credits when user logs in, organizes food, or gets a meal plan
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setCredits(data?.credits || 0));
    }
  }, [user, isOrganizing, mealPlan]);

  // Auth Handlers
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: "google",
      options: {
        redirectTo: window.location.origin 
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleRefill = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url; // Redirects to Stripe Checkout
    } catch (err) {
      console.error("Refill error", err);
      alert("Could not initiate checkout. Please try again later.");
    }
  };
  // ---------------------------------

  // Load Pantry from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cozy-pantry-storage");
    if (saved) {
      try {
        setIngredients(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load pantry", e);
      }
    }
  },[]);

  // Save Pantry to localStorage
  useEffect(() => {
    localStorage.setItem("cozy-pantry-storage", JSON.stringify(ingredients));
  }, [ingredients]);

  const handleOrganize = async (input: string) => {
    if (!user) {
      alert("Please sign in to organize your pantry!");
      return;
    }
    setIsOrganizing(true);
    try {
      const newItems = await organizePantry(input);
      if (newItems.length > 0) {
        setIngredients((prev) => [...prev, ...newItems]);
        setIsInputOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleRemove = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const clearPantry = () => {
    if (confirm("Are you sure you want to clear your pantry?")) {
      setIngredients([]);
    }
  };

  const handleGeneratePlan = async () => {
    if (!user) {
      alert("Please sign in to consult the Chef!");
      return;
    }
    if (ingredients.length === 0) {
      alert("Oh dear, your pantry is empty! Add some ingredients first.");
      return;
    }
    setIsPlanOpen(true);
    setMealPlan(null);
    try {
      const plan = await generateMealPlan(ingredients);
      setMealPlan(plan);
    } catch (error) {
      console.error(error);
      setIsPlanOpen(false); // Close modal if credit error threw
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleSaveRecipe = async () => {
    setIsExporting(true);
    try {
      // Captures only the pantry background, ignoring the open modal
      const pantryImg = await captureElement("pantry-capture-zone", "my-cozy-pantry");
      const images = [pantryImg].filter(Boolean) as string[];

      // Captures the hidden, beautifully formatted recipe book
      const menuImg = await captureElement("meal-plan-canvas", "my-chef-menu");
      if (menuImg) images.push(menuImg);

      const shared = await shareImages(images, "Check out my pantry setup and chef-curated menu!");
      if (!shared) {
        alert("Aesthetic recipe captures saved! Check your device downloads/photos.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="app-root" className="h-screen w-screen overflow-hidden bg-[var(--pantry-bg)] relative">
      
      {/* CAPTURE ZONE: Holds the background, shelves, and buttons. Modals sit outside! */}
      <div id="pantry-capture-zone" className="h-full w-full flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none z-40 carved-wall" />

        {/* Top Banner */}
        <header className="flex items-center justify-between p-2 px-10 shrink-0 z-[50]">
          <div className="flex items-baseline gap-3">
            <h1 className="handwriting text-3xl font-bold text-[#5d4037] drop-shadow-sm">Pantry Canvas</h1>
            <p className="text-[8px] uppercase tracking-[0.3em] text-[#5d4037]/40 font-bold hidden sm:block">The Art of the Ingredient</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* AUTH & CREDITS UI */}
            {!user ? (
              <button
                onClick={handleLogin}
                className="px-4 py-1.5 bg-[#5d4037] text-[#fdf6e3] rounded-lg font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-[#fdf6e3]/50 px-3 py-1.5 rounded-xl border border-[#5d4037]/10 shadow-sm">
                <span className="handwriting text-lg font-bold text-[#5d4037]">Credits: {credits}</span>
                {credits <= 2 && (
                  <button
                    onClick={handleRefill}
                    className="text-xs bg-[#e5c49f] text-[#5d4037] px-3 py-1 rounded-md shadow-sm hover:scale-105 active:scale-95 font-bold transition-all"
                  >
                    Refill ($5)
                  </button>
                )}
                <div className="w-px h-4 bg-[#5d4037]/20 mx-1" />
                <button 
                  onClick={handleLogout} 
                  className="text-[#5d4037]/50 hover:text-[#5d4037] transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Utility Buttons */}
            <div className="flex gap-1 ml-2">
              <button
                onClick={clearPantry}
                className="p-2 rounded-full hover:bg-black/5 text-[#5d4037]/40 hover:text-[#5d4037] transition-all"
                title="Clear Pantry"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Shelves Container */}
        <main id="pantry-canvas" className="flex-1 flex flex-col overflow-hidden px-10">
          {[1, 2, 3, 4, 5].map((shelfNum) => (
            <PantryShelf
              key={shelfNum}
              shelfNumber={shelfNum}
              label={SHELF_LABELS[shelfNum]}
              ingredients={ingredients.filter((i) => i.shelf === shelfNum || (shelfNum === 5 && (i.shelf > 5 || i.shelf < 1)))}
              onRemove={handleRemove}
            />
          ))}
        </main>

        {/* Footer Buttons */}
        <footer className="h-24 flex items-center justify-center gap-4 px-6 relative z-[50] shrink-0">
          <button
            onClick={() => {
              if (!user) alert("Please sign in to stock your shelves!");
              else setIsInputOpen(true);
            }}
            className="flex items-center gap-2 bg-[#5d4037] text-[#fdf6e3] px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all font-bold group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="handwriting text-lg">Stock Shelves</span>
          </button>

          <button
            onClick={handleGeneratePlan}
            className="flex items-center gap-2 bg-[#e5c49f] text-[#5d4037] px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all font-bold"
          >
            <ChefHat className="w-5 h-5" />
            <span className="handwriting text-lg">Consult Chef</span>
          </button>
        </footer>
      </div>

      {/* OVERLAYS (Outside of capture zone) */}
      <PantryInput
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
        onSubmit={handleOrganize}
        isLoading={isOrganizing}
      />

      <MealPlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        mealPlan={mealPlan}
        onSave={handleSaveRecipe}
        isExporting={isExporting}
      />

      {/* Hidden Export Buffer (The Beautiful Recipe Book) */}
      {mealPlan && (
        <div className="fixed -left-[2000px] top-0 pointer-events-none">
          <div id="meal-plan-canvas" className="w-[800px] p-12 bg-[#faf8f1] rounded-3xl border-4 border-[#e5c49f]/40 space-y-8 relative overflow-hidden">
            {/* Paper Texture */}
            <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <ChefHat className="w-12 h-12 text-[#84a59d]" />
                <div className="flex flex-col">
                  <h2 className="handwriting text-5xl font-bold text-[#5d4037] pt-2">Chef's Recipe Book</h2>
                  <div className="w-32 h-1.5 bg-[#e5c49f] rounded-full mt-1" />
                </div>
              </div>
            </div>

            <div className="relative z-10 italic text-2xl text-center font-medium handwriting opacity-80 text-[#84a59d] pb-6">
              "{mealPlan.encouragement}"
            </div>

            <div className="relative z-10 grid gap-6">
              {mealPlan.plan.map((day) => (
                <div key={day.day} className="bg-white/60 p-6 rounded-2xl shadow-sm border border-[#e5c49f]/50 space-y-4">
                  <div className="flex items-baseline gap-4 border-b border-[#e5c49f]/30 pb-3">
                    <span className="text-3xl font-bold handwriting text-[#84a59d]">Day {day.day}</span>
                    <h3 className="text-2xl font-bold text-[#5d4037] tracking-tight">{day.title}</h3>
                  </div>
                  <p className="text-base text-[#5d4037]/80 leading-relaxed italic px-2">
                    {day.description}
                  </p>
                  <ul className="grid gap-3 pt-2">
                    {day.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4 text-base text-[#5d4037]">
                        <span className="mt-1 flex-shrink-0 bg-[#fdebd0] p-1.5 rounded-full">
                          <Check className="w-4 h-4 text-[#c08552]" />
                        </span>
                        <span className="leading-relaxed font-medium">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Subtle Grocery Hint at the bottom (if needed) */}
            {mealPlan.groceryHint && (
              <div className="relative z-10 mt-8 bg-[#fdf6e3] p-6 rounded-2xl border-2 border-dashed border-[#a3b18a]/50 shadow-sm text-center">
                <h4 className="font-bold text-[#5d4037] mb-2 uppercase tracking-wider text-sm">Chef's Complementary Note</h4>
                <p className="text-base text-[#5d4037]/80 leading-relaxed italic">{mealPlan.groceryHint}</p>
              </div>
            )}

            <div className="relative z-10 pt-8 text-center text-[11px] uppercase tracking-[0.2em] text-[#5d4037]/40 font-bold">
              Generated by Pantry Canvas App
            </div>
          </div>
        </div>
      )}
    </div>
  );
}