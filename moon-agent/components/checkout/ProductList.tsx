"use client";

import { Store } from "lucide-react";
import { type SettlementItem } from "@/lib/order/orderApi";
import { CheckoutProductItem } from "./CheckoutProductItem";

/**
 * ProductList - Product list section in checkout
 * Story 4.4: Task 3 - Product list with store header
 *
 * Requirements:
 * - Display store name with icon
 * - List all products with their details
 */

type ProductListProps = {
  items: SettlementItem[];
  storeName?: string;
};

export function ProductList({
  items,
  storeName = "满月Moon优选",
}: ProductListProps) {
  if (items.length === 0) return null;

  return (
    <div data-testid="checkout-product-list" className="bg-white rounded-2xl p-4">
      {/* Store Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Store className="w-4 h-4 text-moon-purple" />
        <span className="font-medium text-moon-text">{storeName}</span>
      </div>

      {/* Product Items */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <CheckoutProductItem key={item.skuId} item={item} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;

