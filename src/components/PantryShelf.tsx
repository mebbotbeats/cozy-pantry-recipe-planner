import { AnimatePresence } from "motion/react";
import { Ingredient } from "../types";
import IngredientCard from "./IngredientCard";

interface PantryShelfProps {
  shelfNumber: number;
  label: string;
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
}

export default function PantryShelf({ shelfNumber, label, ingredients, onRemove }: PantryShelfProps) {
  return (
    // Changed to overflow-visible and z-[1] so shadows do not get clipped!
    <div className="flex-1 flex flex-col relative overflow-visible z-[1] group pb-4">
      
      {/* Label placed within shelf space with a bright, vintage aesthetic */}
      <div className="absolute top-0 left-6 z-20">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c7a6b] font-bold bg-[#fdf6e3]/60 px-2 py-0.5 rounded-sm backdrop-blur-sm shadow-sm border border-white/50">
           {label}
        </span>
      </div>

      {/* Overflow visible here ensures cards can pop up and shadows can drop down */}
      <div className="flex-1 relative flex flex-col justify-end overflow-visible">
        
        {/* The horizontal scroll area */}
        <div className="relative z-10 w-full flex flex-col justify-end pb-1">
          {/* min-h-[110px] gives cards room to animate without clipping their tops */}
          <div className="flex items-end overflow-x-auto shelf-scroll px-8 space-x-3 min-h-[110px]">
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
              <div className="h-14 flex items-center px-4 opacity-40 italic text-[10px] text-[#8c7a6b] uppercase tracking-widest">
                — waiting for ingredients —
              </div>
            )}
          </div>
        </div>
        
        {/* The Bright Beige Wooden Board Floor */}
        <div 
          className="h-5 w-full relative z-[5] bg-[#fdf6e3] border-t border-[#e5dcc5]" 
          style={{ 
            // Use a linear mask to dissolve the shelf edges smoothly into the bright cabinet frame
            maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)"
          }}
        >
          {/* Extremely subtle wood grain overlay to prevent repetition fatigue (opacity 0.03) */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} 
          />
          
          {/* Top highlight for soft sunlight hitting the edge */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/60" />
          
          {/* Front Edge of the Board - Soft, darker beige */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#f0e6d2]" />
          
          {/* Heavy Cast Shadow Under the Shelf - Z-index -1 pushes it behind the shelf */}
          <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-[rgba(93,64,55,0.12)] to-transparent pointer-events-none z-[-1]" />
        </div>
      </div>
    </div>
  );
}