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
    /* min-w-0 and max-w-full are CRITICAL to stop flexbox from expanding off-screen, enabling the scrollbar! */
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group min-h-0 mt-4 min-w-0 max-w-full">
      
      <div className="flex-1 relative flex flex-col justify-end overflow-visible min-h-0 min-w-0 max-w-full">
        
        {/* Horizontal Scroll Area */}
        <div className="relative z-10 w-full flex flex-col justify-end min-h-0 min-w-0 max-w-full">
          
          {/* justify-start aligns everything to the left. overflow-x-auto enables horizontal scroll. */}
          <div className="flex items-end justify-start overflow-x-auto shelf-scroll px-6 sm:px-10 space-x-4 sm:space-x-8 min-h-[120px] pb-[1px] relative z-10 w-full">
            
            {ingredients.length === 0 ? (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-40 text-[11px] text-[#5c4a3d] font-medium tracking-wide pb-2 w-full">
                <span className="italic">Dust motes dance on an empty shelf...</span>
              </div>
            ) : (
              Object.entries(groupedIngredients).map(([groupName, items]) => (
                
                /* inline-flex and items-start ensures the group builds left-to-right */
                <div key={groupName} className="relative inline-flex flex-col items-start pt-6 shrink-0">
                  
                  {/* 1. THE CARDS (Normal Flow) */}
                  {/* pb-4 creates the physical gap at the bottom for the label to sit over */}
                  <div className="flex items-end justify-start space-x-2 px-3 pb-4 relative z-10">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* 2. THE TRAY LIP (Absolute Position) */}
                  {/* absolute bottom-[2px] locks it to the bottom, completely unaffected by the cards */}
                  <div className="absolute bottom-[2px] left-0 right-0 z-20 h-6 bg-[#e8dbce] rounded-[4px_4px_2px_2px] border-t-2 border-b border-x border-[#c4b2a3] shadow-[0_-2px_4px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.7)] flex items-center justify-between px-2 pointer-events-none">
                    
                    {/* Left Screw */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center shrink-0">
                      <div className="w-[1px] h-0.5 bg-black/40 rotate-45" />
                    </div>
                    
                    {/* Category Label */}
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#4a3b32] font-bold px-2 truncate text-center w-full drop-shadow-sm select-none">
                      {groupName}
                    </span>

                    {/* Right Screw */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center shrink-0">
                      <div className="w-[1px] h-0.5 bg-black/40 -rotate-45" />
                    </div>

                  </div>
                </div>
              ))
            )}
            
            {/* Invisible spacer to maintain the right-side padding when fully scrolled to the edge */}
            {ingredients.length > 0 && <div className="shrink-0 w-4 sm:w-8 h-1" />}
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