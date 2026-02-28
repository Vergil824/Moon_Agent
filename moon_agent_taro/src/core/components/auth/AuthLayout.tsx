/**
 * AuthLayout - Shared auth background layout for welcome and login pages.
 *
 * Features:
 * - Background image (stable across page transitions via browser/mini-program cache)
 * - Blur overlay effect
 * - Cross-platform support (H5, WeChat Mini Program, RN)
 *
 * Note: In Taro, each page is independent. The "no reload" effect is achieved
 * via image caching by the browser/mini-program runtime.
 */
import { View, Image } from '@tarojs/components';
import type { FC, ReactNode } from 'react';
import { STATIC_IMAGES } from '@core/imageUrls';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <View className='fixed inset-0 w-screen h-screen overflow-hidden'>
      {/* Gradient background (fallback) */}
      <View className='absolute inset-0 bg-[linear-gradient(180deg,#1a1a2e_0%,#16213e_30%,#0f3460_60%,#1a1a2e_100%)]' />

      {/* Background Image */}
      <Image
        className='absolute inset-0 w-full h-full'
        src={STATIC_IMAGES.welcomeBg}
        mode='aspectFill'
        lazyLoad={false}
      />

      {/* Overlay (no blur) */}
      <View className='absolute inset-0 bg-black/20' />

      {/* Content */}
      <View className='absolute inset-0'>{children}</View>
    </View>
  );
};

export default AuthLayout;
