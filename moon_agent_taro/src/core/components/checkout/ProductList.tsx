/**
 * ProductList - Product list section in checkout
 * Migrated from moon-agent/components/checkout/ProductList.tsx for Taro
 *
 * Requirements:
 * - Display store name with icon
 * - List all products with their details
 */

import { View, Text } from '@tarojs/components';
import { Shop } from '@taroify/icons';
import { type SettlementItem } from '@core/order/orderApi';
import { CheckoutProductItem } from './CheckoutProductItem';

type ProductListProps = {
  items: SettlementItem[];
  storeName?: string;
};

export function ProductList({
  items,
  storeName = '满月Moon优选',
}: ProductListProps) {
  if (items.length === 0) return null;

  return (
    <View className='bg-white rounded-2xl p-4'>
      {/* Store Header */}
      <View className='flex items-center gap-2 pb-2 border-b border-gray-100'>
        <Shop size={16} className='text-moon-purple' />
        <Text className='font-medium text-moon-text'>{storeName}</Text>
      </View>

      {/* Product Items */}
      <View>
        {items.map((item) => (
          <CheckoutProductItem key={item.skuId} item={item} />
        ))}
      </View>
    </View>
  );
}

export default ProductList;
