import { motion } from "motion/react";
import { Ingredient } from "../types";

interface IngredientCardProps {
  ingredient: Ingredient;
  onRemove: (id: string) => void;
  key?: string | number;
}

const sizeClasses = {
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
      whileHover={{ scale: 1.05, y: -5, rotate: 1, zIndex: 50 }}
      className={`
        relative flex flex-col items-center justify-center p-2 mb-2 shrink-0
        ${sizeClasses[ingredient.size]}
        rounded-[6px_12px_4px_10px]
        painterly-shadow
        cursor-pointer overflow-hidden
        border-b-2 border-black/10
      `}
      style={{ backgroundColor: ingredient.color }}
      onClick={() => onRemove(ingredient.id)}
    >
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
      
      <div className="handwriting font-bold text-center leading-tight z-10 px-1 drop-shadow-sm">
        {ingredient.label}
      </div>
      
      {/* Decorative tag look - top hole */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/10" />
    </motion.div>
  );
}
