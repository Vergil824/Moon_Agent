/**
 * CheckoutHeader - Checkout page header
 * Migrated from moon-agent/components/checkout/CheckoutHeader.tsx for Taro
 *
 * Requirements:
 * - White background with bottom shadow
 * - Title: "确认订单"
 * - Left back button to navigate back to cart
 * - Top safe area for mini program status bar (44px default on iOS)
 */

import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MaterialIcons } from 'taro-icons';
import { useState, useEffect } from 'react';

export function CheckoutHeader() {
  const [statusBarHeight, setStatusBarHeight] = useState(44); // Default iOS height

  useEffect(() => {
    // Get system info to determine status bar height
    const systemInfo = Taro.getSystemInfoSync();
    if (systemInfo?.statusBarHeight) {
      setStatusBarHeight(systemInfo.statusBarHeight);
    }
  }, []);

  const handleBack = () => {
    // Navigate back to cart using switchTab for tabBar page
    Taro.switchTab({
      url: '/pages/cart/index',
    });
  };

  return (
    <View className='fixed top-0 left-0 right-0 z-50 bg-white shadow-sm'>
      {/* Safe area for mini program status bar */}
      <View style={{ height: `${statusBarHeight}px` }} />
      
      {/* Header content - 44px height to match native navigation bar */}
      <View className='relative flex h-[44px] items-center justify-center px-4'>
        {/* Back Button - Larger touch area */}
        <View
          className='absolute left-2 flex items-center justify-center w-10 h-10 rounded-full active:bg-gray-100'
          onClick={handleBack}
        >
          <MaterialIcons name='arrow-back' size={24} color='#1f2937' />
        </View>

        {/* Title */}
        <Text className='text-lg font-semibold text-moon-text'>确认订单</Text>
      </View>
    </View>
  );
}

export default CheckoutHeader;
