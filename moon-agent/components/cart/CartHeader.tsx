"use client";

/**
 * CartHeader - Shopping cart page header
 * Story 4.3: AC 1 - Header with cart title and item count
 *
 * Requirements per Figma design (node-id=151:318):
 * - White background with bottom shadow
 * - Title: "购物车" + item count in parentheses
 * - Font: PingFang SC Semibold 18px
 * - Text color: #1f2937
 */

type CartHeaderProps = {
  itemCount: number;
};

export function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <header
      data-testid="cart-header"
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e7eb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
    >
      <div className="flex h-[52px] items-center justify-center px-3">
        <h1 className="text-lg font-semibold text-moon-text">
          <span>购物车</span>
          <span className="font-normal">({itemCount})</span>
        </h1>
      </div>
    </header>
  );
}

export default CartHeader;

