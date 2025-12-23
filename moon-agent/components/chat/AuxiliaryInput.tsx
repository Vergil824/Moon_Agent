"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";
import type { StateComponentProps } from "./StateComponents";

// Slider configuration based on AC requirements
const SLIDER_CONFIG = {
  height: {
    label: "身高 (cm)",
    min: 140,
    max: 200,
    default: 165,
    unit: "cm"
  },
  weight: {
    label: "体重 (kg)",
    min: 30,
    max: 100,
    default: 55,
    unit: "kg"
  },
  waist: {
    label: "腰围 (cm)",
    min: 50,
    max: 120,
    default: 68,
    unit: "cm"
  }
} as const;

export type AuxiliaryData = {
  height: number;
  weight: number;
  waist: number;
};

/**
 * AuxiliaryInput component for collecting height, weight, and waist measurements
 * Matches Figma design: https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-1280
 */
export function AuxiliaryInput({ onSelect }: StateComponentProps) {
  // Local state for slider values while dragging
  // Explicitly type as number to avoid literal type inference
  const [height, setHeight] = useState<number>(SLIDER_CONFIG.height.default);
  const [weight, setWeight] = useState<number>(SLIDER_CONFIG.weight.default);
  const [waist, setWaist] = useState<number>(SLIDER_CONFIG.waist.default);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global store for persisting data
  const setAuxiliaryData = useChatStore((state) => state.setAuxiliaryData);

  // Explicit handlers to avoid type issues
  const handleHeightChange = (value: number) => setHeight(value);
  const handleWeightChange = (value: number) => setWeight(value);
  const handleWaistChange = (value: number) => setWaist(value);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    const data: AuxiliaryData = { height, weight, waist };

    try {
      // Update global Zustand store
      setAuxiliaryData(data);

      // Return natural language Chinese response
      const message = `我的身高是${height}cm，体重${weight}kg，腰围${waist}cm`;
      onSelect(message);
    } catch (error) {
      console.error("Failed to submit auxiliary data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-3 ml-10"
    >
      <div className="bg-white rounded-[24px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full max-w-[331px] p-4">
        {/* Height Slider */}
        <div className="mb-4">
          <Slider
            label={SLIDER_CONFIG.height.label}
            min={SLIDER_CONFIG.height.min}
            max={SLIDER_CONFIG.height.max}
            value={height}
            unit={SLIDER_CONFIG.height.unit}
            onChange={handleHeightChange}
          />
        </div>

        {/* Weight Slider */}
        <div className="mb-4">
          <Slider
            label={SLIDER_CONFIG.weight.label}
            min={SLIDER_CONFIG.weight.min}
            max={SLIDER_CONFIG.weight.max}
            value={weight}
            unit={SLIDER_CONFIG.weight.unit}
            onChange={handleWeightChange}
          />
        </div>

        {/* Waist Slider */}
        <div className="mb-4">
          <Slider
            label={SLIDER_CONFIG.waist.label}
            min={SLIDER_CONFIG.waist.min}
            max={SLIDER_CONFIG.waist.max}
            value={waist}
            unit={SLIDER_CONFIG.waist.unit}
            onChange={handleWaistChange}
          />
        </div>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full h-12 rounded-[14px] bg-moon-purple hover:bg-moon-purple-hover text-white font-semibold text-base shadow-md transition-colors"
        >
          {isSubmitting ? "提交中..." : "确认数据"}
        </Button>
      </div>
    </motion.div>
  );
}
