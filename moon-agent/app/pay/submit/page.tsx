'use client';

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  submitPayOrder,
  type SubmitPayOrderRequest,
  type SubmitPayOrderResponse,
} from '@/lib/payment/payApi';
import {
  getPaymentChannel,
  type PaymentMethod,
  type PaymentChannelCode,
} from '@/lib/utils/utils';

/**
 * Payment Submit Page - Intermediate payment processing page
 * Story 4.5: Payment submission, environment invocation, and status polling
 *
 * This page handles:
 * 1. Auto-detect device environment and select appropriate payment channel
 * 2. Submit payment order to backend
 * 3. Either redirect to payment URL or display QR code (for wx_native)
 *
 * Query params:
 * - payOrderId: Payment order ID (required)
 * - orderId: Trade order ID (for reference)
 * - method: Payment method - "alipay" | "wechat" (required)
 * - openid: WeChat openid (required for wx_pub channel)
 */

type PaymentStatus = 'loading' | 'qrcode' | 'redirecting' | 'error';

// LocalStorage key for cross-tab payment completion signal
const PAYMENT_COMPLETE_SIGNAL_KEY = 'moon_payment_complete';

export default function PaymentSubmitPage() {
  return (
    <Suspense fallback={<PaymentSubmitFallback />}>
      <PaymentSubmitPageContent />
    </Suspense>
  );
}

function PaymentSubmitFallback() {
  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]'>
      <main className='flex-1 flex flex-col items-center justify-center px-6'>
        <Loader2 className='size-16 text-moon-purple animate-spin mx-auto' />
        <h2 className='mt-6 text-xl font-semibold text-moon-text'>
          正在准备支付...
        </h2>
      </main>
    </div>
  );
}

function PaymentSubmitPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Parse query parameters
  const payOrderId = searchParams.get('payOrderId');
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method') as PaymentMethod | null;
  const openid = searchParams.get('openid');

  // State
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [qrContent, setQrContent] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // Track if we've opened a payment window (to listen for callback)
  const paymentWindowOpenedRef = useRef(false);

  // Listen for payment completion signal from callback tab via localStorage
  useEffect(() => {
    if (!payOrderId) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== PAYMENT_COMPLETE_SIGNAL_KEY) return;
      if (!e.newValue) return;

      try {
        const signal = JSON.parse(e.newValue);
        // Check if this signal is for our payment order
        if (signal.payOrderId === payOrderId) {
          // Clear the signal
          localStorage.removeItem(PAYMENT_COMPLETE_SIGNAL_KEY);
          // Navigate to result page
          router.replace(`/pay/result?id=${payOrderId}`);
        }
      } catch {
        // Ignore parse errors
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [payOrderId, router]);

  // Determine payment channel based on environment
  const channelCode = useMemo<PaymentChannelCode | null>(() => {
    if (!method) return null;
    return getPaymentChannel(method);
  }, [method]);

  // Return URL after payment completion
  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    if (payOrderId) params.set('id', payOrderId);
    // Mark callback origin so the result page can bounce back to opener and close the tab
    params.set('from', 'callback');
    return `${baseUrl}/pay/result?${params.toString()}`;
  }, [payOrderId]);

  // Handle payment submission
  const submitPayment = useCallback(async () => {
    if (!payOrderId || !method || !channelCode || !session?.accessToken) {
      setErrorMessage('支付参数不完整');
      setStatus('error');
      setErrorDialogOpen(true);
      return;
    }

    try {
      setStatus('loading');

      // Build request
      const request: SubmitPayOrderRequest = {
        id: parseInt(payOrderId, 10),
        channelCode,
        returnUrl,
        displayMode: channelCode === 'wx_native' ? 'qr' : 'url',
      };

      // Add openid for wx_pub channel
      if (channelCode === 'wx_pub' && openid) {
        request.channelExtras = { openid };
      }

      // Submit payment
      const response = await submitPayOrder(request, session.accessToken);

      if (response.code !== 0) {
        throw new Error(response.msg || '支付提交失败');
      }

      const { displayMode, displayContent } = response.data;

      // Handle response based on display mode
      if (displayMode === 'qr' || channelCode === 'wx_native') {
        // Show QR code for Native payment
        setQrContent(displayContent);
        setStatus('qrcode');
      } else {
        // For URL mode, store the URL and show redirecting state
        // Let user manually open the payment page
        setQrContent(displayContent); // Store URL for the button
        setStatus('redirecting');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '支付提交失败，请稍后重试';
      setErrorMessage(message);
      setStatus('error');
      setErrorDialogOpen(true);
    }
  }, [
    payOrderId,
    method,
    channelCode,
    session?.accessToken,
    returnUrl,
    openid,
  ]);

  // Auto-submit payment on mount
  useEffect(() => {
    if (session?.accessToken && payOrderId && method && channelCode) {
      submitPayment();
    }
  }, [session?.accessToken, payOrderId, method, channelCode, submitPayment]);

  // Validation check
  useEffect(() => {
    if (!payOrderId || !method) {
      setErrorMessage('支付参数缺失');
      setStatus('error');
      setErrorDialogOpen(true);
    }
  }, [payOrderId, method]);

  // Check for wx_pub without openid
  useEffect(() => {
    if (channelCode === 'wx_pub' && !openid) {
      setErrorMessage('微信内支付需要获取授权');
      setStatus('error');
      setErrorDialogOpen(true);
    }
  }, [channelCode, openid]);

  // Handle go to result page (for QR code payment)
  const handleCheckResult = useCallback(() => {
    router.push(`/pay/result?id=${payOrderId}`);
  }, [router, payOrderId]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setErrorDialogOpen(false);
    setErrorMessage('');
    submitPayment();
  }, [submitPayment]);

  // Handle back to cart (order already created, user may want to start over)
  const handleBackToCart = useCallback(() => {
    router.push('/cart');
  }, [router]);

  // Get channel display name
  const channelDisplayName = useMemo(() => {
    if (!channelCode) return '';
    const names: Record<PaymentChannelCode, string> = {
      alipay_wap: '支付宝',
      alipay_pc: '支付宝',
      wx_pub: '微信支付',
      wx_wap: '微信支付',
      wx_native: '微信扫码支付',
    };
    return names[channelCode];
  }, [channelCode]);

  return (
    <div
      data-testid='payment-submit-page'
      className='flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]'
    >
      {/* Main Content */}
      <main className='flex-1 flex flex-col items-center justify-center px-6'>
        {/* Loading State */}
        {status === 'loading' && (
          <div className='text-center'>
            <Loader2 className='size-16 text-moon-purple animate-spin mx-auto' />
            <h2 className='mt-6 text-xl font-semibold text-moon-text'>
              正在准备支付...
            </h2>
            <p className='mt-2 text-sm text-moon-text-muted'>
              即将跳转至{channelDisplayName}
            </p>
          </div>
        )}

        {/* Redirecting State - Show payment link button */}
        {status === 'redirecting' && qrContent && (
          <div className='text-center'>
            <Smartphone className='size-16 text-moon-purple mx-auto' />
            <h2 className='mt-6 text-xl font-semibold text-moon-text'>
              请点击下方按钮前往支付
            </h2>
            <p className='mt-2 text-sm text-moon-text-muted'>
              点击按钮将跳转至{channelDisplayName}完成支付
            </p>
            <div className='mt-6 flex flex-col gap-3 w-full max-w-xs mx-auto'>
              <a
                href={qrContent}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center h-12 px-6 bg-moon-purple hover:bg-moon-purple/90 text-white rounded-full font-medium transition-colors'
              >
                <Smartphone className='size-5 mr-2' />
                前往{channelDisplayName}支付
              </a>
              <Button
                onClick={() => router.push(`/pay/result?id=${payOrderId}`)}
                variant='outline'
                className='rounded-full h-12'
              >
                我已完成支付，查看结果
              </Button>
            </div>
            <p className='mt-4 text-xs text-gray-400'>
              订单号: {orderId || payOrderId}
            </p>
          </div>
        )}

        {/* QR Code State (for wx_native) */}
        {status === 'qrcode' && qrContent && (
          <div className='text-center'>
            <div className='bg-white rounded-2xl p-6 shadow-lg'>
              <div className='flex items-center justify-center gap-2 mb-4'>
                <QrCode className='size-5 text-green-600' />
                <span className='text-lg font-semibold text-moon-text'>
                  微信扫码支付
                </span>
              </div>
              <div className='p-4 bg-white rounded-xl border border-gray-100'>
                <QRCodeSVG
                  value={qrContent}
                  size={200}
                  level='H'
                  includeMargin
                />
              </div>
              <p className='mt-4 text-sm text-moon-text-muted'>
                请使用微信扫描上方二维码完成支付
              </p>
              <div className='mt-4 text-xs text-gray-400'>
                订单号: {orderId || payOrderId}
              </div>
            </div>
            <Button
              onClick={handleCheckResult}
              className='mt-6 bg-moon-purple hover:bg-moon-purple/90 rounded-full px-8'
            >
              我已完成支付
            </Button>
            <Button
              onClick={handleBackToCart}
              variant='ghost'
              className='mt-2 text-moon-text-muted'
            >
              返回购物车
            </Button>
          </div>
        )}

        {/* Error State (shown via dialog) */}
        {status === 'error' && !errorDialogOpen && (
          <div className='text-center'>
            <div className='size-20 rounded-full bg-red-50 flex items-center justify-center mx-auto'>
              <AlertCircle className='size-10 text-red-400' />
            </div>
            <h2 className='mt-4 text-xl font-semibold text-moon-text'>
              支付失败
            </h2>
            <p className='mt-2 text-sm text-moon-text-muted'>{errorMessage}</p>
            <div className='mt-6 space-x-3'>
              <Button onClick={handleRetry} variant='outline'>
                <RefreshCw className='size-4 mr-2' />
                重试
              </Button>
              <Button
                onClick={handleBackToCart}
                className='bg-moon-purple hover:bg-moon-purple/90'
              >
                返回购物车
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Error Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent className='max-w-[85vw] rounded-[20px] sm:max-w-lg'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertCircle className='size-5 text-red-500' />
              支付失败
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex-row gap-2'>
            <Button
              onClick={handleBackToCart}
              variant='outline'
              className='flex-1'
            >
              返回购物车
            </Button>
            <AlertDialogAction
              onClick={handleRetry}
              className='flex-1 rounded-full bg-moon-purple hover:bg-moon-purple/90'
            >
              重试
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
