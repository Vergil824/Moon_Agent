/**
 * CartSkeleton - Skeleton loading state for cart page
 * Migrated from moon-agent/components/cart/CartSkeleton.tsx for Taro
 */

import { View } from '@tarojs/components';

export function CartSkeleton() {
  return (
    <View className='space-y-3'>
      {/* Address Bar Skeleton */}
      <View className='p-3 bg-white/60 backdrop-blur border border-white/50 rounded-[14px] animate-pulse'>
        <View className='flex items-center gap-2'>
          <View className='w-4 h-4 bg-gray-200 rounded' />
          <View className='h-4 w-40 bg-gray-200 rounded' />
          <View className='ml-auto w-4 h-4 bg-gray-200 rounded' />
        </View>
      </View>

      {/* Store Section Skeleton */}
      <View className='bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse'>
        {/* Store Header */}
        <View className='flex items-center gap-2 px-4 py-3 border-b border-gray-100'>
          <View className='w-5 h-5 bg-gray-200 rounded' />
          <View className='h-5 w-24 bg-gray-200 rounded' />
        </View>

        {/* Cart Items */}
        {[1, 2].map((i) => (
          <View
            key={i}
            className='flex gap-3 p-4 border-b border-gray-50 last:border-b-0'
          >
            {/* Checkbox placeholder */}
            <View className='w-5 h-5 bg-gray-200 rounded mt-1' />
            {/* Product image placeholder */}
            <View className='w-20 h-20 bg-gray-200 rounded-lg shrink-0' />
            {/* Product info */}
            <View className='flex-1 min-w-0 space-y-2'>
              <View className='h-4 w-full bg-gray-200 rounded' />
              <View className='h-3 w-20 bg-gray-200 rounded' />
              <View className='flex items-center justify-between mt-3'>
                <View className='h-5 w-16 bg-gray-200 rounded' />
                <View className='h-8 w-24 bg-gray-200 rounded-full' />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Another store section skeleton */}
      <View className='bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse'>
        <View className='flex items-center gap-2 px-4 py-3 border-b border-gray-100'>
          <View className='w-5 h-5 bg-gray-200 rounded' />
          <View className='h-5 w-20 bg-gray-200 rounded' />
        </View>
        <View className='flex gap-3 p-4'>
          <View className='w-5 h-5 bg-gray-200 rounded mt-1' />
          <View className='w-20 h-20 bg-gray-200 rounded-lg shrink-0' />
          <View className='flex-1 min-w-0 space-y-2'>
            <View className='h-4 w-3/4 bg-gray-200 rounded' />
            <View className='h-3 w-16 bg-gray-200 rounded' />
            <View className='flex items-center justify-between mt-3'>
              <View className='h-5 w-14 bg-gray-200 rounded' />
              <View className='h-8 w-24 bg-gray-200 rounded-full' />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CartSkeleton;
