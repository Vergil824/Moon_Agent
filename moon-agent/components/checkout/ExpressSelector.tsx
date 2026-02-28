"use client";

import { Truck, Package, Check } from "lucide-react";
import { useExpressList, type ExpressCompany } from "@/lib/express/useExpress";
import { cn } from "@/lib/utils/utils";

export type ExpressSelectorProps = {
  value: number | null;
  onChange: (expressId: number) => void;
};

/**
 * Express Company Selector Component
 * Story 4.4: Checkout Confirmation - Express Company Selection
 *
 * Displays a list of express companies for user to select
 * Similar to PaymentMethodSelector - shows options as selectable cards
 */
export function ExpressSelector({ value, onChange }: ExpressSelectorProps) {
  const { data: expressList, isLoading, error } = useExpressList();

  if (isLoading) {
    return <ExpressSelectorSkeleton />;
  }

  if (error || !expressList?.length) {
    return null; // Hide if no express options available
  }

  return (
    <div
      data-testid="express-selector"
      className="bg-white rounded-2xl p-4"
    >
      {/* Section Title */}
      <h3 className="text-base font-semibold text-moon-text mb-3">配送方式</h3>

      {/* Express Options Grid */}
      <div className="grid grid-cols-2 gap-2">
        {expressList.map((express) => {
          const isSelected = value === express.id;
          return (
            <button
              key={express.id}
              type="button"
              onClick={() => onChange(express.id)}
              data-testid={`express-option-${express.id}`}
              className={cn(
                "flex items-center gap-2 py-3 px-3 rounded-xl border-2 transition-all",
                isSelected
                  ? "bg-moon-purple/10 border-moon-purple"
                  : "bg-gray-50 border-transparent"
              )}
            >
              {/* Express Icon */}
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0",
                  isSelected
                    ? "bg-moon-purple text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                <Package className="size-4" />
              </div>

              {/* Express Name */}
              <span
                className={cn(
                  "text-sm font-medium flex-1 text-left truncate",
                  isSelected ? "text-moon-purple" : "text-moon-text-muted"
                )}
              >
                {express.name}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <Check className="size-4 text-moon-purple shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for express selector
 */
export function ExpressSelectorSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl p-4 animate-pulse"
      data-testid="express-selector-skeleton"
    >
      {/* Title skeleton */}
      <div className="h-5 w-20 bg-gray-200 rounded mb-3" />

      {/* Options skeleton */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-3 px-3 rounded-xl bg-gray-50"
          >
            <div className="size-8 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpressSelector;
