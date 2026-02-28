import { View, Text } from '@tarojs/components';

/**
 * DegradedHint component - Shows when connection is in degraded mode
 * Aligned with moon-agent degraded mode UI patterns
 *
 * Features:
 * - Warning banner at top
 * - Yellow/amber theme
 * - Non-blocking (user can continue)
 */
export function DegradedHint() {
  return (
    <View
      className='fixed top-0 left-0 right-0 z-50 px-4 py-2 animate-slide-down'
      style={{
        background: 'linear-gradient(90deg, #FEF3C7 0%, #FDE68A 100%)',
        paddingTop: 'max(8px, env(safe-area-inset-top))',
      }}
    >
      <View className='flex items-center justify-center gap-2'>
        <Text className='text-lg'>⚡</Text>
        <Text className='text-sm text-amber-800 font-medium'>
          网络不稳定，已切换到降级模式
        </Text>
      </View>
    </View>
  );
}
