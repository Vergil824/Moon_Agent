import { useState, useCallback } from 'react';
import { View, Textarea } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { MaterialIcons } from 'taro-icons';

/**
 * ChatInput component - Input area for chat messages
 * Aligned with moon-agent/app/chat/page.tsx ChatInput
 *
 * Features:
 * - Left: voice button (gradient circle)
 * - Center: multi-line TextArea with auto-height
 * - Right: send button (shows different icons based on input state)
 * - Keyboard handling for weapp
 */
interface ChatInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isReplying?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isReplying = false,
  placeholder = '输入消息...',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInput = useCallback((e: { detail: { value: string } }) => {
    setValue(e.detail.value);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
    }
  }, [value, disabled, onSend]);

  const hasContent = value.trim().length > 0;

  return (
    <View
      className='fixed left-0 right-0 px-4'
      style={{
        bottom: 'calc(56px + 8px + env(safe-area-inset-bottom))', // 8px gap above BottomNav
      }}
    >
      <View className='flex items-center gap-3'>
        {/* Voice button */}
        <View
          className='shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]'
          style={{
            background: 'linear-gradient(180deg, #8B5CF6 0%, #7C3AED 100%)',
          }}
        >
          <MaterialIcons name='mic' size={20} color='#ffffff' />
        </View>

        {/* Input area */}
        <View className='flex-1 min-w-0 relative'>
          <Textarea
            value={value}
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxlength={500}
            autoHeight
            className={`w-full box-border px-4 py-3 bg-white rounded-full text-base text-gray-800 border transition-colors shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] ${
              isFocused ? 'border-moon-purple/40' : 'border-transparent'
            } ${disabled ? 'opacity-50' : ''}`}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
            }}
            placeholderClass='text-gray-500'
          />
        </View>

        {/* Send / More button */}
        <View className='shrink-0'>
          {isReplying ? (
            <View
              className='w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)]'
              onClick={onStop}
            >
              <MaterialIcons name='stop' size={20} color='#ef4444' />
            </View>
          ) : hasContent ? (
            <Button
              type='primary'
              size='small'
              disabled={disabled}
              onClick={handleSend}
              className='w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)]'
              style={{
                background: disabled ? '#C4B5FD' : '#8B5CF6',
                minWidth: '48px',
              }}
            >
              <MaterialIcons name='send' size={20} color='#ffffff' />
            </Button>
          ) : (
            <View className='w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)]'>
              <MaterialIcons name='photo-camera' size={20} color='#9CA3AF' />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
