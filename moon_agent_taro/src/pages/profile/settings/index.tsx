/**
 * Settings Page - Main settings menu
 * Migrated from moon-agent/app/profile/settings/page.tsx for Taro
 *
 * Features:
 * - Navigation to edit profile
 * - Logout functionality
 */

import { useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ArrowLeft, ArrowRight } from '@taroify/icons';
import { MaterialIcons } from 'taro-icons';
import { useLogout } from '@core/user';

export default function SettingsPage() {
  const logoutMutation = useLogout();

  // Handle back navigation
  const handleBack = useCallback(() => {
    Taro.navigateBack();
  }, []);

  // Navigate to edit profile
  const handleEditProfile = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/profile/settings/edit-profile/index',
    });
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          logoutMutation.mutate();
        }
      },
    });
  }, [logoutMutation]);

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient'>
      {/* Header */}
      <View className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-transparent'>
        <View
          className='w-10 h-10 flex items-center justify-center -ml-2'
          onClick={handleBack}
        >
          <ArrowLeft size={20} className='text-gray-800' />
        </View>
        <Text className='text-lg font-semibold text-moon-text flex-1 text-center -ml-10'>
          设置
        </Text>
      </View>

      {/* Content */}
      <View className='flex-1 px-4 py-4 space-y-4'>
        {/* Account Section */}
        <View className='bg-white rounded-2xl overflow-hidden shadow-sm'>
          {/* Edit Profile */}
          <View
            className='flex items-center justify-between px-4 py-4 active:bg-gray-50'
            onClick={handleEditProfile}
          >
            <View className='flex items-center gap-3'>
              <MaterialIcons name='account_circle' size={20} color='#8b5cf6' />
              <Text className='text-base text-moon-text'>修改个人信息</Text>
            </View>
            <ArrowRight size={20} className='text-gray-300' />
          </View>
        </View>

        {/* Logout Button */}
        <View
          className={`bg-white rounded-2xl px-4 py-4 shadow-sm active:bg-red-50 ${
            logoutMutation.isPending ? 'opacity-50' : ''
          }`}
          onClick={!logoutMutation.isPending ? handleLogout : undefined}
        >
          <View className='flex items-center justify-center gap-2'>
            <MaterialIcons name='exit_to_app' size={20} color='#ef4444' />
            <Text className='text-base text-red-500'>
              {logoutMutation.isPending ? '退出中...' : '退出登录'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
