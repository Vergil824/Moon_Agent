"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ShoppingBag,
  Home,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPayOrder,
  PayOrderStatus,
  isPaymentSuccess,
  isPaymentWaiting,
  isPaymentClosed,
  getPaymentStatusText,
  type PayOrderRespVO,
} from "@/lib/payment/payApi";

/**
 * Payment Result Page - Display payment status with polling
 * Story 4.5: Task 3 - Payment result page with status polling
 *
 * Features:
 * - 2s interval polling for payment status
 * - Different UI states: success, waiting, closed/failed
 * - Navigation to order details or home
 * - Cross-tab communication via localStorage for payment callbacks
 *
 * Query params:
 * - id: Payment order ID (required)
 * - from: "callback" if this is a payment gateway redirect (used for cross-tab sync)
 */

// Query key for payment order status
const PAY_ORDER_QUERY_KEY = ["pay-order"];

// LocalStorage key for cross-tab payment completion signal
const PAYMENT_COMPLETE_SIGNAL_KEY = "moon_payment_complete";

// Polling interval in milliseconds (2 seconds per AC requirement)
const POLLING_INTERVAL = 2000;

// Max polling duration (5 minutes) to prevent infinite polling
const MAX_POLLING_DURATION = 5 * 60 * 1000;

type PaymentResultStatus = "loading" | "success" | "waiting" | "closed" | "error" | "timeout";

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Get payment order ID from query params
  const payOrderId = searchParams.get("id");
  const payOrderIdNum = payOrderId ? parseInt(payOrderId, 10) : null;
  const from = searchParams.get("from");

  // Track if this is a callback tab (opened by payment gateway redirect)
  const [isCallbackTab, setIsCallbackTab] = useState(false);
  const [signalSent, setSignalSent] = useState(false);

  // If this tab is a payment callback tab, notify the original tab via localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (from !== "callback") return;
    if (!payOrderId) return;
    if (signalSent) return;

    setIsCallbackTab(true);

    // Write signal to localStorage to notify the original tab
    const signal = {
      payOrderId,
      timestamp: Date.now(),
    };
    localStorage.setItem(PAYMENT_COMPLETE_SIGNAL_KEY, JSON.stringify(signal));
    setSignalSent(true);

    // Try to close this tab after a short delay
    // Note: window.close() only works for tabs opened by script
    setTimeout(() => {
      try {
        window.close();
      } catch {
        // Tab cannot be closed programmatically
      }
    }, 500);
  }, [from, payOrderId, signalSent]);

  // Track polling start time
  const pollingStartTime = useMemo(() => Date.now(), []);

  // Query payment order status with polling
  const {
    data: payOrder,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery<PayOrderRespVO>({
    queryKey: [...PAY_ORDER_QUERY_KEY, payOrderIdNum],
    queryFn: async () => {
      if (!payOrderIdNum || !session?.accessToken) {
        throw new Error("支付参数缺失");
      }
      const response = await getPayOrder(payOrderIdNum, session.accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "查询支付状态失败");
      }
      return response.data;
    },
    enabled: !!payOrderIdNum && !!session?.accessToken,
    // Polling: refetch every 2 seconds while status is WAITING
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if payment is complete (success or closed)
      if (data && !isPaymentWaiting(data.status)) {
        return false;
      }
      // Stop polling if max duration exceeded
      if (Date.now() - pollingStartTime > MAX_POLLING_DURATION) {
        return false;
      }
      // Continue polling every 2 seconds
      return POLLING_INTERVAL;
    },
    staleTime: 0, // Always consider data stale for polling
  });

  // Determine current status
  const status = useMemo<PaymentResultStatus>(() => {
    if (isLoading) return "loading";
    if (isError || error) return "error";
    if (!payOrder) return "loading";

    if (isPaymentSuccess(payOrder.status)) return "success";
    if (isPaymentClosed(payOrder.status)) return "closed";

    // Check for timeout
    if (Date.now() - pollingStartTime > MAX_POLLING_DURATION) {
      return "timeout";
    }

    return "waiting";
  }, [isLoading, isError, error, payOrder, pollingStartTime]);

  // Auto-stop polling on success or closed
  useEffect(() => {
    if (payOrder && !isPaymentWaiting(payOrder.status)) {
      // Payment complete, no need to poll anymore
    }
  }, [payOrder]);

  // Navigation handlers
  const handleViewOrder = useCallback(() => {
    // Navigate to order detail page (assuming order list is in profile)
    router.push("/profile/orders");
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Format price display
  const formattedPrice = useMemo(() => {
    if (!payOrder) return "0.00";
    return (payOrder.price / 100).toFixed(2);
  }, [payOrder]);

  // Handle close button for callback tab
  const handleCloseTab = useCallback(() => {
    try {
      window.close();
    } catch {
      // Cannot close, show fallback
    }
  }, []);

  // If this is a callback tab, show a special UI prompting user to close
  if (isCallbackTab) {
    return (
      <div
        data-testid="payment-result-page"
        className="flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]"
      >
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25" />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-50">
                <CheckCircle className="size-12 text-green-500" />
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-moon-text">
              支付操作已完成
            </h2>
            <p className="mt-2 text-sm text-moon-text-muted">
              原页面将自动显示支付结果
            </p>
            <p className="mt-4 text-sm text-gray-400">
              您可以关闭此页面，返回原页面查看订单
            </p>

            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <Button
                onClick={handleCloseTab}
                className="w-full bg-moon-purple hover:bg-moon-purple/90 rounded-full h-12"
              >
                关闭此页面
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      data-testid="payment-result-page"
      className="flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]"
    >
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="size-16 text-moon-purple animate-spin mx-auto" />
            <h2 className="mt-6 text-xl font-semibold text-moon-text">
              正在查询支付结果...
            </h2>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            {/* Success animation circle */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25" />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-50">
                <CheckCircle className="size-12 text-green-500" />
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-moon-text">
              支付成功
            </h2>
            <p className="mt-2 text-lg text-moon-purple font-semibold">
              ¥{formattedPrice}
            </p>
            {payOrder?.successTime && (
              <p className="mt-1 text-sm text-moon-text-muted">
                支付时间: {new Date(payOrder.successTime).toLocaleString("zh-CN")}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <Button
                onClick={handleViewOrder}
                className="w-full bg-moon-purple hover:bg-moon-purple/90 rounded-full h-12"
              >
                <ShoppingBag className="size-5 mr-2" />
                查看订单
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full rounded-full h-12"
              >
                <Home className="size-5 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        )}

        {/* Waiting State (Polling) */}
        {status === "waiting" && (
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-pulse" />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-amber-50">
                <Clock className="size-12 text-amber-500" />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-moon-text">
              等待支付结果
            </h2>
            <p className="mt-2 text-sm text-moon-text-muted">
              正在查询支付状态，请稍候...
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 className="size-4 text-moon-purple animate-spin" />
              <span className="text-sm text-moon-text-muted">自动刷新中</span>
            </div>

            <div className="mt-8">
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="rounded-full"
              >
                <Home className="size-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        )}

        {/* Closed/Cancelled State */}
        {status === "closed" && (
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gray-100">
                <XCircle className="size-12 text-gray-400" />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-moon-text">
              {getPaymentStatusText(PayOrderStatus.CLOSED)}
            </h2>
            <p className="mt-2 text-sm text-moon-text-muted">
              订单已关闭或已取消
            </p>

            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <Button
                onClick={handleGoHome}
                className="w-full bg-moon-purple hover:bg-moon-purple/90 rounded-full h-12"
              >
                <Home className="size-5 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        )}

        {/* Timeout State */}
        {status === "timeout" && (
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-amber-50">
                <Clock className="size-12 text-amber-500" />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-moon-text">
              查询超时
            </h2>
            <p className="mt-2 text-sm text-moon-text-muted">
              未能获取到支付结果，请稍后查看订单状态
            </p>

            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full rounded-full h-12"
              >
                <RefreshCw className="size-5 mr-2" />
                重新查询
              </Button>
              <Button
                onClick={handleViewOrder}
                className="w-full bg-moon-purple hover:bg-moon-purple/90 rounded-full h-12"
              >
                <ShoppingBag className="size-5 mr-2" />
                查看订单
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-red-50">
                <XCircle className="size-12 text-red-400" />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-moon-text">
              查询失败
            </h2>
            <p className="mt-2 text-sm text-moon-text-muted">
              {error instanceof Error ? error.message : "网络异常，请稍后重试"}
            </p>

            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full rounded-full h-12"
              >
                <RefreshCw className="size-5 mr-2" />
                重试
              </Button>
              <Button
                onClick={handleGoHome}
                className="w-full bg-moon-purple hover:bg-moon-purple/90 rounded-full h-12"
              >
                <Home className="size-5 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Order Info Footer */}
      {payOrder && (
        <footer className="px-6 py-4 text-center text-xs text-gray-400 border-t border-gray-100">
          支付单号: {payOrder.id}
          {payOrder.channelOrderNo && ` | 渠道单号: ${payOrder.channelOrderNo}`}
        </footer>
      )}
    </div>
  );
}

