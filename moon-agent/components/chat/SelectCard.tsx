"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Props for SelectCard component
 */
export type SelectCardProps = {
  /** Card title (e.g., "圆盘型") */
  title: string;
  /** Card description (e.g., "底盘宽，分布均匀") */
  description: string;
  /** Image source path (e.g., "/assets/shapes/圆盘型.png") */
  imageSrc: string;
  /** Whether the card is currently selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
};

/**
 * Checkmark icon for selected state
 */
function CheckmarkIcon() {
  return (
    <div
      data-testid="checkmark-icon"
      className="absolute top-4 right-4 w-6 h-6 rounded-full bg-moon-purple flex items-center justify-center"
    >
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}

/**
 * SelectCard - A reusable selection card component for chest type selection
 * 
 * Features:
 * - Visual feedback for selected/unselected states
 * - Purple theme (#8B5CF6) for selected state
 * - Optimized image loading via next/image
 * - Accessible button role
 * - Animation on hover/tap
 */
export function SelectCard({
  title,
  description,
  imageSrc,
  selected,
  onClick
}: SelectCardProps) {
  return (
    <motion.button
      data-testid="select-card"
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        relative w-full p-4 rounded-[14px] border-2 transition-colors duration-200
        flex items-center gap-3
        ${selected
          ? "border-moon-purple bg-purple-50"
          : "border-gray-200 bg-white"
        }
      `}
    >
      {/* Image/Icon */}
      <div className="relative shrink-0 w-[60px] h-[60px] rounded-lg overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="60px"
          className="object-contain"
          priority
        />
      </div>

      {/* Text content */}
      <div className="flex-1 text-left">
        <h3
          className={`text-base font-normal leading-6 ${
            selected ? "text-gray-900" : "text-gray-800"
          }`}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-5">
          {description}
        </p>
      </div>

      {/* Selected checkmark */}
      {selected && <CheckmarkIcon />}
    </motion.button>
  );
}
