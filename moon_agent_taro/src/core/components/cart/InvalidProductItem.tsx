/**
 * InvalidProductItem - Invalid/expired cart item component
 * Migrated from moon-agent/components/cart/InvalidProductItem.tsx for Taro
 *
 * Requirements:
 * - Grayed out appearance (opacity reduced)
 * - No checkbox (not selectable)
 * - "已失效" label or reason text
 * - Delete button for removal
 * - Product info displayed but dimmed
 */

import { View, Text, Image } from '@tarojs/components';
import { Delete } from '@taroify/icons';
import {
  type CartItem,
  getSkuPropertiesDisplay,
  getProductImageUrl,
} from '@core/cart/cartApi';

type InvalidProductItemProps = {
  item: CartItem;
  reason?: string;
  onDelete: () => void;
};

export function InvalidProductItem({
  item,
  reason = '已失效',
  onDelete,
}: InvalidProductItemProps) {
  const imageUrl = getProductImageUrl(item);
  const propertiesDisplay = getSkuPropertiesDisplay(item.sku.properties);

  return (
    <View className='flex gap-3 py-3 opacity-60'>
      {/* Invalid Label (replaces checkbox) */}
      <View className='flex items-start pt-10'>
        <View className='px-1.5 py-0.5 bg-gray-200 rounded'>
          <Text className='text-[10px] text-gray-500'>{reason}</Text>
        </View>
      </View>

      {/* Product Image */}
      <View className='relative w-24 h-24 bg-gray-100 rounded-[10px] overflow-hidden shrink-0 grayscale'>
        <Image
          src={imageUrl || '/placeholder-product.png'}
          className='w-full h-full object-cover'
          mode='aspectFill'
        />
      </View>

      {/* Product Details */}
      <View className='flex-1 min-w-0 flex flex-col justify-between'>
        {/* Top Section: Name, Properties */}
        <View className='space-y-1'>
          {/* Product Name */}
          <Text className='text-sm font-medium text-gray-500 leading-tight line-clamp-1'>
            {item.spu.name}
          </Text>

          {/* SKU Properties */}
          {propertiesDisplay && (
            <View className='inline-block px-1.5 py-0.5 bg-gray-100 rounded'>
              <Text className='text-xs text-gray-400'>{propertiesDisplay}</Text>
            </View>
          )}
        </View>

        {/* Bottom Section: Price and Delete */}
        <View className='flex items-end justify-between mt-2'>
          {/* Price (strikethrough) */}
          <Text className='text-sm text-gray-400 line-through'>
            ¥{(item.sku.price / 100).toFixed(0)}
          </Text>

          {/* Delete Button */}
          <View
            className='flex items-center gap-1 px-2 py-1 text-gray-500 active:text-red-500'
            onClick={onDelete}
          >
            <Delete size={14} />
            <Text className='text-xs'>删除</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * InvalidProductsSection - Container for all invalid items
 */
type InvalidProductsSectionProps = {
  items: CartItem[];
  onDeleteItem: (itemId: number) => void;
  onClearAll: () => void;
};

export function InvalidProductsSection({
  items,
  onDeleteItem,
  onClearAll,
}: InvalidProductsSectionProps) {
  if (items.length === 0) return null;

  return (
    <View className='bg-white/60 backdrop-blur border border-white/50 rounded-[14px] shadow-sm overflow-hidden'>
      {/* Section Header */}
      <View className='flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-100'>
        <Text className='text-sm text-gray-500'>失效商品 ({items.length})</Text>
        <View onClick={onClearAll}>
          <Text className='text-xs text-moon-pink active:text-moon-pink/80'>
            清空失效商品
          </Text>
        </View>
      </View>

      {/* Invalid Items */}
      <View className='px-3 divide-y divide-gray-100'>
        {items.map((item) => (
          <InvalidProductItem
            key={item.id}
            item={item}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

export default InvalidProductItem;
