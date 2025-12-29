"use client";

import { MapPin, ChevronRight } from "lucide-react";

/**
 * AddressBar - Delivery address display component
 * Story 4.3: AC 1 - "配送至: [当前默认地址]" per Figma 151:212
 *
 * Requirements:
 * - Rounded card with glass morphism effect
 * - Location icon on the left
 * - Address text (truncated if too long)
 * - Right arrow for navigation to address selection
 * - Background: rgba(255,255,255,0.6) with subtle border and shadow
 */

type AddressBarProps = {
  address?: string;
  onPress?: () => void;
};

export function AddressBar({ 
  address = "请选择配送地址", 
  onPress 
}: AddressBarProps) {
  return (
    <button
      data-testid="address-bar"
      onClick={onPress}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-colors hover:bg-white/80 active:bg-white/70"
    >
      {/* Left: Icon + Address text */}
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <MapPin className="size-4 text-moon-text-muted shrink-0" />
        <span className="text-sm text-moon-text-muted truncate">
          配送至: {address}
        </span>
      </div>

      {/* Right: Chevron */}
      <ChevronRight className="size-4 text-moon-text-muted shrink-0" />
    </button>
  );
}

export default AddressBar;

