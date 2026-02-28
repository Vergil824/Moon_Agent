"use client";

import Image from "next/image";
import { type SettlementItem } from "@/lib/order/orderApi";
import { formatPrice, getSettlementSkuDisplay } from "@/lib/order/orderApi";

/**
 * CheckoutProductItem - Product item in checkout
 * Story 4.4: Task 3.2 - Checkout product item component
 *
 * Requirements per AC 1:
 * - Display SKU image, name, properties (color/size), price, quantity
 * - Simplified version for checkout (no quantity controls)
 */

type CheckoutProductItemProps = {
  item: SettlementItem;
};

export function CheckoutProductItem({ item }: CheckoutProductItemProps) {
  const propertiesDisplay = getSettlementSkuDisplay(item.properties);

  return (
    <div
      data-testid="checkout-product-item"
      className="flex gap-3 py-3 border-b border-gray-100 last:border-0"
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={item.picUrl || "/assets/statics/placeholder.png"}
          alt={item.spuName}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Product Name */}
          <h3
            data-testid="product-name"
            className="text-sm font-medium text-moon-text line-clamp-2"
          >
            {item.spuName}
          </h3>

          {/* SKU Properties */}
          {propertiesDisplay && (
            <p
              data-testid="product-properties"
              className="mt-1 text-xs text-moon-text-muted"
            >
              {propertiesDisplay}
            </p>
          )}
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mt-2">
          <span
            data-testid="product-price"
            className="text-base font-semibold text-moon-pink"
          >
            ¥{formatPrice(item.price)}
          </span>
          <span
            data-testid="product-count"
            className="text-sm text-moon-text-muted"
          >
            x{item.count}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CheckoutProductItem;

