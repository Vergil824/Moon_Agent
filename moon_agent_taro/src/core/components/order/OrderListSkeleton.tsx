/**
 * OrderListSkeleton - Loading placeholder for order list
 * Migrated from moon-agent/components/order/OrderListSkeleton.tsx for Taro
 */

import { View } from "@tarojs/components";

interface OrderListSkeletonProps {
  count?: number;
}

export function OrderListSkeleton({ count = 3 }: OrderListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className={`bg-white rounded-xl p-4 animate-pulse ${i > 0 ? 'mt-3' : ''}`}>
          {/* Header skeleton */}
          <View className="flex items-center justify-between">
            <View className="h-4 w-40 bg-gray-200 rounded" />
            <View className="h-4 w-12 bg-gray-200 rounded" />
          </View>

          {/* Item skeleton */}
          <View className="flex gap-3 mt-3">
            <View className="w-16 h-16 bg-gray-200 rounded-lg shrink-0" />
            <View className="flex-1">
              <View className="h-4 w-full bg-gray-200 rounded" />
              <View className="h-3 w-20 bg-gray-200 rounded mt-2" />
              <View className="flex justify-between mt-2">
                <View className="h-4 w-16 bg-gray-200 rounded" />
                <View className="h-4 w-8 bg-gray-200 rounded" />
              </View>
            </View>
          </View>

          {/* Footer skeleton */}
          <View className="pt-3 mt-3 border-t border-gray-100">
            <View className="flex justify-end">
              <View className="h-5 w-32 bg-gray-200 rounded" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export default OrderListSkeleton;
