import { View } from '@tarojs/components';

/**
 * BotAvatar component - displays the 撑撑姐 avatar
 * Aligned with moon-agent/components/chat/ChatInterface.tsx BotAvatar
 *
 * Features:
 * - Pink-purple gradient ring avatar
 * - Size 8 (32px) with shadow
 * - Gradient ring + white inner circle
 */
export function BotAvatar() {
  return (
    <View
      className='relative shrink-0 w-8 h-8 rounded-full shadow-lg overflow-hidden'
      style={{
        background: 'linear-gradient(135deg, #FFF5F7 0%, #FAF5FF 100%)',
      }}
    >
      {/* Gradient ring layer */}
      <View
        className='absolute rounded-full opacity-30'
        style={{
          inset: '4px',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        }}
      />
      {/* White inner circle */}
      <View
        className='absolute bg-white rounded-full'
        style={{
          inset: '8px',
        }}
      />
    </View>
  );
}
