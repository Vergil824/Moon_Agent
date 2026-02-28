import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Slider } from '@tarojs/components';
import { Button, InputNumber } from '@nutui/nutui-react-taro';
import { useChatStore } from '../../stores';
import type { StateComponentProps } from './types';

// Slider configuration based on AC requirements (AC: 3)
const SLIDER_CONFIG = {
  height: {
    label: '身高 (cm)',
    min: 140,
    max: 200,
    default: 165,
    unit: 'cm',
    errorMsg: '请输入 140-200cm 的身高',
  },
  weight: {
    label: '体重 (kg)',
    min: 30,
    max: 100,
    default: 55,
    unit: 'kg',
    errorMsg: '请输入 30-100kg 的体重',
  },
  waist: {
    label: '腰围 (cm)',
    min: 50,
    max: 120,
    default: 68,
    unit: 'cm',
    errorMsg: '请输入 50-120cm 的腰围',
  },
} as const;

/**
 * Validate value is within range
 */
function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Normalize value from InputNumber onChange
 * Handles string | number | undefined → number
 */
function normalizeValue(
  val: string | number | undefined,
  fallback: number
): number {
  if (val === undefined || val === '' || val === null) {
    return fallback;
  }
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return Number.isNaN(num) ? fallback : num;
}

/**
 * SliderItem - Individual slider with label and input
 * Uses Taro native Slider for better drag support in WeChat Mini Program
 * Matches MeasureGuide style (no real-time value display, has InputNumber)
 */
function SliderItem({
  label,
  min,
  max,
  value,
  unit,
  error,
  onChange,
  onInputChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  unit: string;
  error?: string | null;
  onChange: (val: number) => void;
  onInputChange: (val: number) => void;
}) {
  const handleSliderChange = useCallback(
    (e: { detail: { value: number } }) => {
      const val = e.detail.value;
      const clamped = Math.max(min, Math.min(max, val));
      onChange(clamped);
    },
    [min, max, onChange]
  );

  const handleInputChange = useCallback(
    (val: string | number) => {
      const normalized = normalizeValue(val, value);
      onInputChange(normalized);
    },
    [value, onInputChange]
  );

  return (
    <View className='mb-8'>
      <Text className='text-gray-800 text-lg font-semibold mb-4 block'>
        {label}
      </Text>
      <View className='flex items-center gap-3'>
        <Text className='text-gray-500 text-sm w-10'>{min}</Text>
        <View className='flex-1'>
          <Slider
            value={value}
            min={min}
            max={max}
            step={1}
            activeColor='#8B5CF6'
            backgroundColor='#E5E7EB'
            blockColor='#8B5CF6'
            blockSize={28}
            onChange={handleSliderChange}
            onChanging={handleSliderChange}
          />
        </View>
        <Text className='text-gray-500 text-sm w-10 text-right'>{max}</Text>
      </View>
      <View className='mt-5 flex items-center justify-center gap-3'>
        <InputNumber
          value={value}
          min={min}
          max={max}
          onChange={handleInputChange}
          className='w-28'
        />
        <Text className='text-gray-600 text-base'>{unit}</Text>
      </View>
      {/* Validation error (AC: 3) */}
      {error && (
        <Text className='mt-3 text-red-500 text-sm text-center block'>
          {error}
        </Text>
      )}
    </View>
  );
}

/**
 * AuxiliaryInput component for collecting height, weight, and waist measurements
 * Aligned with moon-agent/components/chat/AuxiliaryInput.tsx
 *
 * Features:
 * - Three sliders (height, weight, waist)
 * - Current value display
 * - Validation with error messages (AC: 3)
 * - Store integration for persistence (AC: 4)
 * - Store value restoration (AC: 5)
 * - Confirm button with disabled state
 */
