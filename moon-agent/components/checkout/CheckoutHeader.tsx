"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * CheckoutHeader - Checkout page header
 * Story 4.4: Task 1 - Confirmation order page header
 *
 * Requirements:
 * - White background with bottom shadow
 * - Title: "确认订单"
 * - Left back button to navigate back to cart
 * - Font: PingFang SC Semibold 18px
 * - Text color: #1f2937
 *
 * Note: Using router.push('/cart') instead of router.back() to ensure
 * consistent navigation back to cart, even after address selection flow
 */

export function CheckoutHeader() {
  const router = useRouter();

  const handleBack = () => {
    // Navigate directly to cart instead of using browser history
    // This ensures consistent behavior after address selection flow
    router.push("/cart");
  };

  return (
    <header
      data-testid="checkout-header"
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e7eb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
    >
      <div className="relative flex h-[52px] items-center justify-center px-3">
        {/* Back Button */}
        <button
          data-testid="checkout-back-btn"
          onClick={handleBack}
          className="absolute left-3 flex items-center justify-center size-8 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="返回"
        >
          <ChevronLeft className="size-6 text-moon-text" />
        </button>

        {/* Title */}
        <h1 className="text-lg font-semibold text-moon-text">确认订单</h1>
      </div>
    </header>
  );
}

export default CheckoutHeader;

