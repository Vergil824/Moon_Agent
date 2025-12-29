"use client";

import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { maskPhoneNumber, formatFullAddress, type Address } from "@/lib/address/addressApi";

/**
 * AddressListItem - Single address item with dual hot zones
 * Story 5.9: AC 2 - Address item interaction design
 *
 * Dual Hot Zone Design:
 * - Hot Zone A (main area): In manage mode -> edit; In select mode -> select & return
 * - Hot Zone B (edit icon): Always navigates to edit form
 */

type AddressListItemProps = {
  address: Address;
  mode?: "manage" | "select";
  onMainClick?: () => void;
  onEditClick?: () => void;
};

export function AddressListItem({
  address,
  mode = "manage",
  onMainClick,
  onEditClick,
}: AddressListItemProps) {
  const handleMainClick = () => {
    onMainClick?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering main click
    onEditClick?.();
  };

  return (
    <div
      data-testid={`address-item-${address.id}`}
      className={cn(
        "relative p-4 bg-white rounded-xl border transition-all",
        "border-gray-100 hover:border-gray-200",
        mode === "select" && "cursor-pointer"
      )}
    >
      {/* Hot Zone A: Main clickable area */}
      <button
        data-testid={`address-main-zone-${address.id}`}
        onClick={handleMainClick}
        className="w-full text-left pr-10"
      >
        {/* Name, Phone, Default Badge Row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-gray-900">{address.name}</span>
          <span className="text-gray-500 text-sm">
            {maskPhoneNumber(address.mobile)}
          </span>
          {address.defaultStatus && (
            <span
              data-testid={`address-default-badge-${address.id}`}
              className="ml-auto px-2 py-0.5 text-xs font-medium text-[#8b5cf6] bg-[#faf5ff] rounded"
            >
              默认
            </span>
          )}
        </div>

        {/* Full Address */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {formatFullAddress(address)}
        </p>
      </button>

      {/* Hot Zone B: Edit icon (always visible, always links to edit) */}
      <button
        data-testid={`address-edit-btn-${address.id}`}
        onClick={handleEditClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-gray-400 hover:text-[#8b5cf6] transition-colors"
        aria-label="编辑地址"
      >
        <Pencil className="size-4" />
      </button>
    </div>
  );
}

export default AddressListItem;

