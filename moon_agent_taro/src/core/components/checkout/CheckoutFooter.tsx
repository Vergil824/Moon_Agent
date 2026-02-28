/**
 * CheckoutFooter - Bottom checkout bar with payment button
 * Migrated from moon-agent/components/checkout/CheckoutFooter.tsx for Taro
 *
 * Per Figma (node-id=166:779):
 * - Fixed at bottom above safe area
 * - Left: Two-line layout (共X件, 总计: / ¥XXX.XX)
 * - Right: Large "立即支付" button with gradient
 */

import { View, Text } from "@tarojs/components";
import { formatOrderPrice } from "@core/order/orderApi";

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
  const isDisabled = disabled || isLoading;

  return (
    <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-[-4px_0px_6px_rgba(0,0,0,0.05)]">
      <View
        className="flex items-center justify-between px-4 py-3"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Price Summary - Two-line layout */}
        <View className="flex flex-col">
          <Text className="text-sm text-moon-text-muted">
            共{itemCount}件, 总计:
          </Text>
          <View className="flex items-baseline">
            <Text className="text-xs font-bold text-moon-pink">¥</Text>
            <Text className="text-2xl font-bold text-moon-pink">
              {formatOrderPrice(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Submit Button - Large rounded */}
        <View
          className={`h-12 px-12 rounded-full flex items-center justify-center ${
            isDisabled
              ? "bg-gray-300"
              : "bg-gradient-moon-primary shadow-[0px_3px_15px_rgba(251,113,133,0.25)]"
          }`}
          style={{
            background: isDisabled
              ? undefined
              : "linear-gradient(114deg, #DA3568 10%, #FB7185 92%)",
          }}
          onClick={() => {
            if (!isDisabled) {
              onSubmit();
            }
          }}
        >
          {isLoading ? (
            <Text className="text-lg font-semibold text-white">提交中...</Text>
          ) : (
            <Text className="text-lg font-semibold text-white">立即支付</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default CheckoutFooter;
