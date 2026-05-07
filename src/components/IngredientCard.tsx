import { motion } from "motion/react";
import { Ingredient } from "../types";

interface IngredientCardProps {
  ingredient: Ingredient;
  onRemove: (id: string) => void;
}

// Define sizeClasses OUTSIDE the component so it is globally available to the render logic
const sizeClasses: Record<string, string> = {
  small: "w-12 h-12 text-[9px]",
  medium: "w-16 h-16 text-[10px]",
  tall: "w-12 h-20 text-[10px]",
  wide: "w-20 h-12 text-[10px]",
  large: "w-18 h-18 text-[11px]",
};

export default function IngredientCard({ ingredient, onRemove }: IngredientCardProps) {
  return (
    <motion.div
      layout
      initial={{ y: -20, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      // Gamified 3D hover effect
      whileHover={{ 
        scale: 1.1, 
        y: -8, 
        rotateX: 10, 
        rotateZ: 2, 
        zIndex: 50,
        boxShadow: "0px 15px 20px rgba(62, 39, 35, 0.3)" 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        group relative flex flex-col items-center justify-center p-2 mb-2 shrink-0
        ${sizeClasses[ingredient.size] || sizeClasses.medium}
        rounded-[6px_12px_4px_10px]
        cursor-pointer overflow-hidden
        border-b-4 border-r-2 border-black/20
      `}
      style={{ backgroundColor: ingredient.color, boxShadow: "0px 4px 6px rgba(0,0,0,0.15)" }}
      onClick={() => onRemove(ingredient.id)}
    >
      {/* GLOSS ANIMATION: Sweeps across the card on hover */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-tr from-transparent via-white/50 to-transparent -translate-x-[150%] group-hover:translate-x-[50%] transition-transform duration-700 ease-in-out pointer-events-none z-20 skew-x-[-20deg]" />

      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
      
      <div className="handwriting font-bold text-center leading-tight z-10 px-1 drop-shadow-sm text-[#3e2723]">
        {ingredient.label}
      </div>
      
      {/* Decorative tag look - top hole */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/20 shadow-inner" />
    </motion.div>
  );
}