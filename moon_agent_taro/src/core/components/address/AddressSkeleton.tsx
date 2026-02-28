/**
 * AddressSkeleton - Loading skeleton for address list
 * Migrated from moon-agent/components/address/AddressSkeleton.tsx for Taro
 */

import { View } from "@tarojs/components";

export function AddressSkeleton() {
  return (
    <View className="space-y-3">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="p-4 bg-white rounded-xl border border-gray-100 animate-pulse"
        >
          {/* Name and phone row */}
          <View className="flex items-center gap-2 mb-2">
            <View className="h-5 w-16 bg-gray-200 rounded" />
            <View className="h-4 w-24 bg-gray-200 rounded" />
          </View>
          {/* Address row */}
          <View className="h-4 w-full bg-gray-200 rounded" />
          <View className="h-4 w-3/4 bg-gray-200 rounded mt-1" />
        </View>
      ))}
    </View>
  );
}

export default AddressSkeleton;
