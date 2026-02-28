/**
 * Edit Profile Page - Update nickname and avatar
 * Migrated from moon-agent/app/profile/settings/edit-profile/page.tsx for Taro
 *
 * Features:
 * - Display current profile info
 * - Update nickname with validation
 * - Toast feedback on success/error
 * - Back navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';
import { MaterialIcons } from 'taro-icons';
import { SafeImage } from '@core/components/SafeImage';
import {
  useUserInfo,
  useUpdateUserInfo,
  profileSchema,
  type ProfileFormData,
} from '@core/user';

type FormErrors = {
  nickname?: string;
  avatar?: string;
};

export default function EditProfilePage() {
  const { data: user, isLoading } = useUserInfo();
  const updateMutation = useUpdateUserInfo();

  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: '',
    avatar: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Handle input change
  const handleInputChange = useCallback(
    (field: keyof ProfileFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    updateMutation.mutate(
      {
        nickname: formData.nickname,
        avatar: formData.avatar || undefined,
      },
      {
        onSuccess: () => {
          Taro.navigateBack();
        },
      }
    );
  }, [validateForm, formData, updateMutation]);

  // Loading state
  if (isLoading) {
    return (
      <View className='flex flex-col min-h-screen bg-page-gradient'>
        <View className='flex-1 flex items-center justify-center'>
          <View className='w-8 h-8 border-2 border-moon-purple border-t-transparent rounded-full animate-spin' />
        </View>
      </View>
    );
  }

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient'>
      {/* Content */}
      <View className='flex-1 px-4 py-4'>
        {/* Avatar Section */}
        <View className='bg-white rounded-xl p-4'>
          <View className='flex items-center gap-4'>
            <Text className='text-sm text-moon-text-muted'>头像</Text>
            <View className='flex-1 flex justify-end'>
              {formData.avatar ? (
                <View className='w-16 h-16 rounded-full overflow-hidden'>
                  <SafeImage
                    src={formData.avatar}
                    mode='aspectFill'
                    className='w-full h-full'
                  />
                </View>
              ) : (
                <View className='w-16 h-16 rounded-full bg-moon-purple/10 flex items-center justify-center'>
                  <MaterialIcons name='person' size={32} color='#8b5cf6' />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Nickname Section */}
        <View className='bg-white rounded-xl p-4 mt-4'>
          <Text className='text-sm text-moon-text-muted block mb-2'>昵称</Text>
          <View className='w-full overflow-hidden'>
            <Input
              type='text'
              value={formData.nickname}
              onInput={(e) => handleInputChange('nickname', e.detail.value)}
              placeholder='请输入昵称'
              maxlength={20}
              className='w-full px-3 bg-gray-50 border border-gray-200 rounded-lg text-base box-border'
              placeholderClass='text-gray-400'
              style={{ height: '44px', lineHeight: '44px' }}
            />
          </View>
          {errors.nickname && (
            <Text className='text-xs text-red-500 block mt-1'>{errors.nickname}</Text>
          )}
          <Text className='text-xs text-gray-400 text-right block mt-1'>
            {formData.nickname.length}/20
          </Text>
        </View>

        {/* Submit Button */}
        <View className='pt-6'>
          <Button
            type='primary'
            color='#8b5cf6'
            disabled={updateMutation.isPending}
            block
            style={{
              borderRadius: '9999px',
              height: '44px',
              lineHeight: '44px',
            }}
            onClick={handleSubmit}
          >
            {updateMutation.isPending ? '保存中...' : '保存修改'}
          </Button>
        </View>
      </View>
    </View>
  );
}
