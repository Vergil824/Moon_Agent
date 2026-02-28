"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SelectCard } from "./SelectCard";
import { StateComponentProps } from "./StateComponents";

/**
 * Chest type definition
 */
type ChestType = {
  id: "round" | "spindle" | "hemisphere";
  title: string;
  description: string;
  imageSrc: string;
};

/**
 * Chest type options data
 * Mapped to new image paths in public/assets/shapes/
 */
const CHEST_TYPES: ChestType[] = [
  {
    id: "round",
    title: "圆盘型",
    description: "底盘宽，分布均匀",
    imageSrc: "/assets/shapes/圆盘型.png"
  },
  {
    id: "spindle",
    title: "纺锤型",
    description: "底盘小，隆起高",
    imageSrc: "/assets/shapes/纺锤型.png"
  },
  {
    id: "hemisphere",
    title: "半球型",
    description: "底盘中等，饱满均衡",
    imageSrc: "/assets/shapes/半球型.png"
  }
];

/**
 * ShapeSelection - Chest type selection panel component
 * 
 * Triggered when n8n returns state `{"step": "shape_select"}`
 * 
 * Features:
 * - Single selection logic
 * - Confirm button (disabled until selection made)
 * - Sends natural language message on confirm (e.g., "我选择了圆盘型")
 * - Follows Figma design specifications
 */
export function ShapeSelection({ onSelect }: StateComponentProps) {
  const [selectedType, setSelectedType] = useState<ChestType["id"] | null>(null);

  /**
   * Handle confirm button click
   * Sends natural language message to n8n
   */
  const handleConfirm = () => {
    if (!selectedType) return;

    const selectedChest = CHEST_TYPES.find((type) => type.id === selectedType);
    if (selectedChest) {
      // Send natural language message as specified in AC
      onSelect(`我选择了${selectedChest.title}`);
    }
  };

  return (
    <motion.div
      data-testid="shape-selection-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-[330px] mx-auto"
    >
      {/* Selection cards */}
      <div className="flex flex-col gap-3">
        {CHEST_TYPES.map((type) => (
          <SelectCard
            key={type.id}
            title={type.title}
            description={type.description}
            imageSrc={type.imageSrc}
            selected={selectedType === type.id}
            onClick={() => setSelectedType(type.id)}
          />
        ))}
      </div>

      {/* Confirm button */}
      <motion.button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedType}
        whileHover={selectedType ? { scale: 1.02 } : undefined}
        whileTap={selectedType ? { scale: 0.98 } : undefined}
        className={`
          w-full mt-4 py-3 rounded-[14px] font-semibold text-base text-white
          shadow-md transition-opacity duration-200
          ${selectedType
            ? "bg-moon-purple hover:bg-moon-purple-hover cursor-pointer opacity-100"
            : "bg-moon-purple opacity-50 cursor-not-allowed"
          }
        `}
      >
        确认选择
      </motion.button>
    </motion.div>
  );
}
