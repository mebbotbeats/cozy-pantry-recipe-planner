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
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group min-h-0 mt-1 sm:mt-3">
      
      {/* Subtle Ambient Wall Shadow behind the items to create a recess */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#5d4037]/[0.04] pointer-events-none rounded-b-xl" />

      {/* 
        Vintage Brass/Enamel Nameplate 
        Anchored to the back wall, sitting just above the shelf surface 
      */}
      <div className="absolute bottom-8 left-6 z-0 hidden sm:block">
        <div className="relative">
          {/* Drop shadow for the physical tag */}
          <div className="absolute inset-0 bg-black/20 translate-y-1 blur-[2px] rounded-sm" />
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
        <div className="relative z-10 w-full flex flex-col justify-end pb-1 min-h-0">
          
          {/* Ambient Occlusion (Dark contact shadow where the shelf top meets the back wall) */}
          <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-[#3e2723]/20 to-transparent pointer-events-none z-0" />
          
          <div className="flex items-end overflow-x-auto shelf-scroll px-8 space-x-3 min-h-[85px] sm:min-h-[100px] pt-4 relative z-10">
             <AnimatePresence mode="popLayout">
              {ingredients.map((item) => (
                <IngredientCard key={item.id} ingredient={item} onRemove={onRemove} />
              ))}
            </AnimatePresence>
            {ingredients.length === 0 && (
              <div className="h-10 sm:h-14 flex items-center px-4 opacity-40 text-[11px] text-[#5c4a3d] font-medium tracking-wide">
                <span className="italic">Dust motes dance on an empty shelf...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 
          THE 3D COTTAGE WOOD SHELF ASSEMBLY 
          Built using planes to simulate real wooden planks
        */}
        <div 
          className="w-full relative z-[5] shrink-0" 
          style={{ 
            // Fades the left and right edges so it blends beautifully into the cabinet walls
            maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)"
          }}
        >
          {/* 1. TOP SURFACE (Recedes back toward the wall) */}
          <div className="h-3 sm:h-4 w-full bg-[#e3d1b8] relative overflow-hidden flex flex-col justify-end">
            <div 
              className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
              style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} 
            />
            {/* Gradient shadow mimicking light falloff on the shelf surface */}
            <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-[#a38f72]/40 to-transparent" />
          </div>

          {/* 2. BEVELED SUNLIGHT EDGE (Where light catches the corner of the wood) */}
          <div className="h-[2px] w-full bg-white/70 relative z-10 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />

          {/* 3. FRONT FACE (The thickness of the physical plank) */}
          <div className="h-2.5 sm:h-3.5 w-full bg-[#cca982] relative overflow-hidden border-b border-[#6e4e2f]">
            <div 
              className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
              style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} 
            />
            {/* Curved bottom shading to make the plank look rounded and solid */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#8a6a43]/70 to-transparent" />
          </div>

          {/* 4. HEAVY CAST SHADOWS (Creates massive depth against the back wall) */}
          {/* Sharp, dark contact shadow right underneath the wood */}
          <div className="absolute top-full left-0 right-0 h-3 bg-gradient-to-b from-[rgba(62,39,35,0.7)] to-transparent pointer-events-none z-[-1]" />
          
          {/* Wide, diffuse ambient drop shadow spreading down the wall */}
          <div className="absolute top-full left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-[rgba(62,39,35,0.3)] via-[rgba(62,39,35,0.1)] to-transparent pointer-events-none z-[-2]" />
        </div>

      </div>
    </div>
  );
}