import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Slider } from '@tarojs/components';
import { Button, Popup, InputNumber } from '@nutui/nutui-react-taro';
import { Play, Cross, ArrowLeft, ArrowRight } from '@taroify/icons';
import Taro from '@tarojs/taro';
import { useChatStore } from '../../stores';
import type { StateComponentProps } from './types';

type DemoStep = 'lower' | 'upper';

// Validation constants aligned with AC requirements
const LOWER_BUST_MIN = 50;
const LOWER_BUST_MAX = 120;
const UPPER_BUST_MIN = 50;
const UPPER_BUST_MAX = 140;

const LOWER_BUST_TIPS: string[] = [
  '• 保持站立姿势，不要弯腰',
  '• 深呼气后再测量，确保数据准确',
  '• 软尺要保持水平，不要倾斜',
  '• 拉紧但不要勒进皮肤',
];

const UPPER_BUST_TIPS: string[] = [
  '• 弯腰90度，让胸部自然下垂',
  '• 测量胸部最高点，不是乳头位置',
  '• 软尺要绕过肩胛骨最突出处',
  '• 保持软尺水平不倾斜',
];

// TODO: Replace with actual images from Figma
// Export from Figma nodes 10:951 (lower bust) and 10:1122 (upper bust)
// Save to: src/assets/chat/lower_bust_demo.png and upper_bust_demo.png
// import LowerBustImg from '@/assets/chat/lower_bust_demo.png';
// import UpperBustImg from '@/assets/chat/upper_bust_demo.png';

/**
 * LowerBustIllustration - Placeholder for lower bust measurement illustration
 * WeChat Mini Program does not support inline SVG, so using View-based placeholder
 * TODO: Replace with Image component when assets are exported from Figma
 */
function LowerBustIllustration() {
  return (
    <View className='w-full h-full flex flex-col items-center justify-center'>
      {/* Placeholder silhouette using View */}
      <View className='relative w-[160px] h-[200px] flex flex-col items-center'>
        {/* Head */}
        <View className='w-[44px] h-[44px] rounded-full bg-gray-300' />
        {/* Body */}
        <View className='mt-2 w-[60px] h-[120px] bg-gray-300/75 rounded-t-[30px]' />
        {/* Measuring line indicator */}
        <View className='absolute top-[80px] left-0 right-0 flex items-center justify-center'>
          <View className='flex items-center gap-1'>
            <Text className='text-moon-purple text-xs'>←</Text>
            <View className='w-[100px] h-[2px] border-t-2 border-dashed border-moon-purple' />
            <Text className='text-moon-purple text-xs'>→</Text>
          </View>
        </View>
        {/* Label */}
        <Text className='absolute top-[95px] right-[-30px] text-moon-purple text-xs opacity-70'>
          下胸围
        </Text>
      </View>
    </View>
  );
}

/**
 * UpperBustIllustration - Placeholder for upper bust measurement illustration
 * WeChat Mini Program does not support inline SVG, so using View-based placeholder
 * TODO: Replace with Image component when assets are exported from Figma
 */
function UpperBustIllustration() {
  return (
    <View className='w-full h-full flex flex-col items-center justify-center'>
      {/* Placeholder silhouette using View - bent forward posture */}
      <View className='relative w-[180px] h-[200px] flex items-start justify-center'>
        {/* Head (positioned to show bending) */}
        <View className='absolute top-[20px] left-[40px] w-[40px] h-[40px] rounded-full bg-gray-300' />
        {/* Body (tilted) */}
        <View
          className='absolute top-[55px] left-[50px] w-[50px] h-[110px] bg-gray-300/75 rounded-t-[25px]'
          style={{ transform: 'rotate(15deg)' }}
        />
        {/* Measuring line indicator */}
        <View className='absolute top-[100px] left-[10px] right-[10px] flex items-center justify-center'>
          <View className='flex items-center gap-1'>
            <Text className='text-moon-pink text-xs'>←</Text>
            <View className='w-[110px] h-[2px] border-t-2 border-dashed border-moon-pink' />
            <Text className='text-moon-pink text-xs'>→</Text>
          </View>
        </View>
        {/* Label */}
        <Text className='absolute top-[115px] right-[0px] text-moon-pink text-xs opacity-90'>
          上胸围
        </Text>
      </View>
    </View>
  );
}

/**
 * MeasureDemoModal - Step-by-step measurement demonstration
 * Uses screen width percentage for responsive sizing
 */
