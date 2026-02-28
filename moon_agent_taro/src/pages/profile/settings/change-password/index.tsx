/**
 * Change Password Page - Update user password
 * Migrated from moon-agent/app/profile/settings/change-password/page.tsx for Taro
 *
 * Features:
 * - Old password verification
 * - New password with confirmation
 * - Form validation (min 6 chars, must match)
 * - Toast feedback on success/error
 * - Back navigation
 */

import { useState, useCallback } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';
import { ArrowLeft } from '@taroify/icons';
import { MaterialIcons } from 'taro-icons';
import { useUpdatePassword, passwordSchema, type PasswordFormData } from '@core/user';

type FormErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ChangePasswordPage() {
  const updatePasswordMutation = useUpdatePassword();

  const [formData, setFormData] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle back navigation
  const handleBack = useCallback(() => {
    Taro.navigateBack();
  }, []);

  // Handle input change
  const handleInputChange = useCallback(
    (field: keyof PasswordFormData, value: string) => {
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
    const result = passwordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
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

    updatePasswordMutation.mutate(
      {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          Taro.navigateBack();
        },
      }
    );
  }, [validateForm, formData, updatePasswordMutation]);

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient'>
      {/* Header */}
      <View className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100'>
        <View
          className='w-10 h-10 flex items-center justify-center -ml-2'
          onClick={handleBack}
        >
          <ArrowLeft size={20} className='text-gray-600' />
        </View>
        <Text className='text-lg font-semibold text-moon-text flex-1 text-center -ml-10'>
          修改密码
        </Text>
      </View>

      {/* Content */}
      <View className='flex-1 px-4 py-4 space-y-4'>
        {/* Old Password */}
        <View className='bg-white rounded-xl p-4 space-y-2'>
          <Text className='text-sm text-moon-text-muted block'>当前密码</Text>
          <View className='relative'>
            <Input
              type={showOldPassword ? 'text' : 'safe-password'}
              password={!showOldPassword}
              value={formData.oldPassword}
              onInput={(e) => handleInputChange('oldPassword', e.detail.value)}
              placeholder='请输入当前密码'
              className='w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-base'
              placeholderClass='text-gray-400'
            />
            <View
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1'
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? (
                <MaterialIcons name='visibility-off' size={20} color='#9ca3af' />
              ) : (
                <MaterialIcons name='visibility' size={20} color='#9ca3af' />
              )}
            </View>
          </View>
          {errors.oldPassword && (
            <Text className='text-xs text-red-500 block'>{errors.oldPassword}</Text>
          )}
        </View>

        {/* New Password */}
        <View className='bg-white rounded-xl p-4 space-y-2'>
          <Text className='text-sm text-moon-text-muted block'>新密码</Text>
          <View className='relative'>
            <Input
              type={showNewPassword ? 'text' : 'safe-password'}
              password={!showNewPassword}
              value={formData.newPassword}
              onInput={(e) => handleInputChange('newPassword', e.detail.value)}
              placeholder='请输入新密码（至少6位）'
              className='w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-base'
              placeholderClass='text-gray-400'
            />
            <View
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1'
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <MaterialIcons name='visibility-off' size={20} color='#9ca3af' />
              ) : (
                <MaterialIcons name='visibility' size={20} color='#9ca3af' />
              )}
            </View>
          </View>
          {errors.newPassword && (
            <Text className='text-xs text-red-500 block'>{errors.newPassword}</Text>
          )}
        </View>

        {/* Confirm Password */}
        <View className='bg-white rounded-xl p-4 space-y-2'>
          <Text className='text-sm text-moon-text-muted block'>确认新密码</Text>
          <View className='relative'>
            <Input
              type={showConfirmPassword ? 'text' : 'safe-password'}
              password={!showConfirmPassword}
              value={formData.confirmPassword}
              onInput={(e) => handleInputChange('confirmPassword', e.detail.value)}
              placeholder='请再次输入新密码'
              className='w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-base'
              placeholderClass='text-gray-400'
            />
            <View
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <MaterialIcons name='visibility-off' size={20} color='#9ca3af' />
              ) : (
                <MaterialIcons name='visibility' size={20} color='#9ca3af' />
              )}
            </View>
          </View>
          {errors.confirmPassword && (
            <Text className='text-xs text-red-500 block'>{errors.confirmPassword}</Text>
          )}
        </View>

        {/* Submit Button */}
        <View className='pt-4'>
          <Button
            type='primary'
            disabled={updatePasswordMutation.isPending}
            className='w-full! h-11 rounded-full!'
            style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
            onClick={handleSubmit}
          >
            {updatePasswordMutation.isPending ? '修改中...' : '确认修改'}
          </Button>
        </View>
      </View>
    </View>
  );
}
