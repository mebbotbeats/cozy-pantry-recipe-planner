import { AnimatePresence } from "motion/react";
import { Ingredient } from "../types";
import IngredientCard from "./IngredientCard";

interface PantryShelfProps {
  shelfNumber: number;
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
}

const getCrateStyle = (groupName: string) => {
  const styles = [
    { bg: "bg-[#d2b48c]", border: "border-[#a68a61]", text: "text-[#3e2723]", strap: "bg-[#8b0000]" }, 
    { bg: "bg-[#cd853f]", border: "border-[#8a5a2b]", text: "text-[#1a0f05]", strap: "bg-[#2f4f4f]" }, 
    { bg: "bg-[#deb887]", border: "border-[#b8860b]", text: "text-[#2c1e0f]", strap: "bg-[#3e2723]" }, 
    { bg: "bg-[#c17a47]", border: "border-[#8a4a25]", text: "text-[#1a0f05]", strap: "bg-[#8b0000]" }, 
    { bg: "bg-[#e6c280]", border: "border-[#c19a6b]", text: "text-[#3e2723]", strap: "bg-[#556b2f]" }, 
  ];
  
  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return styles[Math.abs(hash) % styles.length];
};

export default function PantryShelf({ ingredients, onRemove }: PantryShelfProps) {
  
  const groupedIngredients = ingredients.reduce((acc, item) => {
    const g = item.group || "Miscellaneous";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group min-h-0 mt-4 min-w-0 max-w-full">
      
      <div className="flex-1 relative flex flex-col justify-end overflow-visible min-h-0 min-w-0 max-w-full">
        
        <div className="relative z-10 w-full flex flex-col justify-end min-h-0 min-w-0 max-w-full">
          
          {/* UPDATED: Added overflow-y-hidden to remove the vertical scrollbar entirely */}
          <div className="flex items-end justify-start overflow-x-auto overflow-y-hidden shelf-scroll px-6 sm:px-10 space-x-4 sm:space-x-8 min-h-[130px] pb-0 relative z-10 w-full">
            
            {ingredients.length === 0 ? (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-40 text-[11px] text-[#5c4a3d] font-medium tracking-wide pb-6 w-full">
                <span className="italic">Dust motes dance on an empty shelf...</span>
              </div>
            ) : (
              Object.entries(groupedIngredients).map(([groupName, items]) => {
                const crate = getCrateStyle(groupName);

                return (
                  <div key={groupName} className="relative inline-flex flex-col items-start pt-6 shrink-0">
                    
                    {/* 1. THE CARDS */}
                    <div className="flex items-end justify-start space-x-2 px-4 pb-6 relative z-10">
                      <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                          <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* 2. THE VINTAGE CRATE FRONT */}
                    <div className={`absolute -bottom-[4px] left-0 right-0 z-20 h-7 ${crate.bg} rounded-t-[1px] border-t-2 border-x ${crate.border} shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden pointer-events-none`}>
                      
                      <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-90" />

                      <div className="absolute inset-0 flex justify-evenly opacity-20">
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                      </div>

                      <div className={`absolute left-[12%] top-0 bottom-0 w-1.5 ${crate.strap} opacity-40 mix-blend-multiply`} />
                      <div className={`absolute right-[12%] top-0 bottom-0 w-1.5 ${crate.strap} opacity-40 mix-blend-multiply`} />

                      <div className="absolute left-0.5 top-0.5 w-0.5 h-0.5 rounded-full bg-[#2a1a10] opacity-60" />
                      <div className="absolute right-0.5 top-0.5 w-0.5 h-0.5 rounded-full bg-[#2a1a10] opacity-60" />
                      
                      <span className={`relative z-10 text-[10px] font-serif uppercase tracking-[0.2em] ${crate.text} font-black px-4 truncate text-center w-full opacity-80 mix-blend-multiply`}>
                        {groupName}
                      </span>

                    </div>
                  </div>
                );
              })
            )}
            
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
            <div className="h-[2px] w-full bg-[#5e432a]/80 relative z-10" />
            
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