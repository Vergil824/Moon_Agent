/**
 * OrderListItem - Single order card in order list
 * Migrated from moon-agent/components/order/OrderListItem.tsx for Taro
 *
 * Features:
 * - Order ID/number
 * - Status with color coding
 * - Pay price
 * - Item list with images and properties
 */

import { View, Text, Image } from '@tarojs/components';
import {
  type AppTradeOrderPageItem,
  ORDER_STATUS_MAP,
  formatOrderPrice,
} from '@core/order';

interface OrderListItemProps {
  order: AppTradeOrderPageItem;
  onClick?: () => void;
}

export function OrderListItem({ order, onClick }: OrderListItemProps) {
  const statusInfo = ORDER_STATUS_MAP[order.status] || {
    label: '未知',
    color: 'text-gray-500',
  };

  const handleClick = () => {
    onClick?.();
  };

  return (
    <View
      className='bg-white rounded-xl p-4 space-y-3 active:bg-gray-50'
      onClick={handleClick}
    >
      {/* Header: Order number and status */}
      <View className='flex items-center justify-between'>
        <Text className='text-sm text-moon-text-muted'>
          订单号: <Text className='text-moon-text font-mono'>{order.no}</Text>
        </Text>
        <Text className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </Text>
      </View>

      {/* Order Items */}
      <View className='space-y-2'>
        {order.items.map((item) => (
          <View key={item.id} className='flex gap-3'>
            {/* Item Image */}
            <View className='relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100'>
              {item.picUrl && item.picUrl.trim() !== '' ? (
                <Image
                  src={item.picUrl}
                  mode='aspectFill'
                  className='w-full h-full'
                />
              ) : (
                <View className='w-full h-full flex items-center justify-center'>
                  <Text className='text-moon-text-muted text-xs'>暂无图片</Text>
                </View>
              )}
            </View>

            {/* Item Info */}
            <View className='flex-1 min-w-0'>
              <Text className='text-sm text-moon-text line-clamp-2'>
                {item.spuName}
              </Text>
              {item.properties && item.properties.length > 0 && (
                <Text className='text-xs text-moon-text-muted mt-0.5 block'>
                  {item.properties.map((p) => p.valueName).join('; ')}
                </Text>
              )}
              <View className='flex items-center justify-between mt-1'>
                <Text className='text-sm text-moon-text'>
                  ¥{formatOrderPrice(item.price)}
                </Text>
                <Text className='text-xs text-moon-text-muted'>
                  x{item.count}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Footer: Total price */}
      <View className='pt-2 border-t border-gray-100'>
        <View className='flex items-center justify-end gap-1'>
          <Text className='text-sm text-moon-text-muted'>
            共{order.items.reduce((sum, item) => sum + item.count, 0)}件
          </Text>
          <Text className='text-sm text-moon-text'>实付</Text>
          <Text className='text-base font-semibold text-moon-purple'>
            ¥{formatOrderPrice(order.payPrice)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default OrderListItem;
