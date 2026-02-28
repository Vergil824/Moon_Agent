import { View } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import type { StateComponentProps } from './types';

export type WelcomeOption = '准备好了！' | '有点紧张';

const options: WelcomeOption[] = ['准备好了！', '有点紧张'];

/**
 * WelcomeOptions component for initial user interaction
 * Aligned with moon-agent/components/chat/WelcomeOptions.tsx
 *
 * Features:
 * - Two outline pill buttons
 * - Position: aligned after avatar (ml-10)
 * - NutUI Button with outline + round
 */
export function WelcomeOptions({ onSelect }: StateComponentProps) {
  return (
    <View className='flex flex-wrap gap-2 mt-2 ml-10 animate-slide-up'>
      {options.map((option) => (
        <Button
          key={option}
          type='default'
          fill='outline'
          size='small'
          onClick={() => onSelect(option)}
          className='welcome-option-btn'
        >
          {option}
        </Button>
      ))}
    </View>
  );
}
