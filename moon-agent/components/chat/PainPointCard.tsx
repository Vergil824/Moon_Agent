"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Props for PainPointCard component
 */
export type PainPointCardProps = {
  /** Card title (e.g., "钢圈戳腋下") */
  title: string;
  /** Image source path (e.g., "/assets/pain_points/钢圈戳腋下.png") */
  imageSrc: string;
  /** Whether the card is currently selected */
  selected: boolean;
  /** Toggle handler for multiselect */
  onToggle: () => void;
};

/**
 * PainPointCard - A card component for pain point selection (multiselect grid)
 * 
 * Story 3.2 - Pain Point Multiselect Grid
 * 
 * Features:
 * - Visual feedback for selected/unselected states
 * - Purple theme (#8B5CF6) for selected state (per Figma design)
 * - Grid layout: icon top, title center, checkmark bottom
 * - Accessible button role
 * - Animation on hover/tap
 */
export function PainPointCard({
  title,
  imageSrc,
  selected,
  onToggle
}: PainPointCardProps) {
  return (
    <motion.button
      data-testid="pain-point-card"
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        relative w-full p-3 rounded-[14px] border-2 transition-colors duration-200
        flex flex-col items-center gap-1
        min-h-[88px]
        ${selected
          ? "border-moon-purple bg-purple-50"
          : "border-gray-200 bg-white"
        }
      `}
    >
      {/* Icon */}
      <div className="relative shrink-0 w-5 h-5">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="20px"
          className="object-contain"
        />
      </div>

      {/* Title */}
      <span className="text-xs font-normal text-gray-800 text-center leading-4">
        {title}
      </span>

      {/* Checkmark when selected */}
      {selected && (
        <span
          data-testid="checkmark"
          className="text-xs text-moon-purple font-normal"
        >
          ✓
        </span>
      )}
    </motion.button>
  );
}

