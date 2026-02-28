import { useState } from 'react';
import { View, Text, Input as TaroInput } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { STATIC_IMAGES } from '@core/imageUrls';
import {
  BotAvatar,
  MessageBubble,
  TypingIndicator,
  ChatInput,
  ErrorState,
  DegradedHint,
  StreamingIndicator,
  WelcomeOptions,
  MeasureGuide,
  AuxiliaryInput,
  SelectCard,
  ShapeSelection,
  PainPointCard,
  PainPointGrid,
  LoadingAnalysis,
  ProductRecommendation,
  getStateComponent,
} from '../../core/components/chat';
import type { Message, Product, ChatStatePayload } from '../../core/components/chat/types';
import './index.css';

// Simple validation schema for smoke test
const smokeFormSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
});

type SmokeFormData = z.infer<typeof smokeFormSchema>;

export default function UiSmoke() {
  const [lastChatAction, setLastChatAction] = useState<string>('');
  const [showDegraded, setShowDegraded] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [statePanel, setStatePanel] = useState<ChatStatePayload | null>({
    step: 'welcome',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SmokeFormData>({
    resolver: zodResolver(smokeFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Use Taro native Toast for mini program compatibility
  const showToast = (
    title: string,
    icon: 'success' | 'error' | 'none' | 'loading' = 'none'
  ) => {
    Taro.showToast({ title, icon, duration: 2000 });
  };

  const handleChatSelect = (value: string) => {
    setLastChatAction(value);
    showToast(value, 'none');
  };

  const onSubmit = (data: SmokeFormData) => {
    console.log('Form submitted:', data);
    showToast('表单提交成功！', 'success');
  };

  // Real sample products from backend payload for testing image rendering
  const sampleProducts: Product[] = [
    {
      sku_id: 41,
      product_name: '轻樱超舒适杯',
      price: 48,
      size: '85BCD',
      features: [
        '无钢圈设计彻底解决钢圈戳腋下痛点',
        '浅杯结构精准匹配圆盘胸型',
        '18cm大杯直径适合大底盘用户',
        '底围稳定性强防止跑杯',
      ],
      image_url:
        'https://kunucyhvzsophytnprcm.supabase.co/storage/v1/object/public/Lingeries/1.png',
      matching: 5,
      style: '简约',
    },
    {
      sku_id: 56,
      product_name: 'I am the BEST',
      price: 48,
      size: '85B',
      features: [
        '20cm超大杯直径适合宽底盘圆盘胸',
        '中杯深度兼顾包容度与隆起高度',
        '硬钢圈提供强力支撑防止跑杯',
      ],
      image_url:
        'https://kunucyhvzsophytnprcm.supabase.co/storage/v1/object/public/Lingeries/I%20am%20the%20BEST.jpg',
      matching: 4,
      style: '欧美',
    },
    {
      sku_id: 45,
      product_name: '小猫爪小熊杯',
      price: 48,
      size: '85BC',
      features: [
        '无钢圈结构零压力',
        '浅杯设计防止空杯',
        '莫代尔与桑蚕丝面料极致亲肤',
      ],
      image_url:
        'https://kunucyhvzsophytnprcm.supabase.co/storage/v1/object/public/Lingeries/2.jpg',
      matching: 3,
      style: '简约',
    },
  ];

  const assistantMessage: Message = {
    id: 'assistant-1',
    role: 'assistant',
    content:
      '你好！我是撑撑姐。\n\n我可以帮你找到更适合的内衣。\n\n这里支持 **加粗** 文本。',
    timestamp: Date.now(),
  };
  const userMessage: Message = {
    id: 'user-1',
    role: 'user',
    content: '我想开始测量。',
    timestamp: Date.now(),
  };

  const StatePanelComponent = getStateComponent(statePanel);

  return (
    <View className='min-h-screen p-8 pb-32 bg-page-gradient'>
      <Text className='text-2xl font-bold text-moon-text mb-4'>
        UI Smoke Test
      </Text>
      <Text className='text-base text-moon-text-muted mb-12'>
        Story 1.4 - NutUI + Tailwind + 主题 Token 验证
      </Text>

      {/* Section 1: Theme Tokens / Colors */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          1. 主题 Token 颜色
        </Text>
        <View className='flex flex-wrap gap-4 mb-6'>
          <View className='flex-1 min-w-48'>
            <Text className='text-sm text-moon-text-muted mb-2'>
              --moon-primary
            </Text>
            <View
              className='color-swatch'
              style={{ backgroundColor: 'var(--moon-primary)' }}
            >
              #8B5CF6
            </View>
          </View>
          <View className='flex-1 min-w-48'>
            <Text className='text-sm text-moon-text-muted mb-2'>
              --moon-primary-hover
            </Text>
            <View
              className='color-swatch'
              style={{ backgroundColor: 'var(--moon-primary-hover)' }}
            >
              #7C3AED
            </View>
          </View>
        </View>
        <View className='flex flex-wrap gap-4'>
          <View className='flex-1 min-w-48'>
            <Text className='text-sm text-moon-text-muted mb-2'>
              --moon-secondary
            </Text>
            <View
              className='color-swatch'
              style={{ backgroundColor: 'var(--moon-secondary)' }}
            >
              #EC4899
            </View>
          </View>
          <View className='flex-1 min-w-48'>
            <Text className='text-sm text-moon-text-muted mb-2'>
              --moon-destructive
            </Text>
            <View
              className='color-swatch'
              style={{ backgroundColor: 'var(--moon-destructive)' }}
            >
              #D4183D
            </View>
          </View>
        </View>
      </View>

      {/* Section 2: Global Utility Classes */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          2. 全局工具类
        </Text>

        <Text className='text-sm text-moon-text-muted mb-2'>
          .gradient-card
        </Text>
        <View className='gradient-demo gradient-card'>渐变卡片背景</View>

        <View className='mt-6'>
          <Text className='text-sm text-moon-text-muted mb-2'>
            .header-shadow
          </Text>
          <View className='shadow-demo header-shadow'>Header 阴影效果</View>
        </View>

        <Text className='text-sm text-moon-text-muted mb-2'>.nav-shadow</Text>
        <View className='shadow-demo nav-shadow'>Nav 阴影效果</View>

        <Text className='text-sm text-moon-text-muted mb-2'>.glass</Text>
        <View className='glass-demo glass'>毛玻璃效果</View>

        <View className='mt-6'>
          <Text className='text-sm text-moon-text-muted mb-2'>
            .moon-indeterminate-bar
          </Text>
          <View className='loading-demo moon-indeterminate-bar' />
        </View>
      </View>

      {/* Section 3: NutUI Components */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          3. NutUI 组件
        </Text>

        <Text className='text-sm text-moon-text-muted mb-2'>Button 按钮</Text>
        <View className='flex flex-wrap gap-4 mb-4'>
          <Button
            type='primary'
            onClick={() => showToast('Primary 点击', 'success')}
          >
            Primary
          </Button>
          <Button type='default' onClick={() => showToast('Default 点击')}>
            Default
          </Button>
          <Button
            type='danger'
            onClick={() => showToast('Danger 点击', 'error')}
          >
            Danger
          </Button>
        </View>
        <View className='flex flex-wrap gap-4'>
          <Button
            type='primary'
            fill='outline'
            onClick={() => showToast('Outline 点击')}
          >
            Outline
          </Button>
          <Button type='primary' size='small'>
            Small
          </Button>
          <Button type='primary' size='large'>
            Large
          </Button>
        </View>

        <View className='mt-8'>
          <Text className='text-sm text-moon-text-muted mb-2'>
            Input 输入框
          </Text>
          <View className='mb-6'>
            <TaroInput placeholder='请输入内容' className='input' />
          </View>
          <View className='mb-6'>
            <TaroInput placeholder='禁用状态' disabled className='input' />
          </View>
        </View>
      </View>

      {/* Section 4: Custom Button Classes */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          4. 自定义按钮样式
        </Text>
        <View className='flex flex-wrap gap-4'>
          <View className='btn-primary'>主要按钮</View>
          <View className='btn-secondary'>次要按钮</View>
          <View className='btn-outline'>描边按钮</View>
        </View>
      </View>

      {/* Section 5: Toast Demo */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          5. Toast 提示
        </Text>
        <View className='flex flex-wrap gap-4'>
          <Button
            type='primary'
            size='small'
            onClick={() => showToast('这是一条普通提示')}
          >
            普通提示
          </Button>
          <Button
            type='primary'
            size='small'
            onClick={() => showToast('操作成功！', 'success')}
          >
            成功提示
          </Button>
          <Button
            type='danger'
            size='small'
            onClick={() => showToast('操作失败！', 'error')}
          >
            失败提示
          </Button>
          <Button
            type='default'
            size='small'
            onClick={() => showToast('加载中...', 'loading')}
          >
            加载提示
          </Button>
        </View>
      </View>

      {/* Section 6: Tailwind Utility Classes */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          6. Tailwind 工具类
        </Text>
        <View className='flex flex-wrap gap-4 mb-4'>
          <View className='p-4 bg-moon-primary rounded-lg text-white text-center'>
            bg-moon-primary + rounded-lg
          </View>
        </View>
        <View className='flex flex-wrap gap-4 mb-4'>
          <View className='p-4 bg-moon-secondary rounded-lg text-white text-center'>
            bg-moon-secondary + rounded-lg
          </View>
        </View>
        <View className='flex flex-wrap gap-4 mb-4'>
          <View className='p-4 border-2 border-moon-primary rounded-lg text-moon-primary text-center'>
            border-moon-primary
          </View>
        </View>
        <View className='flex flex-wrap gap-4'>
          <View className='p-4 bg-white shadow-header rounded-lg text-center'>
            shadow-header
          </View>
        </View>
      </View>

      {/* Section 7: Form Validation (react-hook-form + zod) */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          7. 表单验证 (react-hook-form + zod)
        </Text>
        <View className='card p-8'>
          <View className='mb-6'>
            <Text className='text-base font-medium text-moon-text mb-3'>
              姓名
            </Text>
            <Controller
              control={control}
              name='name'
              render={({ field: { onChange, value } }) => (
                <TaroInput
                  placeholder='请输入姓名（至少2个字符）'
                  value={value}
                  onInput={(e) => onChange(e.detail.value)}
                  className='input'
                />
              )}
            />
            {errors.name && (
              <Text className='error-text'>{errors.name.message}</Text>
            )}
          </View>

          <View className='mb-6'>
            <Text className='text-base font-medium text-moon-text mb-3'>
              邮箱
            </Text>
            <Controller
              control={control}
              name='email'
              render={({ field: { onChange, value } }) => (
                <TaroInput
                  placeholder='请输入邮箱地址'
                  value={value}
                  onInput={(e) => onChange(e.detail.value)}
                  className='input'
                />
              )}
            />
            {errors.email && (
              <Text className='error-text'>{errors.email.message}</Text>
            )}
          </View>

          <View
            className={`p-4 rounded-xl text-base mt-6 ${isValid ? 'validation-success' : 'validation-error'}`}
          >
            {isValid ? '✅ 表单验证通过' : '⚠️ 请完善表单信息'}
          </View>

          <View className='mt-6'>
            <Button
              type='primary'
              block
              disabled={!isValid}
              onClick={() => handleSubmit(onSubmit)()}
            >
              提交表单
            </Button>
          </View>
        </View>
      </View>

      {/* Section 8: Chat UI Components (Story 7.2) */}
      <View className='mb-12'>
        <Text className='text-lg font-semibold text-moon-text mb-6 pb-4 border-b-2 border-gray-200'>
          8. Chat 组件冒烟 (Story 7.2)
        </Text>

        {/* Global overlay toggles */}
        {showDegraded && <DegradedHint />}
        {showStreaming && <StreamingIndicator />}
        {showChatInput && (
          <ChatInput
            onSend={(content) => {
              setLastChatAction(`onSend: ${content}`);
              showToast(`发送: ${content}`, 'success');
            }}
            disabled={false}
          />
        )}

        <View className='mb-6'>
          <Text className='text-sm text-moon-text-muted mb-2 block'>
            最近一次交互:
          </Text>
          <View className='card p-4'>
            <Text className='text-sm text-moon-text'>
              {lastChatAction || '(暂无)'}
            </Text>
          </View>
        </View>

        <View className='flex flex-wrap gap-3 mb-8'>
          <Button
            type='primary'
            size='small'
            onClick={() => setShowDegraded((v) => !v)}
          >
            切换 DegradedHint
          </Button>
          <Button
            type='primary'
            size='small'
            onClick={() => setShowStreaming((v) => !v)}
          >
            切换 StreamingIndicator
          </Button>
          <Button
            type='primary'
            size='small'
            onClick={() => setShowChatInput((v) => !v)}
          >
            切换 ChatInput(固定底部)
          </Button>
        </View>

        {/* Basic chat components */}
        <View className='mb-10'>
          <Text className='text-sm text-moon-text-muted mb-3 block'>
            基础组件
          </Text>
          <View className='card p-4 flex flex-col gap-4'>
            <View className='flex items-center gap-3'>
              <BotAvatar />
              <Text className='text-sm text-gray-600'>BotAvatar</Text>
            </View>

            <MessageBubble message={assistantMessage} />
            <MessageBubble message={userMessage} />

            <TypingIndicator />

            <ErrorState
              message='网络请求失败，请检查网络连接'
              onRetry={() => {
                setLastChatAction('onRetry');
                showToast('重试点击', 'none');
              }}
            />
          </View>
        </View>

        {/* State panel components */}
        <View className='mb-10'>
          <Text className='text-sm text-moon-text-muted mb-3 block'>
            State Panel 组件
          </Text>

          <View className='flex flex-wrap gap-2 mb-4'>
            <Button
              type='primary'
              fill='outline'
              size='small'
              onClick={() => setStatePanel({ step: 'welcome' })}
            >
              welcome
            </Button>
            <Button
              type='primary'
              fill='outline'
              size='small'
              onClick={() => setStatePanel({ step: 'size_input' })}
            >
              size_input
            </Button>
            <Button
              type='primary'
              fill='outline'
              size='small'
              onClick={() => setStatePanel({ step: 'body_info' })}
            >
              body_info
            </Button>
            <Button
              type='primary'
              fill='outline'
              size='small'
              onClick={() => setStatePanel({ step: 'shape_choice' })}
            >
              shape_choice
            </Button>
            <Button
              type='primary'
              fill='outline'
              size='small'
              onClick={() => setStatePanel({ step: 'pain_points' })}
            >
              pain_points
            </Button>
            <Button
              type='primary'
              fill='outline'
              size='small'
              onClick={() => setStatePanel({ step: 'summary' })}
            >
              summary
            </Button>
            <Button
              type='primary'
              fill='outline'
              size='small'
              onClick={() =>
                setStatePanel({ step: 'recommendation', products: sampleProducts })
              }
            >
              recommendation
            </Button>
          </View>

          <View className='card p-4'>
            {/* Direct renders (ensure all components are reachable) */}
            <View className='flex flex-col gap-4'>
              <WelcomeOptions onSelect={handleChatSelect} />
              <MeasureGuide onSelect={handleChatSelect} />
              <AuxiliaryInput onSelect={handleChatSelect} />
              <ShapeSelection onSelect={handleChatSelect} />
              <PainPointGrid onSelect={handleChatSelect} />
              <LoadingAnalysis onSelect={handleChatSelect} />
              <ProductRecommendation
                onSelect={handleChatSelect}
                payload={{ products: sampleProducts }}
              />

              {/* Mapping render */}
              {StatePanelComponent && (
                <View className='pt-4 border-t border-gray-200'>
                  <Text className='text-xs text-gray-500 mb-2 block'>
                    getStateComponent(step={String(statePanel?.step)})
                  </Text>
                  <StatePanelComponent
                    onSelect={handleChatSelect}
                    payload={statePanel?.products ? statePanel : undefined}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Atomic cards (SelectCard / PainPointCard) */}
        <View className='mb-4'>
          <Text className='text-sm text-moon-text-muted mb-3 block'>
            原子卡片
          </Text>
          <View className='card p-4 flex flex-col gap-3'>
            <SelectCard
              title='圆盘型'
              description='底盘宽，分布均匀'
              imageSrc={STATIC_IMAGES.chestTypes.round}
              selected
              onClick={() => handleChatSelect('SelectCard: 圆盘型')}
            />
            <PainPointCard
              title='钢圈戳腋下'
              imageSrc={STATIC_IMAGES.painPoints.wirePoking}
              selected
              onToggle={() => handleChatSelect('PainPointCard: 钢圈戳腋下')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
