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
    if (!acc[g]) acc[g] =[];
    acc[g].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group min-h-0 mt-2 sm:mt-4">
      
      <div className="flex-1 relative flex flex-col justify-end overflow-visible min-h-0">
        
        {/* The horizontal scroll area for ingredient clusters */}
        <div className="relative z-10 w-full flex flex-col justify-end min-h-0">
          
          <div className="flex items-end overflow-x-auto shelf-scroll px-8 space-x-12 min-h-[85px] sm:min-h-[110px] pt-8 relative z-10 -mb-[1px]">
            
            {ingredients.length === 0 ? (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-40 text-[11px] text-[#5c4a3d] font-medium tracking-wide pb-2">
                <span className="italic">Dust motes dance on an empty shelf...</span>
              </div>
            ) : (
              // Map through each group to create clusters!
              Object.entries(groupedIngredients).map(([groupName, items]) => (
                <div key={groupName} className="relative flex flex-col items-center">
                  
                  {/* Dynamic Stretched Brass Nameplate Above the Cluster */}
                  <div className="absolute -top-7 left-0 right-0 z-0 flex justify-center min-w-[80px]">
                    <div className="relative w-full">
                      {/* Drop shadow */}
                      <div className="absolute inset-0 bg-black/15 translate-y-1 blur-[2px] rounded-sm" />
                      
                      <div className="relative flex items-center justify-between w-full bg-[#e8dbce] px-2 py-1 rounded-sm border border-[#c4b2a3]">
                        {/* Left Screw */}
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center shrink-0">
                          <div className="w-[1px] h-1 bg-black/30 rotate-45" />
                        </div>
                        
                        {/* Group Text */}
                        <span className="text-[9px] uppercase tracking-[0.25em] text-[#4a3b32] font-bold px-2 truncate text-center w-full">
                          {groupName}
                        </span>
                        
                        {/* Right Screw */}
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center shrink-0">
                          <div className="w-[1px] h-1 bg-black/30 rotate-12" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* The actual food items in this cluster */}
                  <div className="flex items-end space-x-2 relative z-10 w-full justify-center">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* THE SOLID WOODEN SHELF PLANK + HEAVY SHADOWS */}
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