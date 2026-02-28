import { View, Text } from '@tarojs/components';
import { MaterialIcons } from 'taro-icons';

/**
 * NewMessageHint - Floating hint when new messages arrive while scrolled up
 *
 * Displays a "新消息" (New Messages) button that:
 * - Shows when user has scrolled up and new messages arrive (AC: 4)
 * - Clicking scrolls to bottom and resumes auto-follow (AC: 4)
 * - Positioned above the chat input area
 * - Uses solid background color for visibility
 * - Includes subtle pulse animation to indicate interactivity
 *
 * @see Story 3-4-streaming-message-rendering-chat-ui.md (AC: 4)
 */

interface NewMessageHintProps {
  /** Whether to show the hint */
  visible: boolean;
  /** Callback when hint is clicked */
  onClick: () => void;
}

export function NewMessageHint({ visible, onClick }: NewMessageHintProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      className='fixed bottom-[160px] left-1/2 -translate-x-1/2 z-50'
      onClick={onClick}
    >
      <View
        className='flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl active:scale-95 transition-transform'
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)',
          animation: 'pulse-subtle 2s ease-in-out infinite',
        }}
      >
        <View
          className='w-5 h-5 rounded-full bg-white/20 flex items-center justify-center'
        >
          <MaterialIcons name='keyboard-arrow-down' size={16} color='#fff' />
        </View>
        <Text className='text-sm text-white font-semibold'>有新消息</Text>
        <View
          className='w-2 h-2 rounded-full bg-white animate-ping'
          style={{ animationDuration: '1.5s' }}
        />
      </View>
    </View>
  );
}
