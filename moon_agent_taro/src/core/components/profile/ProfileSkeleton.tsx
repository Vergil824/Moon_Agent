/**
 * ProfileSkeleton - Loading placeholder for profile page
 * Migrated from moon-agent/components/profile/ProfileSkeleton.tsx
 *
 * Features:
 * - Skeleton for avatar and user info
 * - Skeleton for menu items
 * - Animated pulse effect
 */

import { View } from '@tarojs/components';

export default function ProfileSkeleton() {
  return (
    <View className='flex flex-col animate-pulse'>
      {/* Header Card Skeleton - Centered layout */}
      <View className='px-4 pt-6 pb-4'>
        <View className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-6 py-8 flex flex-col items-center'>
          {/* Avatar skeleton with gradient border effect */}
          <View className='w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-pink-200 p-[3px] mb-4'>
            <View className='w-full h-full rounded-full bg-gray-100' />
          </View>
          {/* Nickname skeleton - centered */}
          <View className='h-5 w-20 bg-gray-200 rounded mb-2' />
          {/* ID skeleton - centered */}
          <View className='h-4 w-28 bg-gray-200 rounded' />
        </View>
      </View>

      {/* Primary Menu Group Skeleton */}
      <View className='px-4 space-y-4'>
        <View className='bg-white rounded-2xl overflow-hidden shadow-sm'>
          {[1, 2, 3].map((i) => (
            <View key={`primary-${i}`}>
              <View className='flex items-center justify-between py-4 px-4'>
                <View className='flex items-center gap-3'>
                  <View className='w-5 h-5 bg-gray-200 rounded' />
                  <View className='h-4 w-20 bg-gray-200 rounded' />
                </View>
                <View className='w-5 h-5 bg-gray-200 rounded' />
              </View>
              {i < 3 && <View className='h-px bg-gray-100 mx-4' />}
            </View>
          ))}
        </View>

        {/* Secondary Menu Group Skeleton */}
        <View className='bg-white rounded-2xl overflow-hidden shadow-sm'>
          {[1, 2].map((i) => (
            <View key={`secondary-${i}`}>
              <View className='flex items-center justify-between py-4 px-4'>
                <View className='flex items-center gap-3'>
                  <View className='w-5 h-5 bg-gray-200 rounded' />
                  <View className='h-4 w-20 bg-gray-200 rounded' />
                </View>
                <View className='w-5 h-5 bg-gray-200 rounded' />
              </View>
              {i < 2 && <View className='h-px bg-gray-100 mx-4' />}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
