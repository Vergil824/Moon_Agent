import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { STATIC_IMAGES } from '@core/imageUrls';
import { PainPointCard } from './PainPointCard';
import type { StateComponentProps } from './types';

/**
 * Pain point option definition
 */
type PainPoint = {
  id: string;
  title: string;
  imageSrc: string;
};

/**
 * Pain point options data
 * Using CDN image URLs
 */
const PAIN_POINTS: PainPoint[] = [
  {
    id: 'wire_poking',
    title: '钢圈戳腋下',
    imageSrc: STATIC_IMAGES.painPoints.wirePoking,
  },
  {
    id: 'cup_slipping',
    title: '疯狂跑杯',
    imageSrc: STATIC_IMAGES.painPoints.cupSlipping,
  },
  {
    id: 'quad_boob',
    title: '压胸/四个胸',
    imageSrc: STATIC_IMAGES.painPoints.quadBoob,
  },
  {
    id: 'gaping_cup',
    title: '上半截空杯',
    imageSrc: STATIC_IMAGES.painPoints.gapingCup,
  },
  {
    id: 'strap_issues',
    title: '肩带勒肉/滑落',
    imageSrc: STATIC_IMAGES.painPoints.strapIssues,
  },
];

/**
 * PainPointGrid - Pain point multiselect grid component
 * Aligned with moon-agent/components/chat/PainPointGrid.tsx
 *
 * Features:
 * - Multiselect grid (2 columns on mobile)
 * - Purple theme for selected state
 * - Selected count header
 * - Confirm button
 * - Allows 0 or multiple selections
 */
export function PainPointGrid({ onSelect }: StateComponentProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      onSelect('我没有特别的内衣问题');
      return;
    }

    const selectedTitles = selectedIds
      .map((id) => PAIN_POINTS.find((p) => p.id === id)?.title)
      .filter(Boolean)
      .join('、');

    onSelect(`我有${selectedTitles}的问题`);
  };

  return (
    <View className='bg-white rounded-3xl shadow-lg px-5 py-6 w-full animate-slide-up'>
      {/* Selected count header */}
      <View className='flex items-center gap-1 text-base text-gray-700 mb-5'>
        <Text>已选择</Text>
        <Text className='text-moon-pink font-bold text-lg'>{selectedIds.length}</Text>
        <Text>个痛点</Text>
      </View>

      {/* Grid - 2 columns with proper spacing */}
      <View className='grid grid-cols-2 gap-4'>
        {PAIN_POINTS.map((point) => (
          <PainPointCard
            key={point.id}
            title={point.title}
            imageSrc={point.imageSrc}
            selected={selectedIds.includes(point.id)}
            onToggle={() => handleToggle(point.id)}
          />
        ))}
      </View>

      {/* Confirm button with spacing */}
      <View className='mt-8'>
        <Button
          type='primary'
          block
          onClick={handleConfirm}
          className='h-14 rounded-xl font-bold text-lg'
          style={{ background: '#8B5CF6' }}
        >
          确认痛点
        </Button>
      </View>
    </View>
  );
}
