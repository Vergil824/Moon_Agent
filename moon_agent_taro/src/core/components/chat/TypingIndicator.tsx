import { View } from '@tarojs/components';
import { BotAvatar } from './BotAvatar';

/**
 * Typing indicator with animated dots
 * Aligned with moon-agent/components/chat/ChatInterface.tsx TypingIndicator
 *
 * Features:
 * - Avatar + white bubble with 3 bouncing dots
 * - CSS keyframes animation (weapp compatible)
 */
export function TypingIndicator() {
  return (
    <View className='flex items-start gap-2 animate-fade-in'>
      <BotAvatar />
      <View className='bg-white text-gray-800 rounded-tl-[6px] rounded-tr-3xl rounded-br-3xl rounded-bl-3xl shadow-md px-4 py-3'>
        <View className='flex gap-1'>
          {/* Dot 1 */}
          <View
            className='w-2 h-2 bg-gray-400 rounded-full'
            style={{
              animation: 'typing-bounce 0.6s ease-in-out infinite',
            }}
          />
          {/* Dot 2 */}
          <View
            className='w-2 h-2 bg-gray-400 rounded-full'
            style={{
              animation: 'typing-bounce 0.6s ease-in-out infinite 0.2s',
            }}
          />
          {/* Dot 3 */}
          <View
            className='w-2 h-2 bg-gray-400 rounded-full'
            style={{
              animation: 'typing-bounce 0.6s ease-in-out infinite 0.4s',
            }}
          />
        </View>
      </View>
    </View>
  );
}
