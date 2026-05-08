=== File: PantryShelf.tsx ===
import { AnimatePresence } from "motion/react";
import { Ingredient } from "../types";
import IngredientCard from "./IngredientCard";

interface PantryShelfProps {
  shelfNumber: number;
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
}

export default function PantryShelf({ ingredients, onRemove }: PantryShelfProps) {
  
  // Group ingredients by their AI-assigned group name
  const groupedIngredients = ingredients.reduce((acc, item) => {
    const g = item.group || "Miscellaneous";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="flex-1 flex flex-col relative z-[1] group min-h-0 mt-4 sm:mt-6">
      
      <div className="flex-1 relative flex flex-col justify-end min-h-0">
        
        {/* Horizontal scroll area */}
        <div className="relative z-10 w-full flex flex-col justify-end min-h-0">
          
          <div className="flex items-end overflow-x-auto shelf-scroll px-12 space-x-16 min-h-[110px] pb-1 relative z-10">
            
            {ingredients.length === 0 ? (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-30 text-[11px] text-[#5c4a3d] font-medium tracking-wide pb-4">
                <span className="italic">Dust motes dance on an empty shelf...</span>
              </div>
            ) : (
              Object.entries(groupedIngredients).map(([groupName, items]) => (
                /* THE CLUSTER CONTAINER */
                <div key={groupName} className="relative flex items-end justify-center min-w-fit pb-5">
                  
                  {/* 1. THE FOOD CARDS */}
                  {/* These sit in the normal flow. pb-2 creates a small tuck-in effect */}
                  <div className="flex items-end space-x-2 relative z-10 px-2">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* 2. THE TRAY LIP (LABEL) */}
                  {/* ABSOLUTE pins it to the bottom. It does NOT squeeze the cards. */}
                  <div className="absolute bottom-0 left-[-12px] right-[-12px] z-20 pointer-events-none translate-y-1">
                    <div className="relative w-full">
                      
                      {/* Physical shadow under the tray front */}
                      <div className="absolute inset-0 bg-black/30 translate-y-1 blur-[3px] rounded-sm" />
                      
                      {/* The Brass/Wood Plate */}
                      <div className="relative flex items-center justify-between w-full bg-[#e8dbce] px-3 py-1.5 rounded-sm border-t border-b-2 border-x border-[#c4b2a3] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
                        
                        {/* Left Screw */}
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center shrink-0">
                          <div className="w-[1px] h-0.5 bg-black/40 rotate-45" />
                        </div>
                        
                        {/* Label Text */}
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#4a3b32] font-bold px-3 truncate text-center w-full drop-shadow-sm whitespace-nowrap">
                          {groupName}
                        </span>
                        
                        {/* Right Screw */}
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center shrink-0">
                          <div className="w-[1px] h-0.5 bg-black/40 -rotate-45" />
                        </div>
                        
                      </div>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
        
        {/* THE WOODEN SHELF PLANK */}
        <div className="w-full relative z-[5] shrink-0 h-4">
          <div className="absolute top-0 left-0 right-0 h-[120px] pointer-events-none">
            <div className="h-[2px] w-full bg-white/40 relative z-10" />
            <div className="h-4 w-full bg-[#b89570] relative overflow-hidden border-b border-[#5e432a]">
              <div className="absolute inset-0 opacity-[0.15] mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} />
            </div>
            {/* Shelf Shadow */}
            <div className="h-24 w-full bg-gradient-to-b from-[rgba(62,39,35,0.3)] via-[rgba(62,39,35,0.05)] to-transparent" />
          </div>
        </div>

      </div>
    </div>
  );
}