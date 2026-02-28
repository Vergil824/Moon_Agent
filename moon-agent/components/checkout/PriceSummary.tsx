"use client";

import { type SettlementPrice } from "@/lib/order/orderApi";
import { formatPrice } from "@/lib/order/orderApi";

/**
 * PriceSummary - Order price breakdown
 * Story 4.4: Task 5 - Price summary display
 *
 * Requirements per AC 1:
 * - Display total price, shipping fee, final amount
 * - Final amount in pink accent color #EC4899
 */

type PriceSummaryProps = {
  price: SettlementPrice;
};

export function PriceSummary({ price }: PriceSummaryProps) {
  // Helper to check if a price value should be shown
  const hasDiscount = typeof price.discountPrice === "number" && price.discountPrice > 0;
  const hasCoupon = typeof price.couponPrice === "number" && price.couponPrice > 0;
  const hasPoints = typeof price.pointPrice === "number" && price.pointPrice > 0;
  const hasVip = typeof price.vipPrice === "number" && price.vipPrice > 0;

  return (
    <div data-testid="price-summary" className="bg-white rounded-2xl p-4 space-y-2">
      {/* Item Total */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-moon-text-muted">商品总额</span>
        <span className="text-sm text-moon-text">¥{formatPrice(price.totalPrice)}</span>
      </div>

      {/* Shipping Fee */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-moon-text-muted">运费</span>
        <span className="text-sm text-moon-text">
          {price.deliveryPrice === 0 ? "顺丰包邮" : `¥${formatPrice(price.deliveryPrice)}`}
        </span>
      </div>

      {/* Discount (if any) */}
      {hasDiscount ? (
        <div className="flex justify-between items-center">
          <span className="text-sm text-moon-text-muted">优惠</span>
          <span className="text-sm text-[#EC4899]">-¥{formatPrice(price.discountPrice)}</span>
        </div>
      ) : null}

      {/* Coupon Discount (if any) */}
      {hasCoupon ? (
        <div className="flex justify-between items-center">
          <span className="text-sm text-moon-text-muted">优惠券</span>
          <span className="text-sm text-[#EC4899]">-¥{formatPrice(price.couponPrice!)}</span>
        </div>
      ) : null}

      {/* Points Discount (if any) */}
      {hasPoints ? (
        <div className="flex justify-between items-center">
          <span className="text-sm text-moon-text-muted">积分抵扣</span>
          <span className="text-sm text-[#EC4899]">-¥{formatPrice(price.pointPrice!)}</span>
        </div>
      ) : null}

      {/* VIP Discount (if any) */}
      {hasVip ? (
        <div className="flex justify-between items-center">
          <span className="text-sm text-moon-text-muted">会员优惠</span>
          <span className="text-sm text-[#EC4899]">-¥{formatPrice(price.vipPrice!)}</span>
        </div>
      ) : null}

      {/* Divider */}
      <div className="border-t border-gray-100 pt-2 mt-2">
        {/* Pay Price */}
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-moon-text">实付款</span>
          <span
            data-testid="pay-price"
            className="text-xl font-bold text-[#EC4899]"
          >
            ¥{formatPrice(price.payPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PriceSummary;

