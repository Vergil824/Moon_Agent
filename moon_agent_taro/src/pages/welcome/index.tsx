/**
 * WelcomePage - Combined auth page for H5 and WeChat Mini Program.
 * Includes both welcome view and login view in one page to avoid background reload.
 * Aligned with moon-agent/app/(auth)/welcome/page.tsx and moon-agent/app/(auth)/login/page.tsx
 *
 * WeChat Mini App Login Flow (Task 16):
 * 1. Call wx.login() to get loginCode
 * 2. User clicks button with open-type="getPhoneNumber" to get phoneCode
 * 3. Send both codes to backend /member/auth/weixin-mini-app-login
 * 4. Backend returns accessToken/refreshToken
 * 5. Navigate to chat tab
 */
import {
  View,
  Text,
  CustomWrapper,
  Button as TaroButton,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useRef, useState, useEffect } from 'react';
import type { ButtonProps } from '@tarojs/components';
import { Wechat } from '@taroify/icons';
import { MaterialIcons } from 'taro-icons';
import { smsLoginFormSchema } from '@core/schemas';
import { authClient } from '@core/auth';
import { AuthInput, AuthLayout, SendCodeButton } from '@core/components';

type AuthView = 'welcome' | 'login';

// Check if running in WeChat Mini Program
const isWeapp = process.env.TARO_ENV === 'weapp';

