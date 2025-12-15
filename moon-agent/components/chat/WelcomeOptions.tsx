"use client";

import { motion } from "framer-motion";

export type WelcomeOption = "准备好了！" | "有点紧张";

type WelcomeOptionsProps = {
  onSelect: (option: WelcomeOption | string) => void;
};

const options: WelcomeOption[] = ["准备好了！", "有点紧张"];

/**
 * WelcomeOptions component for initial user interaction
 * Renders pill-shaped buttons with outline style per Figma design
 */
export function WelcomeOptions({ onSelect }: WelcomeOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-2 ml-10"
    >
      {options.map((option, index) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.3 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(option)}
          className="px-4 py-2 bg-white border-2 border-violet-500 text-violet-500 text-sm font-semibold rounded-full shadow-sm hover:bg-violet-50 transition-colors"
        >
          {option}
        </motion.button>
      ))}
    </motion.div>
  );
}

