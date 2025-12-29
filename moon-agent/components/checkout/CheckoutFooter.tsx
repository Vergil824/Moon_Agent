"use client";

import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/order/orderApi";

/**
 * CheckoutFooter - Bottom checkout bar with payment button
 * Story 4.4: Task 5 - Checkout footer with payment button
 *
 * Requirements per AC 3:
 * - Fixed at bottom above safe area
 * - Show total amount in pink
 * - "立即支付" button with gradient background
 */

type CheckoutFooterProps = {
  totalAmount: number; // In cents
  itemCount: number;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export function CheckoutFooter({
  totalAmount,
  itemCount,
  onSubmit,
  isLoading = false,
  disabled = false,
}: CheckoutFooterProps) {
  return (
    <footer
      data-testid="checkout-footer"
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-[#f3f4f6] z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-between h-[48px] px-3">
        {/* Price Summary */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-moon-text-muted">共</span>
          <span className="text-sm text-moon-text font-medium">{itemCount}</span>
          <span className="text-sm text-moon-text-muted">件，合计:</span>
          <span className="text-lg font-bold text-moon-pink">
            ¥{formatPrice(totalAmount)}
          </span>
        </div>

        {/* Submit Button */}
        <button
          data-testid="checkout-submit-btn"
          onClick={onSubmit}
          disabled={disabled || isLoading}
          className="h-9 px-8 rounded-full text-sm font-medium text-white shadow-[0px_3px_15px_0px_rgba(251,113,133,0.25)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          style={{
            background: disabled || isLoading
              ? "#d1d5db"
              : "linear-gradient(105deg, #DA3568 9.87%, #FB7185 92.16%)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin inline" />
              提交中...
            </>
          ) : (
            "立即支付"
          )}
        </button>
      </div>
    </footer>
  );
}

export default CheckoutFooter;

