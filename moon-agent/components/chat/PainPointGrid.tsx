"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PainPointCard } from "./PainPointCard";
import { StateComponentProps } from "./StateComponents";

/**
 * Pain point option definition
 */
type PainPoint = {
  id: string;
  title: string;
  imageSrc: string;
};

/**
 * Pain point options data (per PRD/Figma)
 * Strict adherence to Story 3.2 AC
 */
const PAIN_POINTS: PainPoint[] = [
  {
    id: "wire_poking",
    title: "钢圈戳腋下",
    imageSrc: "/assets/pain_points/钢圈戳腋下.png"
  },
  {
    id: "cup_slipping",
    title: "疯狂跑杯",
    imageSrc: "/assets/pain_points/跑杯.png"
  },
  {
    id: "quad_boob",
    title: "压胸/四个胸",
    imageSrc: "/assets/pain_points/压胸.png"
  },
  {
    id: "gaping_cup",
    title: "上半截空杯",
    imageSrc: "/assets/pain_points/空杯.png"
  },
  {
    id: "strap_issues",
    title: "肩带勒肉/滑落",
    imageSrc: "/assets/pain_points/肩带滑落.png"
  }
];

/**
 * PainPointGrid - Pain point multiselect grid component
 * 
 * Story 3.2 - Pain Point Multiselect Grid
 * Triggered when n8n returns state `{"step": "pain_point_select"}`
 * 
 * Features:
 * - Multiselect grid (2 columns on mobile)
 * - Purple theme for selected state (per Figma)
 * - Selected count header
 * - Confirm button to submit natural language message
 * - Allows 0 or multiple selections
 */
export function PainPointGrid({ onSelect }: StateComponentProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /**
   * Toggle pain point selection
   */
  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  /**
   * Handle confirm - generate natural language message
   */
  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      onSelect("我没有特别的内衣问题");
      return;
    }

    const selectedTitles = selectedIds
      .map((id) => PAIN_POINTS.find((p) => p.id === id)?.title)
      .filter(Boolean)
      .join("、");

    onSelect(`我有${selectedTitles}的问题`);
  };

  return (
    <motion.div
      data-testid="pain-point-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl shadow-lg p-4 w-full max-w-[330px] mx-auto"
    >
      {/* Selected count header */}
      <div className="flex items-center gap-0.5 text-sm text-gray-500 mb-2">
        <span>已选择</span>
        <span className="text-moon-pink font-normal">{selectedIds.length}</span>
        <span>个痛点</span>
      </div>

      {/* Grid */}
      <div
        data-testid="pain-point-grid"
        className="grid grid-cols-2 gap-2"
      >
        {PAIN_POINTS.map((point) => (
          <PainPointCard
            key={point.id}
            title={point.title}
            imageSrc={point.imageSrc}
            selected={selectedIds.includes(point.id)}
            onToggle={() => handleToggle(point.id)}
          />
        ))}
      </div>

      {/* Confirm button */}
      <motion.button
        type="button"
        onClick={handleConfirm}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-3 rounded-[14px] font-semibold text-base text-white bg-moon-purple hover:bg-moon-purple-hover shadow-md transition-opacity duration-200"
      >
        确认痛点
      </motion.button>
    </motion.div>
  );
}

