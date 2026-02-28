import { useState, useEffect, useRef } from 'react';
import { View, Text } from '@tarojs/components';
import type { StateComponentProps } from './types';

const ANALYSIS_STAGES = [
  { text: 'Get！数据齐全，分析即将开始～', delay: 0 },
  { text: '正在为你重建3D体态模型...', delay: 2000 },
  { text: '正在计算抗引力系数...', delay: 4000 },
  { text: '正在进行商品推荐..', delay: 6000 },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * LoadingAnalysis - Analysis loading state component
 * Aligned with moon-agent/components/chat/LoadingAnalysis.tsx
 *
 * Features:
 * - Conic gradient ring with seamless rotation
 * - Dynamic staged text (0/2/4/6s)
 * - Pink indeterminate progress bar + timer
 */
export function LoadingAnalysis(_props: StateComponentProps) {
  const [activeStage, setActiveStage] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer for elapsed seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Stage progression
  useEffect(() => {
    if (activeStage < ANALYSIS_STAGES.length - 1) {
      const nextDelay =
        ANALYSIS_STAGES[activeStage + 1].delay -
        ANALYSIS_STAGES[activeStage].delay;
      stageTimerRef.current = setTimeout(() => {
        setActiveStage((prev) => prev + 1);
      }, nextDelay);
    }
    return () => {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    };
  }, [activeStage]);

  return (
    <View className='w-full animate-slide-up'>
      {/* Gradient border card */}
      <View className='gradient-border'>
        <View className='gradient-border-inner p-6'>
          {/* Ring animation */}
          <View className='flex justify-center mb-6'>
            <View className='relative w-24 h-24'>
              {/* Outer ring border */}
              <View className='absolute inset-0 rounded-full border border-gray-200/50' />
              {/* Rotating sweep ring */}
              <View
                className='absolute inset-0 rounded-full ring-sweep'
                style={{
                  animation: 'spin 3.6s linear infinite',
                }}
              />
              {/* Inner pulsing sphere */}
              <View
                className='absolute rounded-full shadow-lg'
                style={{
                  inset: '20px',
                  background:
                    'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </View>
          </View>

          {/* Dynamic text stages */}
          <View className='space-y-2 text-center min-h-[100px]'>
            {ANALYSIS_STAGES.slice(0, activeStage + 1).map((stage, idx) => (
              <Text
                key={idx}
                className={`text-base leading-relaxed block animate-fade-in ${
                  idx === activeStage
                    ? 'text-moon-text font-medium'
                    : 'text-moon-text-muted opacity-50'
                }`}
              >
                {stage.text}
              </Text>
            ))}
          </View>

          {/* Indeterminate progress bar + timer */}
          <View className='mt-6'>
            {/* Progress track */}
            <View className='h-3 w-full rounded-full bg-white/60 overflow-hidden'>
              <View className='h-full w-full moon-indeterminate-bar' />
            </View>

            {/* Timer display */}
            <View className='mt-3 flex items-center justify-center gap-2 text-sm text-moon-text-muted'>
              <Text>生成中...</Text>
              <Text className='font-mono'>{formatTime(elapsedSeconds)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
