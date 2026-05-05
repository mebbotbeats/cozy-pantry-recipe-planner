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
      {/* Subtle shelf background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />
      
      {/* Label placed within shelf space */}
      <div className="absolute top-1 left-4 z-20">
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#5d4037]/30 font-bold">
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
              <div className="h-14 flex items-center px-4 opacity-5 italic text-[10px] text-[#5d4037] uppercase tracking-widest">
                Empty shelf
              </div>
            )}
          </div>
        </div>
        
        {/* The Wooden Board Floor (Perspective View) */}
        <div className="h-4 w-full bg-[#e5c49f]/60 relative z-0 border-t border-black/5">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          {/* Front Edge of the Board - Slightly darker */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#d4b38e] border-t border-black/5" />
          
          {/* Shadow Under the Shelf Board */}
          <div className="absolute -bottom-3 left-0 right-0 h-3 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-[-1]" />
        </div>
      </div>
    </div>
  );
}
