import { View, Text, Input, Button } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feedbackFormSchema, type FeedbackFormData } from '@core/schemas';

export default function Index() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  useLoad(() => {
    console.log('Index page loaded.');
  });

  const onSubmit = (data: FeedbackFormData) => {
    console.log('Form submitted:', data);
    Taro.showToast({
      title: '提交成功！',
      icon: 'success',
      duration: 2000,
    });
  };

  const onError = () => {
    Taro.showToast({
      title: '请检查表单填写',
      icon: 'none',
      duration: 2000,
    });
  };

  return (
    <View className='p-8 min-h-screen'>
      <View className='text-center mb-12'>
        <Text className='block text-[48px] font-bold text-moon-primary'>
          撑撑姐
        </Text>
        <Text className='block text-[28px] text-moon-text-muted mt-2'>
          AI 内衣导购助手
        </Text>
      </View>

      <View className='card mb-12'>
        <Text className='block text-[36px] font-semibold text-moon-text mb-8'>
          测试表单
        </Text>

        <View className='mb-6'>
          <Text className='block text-[28px] text-moon-text mb-3'>姓名</Text>
          <Controller
            control={control}
            name='name'
            render={({ field: { onChange, value } }) => (
              <Input
                className='input'
                placeholder='请输入姓名'
                value={value}
                onInput={(e) => onChange(e.detail.value)}
              />
            )}
          />
          {errors.name && (
            <Text className='error-text'>{errors.name.message}</Text>
          )}
        </View>

        <View className='mb-6'>
          <Text className='block text-[28px] text-moon-text mb-3'>邮箱</Text>
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <Input
                className='input'
                placeholder='请输入邮箱'
                value={value}
                onInput={(e) => onChange(e.detail.value)}
              />
            )}
          />
          {errors.email && (
            <Text className='error-text'>{errors.email.message}</Text>
          )}
        </View>

        <View className='mb-6'>
          <Text className='block text-[28px] text-moon-text mb-3'>留言</Text>
          <Controller
            control={control}
            name='message'
            render={({ field: { onChange, value } }) => (
              <Input
                className='input h-[120px]'
                placeholder='请输入留言内容（至少10个字符）'
                value={value}
                onInput={(e) => onChange(e.detail.value)}
              />
            )}
          />
          {errors.message && (
            <Text className='error-text'>{errors.message.message}</Text>
          )}
        </View>

        <Button
          className='btn-primary'
          onClick={() => handleSubmit(onSubmit, onError)()}
        >
          提交
        </Button>
      </View>

      <View className='mt-12'>
        <Text className='block text-[32px] font-semibold text-moon-text mb-6'>
          样式示例
        </Text>
        <View className='flex flex-col gap-6'>
          <View className='btn-primary'>主要按钮</View>
          <View className='btn-secondary'>次要按钮</View>
          <View className='btn-outline'>描边按钮</View>
        </View>
      </View>
    </View>
  );
}
