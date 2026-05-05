import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export default function PantryInput({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const [text, setText] = useState("");

  const handleApply = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-[#fdf6e3] rounded-2xl shadow-2xl p-6 border border-[#d3c6aa]/30 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="handwriting text-3xl font-bold mb-4">Stock the Pantry</h2>
            <p className="text-sm opacity-60 mb-6">
              Just list whatever you have (e.g. "half a chicken, some old rice, paprika, milk"). 
              Chef AI will organize it for you!
            </p>

            <textarea
              className="w-full h-32 bg-white/50 border border-[#d3c6aa]/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d3c6aa]/50 resize-none transition-all"
              placeholder="Type your ingredients here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleApply}
                disabled={isLoading || !text.trim()}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                  ${isLoading || !text.trim() 
                    ? 'bg-black/10 text-black/20 cursor-not-allowed' 
                    : 'bg-[#4a5d4e] text-[#fdf6e3] hover:shadow-lg active:scale-95'}
                `}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isLoading ? "Organizing..." : "Arrange Pantry"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
