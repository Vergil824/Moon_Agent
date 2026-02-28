/**
 * Profile Page - Personal center with user info and navigation menu
 * Migrated from moon-agent/app/profile/page.tsx
 *
 * Features:
 * - Display user avatar, nickname and ID
 * - Menu navigation to orders, settings, addresses, etc.
 * - Skeleton loading state to avoid CLS
 * - Redirect to login if not authenticated
 * - Gradient background from pink to purple
 * - Version number at bottom
 */

import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useUserInfo } from '@core/user';
import { authClient } from '@core/auth';
import {
  ProfileHeader,
  ProfileMenu,
  ProfileSkeleton,
} from '../../core/components/profile';
import { BottomNav } from '../../core/components/layout';

export default function ProfilePage() {
  const { data: user, isLoading, error, refetch } = useUserInfo();

  useDidShow(() => {
    // Hide tab bar to use custom BottomNav
    Taro.hideTabBar({ animation: false });

    // Check authentication status
    const isAuthenticated = authClient.isAuthenticated();
    if (!isAuthenticated) {
      Taro.reLaunch({ url: '/pages/welcome/index' });
    }
  });

  // Gradient background style
  const backgroundStyle = {
    background:
      'linear-gradient(180deg, rgb(255, 245, 247) 0%, rgb(250, 245, 255) 100%)',
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <View
        className='flex flex-col min-h-screen pb-20'
        style={backgroundStyle}
      >
        <ProfileSkeleton />
        <BottomNav activeTab='profile' />
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View
        className='flex flex-col flex-1 min-h-screen items-center justify-center px-4 pb-20'
        style={backgroundStyle}
      >
        <View className='text-center'>
          <Text className='text-gray-500 mb-4 block'>加载失败，请稍后重试</Text>
          <View
            className='px-4 py-2 bg-[#8b5cf6] text-white rounded-lg active:bg-[#7c3aed] transition-colors inline-block'
            onClick={() => refetch()}
          >
            <Text className='text-white'>重新加载</Text>
          </View>
        </View>
        <BottomNav activeTab='profile' />
      </View>
    );
  }

  // Handle unauthenticated or no user data state
  if (!user) {
    return (
      <View
        className='flex flex-col min-h-screen pb-20'
        style={backgroundStyle}
      >
        <ProfileSkeleton />
        <BottomNav activeTab='profile' />
      </View>
    );
  }

  return (
    <View className='flex flex-col min-h-screen pb-20' style={backgroundStyle}>
      <ProfileHeader user={user} />
      <ProfileMenu />

      {/* Version number at bottom */}
      <View className='flex-1 flex items-end justify-center pb-8 mt-8'>
        <Text className='text-sm text-gray-400'>满月Moon v1.0.0</Text>
      </View>

      <BottomNav activeTab='profile' />
    </View>
  );
}