function MeasureDemoModal({
  open,
  step,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  step: DemoStep;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const isLower = step === 'lower';
  const title = isLower ? '下胸围测量' : '上胸围测量';
  const subtitle = isLower
    ? '站直，深呼气，软尺水平绕胸部根部，拉紧贴合身体'
    : '身体前倾90度（弯腰），软尺水平绕过胸部最高点';
  const tips = isLower ? LOWER_BUST_TIPS : UPPER_BUST_TIPS;

  // Get screen dimensions for responsive modal sizing
  const systemInfo = Taro.getSystemInfoSync();
  const screenWidth = systemInfo.screenWidth;
  const screenHeight = systemInfo.screenHeight;
  // Use 92% of screen width and 85% of screen height for comfortable viewing
  const modalWidth = Math.min(screenWidth * 0.92, 400);
  const modalHeight = Math.min(screenHeight * 0.85, 800);

  return (
    <Popup
      visible={open}
      position='center'
      onClose={onClose}
      round
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        className='bg-white rounded-3xl overflow-hidden flex flex-col'
        style={{
          width: `${modalWidth}px`,
          height: `${modalHeight}px`,
        }}
      >
        {/* Header */}
        <View
          className='relative h-16 shrink-0 flex items-center justify-center'
          style={{
            background: 'linear-gradient(180deg, #8B5CF6 0%, #EC4899 100%)',
          }}
        >
          <Text className='text-white text-xl font-semibold'>测量演示</Text>
          <View
            className='absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center'
            onClick={onClose}
          >
            <Cross size={20} color='#fff' />
          </View>
        </View>

        {/* Body - flex-1 to fill remaining space */}
        <View className='px-5 pt-5 flex-1 overflow-auto'>
          <View className='text-center'>
            <Text className='text-moon-purple text-lg font-semibold'>
              {title}
            </Text>
            <Text className='mt-3 text-gray-500 text-base leading-6 block'>
              {subtitle}
            </Text>
          </View>

          {/* Illustration area - flexible height based on modal size */}
          <View
            className='mt-5 rounded-3xl flex items-center justify-center overflow-hidden'
            style={{
              background: 'linear-gradient(180deg, #FFF5F7 0%, #FAF5FF 100%)',
              height: `${Math.max(modalHeight * 0.42, 280)}px`,
            }}
          >
            {isLower ? <LowerBustIllustration /> : <UpperBustIllustration />}
          </View>

          {/* Tips */}
          <View className='mt-5 rounded-2xl bg-purple-50 border border-purple-200 p-4'>
            <Text className='text-moon-purple text-sm'>💡 小贴士</Text>
            <View className='mt-2 space-y-1'>
              {tips.map((tip, idx) => (
                <Text
                  key={idx}
                  className='text-gray-800 text-sm leading-5 block'
                >
                  {tip}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Footer navigation */}
        <View className='px-6 py-5 shrink-0 flex items-center justify-between'>
          <View
            className={`flex items-center gap-1 ${isLower ? 'opacity-30' : ''}`}
            onClick={isLower ? undefined : onPrev}
          >
            <ArrowLeft size={16} color='#8B5CF6' />
            <Text className='text-sm font-semibold text-moon-purple'>
              上一步
            </Text>
          </View>

          {/* Progress dots */}
          <View className='flex items-center gap-2'>
            <View
              className={`h-2 rounded-full ${isLower ? 'w-6 bg-moon-purple' : 'w-2 bg-gray-300'}`}
            />
            <View
              className={`h-2 rounded-full ${!isLower ? 'w-6 bg-moon-purple' : 'w-2 bg-gray-300'}`}
            />
          </View>

          <View
            className={`flex items-center gap-1 ${!isLower ? 'opacity-30' : ''}`}
            onClick={!isLower ? undefined : onNext}
          >
            <Text className='text-sm font-semibold text-moon-purple'>
              下一步
            </Text>
            <ArrowRight size={16} color='#8B5CF6' />
          </View>
        </View>
      </View>
    </Popup>
  );
}

/**
 * Normalize value from Range/InputNumber onChange
 * Handles number | number[] | string | undefined → number
 * NutUI Range returns number | number[] (for range slider)
 */
function normalizeValue(
  val: number | number[] | string | undefined,
  fallback: number
): number {
  if (val === undefined || val === '' || val === null) {
    return fallback;
  }
  // Handle array (range slider returns array, single slider returns number)
  if (Array.isArray(val)) {
    return val[0] ?? fallback;
  }
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return Number.isNaN(num) ? fallback : num;
}

/**
 * Validate measurement value is within range
 */
function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * MeasureGuide component for size measurement input
 * Aligned with moon-agent/components/chat/MeasureGuide.tsx
 *
 * Features:
 * - "Watch demo" gradient button at top
 * - Lower bust / Upper bust sliders with input
 * - Bust difference calculation
 * - Validation: upperBust >= lowerBust
 * - Store integration for persistence
 * - Confirm button with validation state
 */
export function MeasureGuide({ onSelect }: StateComponentProps) {
  // Read from store for initial values (AC: 5 - 回显)
  const storedMeasurement = useChatStore((s) => s.measurementData);
  const setMeasurementData = useChatStore((s) => s.setMeasurementData);

  // Local state with store fallback (AC: 5 - 首次进入可用默认值)
  const [lowerBust, setLowerBust] = useState<number>(
    storedMeasurement?.lowerBust ?? 75
  );
  const [upperBust, setUpperBust] = useState<number>(
    storedMeasurement?.upperBust ?? 90
  );

  // Sync from store when it changes externally (AC: 5)
  useEffect(() => {
    if (storedMeasurement) {
      setLowerBust(storedMeasurement.lowerBust);
      setUpperBust(storedMeasurement.upperBust);
    }
  }, [storedMeasurement]);

  // Real-time bust difference calculation (AC: 2)
  const bustDifference = useMemo(
    () => upperBust - lowerBust,
    [upperBust, lowerBust]
  );

  // Validation states (AC: 1)
  const lowerBustValid = isInRange(lowerBust, LOWER_BUST_MIN, LOWER_BUST_MAX);
  const upperBustValid = isInRange(upperBust, UPPER_BUST_MIN, UPPER_BUST_MAX);
  const bustRelationValid = upperBust >= lowerBust; // AC: 1 - upperBust >= lowerBust

  // Combined validation (AC: 1)
  const isFormValid = lowerBustValid && upperBustValid && bustRelationValid;

  // Error messages (AC: 1)
  const lowerBustError = !lowerBustValid
    ? `请输入 ${LOWER_BUST_MIN}-${LOWER_BUST_MAX}cm 的下胸围`
    : null;
  const upperBustError = !upperBustValid
    ? `请输入 ${UPPER_BUST_MIN}-${UPPER_BUST_MAX}cm 的上胸围`
    : !bustRelationValid
      ? '上胸围应不小于下胸围'
      : null;

  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<DemoStep>('lower');

  const openDemo = useCallback(() => {
    setDemoStep('lower');
    setDemoOpen(true);
  }, []);

  // Normalized value handlers (handle number | number[] from NutUI Range)
  const handleLowerBustChange = useCallback(
    (val: number | number[]) => {
      const normalized = normalizeValue(val, lowerBust);
      // Clamp to valid range for slider display
      const clamped = Math.max(
        LOWER_BUST_MIN,
        Math.min(LOWER_BUST_MAX, normalized)
      );
      setLowerBust(clamped);
    },
    [lowerBust]
  );

  const handleUpperBustChange = useCallback(
    (val: number | number[]) => {
      const normalized = normalizeValue(val, upperBust);
      // Clamp to valid range for slider display
      const clamped = Math.max(
        UPPER_BUST_MIN,
        Math.min(UPPER_BUST_MAX, normalized)
      );
      setUpperBust(clamped);
    },
    [upperBust]
  );

  // Handle InputNumber changes (may return different types)
  const handleLowerBustInputChange = useCallback(
    (val: string | number) => {
      const normalized = normalizeValue(val, lowerBust);
      // Allow out-of-range for input to show validation error
      setLowerBust(normalized);
    },
    [lowerBust]
  );

  const handleUpperBustInputChange = useCallback(
    (val: string | number) => {
      const normalized = normalizeValue(val, upperBust);
      // Allow out-of-range for input to show validation error
      setUpperBust(normalized);
    },
    [upperBust]
  );

  const onConfirm = useCallback(() => {
    if (!isFormValid) return;

    // Write to store (AC: 4)
    setMeasurementData({
      lowerBust,
      upperBust,
      bustDifference,
    });

    // Send message with measurement data
    onSelect(
      `测量数据：下胸围${lowerBust}cm，上胸围${upperBust}cm，胸围差${bustDifference}cm`
    );
  }, [
    isFormValid,
    lowerBust,
    upperBust,
    bustDifference,
    setMeasurementData,
    onSelect,
  ]);

  return (
    <View className='mt-3 animate-slide-up'>
      {/* Full width card - no max-width restriction for comfortable layout */}
      <View className='bg-white rounded-[24px] shadow-lg w-full px-5 py-6'>
        {/* Watch demo button */}
        <View
          className='w-full h-14 rounded-xl flex items-center justify-center gap-2 shadow-md'
          style={{
            background: 'linear-gradient(180deg, #8B5CF6 0%, #EC4899 100%)',
          }}
          onClick={openDemo}
        >
          <Play size={24} color='#fff' />
          <Text className='text-white text-lg font-semibold'>观看测量演示</Text>
        </View>

        <View className='mt-8'>
          {/* Lower bust - Using Taro native Slider for better drag support */}
          <View className='mb-8'>
            <Text className='text-gray-800 text-lg font-semibold mb-4'>
              下胸围 (cm)
            </Text>
            <View className='flex items-center gap-3'>
              <Text className='text-gray-500 text-sm w-10'>
                {LOWER_BUST_MIN}
              </Text>
              <View className='flex-1'>
                <Slider
                  value={lowerBust}
                  min={LOWER_BUST_MIN}
                  max={LOWER_BUST_MAX}
                  step={1}
                  activeColor='#8B5CF6'
                  backgroundColor='#E5E7EB'
                  blockColor='#8B5CF6'
                  blockSize={28}
                  onChange={(e) => handleLowerBustChange(e.detail.value)}
                  onChanging={(e) => handleLowerBustChange(e.detail.value)}
                />
              </View>
              <Text className='text-gray-500 text-sm w-10 text-right'>
                {LOWER_BUST_MAX}
              </Text>
            </View>
            <View className='mt-5 flex items-center justify-center gap-3'>
              <InputNumber
                value={lowerBust}
                min={LOWER_BUST_MIN}
                max={LOWER_BUST_MAX}
                onChange={handleLowerBustInputChange}
                className='w-28'
              />
              <Text className='text-gray-600 text-base'>cm</Text>
            </View>
            {lowerBustError && (
              <Text className='mt-3 text-red-500 text-sm text-center block'>
                {lowerBustError}
              </Text>
            )}
          </View>

          {/* Upper bust - Using Taro native Slider */}
          <View className='mb-8'>
            <Text className='text-gray-800 text-lg font-semibold mb-4'>
              上胸围 (cm)
            </Text>
            <View className='flex items-center gap-3'>
              <Text className='text-gray-500 text-sm w-10'>
                {UPPER_BUST_MIN}
              </Text>
              <View className='flex-1'>
                <Slider
                  value={upperBust}
                  min={UPPER_BUST_MIN}
                  max={UPPER_BUST_MAX}
                  step={1}
                  activeColor='#EC4899'
                  backgroundColor='#E5E7EB'
                  blockColor='#EC4899'
                  blockSize={28}
                  onChange={(e) => handleUpperBustChange(e.detail.value)}
                  onChanging={(e) => handleUpperBustChange(e.detail.value)}
                />
              </View>
              <Text className='text-gray-500 text-sm w-10 text-right'>
                {UPPER_BUST_MAX}
              </Text>
            </View>
            <View className='mt-5 flex items-center justify-center gap-3'>
              <InputNumber
                value={upperBust}
                min={UPPER_BUST_MIN}
                max={UPPER_BUST_MAX}
                onChange={handleUpperBustInputChange}
                className='w-28'
              />
              <Text className='text-gray-600 text-base'>cm</Text>
            </View>
            {upperBustError && (
              <Text className='mt-3 text-red-500 text-sm text-center block'>
                {upperBustError}
              </Text>
            )}
          </View>

          {/* Bust difference (AC: 2) */}
          <View className='pt-4 pb-6 text-center border-t border-gray-100'>
            <Text className='text-gray-600 text-base'>胸围差</Text>
            <Text className='mt-2 text-3xl font-bold text-moon-pink block'>
              {bustDifference} cm
            </Text>
          </View>

          {/* Confirm button with disabled state (AC: 1) */}
          <Button
            type='primary'
            block
            disabled={!isFormValid}
            onClick={onConfirm}
            className='h-14 rounded-xl font-bold text-lg mt-4'
            style={{
              background: isFormValid ? '#8B5CF6' : '#C4B5FD',
              opacity: isFormValid ? 1 : 0.6,
            }}
          >
            确认数据
          </Button>
        </View>
      </View>

      <MeasureDemoModal
        open={demoOpen}
        step={demoStep}
        onClose={() => setDemoOpen(false)}
        onPrev={() => setDemoStep('lower')}
        onNext={() => setDemoStep('upper')}
      />
    </View>
  );
}
