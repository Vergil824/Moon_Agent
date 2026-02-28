/**
 * CheckoutSkeleton - Loading skeleton for checkout page
 * Migrated from moon-agent/components/checkout/CheckoutSkeleton.tsx for Taro
 *
 * Shows placeholder content while settlement data is loading
 */

import { View } from '@tarojs/components';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <View className={`animate-pulse bg-gray-200 rounded ${className ?? ''}`} />
  );
}

export function CheckoutSkeleton() {
  return (
    <>
      {/* Address Card Skeleton */}
      <View className='bg-white rounded-2xl p-4 mb-3'>
        <View className='flex items-center gap-3'>
          <SkeletonBlock className='w-5 h-5 rounded-full shrink-0' />
          <View className='flex-1 space-y-2'>
            <View className='flex items-center gap-2'>
              <SkeletonBlock className='h-5 w-16' />
              <SkeletonBlock className='h-5 w-28' />
            </View>
            <SkeletonBlock className='h-4 w-full max-w-[280px]' />
          </View>
          <SkeletonBlock className='w-5 h-5 rounded-full shrink-0' />
        </View>
      </View>

      {/* Product List Skeleton */}
      <View className='bg-white rounded-2xl p-4 mb-3'>
        <View className='flex items-center gap-2 mb-3'>
          <SkeletonBlock className='w-5 h-5 rounded-full' />
          <SkeletonBlock className='h-5 w-24' />
        </View>

        {/* Product Items */}
        {[1, 2].map((i) => (
          <View
            key={i}
            className='flex gap-3 py-3 border-b border-gray-100 last:border-0'
          >
            <SkeletonBlock className='w-20 h-20 rounded-lg shrink-0' />
            <View className='flex-1 space-y-2'>
              <SkeletonBlock className='h-4 w-3/4' />
              <SkeletonBlock className='h-3 w-1/2' />
              <View className='flex justify-between items-center mt-2'>
                <SkeletonBlock className='h-5 w-16' />
                <SkeletonBlock className='h-4 w-8' />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Order Remark Skeleton */}
      <View className='bg-white rounded-2xl p-4 mb-3'>
        <View className='flex items-center gap-2'>
          <SkeletonBlock className='h-4 w-16' />
          <SkeletonBlock className='h-10 flex-1 rounded-lg' />
        </View>
      </View>

      {/* Payment Method Skeleton */}
      <View className='bg-white rounded-2xl p-4 mb-3'>
        <SkeletonBlock className='h-5 w-20 mb-3' />
        <View className='flex gap-3'>
          <SkeletonBlock className='h-14 flex-1 rounded-xl' />
          <SkeletonBlock className='h-14 flex-1 rounded-xl' />
        </View>
      </View>

      {/* Price Summary Skeleton */}
      <View className='bg-white rounded-2xl p-4 mb-3'>
        <View className='flex justify-between mb-2'>
          <SkeletonBlock className='h-4 w-16' />
          <SkeletonBlock className='h-4 w-20' />
        </View>
        <View className='flex justify-between mb-2'>
          <SkeletonBlock className='h-4 w-12' />
          <SkeletonBlock className='h-4 w-16' />
        </View>
        <View className='flex justify-between pt-2 border-t border-gray-100'>
          <SkeletonBlock className='h-5 w-12' />
          <SkeletonBlock className='h-5 w-24' />
        </View>
      </View>
    </>
  );
}

export default CheckoutSkeleton;
