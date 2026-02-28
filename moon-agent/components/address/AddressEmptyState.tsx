"use client";

import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * AddressEmptyState - Empty state for address list
 * Story 5.9: AC 1 - EmptyState when no addresses exist
 */

type AddressEmptyStateProps = {
  onAddClick?: () => void;
};

export function AddressEmptyState({ onAddClick }: AddressEmptyStateProps) {
  return (
    <div
      data-testid="address-empty-state"
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="size-20 rounded-full bg-[#faf5ff] flex items-center justify-center mb-4">
        <MapPin className="size-10 text-[#8b5cf6]" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        还没有收货地址
      </h3>
      <p className="text-sm text-gray-500 mb-6 text-center">
        添加一个收货地址，让配送更便捷
      </p>
      <Button
        data-testid="add-address-btn-empty"
        onClick={onAddClick}
        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
      >
        <Plus className="size-4 mr-2" />
        添加新地址
      </Button>
    </div>
  );
}

export default AddressEmptyState;

