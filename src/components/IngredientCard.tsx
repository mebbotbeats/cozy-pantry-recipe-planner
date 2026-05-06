import { motion } from "motion/react";
import { Ingredient } from "../types";

// ... size classes remain the same

export default function IngredientCard({ ingredient, onRemove }: IngredientCardProps) {
  return (
    <motion.div
      layout
      initial={{ y: -20, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      // GAMIFICATION: 3D pop and tilt on hover!
      whileHover={{ 
        scale: 1.1, 
        y: -8, 
        rotateX: 10,  // Tilts back slightly like a real card
        rotateZ: 2, 
        zIndex: 50,
        boxShadow: "0px 15px 20px rgba(62, 39, 35, 0.3)" // Deeper shadow on hover
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        group relative flex flex-col items-center justify-center p-2 mb-2 shrink-0
        ${sizeClasses[ingredient.size]}
        rounded-[6px_12px_4px_10px]
        cursor-pointer overflow-hidden
        border-b-4 border-r-2 border-black/20 /* Thicker bottom border for 3D chunkiness */
      `}
      style={{ backgroundColor: ingredient.color, boxShadow: "0px 4px 6px rgba(0,0,0,0.15)" }}
      onClick={() => onRemove(ingredient.id)}
    >
      {/* GLOSS ANIMATION: Sweeps across the card on hover */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-tr from-transparent via-white/50 to-transparent -translate-x-[150%] group-hover:translate-x-[50%] transition-transform duration-700 ease-in-out pointer-events-none z-20 skew-x-[-20deg]" />

      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
      
      <div className="handwriting font-bold text-center leading-tight z-10 px-1 drop-shadow-sm text-[#3e2723]">
        {ingredient.label}
      </div>
      
      {/* Decorative tag hole */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/20 shadow-inner" />
    </motion.div>
  );
}