import { AnimatePresence } from "motion/react";
import { Ingredient } from "../types";
import IngredientCard from "./IngredientCard";

interface PantryShelfProps {
  shelfNumber: number;
  label: string;
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
}

export default function PantryShelf({ label, ingredients, onRemove }: PantryShelfProps) {
  return (
    // min-h-0 forces the shelves to share vertical space perfectly on smaller screens
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group min-h-0">
      
      {/* Label placed within shelf space with a vintage aesthetic */}
      <div className="absolute top-1 left-6 z-20 hidden sm:block">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c7a6b] font-bold bg-[#fdf6e3]/60 px-2 py-0.5 rounded-sm backdrop-blur-sm shadow-sm border border-white/50">
           {label}
        </span>
      </div>

      <div className="flex-1 relative flex flex-col justify-end overflow-visible min-h-0">
        
        {/* The horizontal scroll area - constrained safely above the board */}
        <div className="relative z-10 w-full flex flex-col justify-end pb-1 min-h-0">
          <div className="flex items-end overflow-x-auto shelf-scroll px-8 space-x-3 min-h-[85px] sm:min-h-[100px] pt-4">
             <AnimatePresence mode="popLayout">
              {ingredients.map((item) => (
                <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
              ))}
            </AnimatePresence>
            {ingredients.length === 0 && (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-40 italic text-[10px] text-[#8c7a6b] uppercase tracking-widest">
                — waiting for ingredients —
              </div>
            )}
          </div>
        </div>
        
        {/* The 20% Darker Beige Wooden Board Floor */}
        <div 
          className="h-4 sm:h-5 w-full relative z-[5] bg-[#e3d8c1] border-t border-[#c4b598] shrink-0" 
          style={{ 
            maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)"
          }}
        >
          {/* Subtle wood grain overlay */}
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} 
          />
          
          {/* Top highlight for soft sunlight hitting the edge */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/40" />
          
          {/* Front Edge of the Board - Darker definition */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-[#d1c4a9] border-b border-black/5" />
          
          {/* Heavy Cast Shadow Under the Shelf for massive depth */}
          <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-[rgba(62,39,35,0.4)] to-transparent pointer-events-none z-[-1]" />
        </div>
      </div>
    </div>
  );
}