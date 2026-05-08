import { AnimatePresence } from "motion/react";
import { Ingredient } from "../types";
import IngredientCard from "./IngredientCard";

interface PantryShelfProps {
  shelfNumber: number;
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
}

export default function PantryShelf({ ingredients, onRemove }: PantryShelfProps) {
  
  const groupedIngredients = ingredients.reduce((acc, item) => {
    const g = item.group || "Miscellaneous";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group min-h-0 mt-4">
      
      <div className="flex-1 relative flex flex-col justify-end overflow-visible min-h-0">
        
        {/* Horizontal Scroll Area */}
        <div className="relative z-10 w-full flex flex-col justify-end min-h-0">
          
          <div className="flex items-end overflow-x-auto shelf-scroll px-8 space-x-6 sm:space-x-8 min-h-[120px] pb-1 relative z-10">
            
            {ingredients.length === 0 ? (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-40 text-[11px] text-[#5c4a3d] font-medium tracking-wide pb-2">
                <span className="italic">Dust motes dance on an empty shelf...</span>
              </div>
            ) : (
              Object.entries(groupedIngredients).map(([groupName, items]) => (
                <div key={groupName} className="flex flex-col items-center justify-end shrink-0 pt-4">
                  
                  {/* 1. THE CARDS (Z-Index 10) */}
                  {/* pb-4 adds 16px of invisible padding below the cards. */}
                  <div className="flex items-end space-x-2 px-3 pb-4 relative z-10">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* 2. THE TRAY LIP (Z-Index 20) */}
                  {/* -mt-7 pulls this UP by 28px. It easily covers the 16px padding + tucks the cards 12px deep! */}
                  <div className="relative z-20 w-[calc(100%+12px)] h-[24px] -mt-7 bg-[#e8dbce] rounded-t-sm border border-[#c4b2a3] flex items-center justify-between px-2 shadow-[0_-2px_4px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] pointer-events-none">
                    
                    {/* Left Screw */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner shrink-0 flex items-center justify-center">
                      <div className="w-[1px] h-0.5 bg-black/40 rotate-45" />
                    </div>
                    
                    {/* Category Label */}
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#4a3b32] font-bold px-2 truncate w-full text-center select-none drop-shadow-sm">
                      {groupName}
                    </span>

                    {/* Right Screw */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner shrink-0 flex items-center justify-center">
                      <div className="w-[1px] h-0.5 bg-black/40 -rotate-45" />
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* THE SOLID WOODEN SHELF PLANK */}
        <div className="w-full relative z-[5] shrink-0 h-4 sm:h-5">
          <div 
            className="absolute top-0 left-0 right-0 h-[150px] pointer-events-none" 
            style={{ 
              maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)"
            }}
          >
            <div className="h-[2px] w-full bg-white/60 relative z-10" />
            <div className="h-4 sm:h-5 w-full bg-[#b89570] relative overflow-hidden border-b border-[#5e432a]">
              <div className="absolute inset-0 opacity-[0.15] mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#694d32]/80 to-transparent" />
            </div>
            <div className="h-5 w-full bg-gradient-to-b from-[rgba(62,39,35,0.7)] to-transparent" />
            <div className="absolute top-[16px] sm:top-[20px] left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-[rgba(62,39,35,0.25)] via-[rgba(62,39,35,0.06)] to-transparent" />
          </div>
        </div>

      </div>
    </div>
  );
}