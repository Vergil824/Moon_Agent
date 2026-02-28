/**
 * PriceSummary - Order price breakdown
 * Migrated from moon-agent/components/checkout/PriceSummary.tsx for Taro
 *
 * Requirements:
 * - Display total price, shipping fee, final amount
 * - Final amount in pink accent color #EC4899
 */

import { View, Text } from '@tarojs/components';
import { type SettlementPrice, formatOrderPrice } from '@core/order/orderApi';

type PriceSummaryProps = {
  price: SettlementPrice;
};

export function PriceSummary({ price }: PriceSummaryProps) {
  // Helper to check if a price value should be shown
  const hasDiscount =
    typeof price.discountPrice === 'number' && price.discountPrice > 0;
  const hasCoupon =
    typeof price.couponPrice === 'number' && price.couponPrice > 0;
  const hasPoints =
    typeof price.pointPrice === 'number' && price.pointPrice > 0;
  const hasVip = typeof price.vipPrice === 'number' && price.vipPrice > 0;

  return (
    <View className='bg-white rounded-2xl p-4 space-y-2'>
      {/* Item Total */}
      <View className='flex justify-between items-center'>
        <Text className='text-sm text-moon-text-muted'>商品总额</Text>
        <Text className='text-sm text-moon-text'>
          ¥{formatOrderPrice(price.totalPrice)}
        </Text>
      </View>

      {/* Shipping Fee */}
      <View className='flex justify-between items-center'>
        <Text className='text-sm text-moon-text-muted'>运费</Text>
        <Text className='text-sm text-moon-text'>
          {price.deliveryPrice === 0
            ? '顺丰包邮'
            : `¥${formatOrderPrice(price.deliveryPrice)}`}
        </Text>
      </View>

      {/* Discount (if any) */}
      {hasDiscount && (
        <View className='flex justify-between items-center'>
          <Text className='text-sm text-moon-text-muted'>优惠</Text>
          <Text className='text-sm text-moon-pink'>
            -¥{formatOrderPrice(price.discountPrice)}
          </Text>
        </View>
      )}

      {/* Coupon Discount (if any) */}
      {hasCoupon && (
        <View className='flex justify-between items-center'>
          <Text className='text-sm text-moon-text-muted'>优惠券</Text>
          <Text className='text-sm text-moon-pink'>
            -¥{formatOrderPrice(price.couponPrice!)}
          </Text>
        </View>
      )}

      {/* Points Discount (if any) */}
      {hasPoints && (
        <View className='flex justify-between items-center'>
          <Text className='text-sm text-moon-text-muted'>积分抵扣</Text>
          <Text className='text-sm text-moon-pink'>
            -¥{formatOrderPrice(price.pointPrice!)}
          </Text>
        </View>
      )}

      {/* VIP Discount (if any) */}
      {hasVip && (
        <View className='flex justify-between items-center'>
          <Text className='text-sm text-moon-text-muted'>会员优惠</Text>
          <Text className='text-sm text-moon-pink'>
            -¥{formatOrderPrice(price.vipPrice!)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View className='border-t border-gray-100 pt-2 mt-2'>
        {/* Pay Price */}
        <View className='flex justify-between items-center'>
          <Text className='text-base font-semibold text-moon-text'>实付款</Text>
          <Text className='text-xl font-bold text-moon-pink'>
            ¥{formatOrderPrice(price.payPrice)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default PriceSummary;
