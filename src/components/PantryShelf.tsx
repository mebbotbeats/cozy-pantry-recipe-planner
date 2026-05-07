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
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group min-h-0 mt-2 sm:mt-4">
      
      {/* 
        Vintage Brass/Enamel Nameplate 
        Anchored to the back wall
      */}
      <div className="absolute bottom-5 left-6 z-20 hidden sm:block">
        <div className="relative">
          {/* Drop shadow for the physical tag */}
          <div className="absolute inset-0 bg-black/15 translate-y-1 blur-[2px] rounded-sm" />
          <span className="relative flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-[#4a3b32] font-bold bg-[#e8dbce] px-3 py-1 rounded-sm border border-[#c4b2a3]">
             {/* Fake little copper screws holding the plate to the wall */}
             <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center">
               <div className="w-[1px] h-1 bg-black/30 rotate-45" />
             </div>
             {label}
             <div className="w-1.5 h-1.5 rounded-full bg-[#8c7a6b] shadow-inner flex items-center justify-center">
               <div className="w-[1px] h-1 bg-black/30 rotate-12" />
             </div>
          </span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col justify-end overflow-visible min-h-0">
        
        {/* The horizontal scroll area */}
        <div className="relative z-10 w-full flex flex-col justify-end min-h-0">
          {/* 
            NOTE: Added -mb-[8px] here. This counteracts the bottom margin on the cards,
            snapping them so they sit flush and physically touch the wooden plank!
          */}
          <div className="flex items-end overflow-x-auto shelf-scroll px-8 space-x-3 min-h-[85px] sm:min-h-[100px] pt-4 relative z-10 -mb-[8px]">
             <AnimatePresence mode="popLayout">
              {ingredients.map((item) => (
                <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
              ))}
            </AnimatePresence>
            {ingredients.length === 0 && (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-40 text-[11px] text-[#5c4a3d] font-medium tracking-wide pb-2">
                <span className="italic">Dust motes dance on an empty shelf...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 
          THE SOLID WOODEN SHELF PLANK + SHADOWS
          We wrap both the wood AND the shadows inside the mask so they fade perfectly at the edges.
        */}
        <div 
          className="w-full relative z-[5] shrink-0" 
          style={{ 
            // Fades the left and right edges beautifully into the cabinet walls
            maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)"
          }}
        >
          {/* Top Edge Highlight (Sunlight catching the corner) */}
          <div className="h-[2px] w-full bg-white/60 relative z-10" />

          {/* Front Face (The physical thickness of the chunky wooden plank) */}
          <div className="h-4 sm:h-5 w-full bg-[#b89570] relative overflow-hidden border-b border-[#5e432a]">
            <div 
              className="absolute inset-0 opacity-[0.15] mix-blend-multiply"
              style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} 
            />
            {/* Curved bottom shading to make the plank look rounded and solid */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#694d32]/80 to-transparent" />
          </div>

          {/* 
            HEAVY CAST SHADOWS 
            Placed in normal flow so the mask includes them.
            We use negative bottom-margins equal to their height so they don't push the shelves apart!
          */}
          {/* Sharp, dark contact shadow right underneath the wood (h-4 = 16px) */}
          <div className="h-4 w-full bg-gradient-to-b from-[rgba(62,39,35,0.75)] to-transparent" />
          
          {/* Wide, diffuse ambient drop shadow spreading down the wall (h-16=64px, sm:h-24=96px) */}
          <div className="h-16 sm:h-24 w-full bg-gradient-to-b from-[rgba(62,39,35,0.25)] via-[rgba(62,39,35,0.06)] to-transparent mb-[-80px] sm:mb-[-112px]" />
        </div>

      </div>
    </div>
  );
}