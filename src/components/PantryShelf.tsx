import { AnimatePresence } from "motion/react";
import { Ingredient } from "../types";
import IngredientCard from "./IngredientCard";

interface PantryShelfProps {
  shelfNumber: number;
  label: string;
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
  key?: string | number;
}

export default function PantryShelf({ shelfNumber, label, ingredients, onRemove }: PantryShelfProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 relative group border-b border-black/5 pb-2">
      {/* Subtle shelf background gradient to give it a slight recess feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/[0.03] to-transparent pointer-events-none" />
      
      {/* Label placed within shelf space with a vintage aesthetic */}
      <div className="absolute top-1 left-4 z-20">
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#5d4037]/40 font-bold bg-white/30 px-1.5 py-0.5 rounded-sm">
           {label}
        </span>
      </div>

      <div className="flex-1 relative flex flex-col justify-end">
        {/* The horizontal scroll area - The "Floor" area where items sit */}
        <div className="relative z-10 w-full overflow-hidden flex flex-col justify-end pb-0.5 translate-y-1">
          <div className="flex items-end overflow-x-auto shelf-scroll px-8 space-x-2 min-h-0 overflow-y-hidden">
             <AnimatePresence mode="popLayout">
              {ingredients.map((item) => (
                <IngredientCard 
                  key={item.id} 
                  ingredient={item} 
                  onRemove={onRemove} 
                />
              ))}
            </AnimatePresence>
            {ingredients.length === 0 && (
              <div className="h-14 flex items-center px-4 opacity-10 italic text-[10px] text-[#5d4037] uppercase tracking-widest">
                — waiting for ingredients —
              </div>
            )}
          </div>
        </div>
        
        {/* The Wooden Board Floor (Rustic Alpine Cottage Style) */}
        <div 
          className="h-5 w-full relative z-0 border-t border-[#8b5a2b]/30 shadow-inner" 
          style={{ 
            backgroundColor: "#b58b5e", 
            backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" 
          }}
        >
          {/* Top highlight for sunlight hitting the edge */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
          
          {/* Front Edge of the Board - Darker thickness for depth */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-2 bg-[#8b5a2b] border-t border-[#5c3a21]/40" 
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} 
          />
          
          {/* Heavy Cast Shadow Under the Shelf to make it pop off the background */}
          <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[rgba(62,39,35,0.4)] to-transparent pointer-events-none z-[-1]" />
        </div>
      </div>
    </div>
  );
}