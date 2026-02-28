/**
 * CartFooter - Bottom action bar for cart page
 * Migrated from moon-agent/components/cart/CartFooter.tsx for Taro
 *
 * Requirements per Figma design:
 * - Left: "全选" checkbox
 * - Center: "合计: ¥[总金额]" with pink price
 * - Right: "结算" button with brand gradient
 * - Background: white with top border
 * - Fixed at bottom above BottomNav
 */

import { View, Text } from '@tarojs/components';
import { Checkbox } from '@nutui/nutui-react-taro';
import { formatPrice } from '@core/cart/cartApi';

type CartFooterProps = {
  isAllSelected: boolean;
  totalAmount: number; // Amount in cents (分)
  selectedCount: number;
  onSelectAllChange: (checked: boolean) => void;
  onCheckout: () => void;
  disabled?: boolean;
};

export function CartFooter({
  isAllSelected,
  totalAmount,
  selectedCount,
  onSelectAllChange,
  onCheckout,
  disabled = false,
}: CartFooterProps) {
  const hasSelection = selectedCount > 0;

  // BottomNav height: h-12 (48px) + pt-2 (8px) + safe-area-inset-bottom
  // We need to sit above BottomNav, accounting for safe area
  return (
    <View
      className='fixed left-0 right-0 z-100 bg-white border-t border-gray-100'
      style={{
        // Position above BottomNav (56px) + safe area
        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <View className='flex items-center justify-between h-[68px] px-4'>
        {/* Left: Select All */}
        <View className='flex items-center gap-2 cart-checkbox-pink'>
          <Checkbox
            checked={isAllSelected}
            onChange={onSelectAllChange}
            shape='round'
          />
          <Text className='text-sm text-moon-text-muted'>全选</Text>
        </View>

        {/* Right: Total + Checkout button */}
        <View className='flex items-center gap-3'>
          {/* Total Amount */}
          <View className='flex items-baseline gap-1'>
            <Text className='text-sm text-moon-text'>合计:</Text>
            <Text className='text-lg font-bold text-moon-pink'>
              ¥{formatPrice(totalAmount)}
            </Text>
          </View>

          {/* Checkout Button */}
          <View
            className={`h-10 px-6 rounded-full flex items-center justify-center shadow-moon-pink ${
              hasSelection && !disabled
                ? 'bg-gradient-moon-primary'
                : 'bg-gray-300'
            }`}
            onClick={() => {
              if (hasSelection && !disabled) {
                onCheckout();
              }
            }}
          >
            <Text className='text-base font-medium text-white'>结算</Text>
            {selectedCount > 0 && (
              <Text className='text-lg font-bold text-white ml-0.5'>
                ({selectedCount})
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default CartFooter;
