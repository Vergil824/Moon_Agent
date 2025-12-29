"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronRight } from "lucide-react";
import { CartProductItem } from "./CartProductItem";
import { type CartStore, type CartItem } from "@/lib/cart/cartApi";

/**
 * CartStoreSection - Store grouping component for cart items
 * Story 4.3: AC 2 - Store section with checkbox and product list
 *
 * Requirements per Figma design (node-id=151:237):
 * - Glass morphism card container
 * - Store header with checkbox and store name
 * - List of CartProductItem components
 * - Store selection affects all items in the store
 */

type CartStoreSectionProps = {
  store: CartStore;
  onStoreSelect: (selected: boolean) => void;
  onItemSelect: (itemId: number, selected: boolean) => void;
  onItemQuantityChange: (itemId: number, count: number) => void;
  onItemDelete?: (itemId: number) => void;
  disabled?: boolean;
};

export function CartStoreSection({
  store,
  onStoreSelect,
  onItemSelect,
  onItemQuantityChange,
  onItemDelete,
  disabled = false,
}: CartStoreSectionProps) {
  // Check if all items in the store are selected
  const allSelected = store.items.length > 0 && store.items.every((item) => item.selected);
  const someSelected = store.items.some((item) => item.selected) && !allSelected;

  return (
    <div
      data-testid="cart-store-section"
      className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden"
    >
      {/* Store Header */}
      <div className="flex items-center gap-3 px-3 pt-3 pb-2">
        <Checkbox.Root
          checked={allSelected}
          onCheckedChange={(checked) => onStoreSelect(checked === true)}
          disabled={disabled}
          className={`size-4 rounded border shadow-sm flex items-center justify-center transition-colors shrink-0 ${
            allSelected
              ? "bg-moon-pink border-moon-pink"
              : someSelected
              ? "bg-moon-pink/30 border-moon-pink"
              : "bg-[#f3f3f5] border-[rgba(0,0,0,0.1)]"
          } disabled:opacity-50`}
        >
          <Checkbox.Indicator>
            <Check className="size-3 text-white" strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>

        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-moon-text">
            {store.name}
          </span>
          <ChevronRight className="size-3 text-moon-text-muted" />
        </div>
      </div>

      {/* Product Items */}
      <div className="px-3 divide-y divide-gray-100">
        {store.items.map((item) => (
          <CartProductItem
            key={item.id}
            item={item}
            onSelect={(selected) => onItemSelect(item.id, selected)}
            onQuantityChange={(count) => onItemQuantityChange(item.id, count)}
            onDelete={() => onItemDelete?.(item.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

export default CartStoreSection;

