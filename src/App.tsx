import { useState, useEffect } from "react";
import { Plus, ChefHat, RotateCcw, LogOut, Check, Moon, Sun } from "lucide-react";
import { Ingredient, MealPlanResponse } from "./types";
import { organizePantry, generateMealPlan } from "./services/aiService";
import PantryShelf from "./components/PantryShelf";
import PantryInput from "./components/PantryInput";
import MealPlanModal from "./components/MealPlanModal";
import { captureElement, shareImages } from "./lib/share";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";

// Helper function: Forces all ingredients in the same group to share the same shelf
const normalizeShelves = (items: Ingredient[]) => {
  const groupShelves: Record<string, number> = {};
  return items.map(item => {
    const g = item.group || "Miscellaneous";
    if (!groupShelves[g]) groupShelves[g] = item.shelf;
    return { ...item, shelf: groupShelves[g] };
  });
};

export default function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark Mode State

  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [particles] = useState(() => 
    [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${Math.random() * 5 + 6}s`
    }))
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.access_token) localStorage.setItem("supabase-token", session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.access_token) localStorage.setItem("supabase-token", session.access_token);
      else localStorage.removeItem("supabase-token");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("credits").eq("id", user.id).single()
        .then(({ data }) => setCredits(data?.credits || 0));
    }
  }, [user, isOrganizing, mealPlan]);

  const handleLogin = async () => await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  const handleLogout = async () => await supabase.auth.signOut();
  const handleRefill = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      alert("Could not initiate checkout. Please try again later.");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("cozy-pantry-storage");
    if (saved) {
      try { 
        setIngredients(normalizeShelves(JSON.parse(saved))); 
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cozy-pantry-storage", JSON.stringify(ingredients));
  }, [ingredients]);

  const handleOrganize = async (input: string) => {
    if (!user) return alert("Please sign in to organize your pantry!");
    setIsOrganizing(true);
    try {
      const newItems = await organizePantry(input);
      if (newItems.length > 0) {
        setIngredients((prev) => {
          return normalizeShelves([...prev, ...newItems]);
        });
        setIsInputOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleRemove = (id: string) => setIngredients((prev) => prev.filter((item) => item.id !== id));
  const clearPantry = () => { if (confirm("Are you sure you want to clear your pantry?")) setIngredients([]); };

  const handleGeneratePlan = async () => {
    if (!user) return alert("Please sign in to consult the Chef!");
    if (ingredients.length === 0) return alert("Oh dear, your pantry is empty! Add some ingredients first.");
    setIsPlanOpen(true);
    setMealPlan(null);
    try {
      const plan = await generateMealPlan(ingredients);
      setMealPlan(plan);
    } catch (error) {
      setIsPlanOpen(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleSaveRecipe = async () => {
    setIsExporting(true);
    try {
      const pantryImg = await captureElement("pantry-capture-zone", "my-cozy-pantry");
      const images = [pantryImg].filter(Boolean) as string[];
      const menuImg = await captureElement("meal-plan-canvas", "my-chef-menu");
      if (menuImg) images.push(menuImg);
      const shared = await shareImages(images, "Check out my pantry setup and chef-curated menu!");
      if (!shared) alert("Aesthetic recipe captures saved! Check your device downloads/photos.");
    } catch (err) {
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="app-root" className={`${isDarkMode ? 'dark' : ''} h-screen w-screen overflow-hidden bg-[var(--pantry-bg)] flex flex-col relative transition-colors duration-500`}>
      
      <div id="pantry-capture-zone" className="flex-1 w-full flex flex-col relative bokeh-glow min-h-0">
        
        <div className="absolute inset-0 pointer-events-none z-40 carved-wall" />
        <div className="absolute inset-0 pointer-events-none sunbeam z-40" />

        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
          {particles.map((style, i) => (
            <div key={i} className="dust-particle" style={style} />
          ))}
        </div>

        <header className="flex items-center justify-between p-3 sm:p-4 px-6 sm:px-10 shrink-0 z-[50]">
          <div className="flex items-baseline gap-3">
            <h1 className="handwriting text-3xl sm:text-4xl font-bold text-[var(--text-dark)] drop-shadow-sm transition-colors duration-500">PantryPlanet</h1>
            <p className="text-[8px] uppercase tracking-[0.3em] text-[var(--text-dark)]/40 font-bold hidden md:block transition-colors duration-500">The Art of the Ingredient</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* DARK MODE TOGGLE */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[var(--text-dark)] transition-all"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {!user ? (
              <button onClick={handleLogin} className="px-4 py-1.5 bg-[#5d4037] text-[#fdf6e3] rounded-lg font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all">
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 bg-[var(--text-dark)]/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-[var(--text-dark)]/10 shadow-sm backdrop-blur-sm transition-colors">
                <span className="handwriting text-base sm:text-lg font-bold text-[var(--text-dark)]">Credits: {credits}</span>
                {credits <= 2 && (
                  <button onClick={handleRefill} className="text-[10px] sm:text-xs bg-[#e5c49f] text-[#5d4037] px-2 py-1 rounded-md shadow-sm hover:scale-105 active:scale-95 font-bold transition-all">
                    Refill ($5)
                  </button>
                )}
                <div className="w-px h-4 bg-[var(--text-dark)]/20 mx-1" />
                <button onClick={handleLogout} className="text-[var(--text-dark)]/50 hover:text-[var(--text-dark)] transition-colors" title="Log out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex gap-1 ml-1 sm:ml-2">
              <button onClick={clearPantry} className="p-2 rounded-full hover:bg-black/5 text-[var(--text-dark)]/40 hover:text-[var(--text-dark)] transition-all" title="Clear Pantry">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main id="pantry-canvas" className="flex-1 flex flex-col px-4 sm:px-10 z-[45] pb-2 min-h-0">
          {[1, 2, 3, 4, 5].map((shelfNum) => (
            <PantryShelf
              key={shelfNum}
              shelfNumber={shelfNum}
              ingredients={ingredients.filter((i) => i.shelf === shelfNum || (shelfNum === 5 && (i.shelf > 5 || i.shelf < 1)))}
              onRemove={handleRemove}
            />
          ))}
        </main>

        <footer className="h-16 sm:h-24 flex items-center justify-center gap-3 sm:gap-4 px-6 relative z-[50] shrink-0 pb-2 sm:pb-0">
          <button onClick={() => { if (!user) alert("Please sign in to stock your shelves!"); else setIsInputOpen(true); }} className="flex items-center gap-2 bg-[#5d4037] text-[#fdf6e3] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all font-bold group">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
            <span className="handwriting text-base sm:text-lg">Stock Shelves</span>
          </button>
          <button onClick={handleGeneratePlan} className="flex items-center gap-2 bg-[#e5c49f] text-[#5d4037] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all font-bold">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="handwriting text-base sm:text-lg">Consult Chef</span>
          </button>
        </footer>
      </div>

      <PantryInput isOpen={isInputOpen} onClose={() => setIsInputOpen(false)} onSubmit={handleOrganize} isLoading={isOrganizing} />
      <MealPlanModal isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} mealPlan={mealPlan} onSave={handleSaveRecipe} isExporting={isExporting} />
      
      {mealPlan && (
        <div className="fixed -left-[2000px] top-0 pointer-events-none">
          <div id="meal-plan-canvas" className="w-[800px] p-12 bg-[#faf8f1] rounded-3xl border-4 border-[#e5c49f]/40 space-y-8 relative overflow-hidden">
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
            <div className="relative z-10 italic text-2xl text-center font-medium handwriting opacity-80 text-[#84a59d] pb-6">"{mealPlan.encouragement}"</div>
            <div className="relative z-10 grid gap-6">
              {mealPlan.plan.map((day) => (
                <div key={day.day} className="bg-white/60 p-6 rounded-2xl shadow-sm border border-[#e5c49f]/50 space-y-4">
                  <div className="flex items-baseline gap-4 border-b border-[#e5c49f]/30 pb-3">
                    <span className="text-3xl font-bold handwriting text-[#84a59d]">Day {day.day}</span>
                    <h3 className="text-2xl font-bold text-[#5d4037] tracking-tight">{day.title}</h3>
                  </div>
                  <p className="text-base text-[#5d4037]/80 leading-relaxed italic px-2">{day.description}</p>
                  <ul className="grid gap-3 pt-2">
                    {day.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4 text-base text-[#5d4037]">
                        <span className="mt-1 flex-shrink-0 bg-[#fdebd0] p-1.5 rounded-full"><Check className="w-4 h-4 text-[#c08552]" /></span>
                        <span className="leading-relaxed font-medium">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {mealPlan.groceryHint && (
              <div className="relative z-10 mt-8 bg-[#fdf6e3] p-6 rounded-2xl border-2 border-dashed border-[#a3b18a]/50 shadow-sm text-center">
                <h4 className="font-bold text-[#5d4037] mb-2 uppercase tracking-wider text-sm">Chef's Complementary Note</h4>
                <p className="text-base text-[#5d4037]/80 leading-relaxed italic">{mealPlan.groceryHint}</p>
              </div>
            )}
            <div className="relative z-10 pt-8 text-center text-[11px] uppercase tracking-[0.2em] text-[#5d4037]/40 font-bold">Generated by PantryPlanet</div>
          </div>
        </div>
      )}
    </div>
  );
}