import { View, Text } from '@tarojs/components';

/**
 * StreamingIndicator component - Shows during streaming response
 * Aligned with moon-agent streaming UI patterns
 *
 * Features:
 * - Top banner indicating streaming in progress
 * - Subtle animation
 * - Auto-dismisses when streaming completes
 */
export function StreamingIndicator() {
  return (
    <View
      className='fixed top-0 left-0 right-0 z-40 animate-fade-in'
      style={{
        paddingTop: 'max(4px, env(safe-area-inset-top))',
      }}
    >
      <View className='mx-4 px-4 py-2 rounded-b-xl bg-white/90 backdrop-blur-sm shadow-sm border-x border-b border-purple-100'>
        <View className='flex items-center justify-center gap-2'>
          {/* Pulsing dot */}
          <View
            className='w-2 h-2 rounded-full bg-moon-purple'
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <Text className='text-sm text-moon-purple font-medium'>
            正在生成回复...
          </Text>
        </View>
      </View>
    </View>
  );
}
