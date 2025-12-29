"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import {
  type CartItem,
  getSkuPropertiesDisplay,
  getProductImageUrl,
} from "@/lib/cart/cartApi";

/**
 * InvalidProductItem - Invalid/expired cart item component
 * Story 4.3: AC 2 - Invalid items with grayed out style
 *
 * Requirements:
 * - Grayed out appearance (opacity reduced)
 * - No checkbox (not selectable)
 * - "已失效" label or reason text
 * - Delete button for removal
 * - Product info displayed but dimmed
 */

type InvalidProductItemProps = {
  item: CartItem;
  reason?: string;
  onDelete: () => void;
};

export function InvalidProductItem({
  item,
  reason = "已失效",
  onDelete,
}: InvalidProductItemProps) {
  const imageUrl = getProductImageUrl(item);
  const propertiesDisplay = getSkuPropertiesDisplay(item.sku.properties);

  return (
    <div
      data-testid="invalid-product-item"
      className="flex gap-3 py-3 opacity-60"
    >
      {/* Invalid Label (replaces checkbox) */}
      <div className="flex items-start pt-10">
        <span className="px-1.5 py-0.5 text-[10px] text-gray-500 bg-gray-200 rounded">
          {reason}
        </span>
      </div>

      {/* Product Image */}
      <div className="relative size-24 bg-gray-100 rounded-[10px] overflow-hidden shrink-0 grayscale">
        <Image
          src={imageUrl || "/placeholder-product.png"}
          alt={item.spu.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Top Section: Name, Properties */}
        <div className="space-y-1">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-500 leading-tight line-clamp-1">
            {item.spu.name}
          </h3>

          {/* SKU Properties */}
          {propertiesDisplay && (
            <div className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-400">
              {propertiesDisplay}
            </div>
          )}
        </div>

        {/* Bottom Section: Price and Delete */}
        <div className="flex items-end justify-between mt-2">
          {/* Price (strikethrough) */}
          <div className="flex items-baseline">
            <span className="text-sm text-gray-400 line-through">
              ¥{(item.sku.price / 100).toFixed(0)}
            </span>
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-moon-destructive transition-colors"
            aria-label={`删除 ${item.spu.name}`}
          >
            <Trash2 className="size-3.5" />
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * InvalidProductsSection - Container for all invalid items
 */
type InvalidProductsSectionProps = {
  items: CartItem[];
  onDeleteItem: (itemId: number) => void;
  onClearAll: () => void;
};

export function InvalidProductsSection({
  items,
  onDeleteItem,
  onClearAll,
}: InvalidProductsSectionProps) {
  if (items.length === 0) return null;

  return (
    <div
      data-testid="invalid-products-section"
      className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-[14px] shadow-sm overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-100">
        <span className="text-sm text-gray-500">
          失效商品 ({items.length})
        </span>
        <button
          onClick={onClearAll}
          className="text-xs text-moon-pink hover:text-moon-pink/80 transition-colors"
        >
          清空失效商品
        </button>
      </div>

      {/* Invalid Items */}
      <div className="px-3 divide-y divide-gray-100">
        {items.map((item) => (
          <InvalidProductItem
            key={item.id}
            item={item}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default InvalidProductItem;

