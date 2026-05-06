import { motion, AnimatePresence } from "motion/react";
import { X, ChefHat, Check, ShoppingCart } from "lucide-react";
import { MealPlanResponse } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlanResponse | null;
}

export default function MealPlanModal({ isOpen, onClose, mealPlan }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-3xl max-h-[85vh] bg-[#faf8f1] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#d3c6aa]/30"
          >
            <div className="bg-[#4a5d4e] p-6 flex items-center justify-between text-[#fdf6e3]">
              <div className="flex items-center gap-3">
                <ChefHat className="w-8 h-8" />
                <h2 className="handwriting text-3xl font-bold">Chef's Master 7-Day Plan</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth bg-[#faf8f1]">
              {mealPlan ? (
                <>
                  <div className="italic text-lg text-center font-medium handwriting opacity-70 border-b border-[#d3c6aa]/30 pb-6">
                    "{mealPlan.encouragement}"
                  </div>

                  {/* NEW: Shopping List Section */}
                  {mealPlan.shoppingList && mealPlan.shoppingList.length > 0 && (
                    <div className="bg-[#e5c49f]/30 p-6 rounded-xl border border-[#d3c6aa]/50">
                      <div className="flex items-center gap-2 mb-3 text-[#5d4037]">
                        <ShoppingCart className="w-5 h-5" />
                        <h3 className="font-bold text-lg tracking-tight">Missing Ingredient List</h3>
                      </div>
                      <p className="text-sm opacity-70 mb-3">Buy these 3 items to turn your pantry into a gourmet kitchen this week:</p>
                      <ul className="grid gap-2 pl-2">
                        {mealPlan.shoppingList.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm font-medium text-[#5d4037]">
                            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#4a5d4e]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 7-Day Meal Plan */}
                  <div className="grid gap-8 mt-6">
                    {mealPlan.plan.map((day) => (
                      <div key={day.day} className="space-y-4">
                        <div className="flex items-baseline gap-4">
                          <span className="text-4xl font-bold handwriting text-[#4a5d4e] opacity-30">Day {day.day}</span>
                          <h3 className="text-xl font-bold tracking-tight">{day.title}</h3>
                        </div>
                        <p className="text-sm opacity-70 leading-relaxed pl-4 border-l-2 border-[#d3c6aa]/30">
                          {day.description}
                        </p>
                        <ul className="grid gap-2 pl-4">
                          {day.instructions.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                              <span className="mt-1 flex-shrink-0">
                                  <Check className="w-4 h-4 text-[#4a5d4e]" />
                              </span>
                              {/* Renders Breakfast, Lunch, and Dinner! */}
                              <span className="opacity-80 leading-relaxed">{step}</span> 
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <ChefHat className="w-16 h-16 mb-4 animate-bounce" />
                  <p className="handwriting text-2xl">Chef is drafting your 7-day menu...</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-[#fdf6e3] border-t border-[#d3c6aa]/20 flex justify-center">
                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-[#4a5d4e] text-[#fdf6e3] rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                    Close Menu
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}