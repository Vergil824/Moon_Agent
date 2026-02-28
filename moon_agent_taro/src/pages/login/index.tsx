/**
 * LoginPage - Redirect to combined welcome/login page.
 * 
 * The actual login form is now part of /pages/welcome/index to avoid
 * background image reload on page transitions.
 */
import { useEffect } from 'react';
import Taro from '@tarojs/taro';

export default function LoginPage() {
  useEffect(() => {
    // Redirect to combined auth page
    Taro.redirectTo({ url: '/pages/welcome/index' });
  }, []);

  return null;
}
