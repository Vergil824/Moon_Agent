/**
 * CartProductItem - Valid cart item component
 * Migrated from moon-agent/components/cart/CartProductItem.tsx for Taro
 *
 * Requirements per Figma design:
 * - Left: Checkbox for selection
 * - Product image: 96x96px rounded
 * - Product name: truncated if too long
 * - SKU properties display (e.g., "云朵白; M")
 * - Promotion tags (optional)
 * - Price: pink #EC4899
 * - Quantity selector on the right
 */

import { View, Text, Image } from '@tarojs/components';
import { Checkbox } from '@nutui/nutui-react-taro';
import { MaterialIcons } from 'taro-icons';
import {
  type CartItem,
  getSkuPropertiesDisplay,
  getProductImageUrl,
  formatPrice,
} from '@core/cart/cartApi';
import { QuantitySelector } from './QuantitySelector';

type CartProductItemProps = {
  item: CartItem;
  onSelect: (selected: boolean) => void;
  onQuantityChange: (count: number) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export function CartProductItem({
  item,
  onSelect,
  onQuantityChange,
  onDelete,
  disabled = false,
}: CartProductItemProps) {
  const imageUrl = getProductImageUrl(item);
  const propertiesDisplay = getSkuPropertiesDisplay(item.sku.properties);
  const hasPromotion = item.promotions && item.promotions.length > 0;

  return (
    <View className='flex gap-3 py-3'>
      {/* Left: Checkbox - Aligned with image center, using CSS class for pink theme */}
      <View className='flex items-center h-24 cart-checkbox-pink'>
        <Checkbox
          checked={item.selected}
          onChange={(checked) => onSelect(checked)}
          disabled={disabled}
          shape='round'
        />
      </View>

      {/* Product Image */}
      <View className='relative w-24 h-24 bg-gray-50 rounded-[10px] overflow-hidden shrink-0'>
        <Image
          src={imageUrl || '/placeholder-product.png'}
          className='w-full h-full object-cover'
          mode='aspectFill'
        />
      </View>

      {/* Product Details */}
      <View className='flex-1 min-w-0 flex flex-col justify-between h-24'>
        {/* Top Section: Name, Properties, Tags */}
        <View className='space-y-1'>
          {/* Product Name */}
          <Text className='text-sm font-medium text-moon-text leading-tight line-clamp-1'>
            {item.spu.name}
          </Text>

          {/* SKU Properties */}
          {propertiesDisplay && (
            <View className='inline-block px-1.5 py-0.5 bg-gray-50 rounded'>
              <Text className='text-xs text-moon-text-muted'>
                {propertiesDisplay}
              </Text>
            </View>
          )}

          {/* Promotion Tags */}
          {hasPromotion && (
            <View className='flex flex-wrap gap-1'>
              {item.promotions!.slice(0, 2).map((promo) => (
                <View
                  key={promo.id}
                  className='px-1 py-0.5 border border-moon-pink rounded-md'
                >
                  <Text className='text-[10px] text-moon-pink'>
                    {promo.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Section: Price and Quantity Selector */}
        <View className='flex items-end justify-between'>
          {/* Price */}
          <View className='flex items-baseline gap-0.5'>
            <Text className='text-xs font-bold text-moon-pink'>¥</Text>
            <Text className='text-lg font-bold text-moon-pink leading-none'>
              {formatPrice(item.sku.price)}
            </Text>
          </View>

          {/* Quantity Selector with delete swipe action */}
          <View className='flex items-center gap-4'>
            <QuantitySelector
              value={item.count}
              max={item.sku.stock}
              onChange={onQuantityChange}
              disabled={disabled}
            />
            {/* Delete Button - Trash icon */}
            <View
              className='w-[30px] h-[30px] flex items-center justify-center active:bg-red-50 rounded-lg '
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              hoverClass='bg-gray-100'
            >
              <MaterialIcons name='delete' size={22} color='#9ca3af' />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CartProductItem;
