"use client";

import { Minus, Plus } from "lucide-react";

/**
 * QuantitySelector - Quantity increment/decrement control
 * Story 4.3: AC 2 - Quantity adjustment component
 *
 * Requirements per Figma design (node-id=151:269):
 * - Border: 1px #e5e7eb rounded
 * - Minus button on left, plus button on right
 * - Current quantity in the center
 * - Disabled state when at min/max
 */

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  size = "sm",
}: QuantitySelectorProps) {
  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  const buttonSize = size === "sm" ? "size-6" : "size-8";
  const iconSize = size === "sm" ? "size-3" : "size-4";
  const containerWidth = size === "sm" ? "w-[81px]" : "w-[96px]";
  const containerHeight = size === "sm" ? "h-[25px]" : "h-[32px]";

  return (
    <div
      data-testid="quantity-selector"
      className={`flex items-center border border-[#e5e7eb] rounded ${containerWidth} ${containerHeight}`}
    >
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={`flex items-center justify-center ${buttonSize} text-moon-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-opacity`}
        aria-label="减少数量"
      >
        <Minus className={iconSize} />
      </button>

      {/* Quantity Display */}
      <span
        className="flex-1 text-center text-xs font-medium text-moon-text"
        aria-label={`当前数量: ${value}`}
      >
        {value}
      </span>

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={`flex items-center justify-center ${buttonSize} text-moon-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-opacity`}
        aria-label="增加数量"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}

export default QuantitySelector;

