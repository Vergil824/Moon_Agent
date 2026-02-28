"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Trash2 } from "lucide-react";
import Image from "next/image";
import { QuantitySelector } from "./QuantitySelector";
import {
  type CartItem,
  getSkuPropertiesDisplay,
  getProductImageUrl,
} from "@/lib/cart/cartApi";

/**
 * CartProductItem - Valid cart item component
 * Story 4.3: AC 2 - Product list item with checkbox, image, details, price, and quantity
 *
 * Requirements per Figma design (node-id=151:247):
 * - Left: Checkbox for selection
 * - Product image: 96x96px rounded
 * - Product name: truncated if too long
 * - SKU properties display (e.g., "云朵白; M")
 * - Promotion tags (optional)
 * - Price: pink #EC4899, original price strikethrough
 * - Quantity selector on the right
 */

type CartProductItemProps = {
  item: CartItem;
  onSelect: (selected: boolean) => void;
  onQuantityChange: (count: number) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

/**
 * Format price from cents to display string
 */
function formatPrice(cents: number): string {
  const yuan = cents / 100;
  return yuan.toFixed(yuan % 1 === 0 ? 0 : 2);
}

export function CartProductItem({
  item,
  onSelect,
  onQuantityChange,
  onDelete,
  disabled = false,
}: CartProductItemProps) {
  const imageUrl = getProductImageUrl(item);
  const propertiesDisplay = getSkuPropertiesDisplay(item.sku.properties);
  const hasPromotion = item.promotions && item.promotions.length > 0;

  return (
    <div
      data-testid="cart-product-item"
      className="flex gap-3 py-3"
    >
      {/* Left: Checkbox */}
      <div className="flex items-start pt-10">
        <Checkbox.Root
          checked={item.selected}
          onCheckedChange={(checked) => onSelect(checked === true)}
          disabled={disabled}
          className="size-4 rounded border border-[rgba(0,0,0,0.1)] bg-[#f3f3f5] shadow-sm flex items-center justify-center data-[state=checked]:bg-moon-pink data-[state=checked]:border-moon-pink disabled:opacity-50 transition-colors shrink-0"
        >
          <Checkbox.Indicator>
            <Check className="size-3 text-white" strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </div>

      {/* Product Image */}
      <div className="relative size-24 bg-[#f9fafb] rounded-[10px] overflow-hidden shrink-0">
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
        {/* Top Section: Name, Properties, Tags */}
        <div className="space-y-1 relative pr-6">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-moon-text leading-tight line-clamp-1">
            {item.spu.name}
          </h3>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            disabled={disabled}
            className="absolute -right-1 -top-1 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            aria-label="删除商品"
          >
            <Trash2 className="size-4" />
          </button>

          {/* SKU Properties */}
          {propertiesDisplay && (
            <div className="inline-block px-1.5 py-0.5 bg-[#f9fafb] rounded text-xs text-moon-text-muted">
              {propertiesDisplay}
            </div>
          )}

          {/* Promotion Tags */}
          {hasPromotion && (
            <div className="flex flex-wrap gap-1">
              {item.promotions!.slice(0, 2).map((promo) => (
                <span
                  key={promo.id}
                  className="px-1 py-0.5 text-[10px] text-moon-pink border border-moon-pink rounded-md"
                >
                  {promo.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Price and Quantity */}
        <div className="flex items-end justify-between mt-2">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-moon-pink">¥</span>
            <span className="text-lg font-bold text-moon-pink leading-none">
              {formatPrice(item.sku.price)}
            </span>
          </div>

          {/* Quantity Selector */}
          <QuantitySelector
            value={item.count}
            max={item.sku.stock}
            onChange={onQuantityChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

export default CartProductItem;

