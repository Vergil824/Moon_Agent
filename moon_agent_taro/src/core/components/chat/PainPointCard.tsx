import { View, Text, Image } from '@tarojs/components';

/**
 * Props for PainPointCard component
 */
export interface PainPointCardProps {
  /** Card title (e.g., "钢圈戳腋下") */
  title: string;
  /** Image source url (e.g., STATIC_IMAGES.painPoints.wirePoking) */
  imageSrc: string;
  /** Whether the card is currently selected */
  selected: boolean;
  /** Toggle handler for multiselect */
  onToggle: () => void;
}

/**
 * PainPointCard - A card component for pain point selection (multiselect grid)
 * Aligned with moon-agent/components/chat/PainPointCard.tsx
 *
 * Features:
 * - Visual feedback for selected/unselected states
 * - Purple theme (#8B5CF6) for selected state
 * - Grid layout: icon top, title center, checkmark bottom
 */
export function PainPointCard({
  title,
  imageSrc,
  selected,
  onToggle,
}: PainPointCardProps) {
  return (
    <View
      className={`pain-point-card ${selected ? 'pain-point-card-selected' : ''}`}
      onClick={onToggle}
    >
      {/* Icon - enlarged for better visibility */}
      <View className='relative shrink-0 w-16 h-16'>
        <Image src={imageSrc} mode='aspectFit' className='w-full h-full' />
      </View>

      {/* Title */}
      <Text className='text-base font-medium text-gray-800 text-center leading-5'>
        {title}
      </Text>

      {/* Checkmark when selected */}
      {selected && (
        <Text className='text-sm text-moon-purple font-semibold'>✓</Text>
      )}
    </View>
  );
}
