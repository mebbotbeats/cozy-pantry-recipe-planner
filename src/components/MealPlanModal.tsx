import { motion, AnimatePresence } from "motion/react";
import { X, ChefHat, Check, ShoppingBasket, Download } from "lucide-react";
import { MealPlanResponse } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlanResponse | null;
  onSave: () => void;
  isExporting: boolean;
}

export default function MealPlanModal({ isOpen, onClose, mealPlan, onSave, isExporting }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] bg-[#faf8f1] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-[#e5c49f]/40"
          >
            {/* Subtle Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

            {/* Cozy Header */}
            <div className="p-8 pb-4 flex items-start justify-between text-[#5d4037] relative z-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <ChefHat className="w-9 h-9 text-[#84a59d]" />
                  <h2 className="handwriting text-5xl font-bold text-[#5d4037] pt-2">Chef's Recipe Book</h2>
                </div>
                <div className="w-24 h-1.5 bg-[#e5c49f] rounded-full ml-12" />
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 transition-colors text-[#5d4037]/60 hover:text-[#5d4037]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-10 space-y-8 scroll-smooth relative z-10">
              {mealPlan ? (
                <>
                  <div className="italic text-2xl text-center font-medium handwriting opacity-80 text-[#84a59d] mt-4 mb-8">
                    "{mealPlan.encouragement}"
                  </div>

                  <div className="grid gap-6">
                    {mealPlan.plan.map((day) => (
                      <div key={day.day} className="bg-white/60 p-6 rounded-2xl shadow-sm border border-[#e5c49f]/50 space-y-4">
                        <div className="flex items-baseline gap-3 border-b border-[#e5c49f]/30 pb-3">
                          <span className="text-3xl font-bold handwriting text-[#84a59d]">Day {day.day}</span>
                          <h3 className="text-xl font-bold text-[#5d4037] tracking-tight">{day.title}</h3>
                        </div>
                        <p className="text-sm text-[#5d4037]/80 leading-relaxed italic px-2">
                          {day.description}
                        </p>
                        <ul className="grid gap-3 pt-2">
                          {day.instructions.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-[#5d4037]">
                              <span className="mt-0.5 flex-shrink-0 bg-[#fdebd0] p-1 rounded-full">
                                  <Check className="w-3 h-3 text-[#c08552]" />
                              </span>
                              <span className="leading-relaxed font-medium">{step}</span> 
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {mealPlan.groceryHint && (
                    <div className="mt-8 bg-[#fdf6e3] p-5 rounded-2xl border-2 border-dashed border-[#a3b18a]/50 flex gap-4 items-start shadow-sm">
                      <ShoppingBasket className="w-6 h-6 text-[#a3b18a] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-[#5d4037] mb-1">Chef's Complementary Note</h4>
                        <p className="text-sm text-[#5d4037]/80 leading-relaxed">{mealPlan.groceryHint}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40 text-[#5d4037]">
                  <ChefHat className="w-20 h-20 mb-6 animate-bounce text-[#84a59d]" />
                  <p className="handwriting text-3xl">Chef is drafting your menu...</p>
                </div>
              )}
            </div>
            
            {/* CTA Footer */}
            <div className="p-6 bg-gradient-to-t from-[#fdf6e3] to-white/50 border-t border-[#e5c49f]/30 flex flex-col items-center relative z-10">
                {mealPlan && (
                  <div className="w-full bg-[#fdebd0]/50 border border-[#c08552]/20 text-[#c08552] px-4 py-2.5 rounded-xl mb-4 text-xs sm:text-sm text-center shadow-sm">
                      <span className="font-bold uppercase tracking-widest text-[10px] block mb-0.5 opacity-80">⚠️ Don't lose this!</span>
                      Your recipe book will close and vanish if you leave without saving.
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 text-[#5d4037]/60 hover:text-[#5d4037] hover:bg-black/5 rounded-xl font-bold transition-all order-2 sm:order-1"
                    >
                        Close without saving
                    </button>
                    <button 
                        onClick={onSave}
                        disabled={isExporting || !mealPlan}
                        className={`
                          px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2
                          ${!mealPlan || isExporting 
                            ? "bg-black/10 text-black/40 cursor-not-allowed" 
                            : "bg-[#84a59d] text-white hover:bg-[#6c8c83]"}
                        `}
                    >
                        <Download className={`w-5 h-5 ${isExporting ? "animate-bounce" : ""}`} />
                        {isExporting ? "Saving Images..." : "Save Recipe to Device"}
                    </button>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}