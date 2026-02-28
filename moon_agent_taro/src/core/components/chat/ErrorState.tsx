import { View, Text } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { Replay } from '@taroify/icons';

/**
 * ErrorState component - Error display with retry button
 * Aligned with moon-agent error handling patterns
 *
 * Features:
 * - Error message display
 * - Retry button (NutUI Button)
 * - Consistent styling with chat bubbles
 */
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className='flex flex-col items-center gap-3 py-4 animate-fade-in'>
      {/* Error icon */}
      <View className='w-12 h-12 rounded-full bg-red-50 flex items-center justify-center'>
        <Text className='text-2xl'>⚠️</Text>
      </View>

      {/* Error message */}
      <Text className='text-sm text-gray-600 text-center px-4'>{message}</Text>

      {/* Retry button */}
      {onRetry && (
        <Button
          type='primary'
          size='small'
          onClick={onRetry}
          className='px-6'
          style={{ background: '#8B5CF6' }}
        >
          <View className='flex items-center gap-2'>
            <Replay size={16} color='#fff' />
            <Text className='text-white'>重试</Text>
          </View>
        </Button>
      )}
    </View>
  );
}
