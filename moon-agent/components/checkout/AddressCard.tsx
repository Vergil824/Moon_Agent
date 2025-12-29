"use client";

import { MapPin, ChevronRight, Plus } from "lucide-react";
import { type SettlementAddress } from "@/lib/order/orderApi";
import { maskPhoneNumber } from "@/lib/address/addressApi";

/**
 * AddressCard - Delivery address display card
 * Story 4.4: Task 3.1 - Address card component
 *
 * Requirements per AC 1:
 * - Display receiver name, masked phone, full address
 * - Tap to navigate to address selection/modification
 * - If no address, show prompt to add
 */

type AddressCardProps = {
  address?: SettlementAddress | null;
  onPress: () => void;
};

export function AddressCard({ address, onPress }: AddressCardProps) {
  const hasAddress = !!address;

  return (
    <button
      data-testid="address-card"
      onClick={onPress}
      className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 text-left active:bg-gray-50 transition-colors"
    >
      {/* Location Icon */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#FFF5F7] flex items-center justify-center">
          <MapPin className="w-4 h-4 text-moon-pink" />
        </div>
      </div>

      {/* Address Content */}
      {hasAddress ? (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              data-testid="address-name"
              className="font-semibold text-moon-text text-base"
            >
              {address.name}
            </span>
            <span
              data-testid="address-phone"
              className="text-moon-text-muted text-sm"
            >
              {maskPhoneNumber(address.mobile)}
            </span>
          </div>
          <p
            data-testid="address-detail"
            className="mt-1 text-sm text-moon-text-muted line-clamp-2"
          >
            {address.areaName} {address.detailAddress}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-2">
          <Plus className="w-4 h-4 text-moon-pink" />
          <span className="text-moon-text font-medium">添加收货地址</span>
        </div>
      )}

      {/* Chevron Icon */}
      <div className="flex-shrink-0">
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
}

export default AddressCard;