export function AuxiliaryInput({ onSelect }: StateComponentProps) {
  // Read from store for initial values (AC: 5 - 回显)
  const storedAuxiliary = useChatStore((s) => s.auxiliaryData);
  const setAuxiliaryData = useChatStore((s) => s.setAuxiliaryData);

  // Local state with store fallback (AC: 5 - 首次进入可用默认值)
  const [height, setHeight] = useState<number>(
    storedAuxiliary?.height ?? SLIDER_CONFIG.height.default
  );
  const [weight, setWeight] = useState<number>(
    storedAuxiliary?.weight ?? SLIDER_CONFIG.weight.default
  );
  const [waist, setWaist] = useState<number>(
    storedAuxiliary?.waist ?? SLIDER_CONFIG.waist.default
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync from store when it changes externally (AC: 5)
  useEffect(() => {
    if (storedAuxiliary) {
      setHeight(storedAuxiliary.height);
      setWeight(storedAuxiliary.weight);
      setWaist(storedAuxiliary.waist);
    }
  }, [storedAuxiliary]);

  // Validation states (AC: 3)
  const heightValid = isInRange(
    height,
    SLIDER_CONFIG.height.min,
    SLIDER_CONFIG.height.max
  );
  const weightValid = isInRange(
    weight,
    SLIDER_CONFIG.weight.min,
    SLIDER_CONFIG.weight.max
  );
  const waistValid = isInRange(
    waist,
    SLIDER_CONFIG.waist.min,
    SLIDER_CONFIG.waist.max
  );

  // Combined validation
  const isFormValid = useMemo(
    () => heightValid && weightValid && waistValid,
    [heightValid, weightValid, waistValid]
  );

  // Error messages (AC: 3)
  const heightError = !heightValid ? SLIDER_CONFIG.height.errorMsg : null;
  const weightError = !weightValid ? SLIDER_CONFIG.weight.errorMsg : null;
  const waistError = !waistValid ? SLIDER_CONFIG.waist.errorMsg : null;

  const handleConfirm = useCallback(async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      // Write to store (AC: 4)
      setAuxiliaryData({ height, weight, waist });

      // Return natural language Chinese response
      const message = `我的身高是${height}cm，体重${weight}kg，腰围${waist}cm`;
      onSelect(message);
    } catch (error) {
      console.error('Failed to submit auxiliary data:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, height, weight, waist, setAuxiliaryData, onSelect]);

  // Determine button disabled state
  const isButtonDisabled = !isFormValid || isSubmitting;

  // Clamped handlers for slider (keep within range)
  const handleHeightSliderChange = useCallback((val: number) => {
    const clamped = Math.max(
      SLIDER_CONFIG.height.min,
      Math.min(SLIDER_CONFIG.height.max, val)
    );
    setHeight(clamped);
  }, []);

  const handleWeightSliderChange = useCallback((val: number) => {
    const clamped = Math.max(
      SLIDER_CONFIG.weight.min,
      Math.min(SLIDER_CONFIG.weight.max, val)
    );
    setWeight(clamped);
  }, []);

  const handleWaistSliderChange = useCallback((val: number) => {
    const clamped = Math.max(
      SLIDER_CONFIG.waist.min,
      Math.min(SLIDER_CONFIG.waist.max, val)
    );
    setWaist(clamped);
  }, []);

  return (
    <View className='mt-3 animate-slide-up'>
      {/* Full width card - no max-width restriction */}
      <View className='bg-white rounded-3xl shadow-lg w-full px-5 py-6'>
        {/* Height Slider */}
        <SliderItem
          label={SLIDER_CONFIG.height.label}
          min={SLIDER_CONFIG.height.min}
          max={SLIDER_CONFIG.height.max}
          value={height}
          unit={SLIDER_CONFIG.height.unit}
          error={heightError}
          onChange={handleHeightSliderChange}
          onInputChange={setHeight}
        />

        {/* Weight Slider */}
        <SliderItem
          label={SLIDER_CONFIG.weight.label}
          min={SLIDER_CONFIG.weight.min}
          max={SLIDER_CONFIG.weight.max}
          value={weight}
          unit={SLIDER_CONFIG.weight.unit}
          error={weightError}
          onChange={handleWeightSliderChange}
          onInputChange={setWeight}
        />

        {/* Waist Slider */}
        <SliderItem
          label={SLIDER_CONFIG.waist.label}
          min={SLIDER_CONFIG.waist.min}
          max={SLIDER_CONFIG.waist.max}
          value={waist}
          unit={SLIDER_CONFIG.waist.unit}
          error={waistError}
          onChange={handleWaistSliderChange}
          onInputChange={setWaist}
        />

        {/* Confirm Button with disabled state (AC: 3) */}
        <Button
          type='primary'
          block
          disabled={isButtonDisabled}
          onClick={handleConfirm}
          className='h-14 rounded-xl font-bold text-lg'
          style={{
            background: isButtonDisabled ? '#C4B5FD' : '#8B5CF6',
            opacity: isButtonDisabled ? 0.6 : 1,
          }}
        >
          {isSubmitting ? '提交中...' : '确认数据'}
        </Button>
      </View>
    </View>
  );
}
