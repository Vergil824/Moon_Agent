"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

/**
 * CartFooter - Bottom action bar for cart page
 * Story 4.3: AC 3 - Bottom operation bar
 *
 * Requirements per Figma design (node-id=152:2):
 * - Left: "全选" checkbox
 * - Center: "合计: ¥[总金额]" with pink price
 * - Right: "结算" button with brand gradient
 * - Background: white with top border and shadow
 * - Fixed at bottom above BottomNav
 */

type CartFooterProps = {
  isAllSelected: boolean;
  totalAmount: number; // Amount in cents (分)
  selectedCount: number;
  onSelectAllChange: (checked: boolean) => void;
  onCheckout: () => void;
  disabled?: boolean;
};

/**
 * Format price from cents to yuan with proper display
 */
function formatPrice(cents: number): string {
  const yuan = cents / 100;
  return yuan.toFixed(yuan % 1 === 0 ? 0 : 2);
}

export function CartFooter({
  isAllSelected,
  totalAmount,
  selectedCount,
  onSelectAllChange,
  onCheckout,
  disabled = false,
}: CartFooterProps) {
  const hasSelection = selectedCount > 0;

  return (
    <footer
      data-testid="cart-footer"
      className="fixed bottom-[56px] left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-t border-[#f3f4f6] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-between h-[48px] px-3">
        {/* Left: Select All */}
        <div className="flex items-center gap-2">
          <Checkbox.Root
            checked={isAllSelected}
            onCheckedChange={(checked) => onSelectAllChange(checked === true)}
            className="size-4 rounded border border-[rgba(0,0,0,0.1)] bg-[#f3f3f5] shadow-sm flex items-center justify-center data-[state=checked]:bg-moon-pink data-[state=checked]:border-moon-pink transition-colors"
          >
            <Checkbox.Indicator>
              <Check className="size-3 text-white" strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span className="text-sm text-moon-text-muted">全选</span>
        </div>

        {/* Right: Total + Checkout button */}
        <div className="flex items-center gap-3">
          {/* Total Amount */}
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-moon-text">合计:</span>
            <span className="text-lg font-bold text-moon-pink">
              ¥{formatPrice(totalAmount)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={disabled || !hasSelection}
            className="h-9 px-8 rounded-full text-sm font-medium text-white shadow-[0px_3px_15px_0px_rgba(251,113,133,0.25)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            style={{
              background: hasSelection && !disabled
                ? "linear-gradient(105deg, #DA3568 9.87%, #FB7185 92.16%)"
                : "#d1d5db",
            }}
          >
            结算{selectedCount > 0 ? `(${selectedCount})` : ""}
          </button>
        </div>
      </div>
    </footer>
  );
}

export default CartFooter;

