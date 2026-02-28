import { View, Text, Image } from '@tarojs/components';

/**
 * Props for SelectCard component
 */
export interface SelectCardProps {
  /** Card title (e.g., "圆盘型") */
  title: string;
  /** Card description (e.g., "底盘宽，分布均匀") */
  description: string;
  /** Image source url (e.g., STATIC_IMAGES.chestTypes.round) */
  imageSrc: string;
  /** Whether the card is currently selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
}

/**
 * SelectCard - A reusable selection card component for chest type selection
 * Aligned with moon-agent/components/chat/SelectCard.tsx
 *
 * Features:
 * - Visual feedback for selected/unselected states
 * - Purple border for selected state (no checkmark)
 * - Left image + right title/description layout
 */
export function SelectCard({
  title,
  description,
  imageSrc,
  selected,
  onClick,
}: SelectCardProps) {
  return (
    <View
      className={`select-card ${selected ? 'select-card-selected' : ''}`}
      onClick={onClick}
    >
      {/* Image/Icon */}
      <View className='relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-50'>
        <Image
          src={imageSrc}
          mode='aspectFit'
          className='w-full h-full'
        />
      </View>

      {/* Text content */}
      <View className='flex-1'>
        <Text
          className={`text-lg font-semibold leading-7 ${
            selected ? 'text-moon-purple' : 'text-gray-800'
          }`}
        >
          {title}
        </Text>
        <Text className='text-base text-gray-500 leading-6 block mt-1'>{description}</Text>
      </View>
    </View>
  );
}
