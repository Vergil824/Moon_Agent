import { useState } from 'react';
import { View } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { STATIC_IMAGES } from '@core/imageUrls';
import { SelectCard } from './SelectCard';
import type { StateComponentProps } from './types';

/**
 * Chest type definition
 */
type ChestType = {
  id: 'round' | 'spindle' | 'hemisphere';
  title: string;
  description: string;
  imageSrc: string;
};

/**
 * Chest type options data
 * Using CDN image URLs
 */
const CHEST_TYPES: ChestType[] = [
  {
    id: 'round',
    title: '圆盘型',
    description: '底盘宽，分布均匀',
    imageSrc: STATIC_IMAGES.chestTypes.round,
  },
  {
    id: 'spindle',
    title: '纺锤型',
    description: '底盘小，隆起高',
    imageSrc: STATIC_IMAGES.chestTypes.spindle,
  },
  {
    id: 'hemisphere',
    title: '半球型',
    description: '底盘中等，饱满均衡',
    imageSrc: STATIC_IMAGES.chestTypes.hemisphere,
  },
];

/**
 * ShapeSelection - Chest type selection panel component
 * Aligned with moon-agent/components/chat/ShapeSelection.tsx
 *
 * Features:
 * - Single selection logic
 * - Confirm button (disabled until selection made)
 * - Sends natural language message on confirm
 */
export function ShapeSelection({ onSelect }: StateComponentProps) {
  const [selectedType, setSelectedType] = useState<ChestType['id'] | null>(
    null
  );

  const handleConfirm = () => {
    if (!selectedType) return;

    const selectedChest = CHEST_TYPES.find((type) => type.id === selectedType);
    if (selectedChest) {
      onSelect(`我选择了${selectedChest.title}`);
    }
  };

  return (
    <View className='bg-white rounded-3xl shadow-lg px-5 py-6 w-full animate-slide-up'>
      {/* Selection cards */}
      <View className='flex flex-col gap-4'>
        {CHEST_TYPES.map((type) => (
          <SelectCard
            key={type.id}
            title={type.title}
            description={type.description}
            imageSrc={type.imageSrc}
            selected={selectedType === type.id}
            onClick={() => setSelectedType(type.id)}
          />
        ))}
      </View>

      {/* Confirm button with spacing */}
      <View className='mt-8'>
        <Button
          type='primary'
          block
          disabled={!selectedType}
          onClick={handleConfirm}
          className='h-14 rounded-xl font-bold text-lg'
          style={{
            background: selectedType ? '#8B5CF6' : '#C4B5FD',
            opacity: selectedType ? 1 : 0.5,
          }}
        >
          确认选择
        </Button>
      </View>
    </View>
  );
}
