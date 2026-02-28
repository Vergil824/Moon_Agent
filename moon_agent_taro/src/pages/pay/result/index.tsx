/**
 * Payment Result Page - Display payment status with polling
 * Migrated from moon-agent/app/pay/result/page.tsx for Taro
 *
 * Features:
 * - 2s interval polling for payment status
 * - Different UI states: success, waiting, closed/failed, cancelled
 * - Navigation to order details or home
 *
 * Query params:
 * - id: Payment order ID (required)
 * - status: Optional initial status from submit page ("success" | "cancel")
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';
import {
  Success,
  Failure,
  Clock,
  Replay,
  WapHomeOutlined,
  ShoppingCart,
} from '@taroify/icons';
import {
  getPayOrder,
  PayOrderStatus,
  isPaymentWaiting,
  isPaymentSuccess,
  isPaymentClosed,
  getPaymentStatusText,
  formatPaymentPrice,
  type PayOrderRespVO,
} from '@core/payment';
import {
  clearCartBackup,
  hasRestorableBackup,
  restoreCartFromBackup,
} from '@core/cart';

type PaymentResultStatus =
  | 'loading'
  | 'success'
  | 'waiting'
  | 'closed'
  | 'cancelled'
  | 'error'
  | 'timeout';

// Polling interval in milliseconds (2 seconds per AC requirement)
const POLLING_INTERVAL = 2000;

// Max polling duration (5 minutes) to prevent infinite polling
const MAX_POLLING_DURATION = 5 * 60 * 1000;

export default function PayResultPage() {
  const router = useRouter();

  // Get payment order ID and initial status from query params
  const payOrderId = router.params?.id;
  const initialStatus = router.params?.status as
    | 'success'
    | 'cancel'
    | undefined;

  // State
  const [status, setStatus] = useState<PaymentResultStatus>('loading');
  const [payOrder, setPayOrder] = useState<PayOrderRespVO | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Polling refs
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingStartRef = useRef<number>(Date.now());
  const isPollingRef = useRef<boolean>(false);

  // Query payment order status
  const queryPaymentStatus = useCallback(async () => {
    if (!payOrderId) {
      setStatus('error');
      setErrorMessage('支付订单ID缺失');
      return;
    }

    try {
      const response = await getPayOrder(parseInt(payOrderId, 10), true);

      if (response.code !== 0) {
        throw new Error(response.msg || '查询支付状态失败');
      }

      const order = response.data;
      setPayOrder(order);

      // Update status based on payment status
      if (isPaymentSuccess(order.status)) {
        setStatus('success');
        isPollingRef.current = false;
        // Clear cart backup on successful payment
        clearCartBackup();
      } else if (isPaymentClosed(order.status)) {
        setStatus('closed');
        isPollingRef.current = false;
      } else if (isPaymentWaiting(order.status)) {
        setStatus('waiting');
        // Continue polling if within time limit
        if (Date.now() - pollingStartRef.current < MAX_POLLING_DURATION) {
          isPollingRef.current = true;
        } else {
          setStatus('timeout');
          isPollingRef.current = false;
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '网络异常，请稍后重试';
      setErrorMessage(message);
      setStatus('error');
      isPollingRef.current = false;
    }
  }, [payOrderId]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
    }

    const poll = async () => {
      await queryPaymentStatus();

      // Continue polling if still waiting
      if (isPollingRef.current) {
        pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
      }
    };

    poll();
  }, [queryPaymentStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    // Handle initial status from submit page
    if (initialStatus === 'success') {
      // Payment was successful from requestPayment callback
      // Still query to get full order details
      setStatus('success');
      queryPaymentStatus();
    } else if (initialStatus === 'cancel') {
      // User cancelled payment
      setStatus('cancelled');
      queryPaymentStatus();
    } else {
      // Normal case - start polling
      pollingStartRef.current = Date.now();
      startPolling();
    }

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume polling when page becomes visible
  useDidShow(() => {
    if (status === 'waiting' && !isPollingRef.current) {
      pollingStartRef.current = Date.now();
      startPolling();
    }
  });

  // Format price display
  const formattedPrice = useMemo(() => {
    if (!payOrder) return '0.00';
    return formatPaymentPrice(payOrder.price);
  }, [payOrder]);

  // Navigation handlers
  const handleViewOrder = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/profile/orders/index',
    });
  }, []);

  const handleGoHome = useCallback(() => {
    Taro.switchTab({
      url: '/pages/chat/index',
    });
  }, []);

  const handleRetry = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    pollingStartRef.current = Date.now();
    startPolling();
  }, [startPolling]);

  const handleBackToCart = useCallback(() => {
    Taro.switchTab({
      url: '/pages/cart/index',
    });
  }, []);

  // Handle restore cart from backup
  const handleRestoreCart = useCallback(async () => {
    if (!hasRestorableBackup()) {
      Taro.showToast({
        title: '没有可恢复的购物车数据',
        icon: 'none',
      });
      return;
    }

    setIsRestoring(true);

    try {
      const result = await restoreCartFromBackup();

      if (result.success) {
        if (result.failedItems.length > 0) {
          Taro.showToast({
            title: `已恢复${result.restoredCount}件，${result.failedItems.length}件失败`,
            icon: 'none',
            duration: 2500,
          });
        } else {
          Taro.showToast({
            title: `已恢复${result.restoredCount}件商品`,
            icon: 'success',
          });
        }
        // Navigate to cart after successful restore
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/cart/index' });
        }, 1500);
      } else {
        Taro.showToast({
          title: '恢复失败，请重试',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('[PayResult] Restore cart failed:', error);
      Taro.showToast({
        title: '恢复失败，请重试',
        icon: 'none',
      });
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient'>
      <View className='flex-1 flex flex-col items-center justify-center px-6'>
        {/* Loading State */}
        {status === 'loading' && (
          <View className='text-center'>
            <View className='w-24 h-24 rounded-full bg-moon-purple/10 flex items-center justify-center mx-auto animate-pulse'>
              <Clock size={48} className='text-moon-purple' />
            </View>
            <Text className='mt-6 text-xl font-semibold text-moon-text block'>
              正在查询支付结果...
            </Text>
          </View>
        )}

        {/* Success State */}
        {status === 'success' && (
          <View className='text-center'>
            <View className='relative mx-auto w-24 h-24'>
              <View className='absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25' />
              <View className='relative flex items-center justify-center w-24 h-24 rounded-full bg-green-50'>
                <Success size={48} className='text-green-500' />
              </View>
            </View>

            <Text className='mt-6 text-2xl font-bold text-moon-text block'>
              支付成功
            </Text>
            <Text className='mt-2 text-lg text-moon-purple font-semibold block'>
              ¥{formattedPrice}
            </Text>
            {payOrder?.successTime && (
              <Text className='mt-1 text-sm text-moon-text-muted block'>
                支付时间:{' '}
                {new Date(payOrder.successTime).toLocaleString('zh-CN')}
              </Text>
            )}

            <View className='mt-8 flex flex-col gap-3 w-full max-w-xs mx-auto'>
              <Button
                type='primary'
                className='rounded-full!'
                style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                onClick={handleViewOrder}
              >
                <View className='flex items-center justify-center gap-2'>
                  <ShoppingCart size={20} />
                  <Text>查看订单</Text>
                </View>
              </Button>
              <Button
                type='default'
                className='rounded-full!'
                onClick={handleGoHome}
              >
                <View className='flex items-center justify-center gap-2'>
                  <WapHomeOutlined size={20} />
                  <Text>返回首页</Text>
                </View>
              </Button>
            </View>
          </View>
        )}

        {/* Waiting State (Polling) */}
        {status === 'waiting' && (
          <View className='text-center'>
            <View className='relative mx-auto w-24 h-24'>
              <View className='absolute inset-0 rounded-full bg-amber-100 animate-pulse' />
              <View className='relative flex items-center justify-center w-24 h-24 rounded-full bg-amber-50'>
                <Clock size={48} className='text-amber-500' />
              </View>
            </View>

            <Text className='mt-6 text-xl font-semibold text-moon-text block'>
              等待支付结果
            </Text>
            <Text className='mt-2 text-sm text-moon-text-muted block'>
              正在查询支付状态，请稍候...
            </Text>

            <View className='mt-4 flex items-center justify-center gap-2'>
              <View className='w-4 h-4 rounded-full bg-moon-purple animate-bounce' />
              <Text className='text-sm text-moon-text-muted'>自动刷新中</Text>
            </View>

            <View className='mt-8'>
              <Button
                type='default'
                className='rounded-full!'
                onClick={handleGoHome}
              >
                <View className='flex items-center justify-center gap-2'>
                  <WapHomeOutlined size={16} />
                  <Text>返回首页</Text>
                </View>
              </Button>
            </View>
          </View>
        )}

        {/* Cancelled State */}
        {status === 'cancelled' && (
          <View className='text-center'>
            <View className='relative mx-auto w-24 h-24'>
              <View className='relative flex items-center justify-center w-24 h-24 rounded-full bg-gray-100'>
                <Failure size={48} className='text-gray-400' />
              </View>
            </View>

            <Text className='mt-6 text-xl font-semibold text-moon-text block'>
              支付已取消
            </Text>
            <Text className='mt-2 text-sm text-moon-text-muted block'>
              您已取消本次支付
            </Text>

            <View className='mt-8 flex flex-col gap-3 w-full max-w-xs mx-auto'>
              {/* Restore cart button - only show if backup exists */}
              {hasRestorableBackup() && (
                <Button
                  type='primary'
                  className='rounded-full!'
                  style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                  onClick={handleRestoreCart}
                  disabled={isRestoring}
                >
                  <View className='flex items-center justify-center gap-2'>
                    <ShoppingCart size={20} />
                    <Text>{isRestoring ? '恢复中...' : '恢复购物车'}</Text>
                  </View>
                </Button>
              )}
              <Button
                type='default'
                className='rounded-full!'
                onClick={handleViewOrder}
              >
                查看订单
              </Button>
              <Button
                type='default'
                className='rounded-full!'
                onClick={handleBackToCart}
              >
                返回购物车
              </Button>
            </View>
          </View>
        )}

        {/* Closed State */}
        {status === 'closed' && (
          <View className='text-center'>
            <View className='relative mx-auto w-24 h-24'>
              <View className='relative flex items-center justify-center w-24 h-24 rounded-full bg-gray-100'>
                <Failure size={48} className='text-gray-400' />
              </View>
            </View>

            <Text className='mt-6 text-xl font-semibold text-moon-text block'>
              {getPaymentStatusText(PayOrderStatus.CLOSED)}
            </Text>
            <Text className='mt-2 text-sm text-moon-text-muted block'>
              订单已关闭或已取消
            </Text>

            <View className='mt-8 flex flex-col gap-3 w-full max-w-xs mx-auto'>
              {/* Restore cart button - only show if backup exists */}
              {hasRestorableBackup() && (
                <Button
                  type='primary'
                  className='rounded-full!'
                  style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                  onClick={handleRestoreCart}
                  disabled={isRestoring}
                >
                  <View className='flex items-center justify-center gap-2'>
                    <ShoppingCart size={20} />
                    <Text>{isRestoring ? '恢复中...' : '恢复购物车'}</Text>
                  </View>
                </Button>
              )}
              <Button
                type='default'
                className='rounded-full!'
                onClick={handleGoHome}
              >
                <View className='flex items-center justify-center gap-2'>
                  <WapHomeOutlined size={20} />
                  <Text>返回首页</Text>
                </View>
              </Button>
            </View>
          </View>
        )}

        {/* Timeout State */}
        {status === 'timeout' && (
          <View className='text-center'>
            <View className='relative mx-auto w-24 h-24'>
              <View className='relative flex items-center justify-center w-24 h-24 rounded-full bg-amber-50'>
                <Clock size={48} className='text-amber-500' />
              </View>
            </View>

            <Text className='mt-6 text-xl font-semibold text-moon-text block'>
              查询超时
            </Text>
            <Text className='mt-2 text-sm text-moon-text-muted block'>
              未能获取到支付结果，请稍后查看订单状态
            </Text>

            <View className='mt-8 flex flex-col gap-3 w-full max-w-xs mx-auto'>
              <Button
                type='default'
                className='rounded-full!'
                onClick={handleRetry}
              >
                <View className='flex items-center justify-center gap-2'>
                  <Replay size={20} />
                  <Text>重新查询</Text>
                </View>
              </Button>
              <Button
                type='primary'
                className='rounded-full!'
                style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                onClick={handleViewOrder}
              >
                <View className='flex items-center justify-center gap-2'>
                  <ShoppingCart size={20} />
                  <Text>查看订单</Text>
                </View>
              </Button>
            </View>
          </View>
        )}

        {/* Error State */}
        {status === 'error' && (
          <View className='text-center'>
            <View className='relative mx-auto w-24 h-24'>
              <View className='relative flex items-center justify-center w-24 h-24 rounded-full bg-red-50'>
                <Failure size={48} className='text-red-400' />
              </View>
            </View>

            <Text className='mt-6 text-xl font-semibold text-moon-text block'>
              查询失败
            </Text>
            <Text className='mt-2 text-sm text-moon-text-muted block'>
              {errorMessage || '网络异常，请稍后重试'}
            </Text>

            <View className='mt-8 flex flex-col gap-3 w-full max-w-xs mx-auto'>
              <Button
                type='default'
                className='rounded-full!'
                onClick={handleRetry}
              >
                <View className='flex items-center justify-center gap-2'>
                  <Replay size={20} />
                  <Text>重试</Text>
                </View>
              </Button>
              <Button
                type='primary'
                className='rounded-full!'
                style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                onClick={handleGoHome}
              >
                <View className='flex items-center justify-center gap-2'>
                  <WapHomeOutlined size={20} />
                  <Text>返回首页</Text>
                </View>
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* Order Info Footer */}
      {payOrder && (
        <View className='px-6 py-4 text-center border-t border-gray-100'>
          <Text className='text-xs text-gray-400 block'>
            支付单号: {payOrder.id}
            {payOrder.channelOrderNo &&
              ` | 渠道单号: ${payOrder.channelOrderNo}`}
          </Text>
        </View>
      )}
    </View>
  );
}
