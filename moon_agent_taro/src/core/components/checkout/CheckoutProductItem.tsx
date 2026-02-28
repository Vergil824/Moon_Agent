/**
 * CheckoutProductItem - Product item in checkout
 * Migrated from moon-agent/components/checkout/CheckoutProductItem.tsx for Taro
 *
 * Requirements:
 * - Display SKU image, name, properties (color/size), price, quantity
 * - Simplified version for checkout (no quantity controls)
 */

import { View, Text, Image } from '@tarojs/components';
import {
  type SettlementItem,
  formatOrderPrice,
  getSettlementSkuDisplay,
} from '@core/order/orderApi';

type CheckoutProductItemProps = {
  item: SettlementItem;
};

export function CheckoutProductItem({ item }: CheckoutProductItemProps) {
  const propertiesDisplay = getSettlementSkuDisplay(item.properties);

  return (
    <View className='flex gap-3 py-3 border-b border-gray-100 last:border-0'>
      {/* Product Image */}
      <View className='shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100'>
        <Image
          src={item.picUrl || '/assets/statics/placeholder.png'}
          className='w-full h-full object-cover'
          mode='aspectFill'
        />
      </View>

      {/* Product Info */}
      <View className='flex-1 min-w-0 flex flex-col justify-between py-0.5'>
        <View>
          {/* Product Name */}
          <Text className='text-sm font-medium text-moon-text line-clamp-2'>
            {item.spuName}
          </Text>

          {/* SKU Properties */}
          {propertiesDisplay && (
            <Text className='mt-1 text-xs text-moon-text-muted'>
              {propertiesDisplay}
            </Text>
          )}
        </View>

        {/* Price and Quantity */}
        <View className='flex items-center justify-between mt-2'>
          <Text className='text-base font-semibold text-moon-pink'>
            ¥{formatOrderPrice(item.price)}
          </Text>
          <Text className='text-sm text-moon-text-muted'>x{item.count}</Text>
        </View>
      </View>
    </View>
  );
}

export default CheckoutProductItem;
