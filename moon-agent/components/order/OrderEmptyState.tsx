"use client";

import { ShoppingBag } from "lucide-react";

/**
 * OrderEmptyState - Empty state when no orders
 * Story 5.5: Empty state display
 */
export default function OrderEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <ShoppingBag className="size-10 text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-gray-700 mb-1">暂无订单</h3>
      <p className="text-sm text-gray-500 text-center">
        您还没有任何订单，快去选购心仪的商品吧
      </p>
    </div>
  );
}

