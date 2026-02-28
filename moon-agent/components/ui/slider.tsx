"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  unit?: string;
  showValue?: boolean;
  onChange?: (value: number) => void;
}

/**
 * Custom Slider component based on native HTML range input
 * Styled to match the Figma design with moon-purple theme
 * Supports both slider drag and direct value input
 */
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      unit = "",
      showValue = true,
      value,
      min = 0,
      max = 100,
      onChange,
      ...props
    },
    ref
  ) => {
    const numericValue = typeof value === "number" ? value : Number(value) || 0;
    const numericMin = Number(min);
    const numericMax = Number(max);

    // State for editing mode
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(numericValue));
    const inputRef = useRef<HTMLInputElement>(null);

    // Calculate the percentage for the filled track
    const percentage =
      ((numericValue - numericMin) / (numericMax - numericMin)) * 100;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onChange?.(newValue);
    };

    // Handle clicking on the value to edit
    const handleValueClick = () => {
      setEditValue(String(numericValue));
      setIsEditing(true);
    };

    // Handle input change during editing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    };

    // Handle input blur or enter key
    const handleInputConfirm = () => {
      const newValue = Number(editValue);
      if (!isNaN(newValue)) {
        // Clamp value to min/max range
        const clampedValue = Math.min(Math.max(newValue, numericMin), numericMax);
        onChange?.(clampedValue);
      }
      setIsEditing(false);
    };

    // Handle key press in input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleInputConfirm();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    };

    // Focus input when entering edit mode
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    return (
      <div className={cn("flex flex-col gap-4 w-full", className)}>
        {label && (
          <label className="text-sm font-medium text-moon-text-muted">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            value={value}
            onChange={handleSliderChange}
            className="slider-input w-full h-2 appearance-none cursor-pointer rounded-[10px] bg-gray-200"
            style={
              {
                "--slider-percentage": `${percentage}%`
              } as React.CSSProperties
            }
            {...props}
          />
        </div>
        {showValue && (
          <div className="flex justify-center items-center">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="number"
                  value={editValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onKeyDown={handleKeyDown}
                  min={min}
                  max={max}
                  className="w-16 text-lg font-medium text-moon-text text-center border border-moon-purple rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-moon-purple/30"
                />
                <span className="text-lg font-medium text-moon-text">{unit}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleValueClick}
                  className="text-lg font-medium text-moon-text text-center hover:text-moon-purple hover:border-moon-purple transition-colors cursor-pointer border border-gray-300 rounded-md px-3 py-1 min-w-[60px]"
                  aria-label={`Edit ${label || "value"}`}
                >
                  {numericValue}
                </button>
                {unit && <span className="text-lg font-medium text-moon-text">{unit}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