export default function WelcomePage() {
  // View state - 'welcome' or 'login'
  const [currentView, setCurrentView] = useState<AuthView>('welcome');

  // WeChat login state
  const [isWechatLoggingIn, setIsWechatLoggingIn] = useState(false);
  // Store loginCode from wx.login() - must be obtained before getPhoneNumber
  const loginCodeRef = useRef<string | null>(null);

  // Form values stored in refs to avoid controlled input re-render issues
  const mobileRef = useRef('');
  const codeRef = useRef('');

  /**
   * Pre-fetch wx.login code on component mount (WeChat requirement)
   * Must call wx.login BEFORE getPhoneNumber to ensure sessionKey consistency
   */
  useEffect(() => {
    if (isWeapp) {
      Taro.login({
        success: (res) => {
          if (res.code) {
            loginCodeRef.current = res.code;
            console.log('[Auth] wx.login success, code obtained');
          } else {
            console.error('[Auth] wx.login failed:', res.errMsg);
          }
        },
        fail: (err) => {
          console.error('[Auth] wx.login error:', err);
        },
      });
    }
  }, []);

  const [mobileError, setMobileError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMobileChange = useCallback((val: string) => {
    mobileRef.current = val;
  }, []);

  const handleCodeChange = useCallback((val: string) => {
    codeRef.current = val;
  }, []);

  // Validate form using ref values
  const validateForm = (): boolean => {
    let isValid = true;
    const mobile = mobileRef.current;
    const code = codeRef.current;

    const mobileResult = smsLoginFormSchema.shape.mobile.safeParse(mobile);
    if (!mobileResult.success) {
      setMobileError(
        mobileResult.error.issues[0]?.message || '请输入有效手机号'
      );
      isValid = false;
    } else {
      setMobileError(null);
    }

    const codeResult = smsLoginFormSchema.shape.code.safeParse(code);
    if (!codeResult.success) {
      setCodeError(codeResult.error.issues[0]?.message || '请输入验证码');
      isValid = false;
    } else {
      setCodeError(null);
    }

    return isValid;
  };

  /**
   * Handle WeChat phone number authorization callback
   * This is triggered by the button with open-type="getPhoneNumber"
   */
  const handleGetPhoneNumber = useCallback(
    async (e: ButtonProps.onGetPhoneNumberEventDetail) => {
      // Check if user denied permission
      if (e.detail.errMsg !== 'getPhoneNumber:ok' || !e.detail.code) {
        console.log('[Auth] User denied phone number permission or no code');
        Taro.showToast({
          title: '需要手机号授权才能登录',
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      // Check if we have loginCode (from wx.login called on mount)
      if (!loginCodeRef.current) {
        console.error('[Auth] No loginCode available, calling wx.login again');
        try {
          const loginRes = await Taro.login();
          if (!loginRes.code) {
            Taro.showToast({
              title: '微信登录失败，请重试',
              icon: 'none',
            });
            return;
          }
          loginCodeRef.current = loginRes.code;
        } catch (err) {
          console.error('[Auth] wx.login failed:', err);
          Taro.showToast({
            title: '微信登录失败，请重试',
            icon: 'none',
          });
          return;
        }
      }

      // Now we have both phoneCode and loginCode, call backend
      const phoneCode = e.detail.code;
      const loginCode = loginCodeRef.current;

      // Generate random state for CSRF protection
      const state = `weapp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      setIsWechatLoggingIn(true);

      try {
        const result = await authClient.loginWithWeixinMiniApp({
          phoneCode,
          loginCode,
          state,
        });

        if (result.code === 0) {
          Taro.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
          });
          // Navigate to chat tab
          Taro.switchTab({ url: '/pages/chat/index' });
        } else {
          Taro.showToast({
            title: result.msg || '登录失败，请重试',
            icon: 'none',
            duration: 2000,
          });
          // Refresh loginCode for next attempt
          Taro.login({
            success: (res) => {
              loginCodeRef.current = res.code || null;
            },
          });
        }
      } catch (error) {
        console.error('[Auth] WeChat login failed:', error);
        Taro.showToast({
          title: '登录失败，请稍后再试',
          icon: 'none',
          duration: 2000,
        });
        // Refresh loginCode for next attempt
        Taro.login({
          success: (res) => {
            loginCodeRef.current = res.code || null;
          },
        });
      } finally {
        setIsWechatLoggingIn(false);
      }
    },
    []
  );

  // Placeholder for H5 - WeChat login not available
  const handleWechatLoginH5 = useCallback(() => {
    Taro.showToast({
      title: '请在微信小程序中使用微信登录',
      icon: 'none',
      duration: 2000,
    });
  }, []);

  const handlePhoneLogin = () => {
    setCurrentView('login');
  };

  // Login view handlers
  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    // Reset form when going back
    mobileRef.current = '';
    codeRef.current = '';
    setMobileError(null);
    setCodeError(null);
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const result = await authClient.login({
        mobile: mobileRef.current,
        code: codeRef.current,
      });
      if (result.code === 0) {
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
        });
        Taro.switchTab({ url: '/pages/chat/index' });
        return;
      }

      Taro.showToast({
        title: result.msg || '登录失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } catch (error) {
      console.error('[Login] Request failed', error);
      Taro.showToast({
        title: '登录失败，请稍后再试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send code handler - isolated in SendCodeButton to prevent parent re-renders
  const handleSendCode = async (): Promise<boolean> => {
    const mobile = mobileRef.current;
    const mobileCheck = smsLoginFormSchema.shape.mobile.safeParse(mobile);
    if (!mobileCheck.success) {
      Taro.showToast({
        title: mobileCheck.error.issues[0]?.message || '请输入有效手机号',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }

    try {
      const result = await authClient.sendSmsCode(mobile, 1);
      if (result.code === 0) {
        Taro.showToast({
          title: '验证码已发送',
          icon: 'success',
          duration: 1500,
        });
        return true;
      }
      Taro.showToast({
        title: result.msg || '发送失败，请重试',
        icon: 'none',
        duration: 2000,
      });
      return false;
    } catch (error) {
      console.error('[Login] Send SMS failed', error);
      Taro.showToast({
        title: '发送失败，请稍后再试',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
  };

  return (
    <AuthLayout>
      {/* Welcome View */}
      {currentView === 'welcome' && (
        <View className='absolute left-0 right-0 bottom-[144rpx] flex flex-col items-center px-[48rpx] welcome-animate'>
          <View className='w-full max-w-[690rpx] flex flex-col gap-[32rpx]'>
            {/* WeChat Login Button */}
            {isWeapp ? (
              // WeChat Mini Program: use open-type="getPhoneNumber"
              <TaroButton
                className={`w-full h-[112rpx] bg-[#07c160] rounded-[56rpx] flex items-center justify-center gap-[16rpx] shadow-[0_8rpx_32rpx_rgba(7,193,96,0.3)] ${
                  isWechatLoggingIn ? 'opacity-50' : ''
                }`}
                openType='getPhoneNumber'
                onGetPhoneNumber={handleGetPhoneNumber}
                disabled={isWechatLoggingIn}
              >
                <Wechat size={20} color='#ffffff' />
                <Text className='text-[32rpx] font-medium text-white'>
                  {isWechatLoggingIn ? '登录中...' : '微信一键登录'}
                </Text>
              </TaroButton>
            ) : (
              // H5: show toast that WeChat login is not available
              <TaroButton
                className='w-full h-[112rpx] bg-[#07c160] rounded-[56rpx] flex items-center justify-center gap-[16rpx] shadow-[0_8rpx_32rpx_rgba(7,193,96,0.3)]'
                onClick={handleWechatLoginH5}
              >
                <Wechat size={20} color='#ffffff' />
                <Text className='text-[32rpx] font-medium text-white'>
                  微信一键登录
                </Text>
              </TaroButton>
            )}

            {/* Phone Login Button */}
            <TaroButton
              className='w-full h-[112rpx] bg-[rgba(255,255,255,0.1)] border-[2rpx] border-[rgba(255,255,255,0.3)] rounded-[56rpx] flex items-center justify-center gap-[16rpx]'
              onClick={handlePhoneLogin}
            >
              <MaterialIcons name='phone' size={20} color='#ffffff' />
              <Text className='text-[32rpx] font-medium text-white'>
                手机号码登录
              </Text>
            </TaroButton>
          </View>

          {/* Privacy Policy */}
          <Text className='mt-[32rpx] text-center text-[24rpx] text-[rgba(255,255,255,0.5)]'>
            登录即代表同意
            <Text className='underline mx-[8rpx] text-[rgba(255,255,255,0.5)]'>
              用户协议
            </Text>
            和
            <Text className='underline mx-[8rpx] text-[rgba(255,255,255,0.5)]'>
              隐私政策
            </Text>
          </Text>
        </View>
      )}

      {/* Login View */}
      {currentView === 'login' && (
        <View className='absolute inset-0 flex items-center justify-center px-[32rpx]'>
          <View className='w-full max-w-[722rpx] bg-white/95 rounded-[28rpx] shadow-[0_20rpx_80rpx_rgba(0,0,0,0.3)] overflow-hidden auth-card-animate'>
            {/* Card Header */}
            <View className='relative px-[48rpx] pt-[48rpx] pb-[16rpx] text-center'>
              {/* Close Button */}
              <View
                className='absolute top-[32rpx] right-[32rpx] w-[64rpx] h-[64rpx] min-w-[64rpx] flex items-center justify-center rounded-[16rpx] active:bg-[#f3f4f6]'
                onClick={handleBackToWelcome}
              >
                <Text className='text-[48rpx] text-[#9ca3af] leading-none font-light'>
                  ×
                </Text>
              </View>

              {/* Title - Pink theme */}
              <Text className='block text-[48rpx] font-semibold text-[#ec4899]'>
                验证码登录
              </Text>
              <Text className='block text-[32rpx] text-[#6b7280] mt-[16rpx]'>
                使用手机号码快速登录
              </Text>
            </View>

            {/* Card Content - Form */}
            <View className='px-[48rpx] py-[32rpx]'>
              {/* Phone Input - Using WrappedInput to avoid input lag */}
              <View className='mb-[32rpx]'>
                <Text className='block text-[28rpx] font-medium text-[#111827] mb-[16rpx]'>
                  手机号码
                </Text>
                <CustomWrapper>
                  <AuthInput
                    className='w-full h-[72rpx] px-[24rpx] bg-[#f9fafb] border-[2rpx] border-[#e5e7eb] rounded-[16rpx] text-[32rpx] text-[#111827] box-border'
                    type='number'
                    placeholder='请输入11位手机号'
                    placeholderClass='text-[#9ca3af]'
                    maxLength={11}
                    onImmediateChange={handleMobileChange}
                    debounceDelay={0}
                  />
                </CustomWrapper>
                {mobileError && (
                  <Text className='block text-[24rpx] text-[#ef4444] mt-[8rpx]'>
                    {mobileError}
                  </Text>
                )}
              </View>

              {/* SMS Code Input - Using WrappedInput to avoid input lag */}
              <View className='mb-[32rpx]'>
                <Text className='block text-[28rpx] font-medium text-[#111827] mb-[16rpx]'>
                  验证码
                </Text>
                <View className='flex items-center gap-[16rpx] w-full box-border'>
                  <CustomWrapper>
                    <AuthInput
                      className='flex-1 min-w-[200rpx] h-[72rpx] px-[24rpx] bg-[#f9fafb] border-[2rpx] border-[#e5e7eb] rounded-[16rpx] text-[32rpx] text-[#111827] box-border'
                      type='number'
                      placeholder='4位验证码'
                      placeholderClass='text-[#9ca3af]'
                      maxLength={4}
                      onImmediateChange={handleCodeChange}
                      debounceDelay={0}
                    />
                  </CustomWrapper>
                  {/* SendCodeButton isolates countdown state to prevent Input re-renders */}
                  <SendCodeButton
                    onSend={handleSendCode}
                    className='h-[72rpx] min-w-[200rpx] px-[24rpx] border-[2rpx] rounded-[16rpx] whitespace-nowrap bg-white flex items-center justify-center border-[#ec4899] active:bg-[rgba(236,72,153,0.05)]'
                    textClassName='text-[28rpx] font-semibold text-[#ec4899]'
                  />
                </View>
                {codeError && (
                  <Text className='block text-[24rpx] text-[#ef4444] mt-[8rpx]'>
                    {codeError}
                  </Text>
                )}
              </View>

              {/* Submit Button - Pink theme */}
              <TaroButton
                className={`w-full h-[88rpx] rounded-[44rpx] text-[36rpx] font-medium text-white mt-[16rpx] ${
                  isSubmitting
                    ? 'bg-[#ec4899] opacity-50'
                    : 'bg-[#ec4899] active:bg-[#db2777]'
                }`}
                disabled={isSubmitting}
                onClick={onSubmit}
              >
                {isSubmitting ? '登录中...' : '登录'}
              </TaroButton>
            </View>
          </View>
        </View>
      )}
    </AuthLayout>
  );
}
