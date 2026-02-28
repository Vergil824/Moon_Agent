/**
 * CartStoreSection - Store grouping component for cart items
 * Migrated from moon-agent/components/cart/CartStoreSection.tsx for Taro
 *
 * Requirements per Figma design:
 * - Glass morphism card container
 * - Store header with checkbox and store name
 * - List of CartProductItem components
 * - Store selection affects all items in the store
 */

import { View, Text } from '@tarojs/components';
import { Checkbox } from '@nutui/nutui-react-taro';
import { ArrowRight } from '@taroify/icons';
import { type CartStore } from '@core/cart/cartApi';
import { CartProductItem } from './CartProductItem';

type CartStoreSectionProps = {
  store: CartStore;
  onStoreSelect: (selected: boolean) => void;
  onItemSelect: (itemId: number, selected: boolean) => void;
  onItemQuantityChange: (itemId: number, count: number) => void;
  onItemDelete?: (itemId: number) => void;
  disabled?: boolean;
};

export function CartStoreSection({
  store,
  onStoreSelect,
  onItemSelect,
  onItemQuantityChange,
  onItemDelete,
  disabled = false,
}: CartStoreSectionProps) {
  // Check if all items in the store are selected
  const allSelected =
    store.items.length > 0 && store.items.every((item) => item.selected);

  return (
    <View className='bg-white/80 backdrop-blur border border-white/50 rounded-[14px] shadow-sm overflow-hidden'>
      {/* Store Header */}
      <View className='flex items-center gap-3 px-3 pt-3 pb-2 cart-checkbox-pink'>
        <Checkbox
          checked={allSelected}
          onChange={onStoreSelect}
          disabled={disabled}
          shape='round'
        />

        <View className='flex items-center gap-1'>
          <Text className='text-sm font-semibold text-moon-text'>
            {store.name}
          </Text>
          <ArrowRight size={12} className='text-moon-text-muted' />
        </View>
      </View>

      {/* Product Items */}
      <View className='px-3 divide-y divide-gray-100'>
        {store.items.map((item) => (
          <CartProductItem
            key={item.id}
            item={item}
            onSelect={(selected) => onItemSelect(item.id, selected)}
            onQuantityChange={(count) => onItemQuantityChange(item.id, count)}
            onDelete={() => onItemDelete?.(item.id)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

export default CartStoreSection;
